import { TestCallback, TestInfo } from '../Type'
import { v2 } from '../../../../lib/index.js'

export function starter(server : v2.WebDAVServer, info : TestInfo, isValid : TestCallback, callback : (r : v2.Resource, subFiles ?: string[]) => void) : void
{
    const subFiles = [
        'subFolder1',
        'subFolder2',
        'subFile1',
        'subFile2'
    ];
    const name = 'folder';
    server.rootFileSystem().addSubTree(info.ctx, {
        [name]: {
            'subFolder1': v2.ResourceType.Directory,
            'subFolder2': v2.ResourceType.Directory,
            'subFile1': v2.ResourceType.File,
            'subFile2': v2.ResourceType.File,
        }
    }, (e) => {
        if(e) return isValid(false, 'Cannot call "addSubTree(...)".', e);

        server.getResource(info.ctx, '/' + name, (e, r) => {
            if(e) return isValid(false, 'Could not find /' + name, e);

            callback(r, subFiles);
        })
    })
}
