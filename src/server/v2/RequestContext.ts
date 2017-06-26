//import { IResource, ReturnCallback, ResourceType } from '../../resource/IResource'
import { requirePrivilege, BasicPrivilege } from '../../user/v2/privilege/IPrivilegeManager'
import { EventsName, DetailsType } from './webDAVServer/Events'
import { XML, XMLElement } from '../../helper/XML'
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

export class RequestContextHeaders
{
    contentLength : number
    isSource : boolean
    depth : number
    host : string

    constructor(protected request : http.IncomingMessage)
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

        for(const k in this.request.headers)
            if(k.replace(/(-| )/g, '').toLowerCase() === name)
            {
                const value = this.request.headers[k].trim();
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
}

export class RequestContext
{
    headers : RequestContextHeaders
    requested : RequestedResource
    user : IUser

    protected constructor(
        public server : WebDAVServer,
        public request : http.IncomingMessage,
        public response : http.ServerResponse,
        public exit : () => void
    ) {
        this.headers = new RequestContextHeaders(request);
        
        const uri = url.parse(request.url).pathname;
        this.requested = {
            uri,
            path: new Path(uri)
        };
    }

    static createExternal(server : WebDAVServer) : RequestContext
    static createExternal(server : WebDAVServer, callback : (error : Error, ctx : RequestContext) => void) : RequestContext
    static createExternal(server : WebDAVServer, options : RequestContextExternalOptions) : RequestContext
    static createExternal(server : WebDAVServer, options : RequestContextExternalOptions, callback : (error : Error, ctx : RequestContext) => void) : RequestContext
    static createExternal(server : WebDAVServer, _options ?: RequestContextExternalOptions | ((error : Error, ctx : RequestContext) => void), _callback ?: (error : Error, ctx : RequestContext) => void) : RequestContext
    {
        const defaultValues = new DefaultRequestContextExternalOptions();

        const options = _options && _options.constructor !== Function ? _options as RequestContextExternalOptions : defaultValues;
        const callback = _callback ? _callback : _options && _options.constructor === Function ? _options as ((error : Error, ctx : RequestContext) => void) : () => {};

        if(defaultValues !== options)
        {
            for(const name in defaultValues)
                if(options[name] === undefined)
                    options[name] = defaultValues[name];
        }

        const ctx = new RequestContext(server, {
            headers: options.headers,
            url: options.url
        } as any, null, null);

        if(!options.user)
            server.httpAuthentication.getUser(ctx, (e, user) => {
                ctx.user = options.user;
                callback(e, ctx);
            })

        return ctx;
    }

    static create(server : WebDAVServer, request : http.IncomingMessage, response : http.ServerResponse, callback : (error : Error, ctx : RequestContext) => void)
    {
        const ctx = new RequestContext(server, request, response, null);
        response.setHeader('DAV', '1,2');
        response.setHeader('Server', server.options.serverName + '/' + server.options.version);

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
                    fs.type(ctx, subPath, (e, type) => {
                        if(e)
                            type = undefined;

                        setAllowHeader(type);
                    })
                })
            })
        })

        function setAllowHeader(type ?: ResourceType)
        {
            const allowedMethods = [];
            for(const name in server.methods)
            {
                const method = server.methods[name];
                if(!method.isValidFor || method.isValidFor(type))
                    allowedMethods.push(name.toUpperCase());
            }

            response.setHeader('Allow', allowedMethods.join(','));
            callback(null, ctx);
        }
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

    requirePrivilegeEx(privileges : BasicPrivilege | BasicPrivilege[], callback : () => void)
    requirePrivilegeEx(privileges : string | string[], callback : () => void)
    requirePrivilegeEx(privileges : BasicPrivilege | BasicPrivilege[] | BasicPrivilege | BasicPrivilege[], callback : () => void)
    {/*
        requirePrivilege(privileges, this, resource, (e, can) => {
            if(e)
            {
                this.setCode(HTTPCodes.InternalServerError);
                this.exit();
                return;
            }

            if(!can)
            {
                this.setCode(HTTPCodes.Unauthorized);
                this.exit();
                return;
            }
            
            callback();
        });*/
        callback();
    }

    requirePrivilege(privileges : BasicPrivilege | BasicPrivilege[], callback : (error : Error, can : boolean) => void)
    requirePrivilege(privileges : string | string[], callback : (error : Error, can : boolean) => void)
    requirePrivilege(privileges : BasicPrivilege | BasicPrivilege[] | BasicPrivilege | BasicPrivilege[], callback : (error : Error, can : boolean) => void)
    {
        //requirePrivilege(privileges, this, resource, callback);
        callback(null, true);
    }

    askForAuthentication(checkForUser : boolean, callback : (error : Error) => void)
    {
        if(checkForUser && this.user !== null && !this.user.isDefaultUser)
        {
            callback(Errors.AlreadyAuthenticated);
            return;
        }

        const auth = this.server.httpAuthentication.askForAuthentication();
        for(const name in auth)
            this.response.setHeader(name, auth[name]);
        callback(null);
    }

    getResource(callback : ReturnCallback<Resource>)
    getResource(path : Path | string, callback : ReturnCallback<Resource>)
    getResource(_path : Path | string | ReturnCallback<Resource>, _callback ?: ReturnCallback<Resource>)
    {
        const path = _callback ? new Path(_path as Path | string) : this.requested.path;
        const callback = _callback ? _callback : _path as ReturnCallback<Resource>;

        this.server.getResource(this, path, callback);
    }

/*
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
        callback(!this.resource ? Errors.ResourceNotFound : null, this.resource);
    }*/

/*
    invokeEvent(event : EventsName, subjectResource ?: IResource, details ?: DetailsType)
    {
        this.server.invoke(event, this, subjectResource, details);
    }
    wrapEvent(event : EventsName, subjectResource ?: IResource, details ?: DetailsType)
    {
        const oldExit = this.exit;
        this.exit = () => {
            if(Math.floor(this.response.statusCode / 100) === 2)
                this.invokeEvent(event, subjectResource, details);

            oldExit();
        }
        return this.exit;
    }
*/
    fullUri(uri : string = null)
    {
        if(!uri)
            uri = this.requested.uri;
        
        return (this.prefixUri() + uri).replace(/([^:])\/\//g, '$1/');
    }

    prefixUri()
    {
        return 'http://' + this.headers.host.replace('/', '');
    }
/*
    getResourcePath(resource : IResource, callback : ReturnCallback<string>)
    {
        if(!resource.parent)
            callback(null, '/');
        else
            resource.webName((e, name) => process.nextTick(() => {
                this.getResourcePath(resource.parent, (e, parentName) => {
                    callback(e, parentName.replace(/\/$/, '') + '/' + name);
                })
            }))
    }*/

    writeBody(xmlObject : XMLElement | object)
    {
        let content = XML.toXML(xmlObject);
        
        switch(this.headers.findBestAccept())
        {
            default:
            case 'xml':
                this.response.setHeader('Content-Type', 'application/xml; charset="utf-8"');
                this.response.setHeader('Content-Length', content.length.toString());
                this.response.write(content);
                break;
                
            case 'json':
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
export default RequestContext;
