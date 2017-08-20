import { TestCallback, TestInfo } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { XMLElementUtil } from 'xml-js-builder'

export function proppatch(server : v2.WebDAVServer, info : TestInfo, path : string, expectedStatusCode : number, bodySet : string[], bodyRemove : string[], callback : (xml : XMLElementUtil) => void)
{
    let body = '<D:propertyupdate xmlns:D="DAV:" xmlns:Z="http://ns.example.com/standards/z39.50/">';
    if(bodySet && bodySet.length > 0)
        body += '<D:set><D:prop>' + bodySet.join() + '</D:prop></D:set>';
    if(bodyRemove && bodyRemove.length > 0)
        body += '<D:remove><D:prop>' + bodyRemove.join() + '</D:prop></D:remove>';
    body += '</D:propertyupdate>';
    
    info.reqXML({
        url: 'http://localhost:' + server.options.port + '/' + path,
        method: 'PROPPATCH',
        body
    }, expectedStatusCode, (res, xml) => {
        callback(xml);
    })
}

export function propfind(server : v2.WebDAVServer, info : TestInfo, path : string, expectedStatusCode : number, depth : number, body : string, callback : (xml : XMLElementUtil) => void)
{
    info.reqXML({
        url: 'http://localhost:' + server.options.port + '/' + path,
        method: 'PROPFIND',
        headers: {
            depth
        },
        body
    }, expectedStatusCode, (res, xml) => {
        callback(xml);
    })
}

export function starter(info : TestInfo, isValid : TestCallback, callback : (server : v2.WebDAVServer) => void) : void
{
    const server = info.startServer({
        storageManager: new v2.PerUserStorageManager(100)
    });
    
    server.rootFileSystem().addSubTree(v2.ExternalRequestContext.create(server), {
        'folder': v2.ResourceType.Directory,
        'file': v2.ResourceType.File
    }, (e) => {
        if(e) return isValid(false, 'Cannot call "addSubTree(...)".', e);

        callback(server);
    })
}
