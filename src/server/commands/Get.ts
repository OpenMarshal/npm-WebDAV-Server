import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource } from '../../resource/IResource'
import { Readable } from 'stream'

export default function(arg : MethodCallArgs, callback)
{
    arg.noBodyExpected(() => {
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
                    r.read(targetSource, (e, rstream) => process.nextTick(() => {
                        if(e)
                        {
                            arg.setCode(HTTPCodes.MethodNotAllowed);
                            callback();
                        }
                        else
                        {
                            arg.setCode(HTTPCodes.OK);
                            
                            rstream.on('end', callback);
                            rstream.pipe(arg.response);
                        }
                    }))
                })
            })
        })
    })
}
