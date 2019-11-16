import { HTTPCodes, HTTPRequestContext, HTTPMethod } from '../WebDAVRequest'
import { XML, XMLElementBuilder, XMLElement } from 'xml-js-builder'
import { ResourceType } from '../../../manager/v2/fileSystem/CommonTypes'
import { Workflow } from '../../../helper/Workflow'
import { Resource } from '../../../manager/v2/fileSystem/Resource'
import { Errors } from '../../../Errors'
import { Lock } from '../../../resource/v2/lock/Lock'
import * as http from 'http'

function dateISO8601(ticks : number) : string
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

interface PropertyRule
{
    leftElements : XMLElement[]
    mustDisplay : (propertyName : string) => boolean
    mustDisplayValue : (propertyName : string) => boolean
}

function parseRequestBody(ctx : HTTPRequestContext, data : Buffer) : PropertyRule
{
    const allTrue : PropertyRule = {
        leftElements: [],
        mustDisplay: () => true,
        mustDisplayValue: () => true
    }
    const onlyName : PropertyRule = {
        leftElements: [],
        mustDisplay: () => true,
        mustDisplayValue: () => false
    }

    if(ctx.headers.contentLength <= 0)
        return allTrue;

    try
    {
        const xml = XML.parse(data as any);

        const propfind = xml.find('DAV:propfind');

        if(propfind.findIndex('DAV:propname') !== -1)
            return onlyName;

        if(propfind.findIndex('DAV:allprop') !== -1)
            return allTrue;

        const prop = propfind.find('DAV:prop');
        const fn = (name : string) => {
            const index = prop.findIndex(name);
            if(index === -1)
                return false;
            prop.elements.splice(index, 1);
            return true;
        };

        return {
            leftElements: prop.elements,
            mustDisplay: fn,
            mustDisplayValue: () => true
        }
    }
    catch(ex)
    {
        return allTrue;
    }
}

function propstatStatus(status : number)
{
    return `HTTP/1.1 ${status} ${http.STATUS_CODES[status]}`;
}

