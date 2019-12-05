import { XML, XMLElement } from 'xml-js-builder'
import { parseIfHeader } from '../../helper/v2/IfParser'
import { WebDAVServer } from './webDAVServer/WebDAVServer'
import { HTTPCodes } from '../HTTPCodes'
import { FileSystem } from '../../manager/v2/fileSystem/FileSystem'
import { ResourceType, ReturnCallback } from '../../manager/v2/fileSystem/CommonTypes'
import { Resource } from '../../manager/v2/fileSystem/Resource'
import { Path } from '../../manager/v2/Path'
import { Errors } from '../../Errors'
import { IUser } from '../../user/v2/IUser'
import * as http from 'http'
import * as url from 'url'
import { promisifyCall } from '../../helper/v2/promise'

export class RequestContextHeaders
{
    contentLength : number
    isSource : boolean
    depth : number
    host : string

    constructor(protected headers : { [name : string] : string | string[] })
    {
        this.isSource = this.find('source', 'F').toUpperCase() === 'T' || this.find('translate', 'T').toUpperCase() === 'F';
        this.host = this.find('Host', 'localhost');

        const depth = this.find('Depth');
        try
        {
            if(depth.toLowerCase() === 'infinity')
                this.depth = -1;
            else
                this.depth = Math.max(-1, parseInt(depth, 10));
        }
        catch(_)
        {
            this.depth = undefined;
        }
        
        try
        {
            this.contentLength = Math.max(0, parseInt(this.find('Content-length', '0'), 10));
        }
        catch(_)
        {
            this.contentLength = 0;
        }
    }

    find(name : string, defaultValue : string = null) : string
    {
        name = name.replace(/(-| )/g, '').toLowerCase();

        for(const k in this.headers)
            if(k.replace(/(-| )/g, '').toLowerCase() === name)
            {
                const value = this.headers[k].toString().trim();
                if(value.length !== 0)
                    return value;
            }
        
        return defaultValue;
    }

    findBestAccept(defaultType : string = 'xml') : string
    {
        const accepts = this.find('Accept', 'text/xml').split(',');
        const regex = {
            'xml': /[^a-z0-9A-Z]xml$/,
            'json': /[^a-z0-9A-Z]json$/
        };

        for(const value of accepts)
        {
            for(const name in regex)
                if(regex[name].test(value))
                    return name;
        }

        return defaultType;
    }
}

export interface RequestedResource
{
    path : Path
    uri : string
}

export interface RequestContextExternalOptions
{
    rootPath ?: string
    headers ?: { [name : string] : string }
    url ?: string
    user ?: IUser
}
export class DefaultRequestContextExternalOptions implements RequestContextExternalOptions
{
    headers : { [name : string] : string } = {
        host: 'localhost'
    }
    url : string = '/'
    user : IUser = {
        isAdministrator: true,
        isDefaultUser: false,
        password: null,
        uid: '-1',
        username: '_default_super_admin_'
    }
}

export class RequestContext
{
    overridePrivileges : boolean
    requested : RequestedResource
    rootPath : string
    headers : RequestContextHeaders
    server : WebDAVServer
    user : IUser
    
    protected constructor(server : WebDAVServer, uri : string, headers : { [name : string] : string | string[] }, rootPath ?: string)
    {
        this.overridePrivileges = false;
        this.rootPath = rootPath;
        this.headers = new RequestContextHeaders(headers);
        this.server = server;
        
        uri = url.parse(uri).pathname;
        uri = uri ? uri : '';
        this.requested = {
            uri,
            path: new Path(uri)
        };
        this.requested.path.decode();

        if(this.rootPath)
        {
            this.rootPath = new Path(this.rootPath).toString(false);
            if(this.rootPath === '/')
                this.rootPath = undefined;
        }
    }
    
    getResourceAsync() : Promise<Resource>
    getResourceAsync(path : Path | string) : Promise<Resource>
    getResourceAsync(path ?: Path | string) : Promise<Resource>
    {
        return promisifyCall((cb) => this.getResource(path, cb));
    }

    getResource(callback : ReturnCallback<Resource>) : void
    getResource(path : Path | string, callback : ReturnCallback<Resource>) : void
    getResource(_path : Path | string | ReturnCallback<Resource>, _callback ?: ReturnCallback<Resource>) : void
    {
        const path = Path.isPath(_path) ? new Path(_path as Path | string) : this.requested.path;
        const callback = _callback ? _callback : _path as ReturnCallback<Resource>;

        this.server.getResource(this, path, callback);
    }

