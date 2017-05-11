import { HTTPCodes, MethodCallArgs, WebDAVRequest } from './WebDAVRequest'
import { RootResource } from '../resource/RootResource'
import { IResource, ReturnCallback } from '../resource/Resource'
import { FSManager } from '../manager/FSManager'
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
    public rootResource : IResource

    constructor(options ?: WebDAVServerOptions)
    {
        this.beforeManagers = [];
        this.rootResource = new RootResource();
        this.afterManagers = [];
        this.methods = {};
        this.options = options;

        // Implement all methods in commands/Commands.ts
        for(var k in Commands)
            if(k === 'NotImplemented')
                this.onUnknownMethod(Commands[k]);
            else
                this.method(k, Commands[k]);
    }

    getResourceFromPath(path : Array<string> | string, callback : ReturnCallback<IResource>)
    getResourceFromPath(path : Array<string> | string, rootResource : IResource, callback : ReturnCallback<IResource>)
    getResourceFromPath(path : Array<string> | string, callbackOrRootResource : ReturnCallback<IResource> | IResource, callback? : ReturnCallback<IResource>)
    {
        var rootResource : IResource;

        if(callbackOrRootResource instanceof Function)
        {
            callback = callbackOrRootResource;
            rootResource = this.rootResource;
        }
        else
            rootResource = callbackOrRootResource;

        var paths : Array<string>
        if(path.constructor === String)
            paths = (path as string).replace(/(^\/|\/$)/g, '').split('/');
        else
            paths = path as Array<string>;
        
        if(paths.length === 0 || paths.length === 1 && paths[0].length === 0)
        {
            callback(null, rootResource);
            return;
        }

        rootResource.getChildren((e, children) => {
            if(e)
            {
                callback(e, null);
                return;
            }
            if(children.length === 0)
            {
                callback(new Error('404 Not Found'), null);
                return;
            }

            let found = false;
            let nb = children.length;
            function done()
            {
                --nb;
                if(nb === 0 && !found)
                    callback(new Error('404 Not Found'), null);
            }

            for(var k in children)
            {
                if(found)
                    break;

                children[k].webName((e, name) => {
                    if(name === paths[0])
                    {
                        found = true;
                        paths.splice(0, 1);
                        this.getResourceFromPath(paths, children[k], callback);
                    }
                    done();
                })
            }
        })
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
            this,
            req,
            res,
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