export default class implements HTTPMethod
{
    addXMLInfo(ctx : HTTPRequestContext, data : Buffer, resource : Resource, multistatus : XMLElementBuilder, _callback : (e ?: Error) => void) : void
    {
        const reqBody = parseRequestBody(ctx, data);

        const response = new XMLElementBuilder('D:response');
        const callback = (e ?: Error) => {
            if(e === Errors.MustIgnore || e === Errors.ResourceNotFound)
                e = null;
            else if(!e)
                multistatus.add(response);
            else
            {
                const errorNumber = HTTPRequestContext.defaultStatusCode(e);
                if(errorNumber !== null)
                {
                    const response = new XMLElementBuilder('D:response');
                    response.ele('D:propstat').ele('D:status').add(`HTTP/1.1 ${errorNumber} ${http.STATUS_CODES[errorNumber]}`);
                    resource.fs.getFullPath(ctx, resource.path, (e, path) => {
                        if(e)
                            return nbOut(e);
                        
                        const p = HTTPRequestContext.encodeURL(ctx.fullUri(path.toString()));
                        response.ele('D:href', undefined, true).add(p);
                        if(ctx.server.options.enableLocationTag)
                            response.ele('D:location').ele('D:href', undefined, true).add(p);
                    })
                    multistatus.add(response);
                }
            }

            _callback(e);
        }

        const propstat = response.ele('D:propstat')

        propstat.ele('D:status').add('HTTP/1.1 200 OK')

        const prop = propstat.ele('D:prop')
        
        let nb = 1;
        function nbOut(error?)
        {
            if(nb > 0 && error)
            {
                nb = -1000;
                return callback(error);
            }

            --nb;
            if(nb === 0)
            {
                if(reqBody.leftElements.length > 0)
                {
                    const propstatError = response.ele('D:propstat');
                    const prop = propstatError.ele('D:prop');
                    propstatError.ele('D:status').add(propstatStatus(HTTPCodes.NotFound));

                    for(const el of reqBody.leftElements)
                    {
                        if(el)
                        {
                            prop.add(el);
                        }
                    }
                }
                callback();
            }
        }
        
        const tags : any = {};

        function mustDisplayTag(name : string)
        {
            if(reqBody.mustDisplay('DAV:' + name))
                tags[name] = {
                    el: prop.ele('D:' + name),
                    value: reqBody.mustDisplayValue('DAV:' + name)
                };
            else
                tags[name] = {
                    value: false
                };
        }

        mustDisplayTag('getlastmodified')
        mustDisplayTag('lockdiscovery')
        mustDisplayTag('supportedlock')
        mustDisplayTag('creationdate')
        mustDisplayTag('resourcetype')
        mustDisplayTag('displayname')
        mustDisplayTag('getetag')

        function displayValue(values : string[] | string, fn : () => void)
        {
            if(values.constructor === String ? tags[values as string].value : (values as string[]).some((n) => tags[n].value))
            {
                ++nb;
                process.nextTick(fn);
            }
        }

        displayValue('creationdate', () =>
        {
            resource.creationDate((e, ticks) => process.nextTick(() => {
                if(!e)
                    tags.creationdate.el.add(dateISO8601(ticks));
                
                nbOut(e);
            }))
        })

        displayValue('lockdiscovery', () =>
        {
            resource.listDeepLocks((e, locks) => {
                if(e)
                    return nbOut(e);

                for(const path in locks)
                {
                    for(const _lock of locks[path])
                    {
                        const lock : Lock = _lock;
                        const activelock = tags.lockdiscovery.el.ele('D:activelock');
                        
                        activelock.ele('D:lockscope').ele('D:' + lock.lockKind.scope.value.toLowerCase())
                        activelock.ele('D:locktype').ele('D:' + lock.lockKind.type.value.toLowerCase())
                        activelock.ele('D:depth').add('Infinity')
                        if(lock.owner)
                            activelock.ele('D:owner').add(lock.owner)
                        activelock.ele('D:timeout').add(`Second-${lock.expirationDate - Date.now()}`)
                        activelock.ele('D:locktoken').ele('D:href', undefined, true).add(lock.uuid)
                        activelock.ele('D:lockroot').ele('D:href', undefined, true).add(HTTPRequestContext.encodeURL(ctx.fullUri(path)))
                    }
                }
                
                nbOut(null);
            })
        })
        
        ++nb;
        resource.type((e, type) => process.nextTick(() => {
            if(e)
                return nbOut(e);
            
            resource.fs.getFullPath(ctx, resource.path, (e, path) => {
                if(e)
                    return nbOut(e);
                
                const p = HTTPRequestContext.encodeURL(ctx.fullUri(path.toString()));
                const href = p.lastIndexOf('/') !== p.length - 1 && type.isDirectory ? p + '/' : p;
                response.ele('D:href', undefined, true).add(href);
                if(ctx.server.options.enableLocationTag)
                    response.ele('D:location').ele('D:href', undefined, true).add(p);

                if(tags.resourcetype.value && type.isDirectory)
                    tags.resourcetype.el.ele('D:collection')
                    
                if(type.isFile)
                {
                    mustDisplayTag('getcontentlength')
                    mustDisplayTag('getcontenttype')

                    if(tags.getcontenttype.value)
                    {
                        ++nb;
                        resource.mimeType(ctx.headers.isSource, (e, mimeType) => process.nextTick(() => {
                            if(!e)
                                tags.getcontenttype.el.add(mimeType)
                            nbOut(e);
                        }))
                    }

                    if(tags.getcontentlength.value)
                    {
                        ++nb;
                        resource.size(ctx.headers.isSource, (e, size) => process.nextTick(() => {
                            if(!e)
                                tags.getcontentlength.el.add(size === undefined || size === null || size.constructor !== Number ? 0 : size)
                            nbOut(e);
                        }))
                    }
                }

                nbOut();
            })
        }))

        displayValue('displayname', () =>
        {
            let methodDisplayName = resource.webName;
            if(resource.displayName)
                methodDisplayName = resource.displayName;
            
            methodDisplayName.bind(resource)((e, name) => process.nextTick(() => {
                if(!e)
                    tags.displayname.el.add(name || '');
                nbOut(e);
            }))
        })

        displayValue('supportedlock', () =>
        {
            resource.availableLocks((e, lockKinds) => process.nextTick(() => {
                if(e)
                {
                    nbOut(e);
                    return;
                }

                lockKinds.forEach((lockKind) => {
                    const lockentry = tags.supportedlock.el.ele('D:lockentry')

                    const lockscope = lockentry.ele('D:lockscope')
                    lockscope.ele('D:' + lockKind.scope.value.toLowerCase())

                    const locktype = lockentry.ele('D:locktype')
                    locktype.ele('D:' + lockKind.type.value.toLowerCase())
                })
                nbOut();
            }))
        })

        displayValue('getlastmodified', () =>
        {
            resource.lastModifiedDate((e, lastModifiedDate) => process.nextTick(() => {
                if(!e && tags.getlastmodified.value)
                    tags.getlastmodified.el.add(new Date(lastModifiedDate).toUTCString())
                nbOut(e);
            }))
        })

        displayValue('getetag', () =>
        {
            resource.etag((e, etag) => process.nextTick(() => {
                if(!e && tags.getetag.value)
                    tags.getetag.el.add(etag);
                nbOut(e);
            }))
        })

        ++nb;
        process.nextTick(() => {
            resource.propertyManager((e, pm) => {
                if(e)
                    return nbOut(e);
                
                pm.getProperties((e, properties) => {
                    if(e)
                        return nbOut(e);
                    
                    for(const name in properties)
                    {
                        if(reqBody.mustDisplay(name))
                        {
                            const tag = prop.ele(name);
                            if(reqBody.mustDisplayValue(name))
                            {
                                const property = properties[name];
                                if(tag.attributes)
                                    for(const attName in property.attributes)
                                        tag.attributes[attName] = property.attributes[attName];
                                else
                                    tag.attributes = property.attributes;

                                tag.add(property.value);
                            }
                        }
                    }
                    nbOut();
                })
            })
        })

        nbOut();
    }
    
