import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createFileTxt'

export default ((info, isValid) =>
{
    const server = info.init(1);
    const cx = new Buffer(100000);
    for(let i = 0; i < cx.length; ++i)
        cx.write('X', i, 1, 'utf-8');
    const content = cx.toString();
    
    starter(server, info, isValid, cx, (r) => {
        info.req({
            url: 'http://localhost:' + info.port + '/file.txt',
            method: 'GET'
        }, (res, body) => {
            isValid(body === content, 'The content read is not the same as the one written : "' + body.substring(0, 20) + '[...]" but expected "' + content.substring(0, 20) + '[...]".');
        })
    });

}) as Test;
