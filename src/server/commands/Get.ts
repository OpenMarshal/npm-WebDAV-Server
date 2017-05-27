import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource } from '../../resource/IResource'
import { Readable } from 'stream'

export default function(arg : MethodCallArgs, callback)
{
    arg.getResource((e, r) => {
        if(e)
        {
            arg.setCode(HTTPCodes.NotFound)
            callback();
            return;
        }

        arg.checkIfHeader(r, () => {
            const targetSource = arg.findHeader('source', 'F').toUpperCase() === 'T';

            arg.requirePrivilege(targetSource ? [ 'canRead', 'canSource' ] : [ 'canRead' ], r, () => {
                r.read(targetSource, (e, c) => process.nextTick(() => {
                    if(e)
                        arg.setCode(HTTPCodes.MethodNotAllowed);
                    else
                    {
                        arg.setCode(HTTPCodes.OK);

                        if((c as Readable).readable)
                        {
                            const rdata = c as Readable;
                            let isFirst = true;
                            rdata.on('end', callback);
                            rdata.pipe(arg.response);
                            return;
                        }
                        else
                        {
                            let content : any = c;
                            if(c === undefined || c === null)
                                content = new Buffer(0);
                            else if(c.constructor === Boolean || c.constructor === Number)
                                content = c.toString()
                            else if(c.constructor === Int8Array)
                                content = new Buffer(c as Int8Array);
                            else
                                content = c;
                            
                            arg.response.write(content);
                        }
                    }
                    callback();
                }))
            })
        })
    })
}
