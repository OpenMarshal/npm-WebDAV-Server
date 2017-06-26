import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createFileTxt'

export default ((info, isValid) =>
{
    const server = info.init(4);

    const content = 'This is my content!';
    info.req({
        url: 'http://localhost:' + info.port + '/fileUndefined.txt',
        method: 'PUT',
        body: content
    }, v2.HTTPCodes.Created, () => {
        info.req({
            url: 'http://localhost:' + info.port + '/fileUndefined.txt',
            method: 'GET'
        }, (res, body) => {
            isValid(body === content, 'The content read is not the same as the one written : "' + body + '" but expected "' + content + '".');
        })
    });
    
    starter(server, info, isValid, content, () => {
        info.req({
            url: 'http://localhost:' + info.port + '/file.txt/fileUndefined.txt',
            method: 'PUT',
            body: content
        }, v2.HTTPCodes.Conflict, () => {
            isValid(true);
        });
    })
    
    info.req({
        url: 'http://localhost:' + info.port + '/folderUndefined/fileUndefined.txt',
        method: 'PUT',
        body: content
    }, v2.HTTPCodes.Conflict, () => {
        isValid(true);
    });
    
    info.req({
        url: 'http://localhost:' + info.port + '/fileUndefined2.txt',
        method: 'PUT',
        body: content
    }, v2.HTTPCodes.Created, () => {
        info.req({
            url: 'http://localhost:' + info.port + '/fileUndefined2.txt',
            method: 'PUT',
            body: content
        }, v2.HTTPCodes.OK, () => {
            isValid(true);
        });
    });

}) as Test;
