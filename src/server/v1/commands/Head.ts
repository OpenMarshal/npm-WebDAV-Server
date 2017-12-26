import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource, ResourceType } from '../../../resource/v1/IResource'
import Get from './Get'

export function method(arg : MethodCallArgs, callback)
{
    arg.noBodyExpected(() => {
        arg.getResource((e, r) => {
            if(e)
            {
                arg.setCode(HTTPCodes.NotFound)
                callback();
                return;
            }

            const targetSource = arg.isSource;

            arg.checkIfHeader(r, () => {
                arg.requirePrivilege(targetSource ? [ 'canRead', 'canSource', 'canGetMimeType' ] : [ 'canRead', 'canGetMimeType' ], r, () => {
                    r.type((e, type) => {
                        if(e)
                        {
                            arg.setCode(HTTPCodes.InternalServerError)
                            callback();
                            return;
                        }
                        if(!type.isFile)
                        {
                            arg.setCode(HTTPCodes.MethodNotAllowed)
                            callback();
                            return;
                        }
                        
                        r.mimeType(targetSource, (e, mimeType) => process.nextTick(() => {
                            if(e)
                            {
                                arg.setCode(HTTPCodes.InternalServerError);
                                callback();
                                return;
                            }

                            r.size(targetSource, (e, size) => {
                                if(e)
                                    arg.setCode(HTTPCodes.InternalServerError)
                                else
                                {
                                    arg.setCode(HTTPCodes.OK);
                                    arg.response.setHeader('Accept-Ranges', 'bytes')
                                    arg.response.setHeader('Content-Type', mimeType);
                                    arg.response.setHeader('Content-Length', size.toString());
                                    callback();
                                }
                            })
                        }))
                    })
                })
            })
        })
    })
}

(method as WebDAVRequest).isValidFor = (Get as WebDAVRequest).isValidFor;

export default method;
