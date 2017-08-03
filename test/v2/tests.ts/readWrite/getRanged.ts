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
function goHead(info : TestInfo, isValid : TestCallback, range : string, callback : (statusCode : number, headers : any) => void)
{
    starter(info.startServer(), info, isValid, content, (r, s) => {
        info.req({
            url: 'http://localhost:' + s.options.port + '/file.txt',
            method: 'HEAD',
            headers: {
                'Range': range
            }
        }, (res) => {
            callback(res.statusCode, res.headers);
        })
    })
}

export default ((info, isValid) =>
{
    const server = info.init(22);

    go(info, isValid, 'bytes=0-100', (statusCode, headers, body) => {
        isValid(headers['content-length'] === content.length.toString(), 'The content length returned must be the maximum length possible, but instead of ' + content.length + ', got ' + headers['content-length'] + '.');
    })

    go(info, isValid, 'bytes=-100', (statusCode, headers, body) => {
        isValid(headers['content-length'] === content.length.toString(), 'The content length returned must be the maximum length possible, but instead of ' + content.length + ', got ' + headers['content-length'] + '.');
    })
    
    go(info, isValid, 'bytes=0-1', (statusCode, headers, body) => {
        isValid(headers['content-length'] === '2', 'The content length returned must be equals to 2 when 0-1 is asked, but instead of ' + 2 + ', got ' + headers['content-length'] + '.');
    })
    
    go(info, isValid, 'bytes=0-0', (statusCode, headers, body) => {
        isValid(headers['content-length'] === '1', 'The content length returned must be equals to 1 when 0-0 is asked, but instead of ' + 1 + ', got ' + headers['content-length'] + '.');
    })
    
    go(info, isValid, 'bytes=-1', (statusCode, headers, body) => {
        isValid(headers['content-length'] === '1', 'The content length returned must be equals to 1 when 0-0 is asked, but instead of ' + 1 + ', got ' + headers['content-length'] + '.');
    })
    
    goHead(info, isValid, 'bytes=0-100', (statusCode, headers) => {
        isValid(headers['content-length'] === content.length.toString(), 'The content length returned must be the maximum length possible, but instead of ' + content.length + ', got ' + headers['content-length'] + '.');
    })

    goHead(info, isValid, 'bytes=-100', (statusCode, headers) => {
        isValid(headers['content-length'] === content.length.toString(), 'The content length returned must be the maximum length possible, but instead of ' + content.length + ', got ' + headers['content-length'] + '.');
    })
    
    goHead(info, isValid, 'bytes=0-1', (statusCode, headers) => {
        isValid(headers['content-length'] === '2', 'The content length returned must be equals to 2 when 0-1 is asked, but instead of ' + 2 + ', got ' + headers['content-length'] + '.');
    })
    
    goHead(info, isValid, 'bytes=0-0', (statusCode, headers) => {
        isValid(headers['content-length'] === '1', 'The content length returned must be equals to 1 when 0-0 is asked, but instead of ' + 1 + ', got ' + headers['content-length'] + '.');
    })
    
    goHead(info, isValid, 'bytes=-1', (statusCode, headers) => {
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
    
    go(info, isValid, 'bytes=0-', (statusCode, headers, body) => {
        isValid(body === content, 'Expected "' + content + '" but got "' + body + '".');
    })
    
    go(info, isValid, 'bytes=1-', (statusCode, headers, body) => {
        const expected = content.substr(1);
        isValid(body === expected, 'Expected "' + expected + '" but got "' + body + '".');
    })
    
    go(info, isValid, 'bytes=100-', (statusCode, headers, body) => {
        isValid(body === '', 'Expected "" but got "' + body + '".');
    })
    
    go(info, isValid, 'bytes=-0', (statusCode, headers, body) => {
        isValid(body === '', 'Expected "" but got "' + body + '".');
    })
    
    go(info, isValid, 'bytes=-1', (statusCode, headers, body) => {
        isValid(body === '!', 'Expected "!" but got "' + body + '".');
    })
    
    go(info, isValid, 'bytes=-100', (statusCode, headers, body) => {
        isValid(body === content, 'Expected "' + content + '" but got "' + body + '".');
    })
    
    go(info, isValid, 'bytes=0-0,1-1', (statusCode, headers, body) => {
        isValid(/^--[^\n]+\n[^\n]+\n[^\n]+\n\r\nH\r\n--[^\n]+\n[^\n]+\n[^\n]+\n\r\ne\r\n--[^-]+--$/.test(body), 'Expected multipart "H -- e" but got "' + body + '".');
    })
    
    go(info, isValid, 'bytes=-1,1-1', (statusCode, headers, body) => {
        isValid(/^--[^\n]+\n[^\n]+\n[^\n]+\n\r\n!\r\n--[^\n]+\n[^\n]+\n[^\n]+\n\r\ne\r\n--[^-]+--$/.test(body), 'Expected multipart "! -- e" but got "' + body + '".');
    })

}) as Test;
