import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource } from '../../resource/IResource'

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

            const targetSource = arg.findHeader('source', 'F').toUpperCase() === 'T';

            arg.checkIfHeader(r, () => {
                arg.requirePrivilege(targetSource ? [ 'canRead', 'canSource' ] : [ 'canRead' ], r, () => {
                    r.type((e, type) => {
                        if(e)
                            arg.setCode(HTTPCodes.InternalServerError)
                        else if(!type.isFile)
                            arg.setCode(HTTPCodes.MethodNotAllowed)
                        else
                        {
                            r.size(targetSource, (e, size) => {
                                if(e)
                                    arg.setCode(HTTPCodes.InternalServerError)
                                else
                                {
                                    arg.setCode(HTTPCodes.OK);
                                    arg.response.setHeader('Accept-Ranges', 'bytes')
                                    arg.response.setHeader('Content-Length', size.toString());
                                    callback();
                                }
                            })
                            return;
                        }

                        callback();
                    })
                })
            })
        })
    })
}
