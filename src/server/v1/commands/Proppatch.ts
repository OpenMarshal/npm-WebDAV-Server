import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource, ResourceType } from '../../../resource/v1/IResource'
import { STATUS_CODES } from 'http'
import { EventsName } from '../../../server/v1/webDAVServer/Events'
import { Workflow } from '../../../helper/Workflow'
import { XML, XMLElementBuilder } from 'xml-js-builder'

export function method(arg : MethodCallArgs, callback)
{
    arg.getResource((e, r) => {
        if(e)
        {
            arg.setCode(HTTPCodes.NotFound)
            callback();
            return;
        }
        
        arg.checkIfHeader(r, () => {
            arg.requirePrivilege([ 'canSetProperty', 'canRemoveProperty' ], r, () => {
                const multistatus = new XMLElementBuilder('D:multistatus', {
                    'xmlns:D': 'DAV:'
                });
                const response = multistatus.ele('D:response');
                response.ele('D:href', undefined, true).add(arg.fullUri());

                try
                {
                    const xml = XML.parse(arg.data as any);
                    const root = xml.find('DAV:propertyupdate');

                    let finalize = function()
                    {
                        finalize = function()
                        {
                            arg.setCode(HTTPCodes.MultiStatus);
                            arg.writeXML(multistatus);
                            callback();
                        }
                    }

                    const notify = function(el : any, error : any)
                    {
                        const code = error ? HTTPCodes.Conflict : HTTPCodes.OK;
                        const propstat = response.ele('D:propstat');
                        propstat.ele('D:prop').ele(el.name);
                        propstat.ele('D:status').add('HTTP/1.1 ' + code + ' ' + STATUS_CODES[code]);
                    }

                    const execute = function(name : string, eventName : EventsName, fnProp)
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
                                    if(!e)
                                        arg.invokeEvent(eventName, r, el)
                                    notify(el, e)
                                })
                                .done((_) => finalize())
                        })
                    }

                    execute('DAV:set', 'setProperty', (el, callback) => {
                        r.setProperty(el.name, el.elements, callback)
                    })
                    execute('DAV:remove', 'removeProperty', (el, callback) => {
                        r.removeProperty(el.name, callback)
                    })
                }
                catch(ex)
                {
                    arg.setCode(HTTPCodes.BadRequest);
                    callback();
                }
            })
        })
    })
}

(method as WebDAVRequest).isValidFor = function(type : ResourceType)
{
    return !!type;
};

export default method;
