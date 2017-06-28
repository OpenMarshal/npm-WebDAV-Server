import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createFileTxt'

export default ((info, isValid) =>
{
    const server = info.init(2);

    const content = 'Hello!!!';
    starter(server, info, isValid, content, (r) => {
        info.req({
            url: 'http://localhost:' + info.port + '/file.txt',
            method: 'GET'
        }, (res, body) => {
            isValid(body === content, 'The content read is not the same as the one written : "' + body + '" but expected "' + content + '".');
        })
    })
    
    const server2 = info.startServer();
    starter(server2, info, isValid, content, (r) => {
        info.req({
            url: 'http://localhost:' + server2.options.port + '/file.txt',
            method: 'HEAD'
        }, (res) => {
            isValid(res.headers['content-length'] === content.length.toString(), 'The content read is not the same as the one written : "' + content.length.toString() + '" but expected "' + res.headers['content-length'] + '".');
        })
    })

}) as Test;
