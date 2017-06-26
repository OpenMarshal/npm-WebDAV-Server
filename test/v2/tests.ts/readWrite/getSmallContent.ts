import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createFileTxt'

export default ((info, isValid) =>
{
    const server = info.init(1);

    const content = 'Hello!!!';
    starter(server, info, isValid, content, (r) => {
        info.req({
            url: 'http://localhost:' + info.port + '/file.txt',
            method: 'GET'
        }, (res, body) => {
            isValid(body === content, 'The content read is not the same as the one written : "' + body + '" but expected "' + content + '".');
        })
    })

}) as Test;
