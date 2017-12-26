import { IResource, ReturnCallback, ETag } from '../../resource/v1/IResource'
import { MethodCallArgs } from '../../server/v1/MethodCallArgs'
import { Errors } from '../../Errors'
import * as url from 'url'

type FnReturn = ReturnCallback<boolean>

function NoLock()
{
    return function(r : IResource, callback : FnReturn) {
        r.getLocks((e, locks) => {
            if(e === Errors.MustIgnore)
                callback(null, true);
            else
                callback(e, locks ? locks.length === 0 : false);
        })
    }
}

function Token(token : string)
{
    return function(r : IResource, callback : FnReturn) {
        r.getLock(token, (e, lock) => {
            if(e === Errors.MustIgnore)
                callback(null, true);
            else
                callback(e, !!lock && !e);
        })
    }
}

function Tag(tag : string)
{
    return function(r : IResource, callback : FnReturn) {
        r.lastModifiedDate((e, lastModifiedDate) => {
            if(e === Errors.MustIgnore)
                callback(null, true);
            else
                callback(e, !e && ETag.createETag(lastModifiedDate) === tag);
        })
    }
}

function Not(filter)
{
    return function(r : IResource, callback : FnReturn) {
        filter(r, (e, v) => {
            callback(e, !v);
        })
    }
}

function parseInternal(group : string)
{
    const rex = /((not)|<([^>]+)>|\[([^\]]+)\]|<(DAV:no-lock)>)/ig;
    let match = rex.exec(group);

    let isNot = false;
    const andArray = [];
    function add(filter)
    {
        andArray.push(isNot ? Not(filter) : filter);
        isNot = false;
    }

    while(match)
    {
        if(match[2])
        { // not
            isNot = true;
        }
        else if(match[3])
        { // lock-token
            add(Token(match[3]));
        }
        else if(match[4])
        { // tag
            add(Tag(match[4]));
        }
        else if(match[5])
        { // DAV:no-lock
            add(NoLock());
        }
        match = rex.exec(group);
    }

    if(andArray.length)
        return (r, callback) => callback(null, true);

    return function(r : IResource, callback : FnReturn) {
        let nb = andArray.length;
        function done(error, result)
        {
            if(nb <= 0)
                return;
            if(error)
            {
                nb = -1;
                callback(error, false);
                return;
            }
            --nb;
            if(nb === 0 || !result)
            {
                nb = -1;
                callback(null, result);
            }
        }

        andArray.forEach((a) => a(r, done));
    };
}

export function extractOneToken(ifHeader : string)
{
    const match = /^[ ]*\([ ]*<([^>]+)>[ ]*\)[ ]*$/.exec(ifHeader);
    if(!match)
        return null;
    else
        return match[1];
}

export function parseIfHeader(ifHeader : string)
{
    const rex = /(?:<([^>]+)>)?\s*\(([^\)]+)\)/g;
    let match = rex.exec(ifHeader);

    const orArray = [];
    let oldPath = undefined;

    while(match)
    {
        if(match[1])
            oldPath = url.parse(match[1]).path;
        
        orArray.push({
            path: oldPath,
            actions: parseInternal(match[2])
        })

        match = rex.exec(ifHeader);
    }

    if(orArray.length)
        return (arg : MethodCallArgs, r : IResource, callback : ReturnCallback<boolean>) => callback(null, true);

    return function(arg : MethodCallArgs, r : IResource, callback : ReturnCallback<boolean>) {
        let nb = orArray.length;
        function done(error, result)
        {
            if(nb <= 0)
                return;
            if(error)
            {
                nb = -1;
                callback(error, false);
                return;
            }
            --nb;
            if(nb === 0 || result)
            {
                nb = -1;
                callback(null, result);
            }
        }

        orArray.forEach((a) => {
            if(!a.path)
                a.actions(r, done);
            else
                arg.server.getResourceFromPath(arg, a.path, (e, resource) => {
                    if(e)
                        done(e, null);
                    else
                        a.actions(resource, done);
                });
        })
    }
}
