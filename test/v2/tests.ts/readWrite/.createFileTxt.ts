import { TestCallback, TestInfo } from '../Type'
import { v2 } from '../../../../lib/index.js'

export function starter(server : v2.WebDAVServer, info : TestInfo, isValid : TestCallback, content : string | Buffer, _type ?: v2.ResourceType | ((r ?: v2.Resource) => void), _callback ?: (r ?: v2.Resource) => void) : void
{
    const callback = _callback ? _callback : _type as (r ?: v2.Resource) => void;
    const type = _callback ? _type as v2.ResourceType : v2.ResourceType.File;

    const name = 'file.txt';
    server.rootFileSystem.addSubTree(info.ctx, {
        [name]: type
    }, (e) => {
        if(e) return isValid(false, 'Cannot call "addSubTree(...)".', e);

        server.getResource(info.ctx, '/' + name, (e, r) => {
            if(e) return isValid(false, 'Could not find //' + name, e);

            if(!type.isFile)
                return callback(r);
            
            r.openWriteStream((e, wStream) => {
                if(e) return isValid(false, 'Could not open the resource for writing.', e);
                wStream.end(content, (e) => {
                    if(e) return isValid(false, 'Could not write content to the resource.', e);

                    callback(r);
                });
            })
        })
    })
}
