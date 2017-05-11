import { HTTPCodes, MethodCallArgs, WebDAVRequest } from './WebDAVRequest'
import { IResource } from '../resource/Resource'
import * as http from 'http'
import * as url from 'url'

import Commands from './commands/Commands'

export class WebDAVServerOptions
{
    port ?: number = 1900
}

export class WebDAVServer
{
    protected beforeManagers : Array<WebDAVRequest>
    protected afterManagers : Array<WebDAVRequest>
    protected unknownMethod : WebDAVRequest
    protected options : WebDAVServerOptions
    protected methods : Object
    protected server : http.Server

    constructor(options ?: WebDAVServerOptions)
    {
        this.beforeManagers = [];
        this.afterManagers = [];
        this.methods = new Object();
        this.options = options;

        // Implement all methods in commands/Commands.ts
        for(var k in Commands)
            if(k === 'NotImplemented')
                this.onUnknownMethod(Commands[k]);
            else
                this.method(k, Commands[k]);
    }

    onUnknownMethod(unknownMethod : WebDAVRequest)
    {
        this.unknownMethod = unknownMethod;
    }

    start(port : number = this.options.port)
    {
        this.server = http.createServer((req : http.IncomingMessage, res : http.ServerResponse) =>
        {
            var method : WebDAVRequest = this.methods[this.normalizeMethodName(req.method)];
            if(!method)
                method = this.unknownMethod;

            var base : MethodCallArgs = this.createMethodCallArgs(req, res)

            if(!method.chunked)
            {
                var data = '';
                var go = () =>
                {
                    base.data = data;
                    this.invokeBeforeRequest(base, () => {
                        method(base, () =>
                        {
                            res.end();
                            this.invokeAfterRequest(base, null);
                        });
                    })
                }
                
                if(base.contentLength === 0)
                {
                    go();
                }
                else
                {
                    req.on('data', chunk => {
                        data += chunk.toString();
                        if(data.length >= base.contentLength)
                        {
                            if(data.length > base.contentLength)
                                data = data.substring(0, base.contentLength);
                            go();
                        }
                    });
                }
            }
        })
        this.server.listen(port);
    }

    stop(callback : () => void)
    {
        if(this.server)
        {
            this.server.close(() => callback());
            this.server = null;
        }
        else
            process.nextTick(callback);
    }

    protected createMethodCallArgs(req : http.IncomingMessage, res : http.ServerResponse) : MethodCallArgs
    {
        return new MethodCallArgs(
            req,
            res,
            null,
            null
        )
    }

    protected normalizeMethodName(method : string) : string
    {
        return method.toLowerCase();
    }

    method(name : string, manager : WebDAVRequest)
    {
        this.methods[this.normalizeMethodName(name)] = manager;
    }

    beforeRequest(manager : WebDAVRequest)
    {
        this.beforeManagers.push(manager);
    }
    afterRequest(manager : WebDAVRequest)
    {
        this.afterManagers.push(manager);
    }

    protected invokeBARequest(collection : Array<WebDAVRequest>, base : MethodCallArgs, callback)
    {
        function callCallback()
        {
            if(callback)
                process.nextTick(callback);
        }

        if(collection.length === 0)
        {
            callCallback();
            return;
        }

        base.callback = next;
        var nb = collection.length + 1;
        
        function next()
        {
            --nb;
            if(nb === 0)
            {
                callCallback();
            }
            else
                process.nextTick(() => collection[collection.length - nb](base, next))
        }
        next();
    }
    protected invokeBeforeRequest(base : MethodCallArgs, callback)
    {
        this.invokeBARequest(this.beforeManagers, base, callback);
    }
    protected invokeAfterRequest(base : MethodCallArgs, callback)
    {
        this.invokeBARequest(this.afterManagers, base, callback);
    }
}
