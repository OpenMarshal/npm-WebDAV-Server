import { HTTPCodes, HTTPRequestContext, HTTPMethod } from '../WebDAVRequest'
import { XML, XMLElement } from '../../../helper/XML'
import { Workflow } from '../../../helper/Workflow'
import { ResourceType } from '../../../manager/v2/fileSystem/CommonTypes'
import { Resource } from '../../../manager/v2/fileSystem/Resource'
import { Path } from '../../../manager/v2/Path'
import { Errors } from '../../../Errors'
import { Lock } from '../../../resource/lock/Lock'
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

    let h = Math.ceil(offset / 60).toString(10);
    while(h.length < 2)
        h = '0' + h;

    let m = (offset % 60).toString(10);
    while(m.length < 2)
        m = '0' + m;
        
    result += h + ':' + m;
    
    return result;
}

/*
function lockDiscovery(lockDiscoveryCache : any, ctx : HTTPRequestContext, path : Path, resource : IResource, callback : ReturnCallback<any>)
{
    const cached = lockDiscoveryCache[path.toString()];
    if(cached)
    {
        callback(null, cached);
        return;
    }

    const _Callback = callback;
    callback = (e, l) => {
        if(!e)
            lockDiscoveryCache[path.toString()] = l;
        _Callback(e, l);
    }

    ctx.requireErPrivilege('canListLocks', resource, (e, can) => {
        if(e || !can)
        {
            callback(e, {});
            return;
        }

        resource.getLocks((e, locks) => {
            if(e === Errors.MustIgnore)
            {
                locks = [];
            }
            else if(e)
            {
                callback(e, null);
                return;
            }

            if(resource.parent)
            {
                const parentPath = path.getParent();
                lockDiscovery(lockDiscoveryCache, ctx, parentPath, resource.parent, (e, l) => {
                    if(e)
                        callback(e, null);
                    else
                    {
                        l[path.toString()] = locks;
                        callback(null, l);
                    }
                });
            }
            else
                callback(null, {
                    [path.toString()]: locks
                });
        });
    })
}
*/

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
        const xml = XML.parse(data);

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
    return 'HTTP/1.1 ' + status + ' ' + http.STATUS_CODES[status];
}

export default class implements HTTPMethod
{
    unchunked(ctx : HTTPRequestContext, data : Buffer, callback : () => void) : void
    {
        ctx.getResource((e, resource) => {
            const lockDiscoveryCache = {};

            ctx.checkIfHeader(resource, () => {
                const targetSource = ctx.headers.isSource;

                const multistatus = XML.createElement('D:multistatus', {
                    'xmlns:D': 'DAV:'
                })

                resource.type((e, type) => process.nextTick(() => {
                    if(e)
                    {
                        if(!ctx.setCodeFromError(e))
                            ctx.setCode(HTTPCodes.InternalServerError)
                        return callback();
                    }

                    if(!type.isDirectory || ctx.headers.depth === 0)
                    {
                        addXMLInfo(resource, multistatus, (e) => {
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
                    
                    //ctx.requirePrivilege('canGetChildren', resource, () => {
                        resource.readDir(true, (e, children) => process.nextTick(() => {
                            function err(e)
                            {
                                if(!ctx.setCodeFromError(e))
                                    ctx.setCode(HTTPCodes.InternalServerError)
                                callback();
                            }

                            addXMLInfo(resource, multistatus, (e) => {
                                if(e)
                                    return err(e);

                                new Workflow()
                                    .each(children, (childName, cb) => {
                                        ctx.server.getResource(ctx, ctx.requested.path.getChildPath(childName), (e, r) => {
                                            if(e)
                                                return cb(e);
                                            addXMLInfo(r, multistatus, cb);
                                        });
                                    })
                                    .error(err)
                                    .done(() => {
                                        done(multistatus)
                                    });
                            });
                        }))
                    //})
                }))
                
                function addXMLInfo(resource : Resource, multistatus, _callback)
                {
                    const reqBody = parseRequestBody(ctx, data);

                    const response = XML.createElement('D:response');
                    const callback = (e ?: Error) => {
                        if(e === Errors.MustIgnore)
                            e = null;
                        else if(!e)
                            multistatus.add(response);

                        _callback(e);
                    }

                    const propstat = response.ele('D:propstat')

                    /*const privileges : BasicPrivilege[] = [
                        'canGetCreationDate', 'canGetAvailableLocks', 'canGetLastModifiedDate', 'canGetMimeType', 'canGetProperties', 'canGetSize', 'canGetType', 'canGetWebName'
                    ];
                    if(targetSource)
                        privileges.push('canSource');
                    ctx.requireErPrivilege(privileges, resource, (e, can) => {
                        if(e)
                        {
                            callback(e);
                            return;
                        }
                        
                        if(!can)
                        {
                            callback(Errors.BadAuthentication);
                            return;
                        }*/

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
                                        if(el)
                                            prop.ele(el.name);
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
                                        activelock.ele('D:timeout').add('Second-' + (lock.expirationDate - Date.now()))
                                        activelock.ele('D:locktoken').ele('D:href', undefined, true).add(lock.uuid)
                                        activelock.ele('D:lockroot').ele('D:href', undefined, true).add(encodeURI(ctx.fullUri(path)))
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
                                
                                const p = encodeURI(ctx.fullUri(path.toString()));
                                const href = p.lastIndexOf('/') !== p.length - 1 && type.isDirectory ? p + '/' : p;
                                response.ele('D:href', undefined, true).add(href);
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
                                        resource.mimeType(targetSource, (e, mimeType) => process.nextTick(() => {
                                            if(!e)
                                                tags.getcontenttype.el.add(mimeType)
                                            nbOut(e);
                                        }))
                                    }

                                    if(tags.getcontentlength.value)
                                    {
                                        ++nb;
                                        resource.size(targetSource, (e, size) => process.nextTick(() => {
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
                                    tags.displayname.el.add(name ? encodeURI(name) : '');
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
                    //})
                }

                function done(multistatus)
                {
                    ctx.setCode(HTTPCodes.MultiStatus);
                    ctx.writeBody(multistatus);
                    callback();
                }
            })
        })
    }

    isValidFor(ctx : HTTPRequestContext, type : ResourceType)
    {
        return !!type;
    }
}
