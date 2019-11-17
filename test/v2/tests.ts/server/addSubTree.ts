import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'

export default ((info, isValid) =>
{
    const server = info.init(2);
    
    const server2 = info.startServer();
    server2.rootFileSystem().addSubTree(v2.ExternalRequestContext.create(server2), {
        'emptyFolder1': v2.ResourceType.Directory,
        'folder1': {
            'emptyFolder2': v2.ResourceType.Directory,
            'file2': 'Hello!',
            'folder2': {
                'emptyFolder3': v2.ResourceType.Directory,
                'file3': 'Hello!'
            },
            'folder2x': {
                'emptyFolder3x': v2.ResourceType.Directory,
                'file3x': 'Hello!'
            }
        },
        'file1': 'Hello!'
    }, (e) => {
        const check = (path : string, callback : () => void) =>
        {
            info.req({
                url: 'http://localhost:' + server2.options.port + '/' + path,
                method: 'PROPFIND',
                headers: {
                    Depth: 0
                }
            }, v2.HTTPCodes.MultiStatus, () => {
                callback();
            })
        }
        const checkContent = (path : string, content : string, callback : () => void) =>
        {
            info.req({
                url: 'http://localhost:' + server2.options.port + '/' + path,
                method: 'GET'
            }, v2.HTTPCodes.OK, (res, rContent) => {
                if(rContent === content)
                    return callback();
                isValid(false);
            })
        }

        check('file1', () => {
        check('emptyFolder1', () => {
        check('folder1', () => {
        check('folder1/file2', () => {
        check('folder1/emptyFolder2', () => {
        check('folder1/folder2', () => {
        check('folder1/folder2/emptyFolder3', () => {
        check('folder1/folder2/file3', () => {
        check('folder1/folder2x', () => {
        check('folder1/folder2x/emptyFolder3x', () => {
        check('folder1/folder2x/file3x', () => {
        checkContent('file1', 'Hello!', () => {
        checkContent('folder1/file2', 'Hello!', () => {
        checkContent('folder1/folder2/file3', 'Hello!', () => {
        checkContent('folder1/folder2x/file3x', 'Hello!', () => {
            isValid(true);
        })
        })
        })
        })
        })
        })
        })
        })
        })
        })
        })
        })
        })
        })
        })
    })

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
        const check = (path : string, callback : () => void) =>
        {
            info.req({
                url: 'http://localhost:' + server.options.port + '/' + path,
                method: 'PROPFIND',
                headers: {
                    Depth: 0
                }
            }, v2.HTTPCodes.MultiStatus, () => {
                callback();
            })
        }

        check('file1', () => {
        check('emptyFolder1', () => {
        check('folder1', () => {
        check('folder1/file2', () => {
        check('folder1/emptyFolder2', () => {
        check('folder1/folder2', () => {
        check('folder1/folder2/emptyFolder3', () => {
        check('folder1/folder2/file3', () => {
        check('folder1/folder2x', () => {
        check('folder1/folder2x/emptyFolder3x', () => {
        check('folder1/folder2x/file3x', () => {
            isValid(true);
        })
        })
        })
        })
        })
        })
        })
        })
        })
        })
        })
    })

}) as Test;
