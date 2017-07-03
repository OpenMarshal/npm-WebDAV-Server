import { TestCallback, TestInfo } from '../Type'
import { v2 } from '../../../../lib/index.js'
import * as path from 'path'
import * as fs from 'fs'

let index = 0;
function getPath(index : number, subName ?: string) : string
{
    const rootPath = path.join(__dirname, 'persistence' + index.toString());
    if(subName)
        return path.join(rootPath, subName);
    else
        return rootPath;
}

export function starter(info : TestInfo, isValid : TestCallback, callback : (server : v2.WebDAVServer, folder : string, file : string, fileTemp : string) => void) : void
{
    const currentIndex = ++index;

    const root = getPath(currentIndex);
    const folder = getPath(currentIndex, 'data');
    const file = getPath(currentIndex, 'save.json');
    const fileTemp = getPath(currentIndex, 'save.tmp.json');

    const server = info.startServer({
        autoSave: {
            treeFilePath: file,
            tempTreeFilePath: fileTemp,
            onSaveError: (e) => {
                isValid(false, e);
            }
        }
    })
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

        fs.rmdir(folder, () => {
        fs.unlink(file, () => {
        fs.unlink(fileTemp, () => {
        fs.mkdir(root, (e) => {
            callback(server, folder, file, fileTemp);
        })
        })
        })
        })
    })
}
