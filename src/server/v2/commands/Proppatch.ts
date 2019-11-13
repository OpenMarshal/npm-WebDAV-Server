import { HTTPCodes, HTTPMethod, HTTPRequestContext } from '../WebDAVRequest'
import { XML, XMLElementBuilder, XMLElement } from 'xml-js-builder'
import { ResourceType } from '../../../manager/v2/fileSystem/CommonTypes'
import { STATUS_CODES } from 'http'
import { startsWith } from '../../../helper/JSCompatibility'
import { Workflow } from '../../../helper/Workflow'
import { Errors } from '../../../Errors'

export default class implements HTTPMethod
{
    unchunked(ctx : HTTPRequestContext, data : Buffer, callback : () => void) : void
    {
        ctx.getResource((e, r) => {
            ctx.checkIfHeader(r, () => {
                //ctx.requirePrivilege([ 'canSetProperty', 'canRemoveProperty' ], r, () => {
                    const multistatus = new XMLElementBuilder('D:multistatus', {
                        'xmlns:D': 'DAV:'
                    });
                    const response = multistatus.ele('D:response');
                    response.ele('D:href', undefined, true).add(HTTPRequestContext.encodeURL(ctx.fullUri()));

                    try
                    {
                        const xml = XML.parse(data as any);
                        const root = xml.find('DAV:propertyupdate');
                        const notifications : any = { }
                        const reverse = [];

                        let finalize = function()
                        {
                            finalize = function()
                            {
                                const next = () => {
                                    const codes = Object.keys(notifications);

                                    codes.forEach((code) => {
                                        const propstat = response.ele('D:propstat');
                                        const prop = propstat.ele('D:prop');
                                        notifications[code].forEach((name) => prop.add(new XMLElementBuilder(name)));
                                        propstat.ele('D:status').add('HTTP/1.1 ' + code + ' ' + STATUS_CODES[code]);
                                    })

                                    ctx.setCode(HTTPCodes.MultiStatus);
                                    ctx.writeBody(multistatus);
                                    callback();
                                }

                                if(Object.keys(notifications).length > 1)
                                {
                                    new Workflow()
                                        .each(reverse, (action, cb) => action(cb))
                                        .error((e) => {
                                            if(!ctx.setCodeFromError(e))
                                                ctx.setCode(HTTPCodes.InternalServerError)
                                            callback();
                                        })
                                        .done(() => {
                                            if(notifications[HTTPCodes.OK])
                                            {
                                                notifications[HTTPCodes.FailedDependency] = notifications[HTTPCodes.OK];
                                                delete notifications[HTTPCodes.OK];
                                            }
                                            next();
                                        })
                                }
                                else
                                    next();
                            }
                        }

                        const notify = function(el : any, error : any)
                        {
                            const code = error ? HTTPCodes.Forbidden : HTTPCodes.OK;
                            if(!notifications[code])
                                notifications[code] = [];
                            notifications[code].push(el.name);
                        }

                        const execute = function(name : string, eventName : /*EventsName*/string, fnProp)
                        {
                            const list = root.findMany(name);
                            if(list.length === 0)
                            {
                                finalize();
                                return;
                            }

                            list.forEach(function(el) {
                                const els = el.find('DAV:prop').elements;
                                
                                new Workflow(false)
                                    .each(els, (x, cb) => {
                                        if(x.type !== 'element')
                                            return cb();
                                        fnProp(x, cb);
                                    })
                                    .intermediate((el, e) => {
                                        /*if(!e)
                                            ctx.invokeEvent(eventName, r, el)*/
                                        if(el.type === 'element')
                                            notify(el, e)
                                    })
                                    .done((_) => finalize())
                            })
                        }
                        
                        r.fs.checkPrivilege(ctx, r.path, 'canWriteProperties', (e, can) => {
                            if(e || !can)
                            {
                                if(e)
                                {
                                    if(!ctx.setCodeFromError(e))
                                        ctx.setCode(HTTPCodes.InternalServerError)
                                }
                                else if(!can)
                                    ctx.setCodeFromError(Errors.NotEnoughPrivilege);
                                return callback();
                            }

                            r.fs.isLocked(ctx, r.path, (e, locked) => {
                                if(e || locked)
                                {
                                    if(e)
                                    {
                                        if(!ctx.setCodeFromError(e))
                                            ctx.setCode(HTTPCodes.InternalServerError)
                                    }
                                    else if(locked)
                                        ctx.setCode(HTTPCodes.Locked);
                                    return callback();
                                }
                            
                                r.propertyManager((e, pm) => {
                                    if(e)
                                    {
                                        if(!ctx.setCodeFromError(e))
                                            ctx.setCode(HTTPCodes.InternalServerError)
                                        return callback();
                                    }

                                    pm.getProperties((e, props) => {
                                        if(e)
                                        {
                                            if(!ctx.setCodeFromError(e))
                                                ctx.setCode(HTTPCodes.InternalServerError)
                                            return callback();
                                        }

                                        const properties = JSON.parse(JSON.stringify(props));

                                        const pushSetReverseAction = (el : XMLElement) => {
                                            const prop = properties[el.name];
                                            if(prop)
                                                reverse.push((cb) => pm.setProperty(el.name, prop.value, prop.attributes, cb));
                                            else
                                                reverse.push((cb) => pm.removeProperty(el.name, cb));
                                        }
                                        const pushRemoveReverseAction = (el : XMLElement) => {
                                            const prop = properties[el.name];
                                            reverse.push((cb) => pm.setProperty(el.name, prop.value, prop.attributes, cb));
                                        }
                                        execute('DAV:set', 'setProperty', (el : XMLElement, callback) => {
                                            if(startsWith(el.name, 'DAV:'))
                                            {
                                                pushSetReverseAction(el);
                                                return callback(Errors.Forbidden);
                                            }

                                            pm.setProperty(el.name, el.elements, el.attributes, (e) => {
                                                if(!e)
                                                    pushSetReverseAction(el);
                                                callback(e);
                                            })
                                        })
                                        execute('DAV:remove', 'removeProperty', (el : XMLElement, callback) => {
                                            if(startsWith(el.name, 'DAV:'))
                                            {
                                                pushRemoveReverseAction(el);
                                                return callback(Errors.Forbidden);
                                            }

                                            pm.removeProperty(el.name, (e) => {
                                                if(!e)
                                                    pushRemoveReverseAction(el);
                                                callback(e);
                                            })
                                        })
                                    }, false)
                                })
                            })
                        })
                    }
                    catch(ex)
                    {
                        ctx.setCode(HTTPCodes.BadRequest);
                        callback();
                    }
                //})
            })
        })
    }

    isValidFor(ctx : HTTPRequestContext, type : ResourceType)
    {
        return !!type;
    }
}
