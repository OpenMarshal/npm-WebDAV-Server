import { TestCallback, TestInfo } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { XMLElementUtil } from 'xml-js-builder'

export interface Lock
{
    scope : string
    type : string
    depth : number
    owner : string | XMLElementUtil | XMLElementUtil[]
    timeoutSec : number
    uuid : string
    root : string
}

export function methodTesterNotBlocking(info : TestInfo, isValid : TestCallback, callbackLocked : (port : number, user2 : string, cb : () => void) => void) : void
{
    const server1 = info.init(3);

    starter(server1, info, isValid, 'folder/folder2/folder3/folder4/file', 0, true, (lock, user1, user2) => {
        callbackLocked(server1.options.port, user2, () => {
            isValid(true);
        })
    })
    
    const server2 = info.startServer();
    starter(server2, info, isValid, 'folder', -1, true, (lock, user1, user2) => {
        callbackLocked(server2.options.port, user2, () => {
            isValid(true);
        })
    })
    
    const server3 = info.startServer();
    starter(server3, info, isValid, 'folder/folder2/folder3/folder4', 1, true, (lock, user1, user2) => {
        callbackLocked(server3.options.port, user2, () => {
            isValid(true);
        })
    })
}

export function methodTesterBlocking(info : TestInfo, isValid : TestCallback, callbackLocked : (port : number, user1 : string, user2 : string, cb : () => void) => void, callbackUnlocked ?: (port : number, user2 : string) => void, isFolder ?: boolean) : void
{
    isFolder = isFolder === undefined ? false : isFolder;

    const server1 = info.init(2 + (isFolder ? 0 : 1));

    if(!isFolder)
    {
        starter(server1, info, isValid, 'folder/folder2/folder3/folder4/file', 0, true, (lock, user1, user2) => {
            callbackLocked(server1.options.port, user1, user2, () => {
                if(!callbackUnlocked)
                    return isValid(true);

                unlockResource(server1, info, isValid, user1, 'folder/folder2/folder3/folder4/file', lock.uuid, () => {
                    callbackUnlocked(server1.options.port, user2);
                })
            })
        })
    }
    
    const server2 = info.startServer();
    starter(server2, info, isValid, 'folder', -1, true, (lock, user1, user2) => {
        callbackLocked(server2.options.port, user1, user2, () => {
            if(!callbackUnlocked)
                return isValid(true);
                
            unlockResource(server2, info, isValid, user1, 'folder', lock.uuid, () => {
                callbackUnlocked(server2.options.port, user2);
            })
        })
    })
    
    const server3 = info.startServer();
    starter(server3, info, isValid, 'folder/folder2/folder3/folder4', 1, true, (lock, user1, user2) => {
        callbackLocked(server3.options.port, user1, user2, () => {
            if(!callbackUnlocked)
                return isValid(true);
                
            unlockResource(server3, info, isValid, user1, 'folder/folder2/folder3/folder4', lock.uuid, () => {
                callbackUnlocked(server3.options.port, user2);
            })
        })
    })
}

export function unlockResource(
    server : v2.WebDAVServer,
    info : TestInfo,
    isValid : TestCallback,
    user : string,
    pathNameToUnlock : string,
    lockToken : string,
    callback : () => void) : void
export function unlockResource(
    server : v2.WebDAVServer,
    info : TestInfo,
    isValid : TestCallback,
    user : string,
    pathNameToUnlock : string,
    lockToken : string,
    expectedResponseCode : number,
    callback : () => void) : void
export function unlockResource(
    server : v2.WebDAVServer,
    info : TestInfo,
    isValid : TestCallback,
    user : string,
    pathNameToUnlock : string,
    lockToken : string,
    _expectedResponseCode : number | (() => void),
    _callback ?: () => void) : void
{
    const expectedResponseCode = _callback ? _expectedResponseCode as number : v2.HTTPCodes.NoContent;
    const callback = _callback ? _callback : _expectedResponseCode as () => void;

    info.req({
        url: 'http://localhost:' + server.options.port + '/' + pathNameToUnlock,
        method: 'UNLOCK',
        headers: {
            'Lock-Token': '<' + lockToken + '>',
            Authorization: 'Basic ' + user
        }
    }, expectedResponseCode, () => {
        callback();
    })
}

export function lockResource(
    server : v2.WebDAVServer,
    info : TestInfo,
    isValid : TestCallback,
    user : string,
    pathNameToLock : string,
    depth : number,
    isExclusive : boolean,
    callback : (lock : Lock) => void) : void
export function lockResource(
    server : v2.WebDAVServer,
    info : TestInfo,
    isValid : TestCallback,
    user : string,
    pathNameToLock : string,
    depth : number,
    isExclusive : boolean,
    expectedResponseCode : number,
    callback : (lock : Lock) => void) : void
export function lockResource(
    server : v2.WebDAVServer,
    info : TestInfo,
    isValid : TestCallback,
    user : string,
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
            Depth: depth === -1 ? 'Infinity' : depth.toString(),
            Authorization: 'Basic ' + user
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
                depth: sDepth === 'infinity' ? -1 : parseInt(sDepth, 10),
                owner: activeLock.find('DAV:owner').elements,
                timeoutSec: parseInt(sTimeout.substring(sTimeout.indexOf(':') + 1), 10),
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
    callback : (lock : Lock, user1 : string, user2 : string) => void) : void
export function starter(
    server : v2.WebDAVServer,
    info : TestInfo,
    isValid : TestCallback,
    pathNameToLock : string,
    depth : number,
    isExclusive : boolean,
    expectedResponseCode : number,
    callback : (lock : Lock, user1 : string, user2 : string) => void) : void
export function starter(
    server : v2.WebDAVServer,
    info : TestInfo,
    isValid : TestCallback,
    pathNameToLock : string,
    depth : number,
    isExclusive : boolean,
    _expectedResponseCode : number | ((lock : Lock, user1 : string, user2 : string) => void),
    _callback ?: (lock : Lock, user1 : string, user2 : string) => void) : void
{
    const expectedResponseCode = _callback ? _expectedResponseCode as number : v2.HTTPCodes.OK;
    const callback = _callback ? _callback : _expectedResponseCode as (lock : Lock, user1 : string, user2 : string) => void;

    const um = new v2.SimpleUserManager();
    um.addUser('user1', 'password1'); // dXNlcjE6cGFzc3dvcmQx
    um.addUser('user2', 'password2'); // dXNlcjI6cGFzc3dvcmQy
    server.httpAuthentication = new v2.HTTPBasicAuthentication(um, 'Test realm');
    server.options.httpAuthentication = server.httpAuthentication;
    server.rootFileSystem().addSubTree(v2.ExternalRequestContext.create(server), {
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

        lockResource(server, info, isValid, 'dXNlcjE6cGFzc3dvcmQx', pathNameToLock, depth, isExclusive, expectedResponseCode, (lock) => {
            callback(lock, 'dXNlcjE6cGFzc3dvcmQx', 'dXNlcjI6cGFzc3dvcmQy');
        });
    })
}
