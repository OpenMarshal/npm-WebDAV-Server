import { IResource, ReturnCallback } from '../resource/Resource'
import { XML, XMLElement } from '../helper/XML'
import { WebDAVServer } from '../server/WebDAVServer'
import { FSPath } from '../manager/FSManager'
import * as http from 'http'
import * as url from 'url'

export class MethodCallArgs
{
    contentLength : number
    depth : number
    host : string
    path : FSPath
    uri : string
    
    data : string

    constructor(
        public server : WebDAVServer,
        public request : http.IncomingMessage,
        public response : http.ServerResponse,
        public callback : () => void
    ) {
        this.contentLength = parseInt(this.findHeader('Content-length', '0'), 10);
        this.depth = parseInt(this.findHeader('Depth', '0'), 10);
        this.host = this.findHeader('Host');
        
        this.uri = url.parse(request.url).pathname;
        this.path = new FSPath(this.uri);
    }

    accept(regex : RegExp[]) : number
    {
        const accepts = this.findHeader('Accept', 'text/xml').split(',');

        for(const value of accepts)
        {
            for(let i = 0; i < regex.length; ++i)
                if(regex[i].test(value))
                    return i;
        }

        return -1;
    }

    findHeader(name : string, defaultValue : string = null) : string
    {
        name = name.replace(/(-| )/g, '').toLowerCase();

        for(const k in this.request.headers)
            if(k.replace(/(-| )/g, '').toLowerCase() === name)
                return this.request.headers[k];
        
        return defaultValue;
    }

    getResource(callback : ReturnCallback<IResource>)
    {
        this.server.getResourceFromPath(this.uri, callback);
    }

    dateISO8601(ticks : number) : string
    {
        // Adding date
        const date = new Date(ticks);
        let result = date.toISOString().substring(0, '0000-00-00T00:00:00'.length);
        
        // Adding timezone offset
        let offset = date.getTimezoneOffset();
        result += offset < 0 ? '-' : '+'
        offset = Math.abs(offset)

        let h = Math.ceil(offset / 60).toString(10);
        while(h.length < 2)
            h = '0' + h;

        let m = (offset % 60).toString(10);
        while(m.length < 2)
            m = '0' + m;
            
        result += h + ':' + m;
        
        return result;
    }

    fullUri(uri : string = null)
    {
        if(!uri)
            uri = this.uri;
        
        return this.prefixUri() + uri.replace(/\/\//g, '/');
    }

    prefixUri()
    {
        return 'http://' + this.host.replace('/', '');
    }

    getResourcePath(resource : IResource, callback : ReturnCallback<string>)
    {
        if(!resource.parent)
            callback(null, '/');
        else
            resource.webName((e, name) => {
                this.getResourcePath(resource.parent, (e, parentName) => {
                    callback(e, parentName.replace(/\/$/, '') + '/' + name);
                })
            })
    }

    writeXML(xmlObject : XMLElement | object)
    {
        let content = XML.toXML(xmlObject);
        
        switch(this.accept([ /[^a-z0-9A-Z]xml$/, /[^a-z0-9A-Z]json$/ ]))
        {
            default:
            case 0: // xml
                this.response.setHeader('Content-Type', 'application/xml; charset="utf-8"');
                this.response.setHeader('Content-Length', content.length.toString());
                this.response.write(content);
                break;
                
            case 1: // json
                content = XML.toJSON(content);
                this.response.setHeader('Content-Type', 'application/json; charset="utf-8"');
                this.response.setHeader('Content-Length', content.length.toString());
                this.response.write(content);
                break;
        }
    }
    
    setCode(code : number, message ?: string)
    {
        if(!message)
            message = http.STATUS_CODES[code];
        if(!message)
        {
            this.response.statusCode = code;
        }
        else
        {
            this.response.statusCode = code;
            this.response.statusMessage = message;
        }
    }
}
export default MethodCallArgs;
