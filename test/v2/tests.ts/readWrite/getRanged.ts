import { Test, TestCallback, TestInfo } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createFileTxt'

const content = 'Helio!';
function go(info : TestInfo, isValid : TestCallback, range : string, callback : (statusCode : number, headers : any, body : string) => void)
{
    starter(info.startServer(), info, isValid, content, (r, s) => {
        info.req({
            url: 'http://localhost:' + s.options.port + '/file.txt',
            method: 'GET',
            headers: {
                'Range': range
            }
        }, (res, body) => {
            callback(res.statusCode, res.headers, body);
        })
    })
}

export default ((info, isValid) =>
{
    const server = info.init(7);

    go(info, isValid, 'bytes=0-100', (statusCode, headers, body) => {
        isValid(headers['content-length'] === content.length.toString(), 'The content length returned must be a maximum the range could retrieve, but instead of ' + content.length + ', got ' + headers['content-length'] + '.');
    })
    
    go(info, isValid, 'bytes=0-1', (statusCode, headers, body) => {
        isValid(headers['content-length'] === '2', 'The content length returned must be equals to 2 when 0-1 is asked, but instead of ' + 2 + ', got ' + headers['content-length'] + '.');
    })
    
    go(info, isValid, 'bytes=0-0', (statusCode, headers, body) => {
        isValid(headers['content-length'] === '1', 'The content length returned must be equals to 1 when 0-0 is asked, but instead of ' + 1 + ', got ' + headers['content-length'] + '.');
    })
    
    go(info, isValid, 'bytes=0-100', (statusCode, headers, body) => {
        isValid(body === content, 'Expected "' + content + '" but got "' + body + '".');
    })
    
    go(info, isValid, 'bytes=0-0', (statusCode, headers, body) => {
        isValid(body === 'H', 'Expected "H" but got "' + body + '".');
    })
    
    go(info, isValid, 'bytes=1-1', (statusCode, headers, body) => {
        isValid(body === 'e', 'Expected "e" but got "' + body + '".');
    })
    
    go(info, isValid, 'bytes=' + (content.length - 1) + '-' + (content.length - 1), (statusCode, headers, body) => {
        isValid(body === '!', 'Expected "!" but got "' + body + '".');
    })

}) as Test;
