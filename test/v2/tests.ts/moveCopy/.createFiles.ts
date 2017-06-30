import { TestCallback, TestInfo } from '../Type'
import { v2 } from '../../../../lib/index.js'

export function check(server : v2.WebDAVServer, info : TestInfo, isValid : TestCallback, path : string, mustExist : boolean, callback : () => void) : void
{
    info.req({
        url: 'http://localhost:' + server.options.port + '/' + path,
        method: 'PROPFIND',
        headers: {
            Depth: 0
        }
    }, mustExist ? v2.HTTPCodes.MultiStatus : v2.HTTPCodes.NotFound, () => {
        callback();
    })
}

export function starter(server : v2.WebDAVServer, info : TestInfo, isValid : TestCallback, method : string, from : string, to : string, overwrite : boolean, expectedStatusCode : number, callback ?: (server : v2.WebDAVServer) => void) : void
{
    server.rootFileSystem().addSubTree(v2.ExternalRequestContext.create(server), {
        'emptyFolder1': v2.ResourceType.Directory,
        'folder1': {
            'emptyFolder2': v2.ResourceType.Directory,
            'file2': v2.ResourceType.File,
            'folder2': {
                'emptyFolder3': v2.ResourceType.Directory,
                'file3': v2.ResourceType.File
            },
            'folder2x': {
                'emptyFolder3x': v2.ResourceType.Directory,
                'file3x': v2.ResourceType.File
            }
        },
        'file1': v2.ResourceType.File
    }, (e) => {
        if(e) return isValid(false, 'Cannot call "addSubTree(...)".', e);

        info.req({
            url: 'http://localhost:' + server.options.port + '/' + from,
            method,
            headers: {
                overwrite: overwrite ? 'T' : 'F',
                destination: '/' + to
            }
        }, expectedStatusCode, () => {
            if(!callback)
                isValid(true);
            else
                callback(server);
        })
    })
}
