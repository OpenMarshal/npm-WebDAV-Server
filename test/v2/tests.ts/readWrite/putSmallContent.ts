import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createFileTxt'

export default ((info, isValid) =>
{
    const server = info.init(1);
    const content = 'Hello!!!';
    starter(server, info, isValid, 'NO CONTENT', (r) => {
        info.req({
            url: 'http://localhost:' + info.port + '/file.txt',
            method: 'PUT',
            body: content
        }, (res, body) => {
            r.openReadStream((e, rStream) => {
                if(e) return isValid(false, 'Could not open the resource for reading.', e);

                const data = rStream.read(1000).toString();
                isValid(data === content, 'The content read is not the same as the one written : "' + data + '" but expected "' + content + '".');
            })
        })
    });

}) as Test;
