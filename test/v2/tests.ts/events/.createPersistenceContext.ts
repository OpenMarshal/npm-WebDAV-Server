import { TestCallback, TestInfo } from '../Type'
import { v2 } from '../../../../lib/index.js'
import * as path from 'path'
import * as fs from 'fs'

export function starter(info : TestInfo, isValid : TestCallback, eventName : v2.ServerEvent, callback : (server : v2.WebDAVServer, fs : v2.FileSystem) => void) : void
{
    const server = info.startServer();
    
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
        'file1': v2.ResourceType.File,
        'file2': v2.ResourceType.File,
        'file3': v2.ResourceType.File,
        'file4': v2.ResourceType.File,
        'file5': v2.ResourceType.File,
        'file6': v2.ResourceType.File,
        'file7': v2.ResourceType.File,
    }, (e) => {
        if(e) return isValid(false, 'Cannot call "addSubTree(...)".', e);

        server.on(eventName, (ctx, fs, path) => {
            isValid(true);
        })

        callback(server, server.rootFileSystem());
    })
}
