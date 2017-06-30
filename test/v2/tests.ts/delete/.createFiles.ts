import { TestCallback, TestInfo } from '../Type'
import { v2 } from '../../../../lib/index.js'

export function starter(server : v2.WebDAVServer, info : TestInfo, isValid : TestCallback, name : string, expectedStatusCode : number, callback ?: (server : v2.WebDAVServer) => void) : void
{
    server.rootFileSystem().addSubTree(v2.ExternalRequestContext.create(server), {
        'emptyFolder1': v2.ResourceType.Directory,
        'folder1': {
            'emptyFolder2': v2.ResourceType.Directory,
            'file2': v2.ResourceType.File,
            'folder2': {
                'emptyFolder3': v2.ResourceType.Directory,
                'file3': v2.ResourceType.File
            }
        },
        'file1': v2.ResourceType.File
    }, (e) => {
        if(e) return isValid(false, 'Cannot call "addSubTree(...)".', e);

        info.req({
            url: 'http://localhost:' + server.options.port + '/' + name,
            method: 'DELETE'
        }, expectedStatusCode, () => {
            if(!callback)
                isValid(true);
            else
                callback(server);
        })
    })
}