    unchunked(ctx : HTTPRequestContext, data : Buffer, callback : () => void) : void
    {
        if(ctx.server.options.maxRequestDepth < ctx.headers.depth || ctx.headers.depth < 0 && (ctx.server.options.maxRequestDepth !== Infinity && ctx.server.options.maxRequestDepth >= 0))
        {
            ctx.setCode(HTTPCodes.Forbidden);
            callback();
            return;
        }

        ctx.getResource((e, resource) => {
            ctx.checkIfHeader(resource, () => {
                const multistatus = new XMLElementBuilder('D:multistatus', {
                    'xmlns:D': 'DAV:'
                })
                
                const done = (multistatus) =>
                {
                    ctx.setCode(HTTPCodes.MultiStatus);
                    ctx.writeBody(multistatus);
                    callback();
                }

                resource.type((e, type) => process.nextTick(() => {
                    if(e)
                    {
                        if(!ctx.setCodeFromError(e))
                            ctx.setCode(HTTPCodes.InternalServerError)
                        return callback();
                    }

                    if(!type.isDirectory || ctx.headers.depth === 0)
                    {
                        this.addXMLInfo(ctx, data, resource, multistatus, (e) => {
                            if(!e)
                                done(multistatus);
                            else
                            {
                                if(!ctx.setCodeFromError(e))
                                    ctx.setCode(HTTPCodes.InternalServerError)
                                callback();
                            }
                        })
                        return;
                    }

                    const injectResourcePropfind = (resource : Resource, depth : number, callback : () => void) => {
                        --depth;

                        resource.readDir(true, (e, children) => process.nextTick(() => {
                            function err(e)
                            {
                                if(!ctx.setCodeFromError(e))
                                    ctx.setCode(HTTPCodes.InternalServerError)
                                callback();
                            }
    
                            if(e)
                                return err(e);

                            resource.fs.getFullPath(ctx, resource.path, (e, rsPath) => {
                                new Workflow()
                                    .each(children, (childName, cb) => {
                                        ctx.server.getResource(ctx, rsPath.getChildPath(childName), (e, r) => {
                                            if(e)
                                                return cb(e);

                                            this.addXMLInfo(ctx, data, r, multistatus, (e) => {
                                                if(e)
                                                    return cb(e);
                                                
                                                if(depth !== 0)
                                                {
                                                    r.type((e, type) => {
                                                        if(e || !type.isDirectory)
                                                            return cb(e);
                                                            
                                                        injectResourcePropfind(r, depth, () => {
                                                            cb();
                                                        });
                                                    })
                                                }
                                                else
                                                {
                                                    cb();
                                                }
                                            });
                                        });
                                    })
                                    .error(err)
                                    .done(() => {
                                        callback();
                                    });
                            })
                        }))
                    }

                    this.addXMLInfo(ctx, data, resource, multistatus, (e) => {
                        if(!e)
                        {
                            injectResourcePropfind(resource, ctx.headers.depth, () => {
                                done(multistatus);
                            });
                        }
                        else
                        {
                            if(!ctx.setCodeFromError(e))
                                ctx.setCode(HTTPCodes.InternalServerError)
                            callback();
                        }
                    })
                }))
            })
        })
    }

    isValidFor(ctx : HTTPRequestContext, type : ResourceType)
    {
        return !!type;
    }
}
