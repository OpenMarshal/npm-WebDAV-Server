import { HTTPCodes, MethodCallArgs, WebDAVRequest } from './WebDAVRequest'
import { IResource } from '../resource/Resource'
import * as http from 'http'
import * as url from 'url'

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

    constructor(options ?: WebDAVServerOptions)
    {
        this.beforeManagers = [];
        this.afterManagers = [];
        this.methods = new Object();
        this.options = options;

        this.method('GET', (arg, callback) => {
            arg.response.write('<html><body>ok</body></html>');
            callback();
        });

        this.onUnknownMethod((arg, callback) => {
            arg.setCode(HTTPCodes.NotImplemented);
            callback();
        });
    }

    onUnknownMethod(unknownMethod : WebDAVRequest)
    {
        this.unknownMethod = unknownMethod;
    }

    start(port : number = this.options.port)
    {
        http.createServer((req : http.IncomingMessage, res : http.ServerResponse) =>
        {
            var method : WebDAVRequest = this.methods[this.normalizeMethodName(req.method)];
            if(!method)
                method = this.unknownMethod;

            var base : MethodCallArgs = this.createMethodCallArgs(req, res)
            this.invokeBeforeRequest(base, () => {
                method(base, () =>
                {
                    res.end();
                    this.invokeAfterRequest(base, null);
                });
            })
        }).listen(port);
    }

    protected createMethodCallArgs(req : http.IncomingMessage, res : http.ServerResponse) : MethodCallArgs
    {
        var uri = url.parse(req.url).pathname;
        
        return new MethodCallArgs(
            uri,
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
