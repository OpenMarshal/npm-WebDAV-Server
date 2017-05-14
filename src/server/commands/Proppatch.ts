import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { STATUS_CODES } from 'http'
import { IResource } from '../../resource/Resource'
import { XML } from '../../helper/XML'

export default function(arg : MethodCallArgs, callback)
{
    arg.getResource((e, r) => {
        if(e)
        {
            arg.setCode(HTTPCodes.NotFound)
            callback();
            return;
        }

        const multistatus = XML.createElement('D:multistatus', {
            'xmlns:D': 'DAV:'
        });
        const response = multistatus.ele('D:response');
        response.ele('D:href').add(arg.fullUri());

        const xml = XML.parse(arg.data);
        const root = xml.find('DAV:propertyupdate');

        let finalize = function()
        {
            finalize = function()
            {
                arg.setCode(HTTPCodes.MultiStatus);
                arg.response.write(XML.toXML(multistatus));
                callback();
            }
        }

        function notify(el : any, error : any)
        {
            const code = error ? HTTPCodes.Conflict : HTTPCodes.OK;
            const propstat = response.ele('D:propstat');
            propstat.ele('D:prop').ele(el.name);
            propstat.ele('D:status').add('HTTP/1.1 ' + code + ' ' + STATUS_CODES[code]);
        }

        execute('DAV:set', (el, callback) => {
            r.setProperty(el.name, el.elements, callback)
        })
        execute('DAV:remove', (el, callback) => {
            r.removeProperty(el.name, callback)
        })

        function execute(name, fnProp)
        {
            const list = root.findMany(name);
            if(list.length === 0)
            {
                finalize();
                return;
            }

            list.forEach(function(el) {
                const els = el.find('DAV:prop').elements;
                if(els.length === 0)
                {
                    finalize();
                    return;
                }

                let nb = els.length;
                els.forEach(function(el) {
                    fnProp(el, (e) => {
                        notify(el, e);
                        --nb;
                        if(nb === 0)
                            finalize();
                    })
                })
            })
        }
    })
}
