import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import * as request from 'request'

export default ((info, isValid) =>
{
    const server = info.init(1);
    
    function check(path : string, callback : () => void) : void
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

    server.rootFileSystem().addSubTree(v2.RequestContext.createExternal(server), {
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
