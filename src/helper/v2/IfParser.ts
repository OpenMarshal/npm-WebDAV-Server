import { RequestContext } from '../../server/v2/RequestContext'
import { ReturnCallback } from '../../index.v2';
import { Resource } from '../../manager/v2/fileSystem/Resource'
import { Path } from '../../manager/v2/Path'
import * as url from 'url'

type FnReturn = ReturnCallback<boolean>

function NoLock()
{
    return function(resource : Resource, callback : FnReturn) {
        resource.lockManager((e, lm) => {
            if(e)
                return callback(e, false);
            
            lm.getLocks((e, locks) => {
                callback(e, locks ? locks.length === 0 : false);
            })
        })
    }
}

function Token(token : string)
{
    return function(resource : Resource, callback : FnReturn) {
        resource.lockManager((e, lm) => {
            if(e)
                return callback(e, false);
            
            lm.getLock(token, (e, lock) => callback(e, !!lock && !e));
        })
    }
}

function Tag(tag : string)
{
    return function(resource : Resource, callback : FnReturn) {
        resource.etag((e, etag) => callback(e, !e && etag === tag));
    }
}

function Not(filter)
{
    return function(resource : Resource, callback : FnReturn) {
        filter(resource, (e, v) => {
            callback(e, !v);
        })
    }
}

function parseInternal(group : string)
{
    const rex = /((not)|\[([^\]]+)\]|<(DAV:no-lock)>|<([^>]+)>|([^\s]+))/ig;
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
        else if(match[5] || match[6])
        { // lock-token
            add(Token(match[5] || match[6]));
        }
        else if(match[3])
        { // tag
            add(Tag(match[3]));
        }
        else if(match[4])
        { // DAV:no-lock
            add(NoLock());
        }
        match = rex.exec(group);
    }

    if(andArray.length)
        return (r, callback) => callback(null, true);

    return function(resource : Resource, callback : FnReturn) {
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

        andArray.forEach((a) => a(resource, done));
    };
}

export function extractOneToken(ifHeader : string)
{
    const match = /^\s*\(\s*<?([^\)\s>]+)>?\s*\)\s*$/.exec(ifHeader);
    if(!match)
        return null;
    else
        return match[1];
}

export function parseIfHeader(ifHeader : string)
{
    const rex = /(?:<([^>]+)>)?\s*\(([^\)]+)\)/g;
    let match = rex.exec(ifHeader);

    const orArray : {
        path : string,
        actions : (resource : Resource, callback : FnReturn) => void
    }[] = [];
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

    if(orArray.length === 0)
        return (ctx : RequestContext, resource : Resource, callback : ReturnCallback<boolean>) => callback(null, true);

    return function(ctx : RequestContext, resource : Resource, callback : ReturnCallback<boolean>) {
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
                a.actions(resource, done);
            else
            {
                const sPath = new Path(a.path);
                ctx.server.getFileSystem(sPath, (fs, _, sub) => {
                    a.actions(fs.resource(ctx, sPath), done);
                })
            }
        })
    }
}
