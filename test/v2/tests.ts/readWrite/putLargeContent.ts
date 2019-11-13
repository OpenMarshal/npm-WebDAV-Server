import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createFileTxt'

export default ((info, isValid) =>
{
    const server = info.init(1);
    const cx = Buffer.alloc(100000);
    for(let i = 0; i < cx.length; ++i)
        cx.write('X', i, 1, 'utf-8');
    const content = cx.toString();
    
    starter(server, info, isValid, 'NO CONTENT', (r) => {
        info.req({
            url: 'http://localhost:' + info.port + '/file.txt',
            method: 'PUT',
            body: content
        }, (res, body) => {
            r.openReadStream((e, rStream) => {
                if(e) return isValid(false, 'Could not open the resource for reading.', e);

                let data = '';
                let tempData;
                while(tempData = rStream.read(1000))
                    data += tempData.toString();
                isValid(data === content, 'The content read is not the same as the one written : "' + data.substring(0, 20) + '[...]" but expected "' + content.substring(0, 20) + '[...]".');
            })
        })
    });

}) as Test;
