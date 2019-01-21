import { TestCallback, TestInfo } from '../Type'
import { v2 } from '../../../../lib/index.js'

export function starter(server : v2.WebDAVServer, info : TestInfo, isValid : TestCallback, callback : (r : v2.Resource, subFiles ?: string[], allFiles ?: string[]) => void) : void
{
    const subFiles = [
        'subFolder1',
        'subFolder2',
        'subFile1',
        'subFile2',
        'folder%20no%20space',
        'subFolder3',
        'sub Folder 4',
        'file漢字',
        'dir漢字',
        'this is a file',
        'this is a directory',
        'vfs'
    ];
    const allFiles = [
        'subFolder1',
        'subFolder2',
        'subFile1',
        'subFile2',
        'folder%20no%20space',
        'folder%20no%20space/file',
        'folder%20no%20space/folder',
        'subFolder3',
        'subFolder3/file漢字',
        'subFolder3/dir漢字',
        'subFolder3/this is a file',
        'subFolder3/this is a directory',
        'sub Folder 4',
        'sub Folder 4/file漢字',
        'sub Folder 4/dir漢字',
        'sub Folder 4/this is a file',
        'sub Folder 4/this is a directory',
        'file漢字',
        'dir漢字',
        'this is a file',
        'this is a directory',
        'vfs',
        'vfs/file',
        'vfs/folder'
    ];
    const name = 'folder';
    const ctx = v2.ExternalRequestContext.create(server);
    const vfs = new v2.VirtualFileSystem();

    server.rootFileSystem().addSubTree(ctx, {
        [name]: {
            'subFolder1': v2.ResourceType.Directory,
            'subFolder2': v2.ResourceType.Directory,
            'subFile1': v2.ResourceType.File,
            'subFile2': v2.ResourceType.File,
            'folder%20no%20space': {
                'file': v2.ResourceType.File,
                'folder': v2.ResourceType.Directory
            },
            'subFolder3': {
                'file漢字': v2.ResourceType.File,
                'dir漢字': v2.ResourceType.Directory,
                'this is a file': v2.ResourceType.File,
                'this is a directory': v2.ResourceType.Directory
            },
            'sub Folder 4': {
                'file漢字': v2.ResourceType.File,
                'dir漢字': v2.ResourceType.Directory,
                'this is a file': v2.ResourceType.File,
                'this is a directory': v2.ResourceType.Directory
            },
            'file漢字': v2.ResourceType.File,
            'dir漢字': v2.ResourceType.Directory,
            'this is a file': v2.ResourceType.File,
            'this is a directory': v2.ResourceType.Directory
        }
    }, (e) => {
        server.setFileSystem(`/${name}/vfs`, vfs, () => {
            vfs.addSubTree(ctx, {
                'file': v2.ResourceType.File,
                'folder': v2.ResourceType.Directory
            }, () => {
                if(e) return isValid(false, 'Cannot call "addSubTree(...)".', e);

                server.getResource(ctx, '/' + name, (e, r) => {
                    if(e) return isValid(false, 'Could not find /' + name, e);

                    callback(r, subFiles, allFiles);
                })
            })
        })
    });
}