    getResourceSync(path ?: Path | string) : Resource
    {
        path = path ? path : this.requested.path;
        return this.server.getResourceSync(this, path);
    }

    fullUri(uri : string = null) : string
    {
        if(!uri)
            uri = this.requested.uri;

        if(this.server.options.respondWithPaths)
            return this.rootPath ? this.rootPath + uri : uri;
        else
            return (this.prefixUri() + uri).replace(/([^:])\/\//g, '$1/');
    }

    prefixUri() : string
    {
        return 'http://' + this.headers.host.replace('/', '') + (this.rootPath ? this.rootPath : '');
    }
}

export class ExternalRequestContext extends RequestContext
{
    static create(server : WebDAVServer) : ExternalRequestContext
    static create(server : WebDAVServer, callback : (error : Error, ctx : ExternalRequestContext) => void) : ExternalRequestContext
    static create(server : WebDAVServer, options : RequestContextExternalOptions) : ExternalRequestContext
    static create(server : WebDAVServer, options : RequestContextExternalOptions, callback : (error : Error, ctx : ExternalRequestContext) => void) : ExternalRequestContext
    static create(server : WebDAVServer, _options ?: RequestContextExternalOptions | ((error : Error, ctx : ExternalRequestContext) => void), _callback ?: (error : Error, ctx : ExternalRequestContext) => void) : ExternalRequestContext
    {
        const defaultValues = new DefaultRequestContextExternalOptions();

        const options = _options && _options.constructor !== Function ? _options as RequestContextExternalOptions : defaultValues;
        const callback = _callback ? _callback : _options && _options.constructor === Function ? _options as ((error : Error, ctx : ExternalRequestContext) => void) : () => {};

        if(defaultValues !== options)
        {
            for(const name in defaultValues)
                if(options[name] === undefined)
                    options[name] = defaultValues[name];
        }

        const ctx = new ExternalRequestContext(server, options.url, options.headers);

        if(options.user)
        {
            ctx.user = options.user;
            process.nextTick(() => callback(null, ctx));
        }

        return ctx;
    }
}

export class HTTPRequestContext extends RequestContext
{
    responseBody : string
    request : http.IncomingMessage
    response : http.ServerResponse
    exit : () => void

    protected constructor(
        server : WebDAVServer,
        request : http.IncomingMessage,
        response : http.ServerResponse,
        exit : () => void,
        rootPath ?: string
    ) {
        super(server, request.url, request.headers, rootPath);

        this.responseBody = undefined;
        this.response = response;
        this.request = request;
        this.exit = exit;
        
        if(this.response)
        {
            this.response.on('error', (e) => {
                console.error(e);
            });
        }
    }

    static create(server : WebDAVServer, request : http.IncomingMessage, response : http.ServerResponse, callback : (error : Error, ctx : HTTPRequestContext) => void) : void
    static create(server : WebDAVServer, request : http.IncomingMessage, response : http.ServerResponse, rootPath : string, callback : (error : Error, ctx : HTTPRequestContext) => void) : void
    static create(server : WebDAVServer, request : http.IncomingMessage, response : http.ServerResponse, _rootPath : string | ((error : Error, ctx : HTTPRequestContext) => void), _callback ?: (error : Error, ctx : HTTPRequestContext) => void) : void
    {
        const rootPath = _callback ? _rootPath as string : undefined;
        const callback = _callback ? _callback : _rootPath as ((error : Error, ctx : HTTPRequestContext) => void);

        const ctx = new HTTPRequestContext(server, request, response, null, rootPath);
        response.setHeader('DAV', '1,2');
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Credentials', 'true');
        response.setHeader('Access-Control-Expose-Headers', 'DAV, content-length, Allow');
        response.setHeader('MS-Author-Via', 'DAV');
        response.setHeader('Server', server.options.serverName + '/' + server.options.version);

        if(server.options.headers)
        {
            for(const headerName in server.options.headers)
                response.setHeader(headerName, server.options.headers[headerName]);
        }
        
        const setAllowHeader = (type ?: ResourceType) =>
        {
            const allowedMethods = [];
            for(const name in server.methods)
            {
                const method = server.methods[name];
                if(!method.isValidFor || method.isValidFor(ctx, type))
                    allowedMethods.push(name.toUpperCase());
            }

            response.setHeader('Allow', allowedMethods.join(','));
            callback(null, ctx);
        };

        ctx.askForAuthentication(false, (e) => {
            if(e)
            {
                callback(e, ctx);
                return;
            }

            server.httpAuthentication.getUser(ctx, (e, user) => {
                ctx.user = user;
                if(e && e !== Errors.UserNotFound)
                {
                    if(server.options.requireAuthentification || e !== Errors.MissingAuthorisationHeader)
                        return callback(e, ctx);
                }

                if(server.options.requireAuthentification && (!user || user.isDefaultUser || e === Errors.UserNotFound))
                    return callback(Errors.MissingAuthorisationHeader, ctx);

                server.getFileSystem(ctx.requested.path, (fs, _, subPath) => {
                    fs.type(ctx.requested.path.isRoot() ? server.createExternalContext() : ctx, subPath, (e, type) => {
                        if(e)
                            type = undefined;

                        setAllowHeader(type);
                    })
                })
            })
        })
    }
    
