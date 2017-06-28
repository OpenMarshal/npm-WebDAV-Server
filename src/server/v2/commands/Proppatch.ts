import { HTTPCodes, HTTPMethod, RequestContext } from '../WebDAVRequest'
import { ResourceType } from '../../../manager/v2/fileSystem/CommonTypes'
import { STATUS_CODES } from 'http'
import { Workflow } from '../../../helper/Workflow'
import { XML } from '../../../helper/XML'
import { Errors } from '../../../Errors'

export default class implements HTTPMethod
{
    unchunked(ctx : RequestContext, data : Buffer, callback : () => void) : void
    {
        ctx.getResource((e, r) => {
            ctx.checkIfHeader(r, () => {
                //ctx.requirePrivilege([ 'canSetProperty', 'canRemoveProperty' ], r, () => {
                    const multistatus = XML.createElement('D:multistatus', {
                        'xmlns:D': 'DAV:'
                    });
                    const response = multistatus.ele('D:response');
                    response.ele('D:href', undefined, true).add(ctx.fullUri());

                    try
                    {
                        const xml = XML.parse(data);
                        const root = xml.find('DAV:propertyupdate');

                        let finalize = function()
                        {
                            finalize = function()
                            {
                                ctx.setCode(HTTPCodes.MultiStatus);
                                ctx.writeBody(multistatus);
                                callback();
                            }
                        }

                        const notify = function(el : any, error : any)
                        {
                            const code = error ? HTTPCodes.Forbidden : HTTPCodes.OK;
                            const propstat = response.ele('D:propstat');
                            propstat.ele('D:prop').ele(el.name);
                            propstat.ele('D:status').add('HTTP/1.1 ' + code + ' ' + STATUS_CODES[code]);
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
                                    .each(els, fnProp)
                                    .intermediate((el, e) => {
                                        /*if(!e)
                                            ctx.invokeEvent(eventName, r, el)*/
                                        notify(el, e)
                                    })
                                    .done(() => finalize())
                            })
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

                                execute('DAV:set', 'setProperty', (el, callback) => {
                                    pm.setProperty(el.name, el.elements, callback)
                                })
                                execute('DAV:remove', 'removeProperty', (el, callback) => {
                                    pm.removeProperty(el.name, callback)
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

    isValidFor(type : ResourceType)
    {
        return !!type;
    }
}
