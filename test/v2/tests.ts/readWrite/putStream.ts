import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createFileTxt'
import { Readable } from 'stream'

export default ((info, isValid) =>
{
    const server = info.init(1);
    const cx = Buffer.alloc(100000);
    for(let i = 0; i < cx.length; ++i)
        cx.write('X', i, 1, 'utf-8');
    const content = cx.toString();
    let index = 0;
    const stream = new Readable({
        read(size ?: number)
        {
            if(index >= cx.length)
                return null;
            return cx.slice(index, index + size);
        }
    })
    
    starter(server, info, isValid, 'NO CONTENT', (r) => {
        const reqStream = info.reqStream({
            url: 'http://localhost:' + info.port + '/file.txt',
            method: 'PUT',
            body: content
        }, () => {
            r.openReadStream((e, rStream) => {
                if(e) return isValid(false, 'Could not open the resource for reading.', e);

                let data = '';
                let tempData;
                while(tempData = rStream.read(1000))
                    data += tempData.toString();
                isValid(data === content, 'The content read is not the same as the one written : "' + data.substring(0, 20) + '[...]" but expected "' + content.substring(0, 20) + '[...]".');
            })
        });

        stream.pipe(reqStream);
    });

}) as Test;