    static encodeURL(url : string)
    {
        return encodeURI(url);
    }

    noBodyExpected(callback : () => void)
    {
        if(this.server.options.strictMode && this.headers.contentLength !== 0)
        {
            this.setCode(HTTPCodes.UnsupportedMediaType);
            this.exit();
        }
        else
            callback();
    }

    checkIfHeader(resource : Resource, callback : () => void)
    checkIfHeader(fs : FileSystem, path : Path, callback : () => void)
    checkIfHeader(_fs : FileSystem | Resource, _path : Path | (() => void), _callback ?: () => void)
    {
        const fs = _callback ? _fs as FileSystem : null;
        const path = _callback ? _path as Path : null;
        let resource = _callback ? null : _fs as Resource;
        const callback = _callback ? _callback : _path as () => void;

        const ifHeader = this.headers.find('If');

        if(!ifHeader)
        {
            callback();
            return;
        }

        if(!resource)
        {
            resource = fs.resource(this, path);
        }

        parseIfHeader(ifHeader)(this, resource, (e, passed) => {
            if(e)
            {
                this.setCode(HTTPCodes.InternalServerError);
                this.exit();
            }
            else if(!passed)
            {
                this.setCode(HTTPCodes.PreconditionFailed);
                this.exit();
            }
            else
                callback();
        });
    }

    askForAuthentication(checkForUser : boolean, callback : (error : Error) => void)
    {
        if(checkForUser && this.user !== null && !this.user.isDefaultUser)
        {
            callback(Errors.AlreadyAuthenticated);
            return;
        }

        const auth = this.server.httpAuthentication.askForAuthentication(this);
        for(const name in auth)
            this.response.setHeader(name, auth[name]);
        callback(null);
    }

    writeBody(xmlObject : XMLElement | object)
    {
        let content = XML.toXML(xmlObject);
        
        switch(this.headers.findBestAccept())
        {
            default:
            case 'xml':
                this.response.setHeader('Content-Type', 'application/xml;charset=utf-8');
                this.response.setHeader('Content-Length', Buffer.from(content).length.toString());
                this.response.write(content, 'UTF-8');
                break;
                
            case 'json':
                content = XML.toJSON(content);
                this.response.setHeader('Content-Type', 'application/json;charset=utf-8');
                this.response.setHeader('Content-Length', Buffer.from(content).length.toString());
                this.response.write(content, 'UTF-8');
                break;
        }

        this.responseBody = content;
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

    protected static defaultErrorStatusCodes = [
        { error: Errors.ResourceNotFound,               code: HTTPCodes.NotFound },
        { error: Errors.Locked,                         code: HTTPCodes.Locked },
        { error: Errors.BadAuthentication,              code: HTTPCodes.Unauthorized },
        { error: Errors.NotEnoughPrivilege,             code: HTTPCodes.Unauthorized },
        { error: Errors.ResourceAlreadyExists,          code: HTTPCodes.Conflict },
        { error: Errors.IntermediateResourceMissing,    code: HTTPCodes.Conflict },
        { error: Errors.WrongParentTypeForCreation,     code: HTTPCodes.Conflict },
        { error: Errors.InsufficientStorage,            code: HTTPCodes.InsufficientStorage },
        { error: Errors.Forbidden,                      code: HTTPCodes.Forbidden }
    ];

    static defaultStatusCode(error : Error) : number
    {
        let code = null;

        for(const errorCode of this.defaultErrorStatusCodes)
        {
            if(errorCode.error === error)
            {
                code = errorCode.code;
                break;
            }
        }
        
        return code;
    }

    setCodeFromError(error : Error) : boolean
    {
        const code = HTTPRequestContext.defaultStatusCode(error);

        if(code)
            this.setCode(code);

        return !!code;
    }
}
