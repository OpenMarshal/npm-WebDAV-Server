import { IResource, ReturnCallback, ResourceType } from '../../resource/v1/IResource'
import { requirePrivilege, BasicPrivilege } from '../../user/v1/privilege/IPrivilegeManager'
import { EventsName, DetailsType } from './webDAVServer/Events'
import { XML, XMLElement } from 'xml-js-builder'
import { parseIfHeader } from '../../helper/v1/IfParser'
import { WebDAVServer } from './webDAVServer/WebDAVServer'
import { HTTPCodes } from '../HTTPCodes'
import { FSPath } from '../../manager/v1/FSManager'
import { Errors } from '../../Errors'
import { IUser } from '../../user/v1/IUser'
import * as http from 'http'
import * as url from 'url'

export class MethodCallArgs
{
    contentLength : number
    isSource : boolean
    depth : number
    host : string
    path : FSPath
    uri : string
    resource : IResource
    resourceType : ResourceType
    
    data : Buffer | Int8Array
    user : IUser

    protected constructor(
        public server : WebDAVServer,
        public request : http.IncomingMessage,
        public response : http.ServerResponse,
        public exit : () => void,
        public callback : () => void
    ) {
        this.contentLength = parseInt(this.findHeader('Content-length', '0'), 10);
        this.isSource = this.findHeader('source', 'F').toUpperCase() === 'T' || this.findHeader('translate', 'T').toUpperCase() === 'F';
        this.depth = parseInt(this.findHeader('Depth', '0'), 10);
        this.host = this.findHeader('Host');
        
        this.uri = url.parse(request.url).pathname;
        this.path = new FSPath(this.uri);
    }

    static create(
        server : WebDAVServer,
        request : http.IncomingMessage,
        response : http.ServerResponse,
        callback : (error : Error, mca : MethodCallArgs) => void)
    {
        const mca = new MethodCallArgs(server, request, response, null, null);
        response.setHeader('DAV', '1,2');
        response.setHeader('Server', server.options.serverName + '/' + server.options.version);

        mca.askForAuthentication(false, (e) => {
            if(e)
            {
                callback(e, mca);
                return;
            }

            server.httpAuthentication.getUser(mca, server.userManager, (e, user) => {
                mca.user = user;
                if(e && e !== Errors.UserNotFound)
                {
                    if(server.options.requireAuthentification || e !== Errors.MissingAuthorisationHeader)
                    {
                        callback(e, mca);
                        return;
                    }
                }

                if(server.options.requireAuthentification && (!user || user.isDefaultUser || e === Errors.UserNotFound))
                {
                    callback(Errors.MissingAuthorisationHeader, mca);
                    return;
                }

                server.getResourceFromPath(mca, mca.uri, (e, r) => {
                    if(e || !r)
                    {
                        setAllowHeader();
                        return;
                    }

                    mca.resource = r;

                    r.type((e, type) => {
                        if(e || !type)
                        {
                            setAllowHeader();
                            return;
                        }

                        mca.resourceType = type;
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
            callback(null, mca);
        }
    }

    noBodyExpected(callback : () => void)
    {
        if(this.server.options.strictMode && this.contentLength !== 0)
        {
            this.setCode(HTTPCodes.UnsupportedMediaType);
            this.exit();
        }
        else
            callback();
    }

    checkIfHeader(defaultResource : IResource, callback : () => void)
    {
        const ifHeader = this.findHeader('If');

        if(!ifHeader)
        {
            callback();
            return;
        }

        parseIfHeader(ifHeader)(this, defaultResource, (e, passed) => {
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

    requireCustomPrivilege(privileges : string | string[], resource : IResource, callback : () => void)
    {
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
        });
    }
    requirePrivilege(privileges : BasicPrivilege | BasicPrivilege[], resource : IResource, callback : () => void)
    {
        this.requireCustomPrivilege(privileges, resource, callback);
    }

    requireErCustomPrivilege(privileges : string | string[], resource : IResource, callback : (error : Error, can : boolean) => void)
    {
        requirePrivilege(privileges, this, resource, callback);
    }
    requireErPrivilege(privileges : BasicPrivilege | BasicPrivilege[], resource : IResource, callback : (error : Error, can : boolean) => void)
    {
        this.requireErCustomPrivilege(privileges, resource, callback);
    }

    askForAuthentication(checkForUser : boolean, callback : (error : Error) => void)
    {
        if(checkForUser && this.user !== null && !this.user.isDefaultUser)
        {
            callback(Errors.AlreadyAuthenticated)
            return;
        }

        const auth = this.server.httpAuthentication.askForAuthentication();
        for(const name in auth)
            this.response.setHeader(name, auth[name]);
        callback(null);
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
                return this.request.headers[k].toString();
        
        return defaultValue;
    }

    getResource(callback : ReturnCallback<IResource>)
    {
        callback(!this.resource ? Errors.ResourceNotFound : null, this.resource);
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

        let h = Math.floor(offset / 60).toString(10);
        while(h.length < 2)
            h = '0' + h;

        let m = (offset % 60).toString(10);
        while(m.length < 2)
            m = '0' + m;
            
        result += h + ':' + m;
        
        return result;
    }

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

    fullUri(uri : string = null)
    {
        if(!uri)
            uri = this.uri;
        
        return (this.prefixUri() + uri).replace(/([^:])\/\//g, '$1/');
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
            resource.webName((e, name) => process.nextTick(() => {
                this.getResourcePath(resource.parent, (e, parentName) => {
                    callback(e, parentName.replace(/\/$/, '') + '/' + name);
                })
            }))
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
export type RequestContext = MethodCallArgs;
