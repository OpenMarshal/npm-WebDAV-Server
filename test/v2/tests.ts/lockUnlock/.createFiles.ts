import { TestCallback, TestInfo } from '../Type'
import { v2 } from '../../../../lib/index.js'

export interface Lock
{
    scope : string
    type : string
    depth : number
    owner : string | v2.XMLElement | v2.XMLElement[]
    timeoutSec : number
    uuid : string
    root : string
}

export function lockResource(
    server : v2.WebDAVServer,
    info : TestInfo,
    isValid : TestCallback,
    pathNameToLock : string,
    depth : number,
    isExclusive : boolean,
    callback : (lock : Lock) => void) : void
export function lockResource(
    server : v2.WebDAVServer,
    info : TestInfo,
    isValid : TestCallback,
    pathNameToLock : string,
    depth : number,
    isExclusive : boolean,
    expectedResponseCode : number,
    callback : (lock : Lock) => void) : void
export function lockResource(
    server : v2.WebDAVServer,
    info : TestInfo,
    isValid : TestCallback,
    pathNameToLock : string,
    depth : number,
    isExclusive : boolean,
    _expectedResponseCode : number | ((lock : Lock) => void),
    _callback ?: (lock : Lock) => void) : void
{
    const expectedResponseCode = _callback ? _expectedResponseCode as number : v2.HTTPCodes.OK;
    const callback = _callback ? _callback : _expectedResponseCode as (lock : Lock) => void;

    info.reqXML({
        url: 'http://localhost:' + server.options.port + '/' + pathNameToLock,
        method: 'LOCK',
        headers: {
            depth: depth === -1 ? 'Infinity' : depth.toString()
        },
        body: '<?xml version="1.0" encoding="utf-8" ?><D:lockinfo xmlns:D="DAV:"><D:lockscope><D:' + (isExclusive ? 'exclusive' : 'shared') + '/></D:lockscope><D:locktype><D:write/></D:locktype><D:owner><D:href>http://example.org/~ejw/contact.html</D:href></D:owner></D:lockinfo>'
    }, expectedResponseCode, (res, xml) => {
        if(expectedResponseCode !== v2.HTTPCodes.Created && expectedResponseCode !== v2.HTTPCodes.OK)
            return callback(null);

        try
        {
            const activeLock = xml.find('DAV:prop').find('DAV:lockdiscovery').find('DAV:activelock');
            const sDepth = activeLock.find('DAV:depth').findText().trim().toLowerCase();
            const sTimeout = activeLock.find('DAV:timeout').findText();

            const lock = {
                scope: activeLock.find('DAV:lockscope').elements[0].name.replace('DAV:', '').toLowerCase(),
                type: activeLock.find('DAV:locktype').elements[0].name.replace('DAV:', '').toLowerCase(),
                depth: sDepth === 'infinity' ? -1 : parseInt(sDepth),
                owner: activeLock.find('DAV:owner').elements,
                timeoutSec: parseInt(sTimeout.substring(sTimeout.indexOf(':') + 1)),
                uuid: activeLock.find('DAV:locktoken').find('DAV:href').findText(),
                root: activeLock.find('DAV:lockroot').find('DAV:href').findText()
            };

            if(lock.type !== 'write')
                return isValid(false, 'The lock type must be write when requested to be write.', lock.type);
            if(isExclusive && lock.scope !== 'exclusive')
                return isValid(false, 'The lock scope must be exclusive when requested to be exclusive.', lock.scope);
            if(!isExclusive && lock.scope !== 'shared')
                return isValid(false, 'The lock scope must be shared when requested to be shared.', lock.scope);
            
            try
            {
                if(lock.owner[0].findText() !== 'http://example.org/~ejw/contact.html')
                    return isValid(false, 'The value of the owner is not perfectly saved.');
            }
            catch(ex)
            {
                return isValid(false, 'The owner property is not valid.', ex);
            }
            
            callback(lock);
        }
        catch(ex)
        {
            return isValid(false, 'The WebDAV XML response is not valid.', ex);
        }
    })
}

export function starter(
    server : v2.WebDAVServer,
    info : TestInfo,
    isValid : TestCallback,
    pathNameToLock : string,
    depth : number,
    isExclusive : boolean,
    callback : (lock : Lock) => void) : void
export function starter(
    server : v2.WebDAVServer,
    info : TestInfo,
    isValid : TestCallback,
    pathNameToLock : string,
    depth : number,
    isExclusive : boolean,
    expectedResponseCode : number,
    callback : (lock : Lock) => void) : void
export function starter(
    server : v2.WebDAVServer,
    info : TestInfo,
    isValid : TestCallback,
    pathNameToLock : string,
    depth : number,
    isExclusive : boolean,
    _expectedResponseCode : number | ((lock : Lock) => void),
    _callback ?: (lock : Lock) => void) : void
{
    const expectedResponseCode = _callback ? _expectedResponseCode as number : v2.HTTPCodes.OK;
    const callback = _callback ? _callback : _expectedResponseCode as (lock : Lock) => void;

    server.rootFileSystem().addSubTree(info.ctx, {
        'folder': {
            'folder2': {
                'folder3': {
                    'folder4': {
                        'file': v2.ResourceType.File
                    }
                }
            }
        },
        'file': v2.ResourceType.File,
        'hybrid': v2.ResourceType.Hybrid,
        'noResource': v2.ResourceType.NoResource,
    }, (e) => {
        if(e) return isValid(false, 'Cannot call "addSubTree(...)".', e);

        lockResource(server, info, isValid, pathNameToLock, depth, isExclusive, expectedResponseCode, callback);
    })
}
