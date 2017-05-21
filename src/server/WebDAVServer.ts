import { WebDAVServerOptions, setDefaultServerOptions } from './WebDAVServerOptions'
import { HTTPCodes, MethodCallArgs, WebDAVRequest } from './WebDAVRequest'
import { IResource, ReturnCallback } from '../resource/IResource'
import { FakePrivilegeManager } from '../user/privilege/FakePrivilegeManager'
import { HTTPAuthentication } from '../user/authentication/HTTPAuthentication'
import { IPrivilegeManager } from '../user/privilege/IPrivilegeManager'
import { SimpleUserManager } from '../user/simple/SimpleUserManager'
import { FSManager, FSPath } from '../manager/FSManager'
import { RootResource } from '../resource/std/RootResource'
import { IUserManager } from '../user/IUserManager'
import { Errors } from '../Errors'
import Commands from './commands/Commands'
import * as http from 'http'

export { WebDAVServerOptions } from './WebDAVServerOptions'

export class WebDAVServer
{
    public httpAuthentication : HTTPAuthentication
    public privilegeManager : IPrivilegeManager
    public rootResource : IResource
    public userManager : IUserManager
    public options : WebDAVServerOptions
    public methods : object

    protected beforeManagers : WebDAVRequest[]
    protected afterManagers : WebDAVRequest[]
    protected unknownMethod : WebDAVRequest
    protected server : http.Server

    constructor(options ?: WebDAVServerOptions)
    {
        this.beforeManagers = [];
        this.afterManagers = [];
        this.methods = {};
        this.options = setDefaultServerOptions(options);

        this.httpAuthentication = this.options.httpAuthentication;
        this.privilegeManager = this.options.privilegeManager;
        this.rootResource = this.options.rootResource;
        this.userManager = this.options.userManager;

        // Implement all methods in commands/Commands.ts
        for(const k in Commands)
            if(k === 'NotImplemented')
                this.onUnknownMethod(Commands[k]);
            else
                this.method(k, Commands[k]);
    }

    getResourceFromPath(path : FSPath | string[] | string, callback : ReturnCallback<IResource>)
    getResourceFromPath(path : FSPath | string[] | string, rootResource : IResource, callback : ReturnCallback<IResource>)
    getResourceFromPath(path : FSPath | string[] | string, callbackOrRootResource : ReturnCallback<IResource> | IResource, callback ?: ReturnCallback<IResource>)
    {
        let rootResource : IResource;

        if(callbackOrRootResource instanceof Function)
        {
            callback = callbackOrRootResource;
            rootResource = this.rootResource;
        }
        else
            rootResource = callbackOrRootResource;

        let paths : FSPath
        if(path.constructor === FSPath)
            paths = path as FSPath;
        else
            paths = new FSPath(path);
        
        if(paths.isRoot())
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

            for(const k in children)
            {
                if(found)
                    break;

                children[k].webName((e, name) => {
                    if(name === paths.rootName())
                    {
                        found = true;
                        paths.removeRoot();
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
            let method : WebDAVRequest = this.methods[this.normalizeMethodName(req.method)];
            if(!method)
                method = this.unknownMethod;

            MethodCallArgs.create(this, req, res, (e, base) => {
                if(e)
                {
                    if(e === Errors.AuenticationPropertyMissing)
                        base.setCode(HTTPCodes.Unauthorized);
                    else
                        base.setCode(HTTPCodes.InternalServerError);
                    res.end();
                    return;
                }

                if(!method.chunked)
                {
                    let data = '';
                    const go = () =>
                    {
                        base.data = data;
                        this.invokeBeforeRequest(base, () => {
                            base.exit = () =>
                            {
                                res.end();
                                this.invokeAfterRequest(base, null);
                            };
                            method(base, base.exit);
                        })
                    }
                    
                    if(base.contentLength === 0)
                    {
                        go();
                    }
                    else
                    {
                        req.on('data', (chunk) => {
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
        })
        this.server.listen(port);
    }

    stop(callback : () => void)
    {
        if(this.server)
        {
            this.server.close(callback);
            this.server = null;
        }
        else
            process.nextTick(callback);
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

    protected normalizeMethodName(method : string) : string
    {
        return method.toLowerCase();
    }

    protected invokeBARequest(collection : WebDAVRequest[], base : MethodCallArgs, callback)
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
        let nb = collection.length + 1;
        
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
