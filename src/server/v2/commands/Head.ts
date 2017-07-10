import { HTTPCodes, HTTPMethod, HTTPRequestContext } from '../WebDAVRequest'
import { ResourceType } from '../../../manager/v2/fileSystem/CommonTypes'
import { Errors } from '../../../Errors'

export default class implements HTTPMethod
{
    unchunked(ctx : HTTPRequestContext, data : Buffer, callback : () => void) : void
    {
        ctx.noBodyExpected(() => {
            ctx.getResource((e, r) => {
                const targetSource = ctx.headers.isSource;

                ctx.checkIfHeader(r, () => {
                    //ctx.requirePrivilege(targetSource ? [ 'canRead', 'canSource', 'canGetMimeType' ] : [ 'canRead', 'canGetMimeType' ], r, () => {
                        r.type((e, type) => {
                            if(e)
                            {
                                if(!ctx.setCodeFromError(e))
                                    ctx.setCode(HTTPCodes.InternalServerError)
                                return callback();
                            }
                            if(!type.isFile)
                            {
                                ctx.setCode(HTTPCodes.MethodNotAllowed)
                                return callback();
                            }
                            
                            r.mimeType(targetSource, (e, mimeType) => process.nextTick(() => {
                                if(e)
                                {
                                    if(!ctx.setCodeFromError(e))
                                        ctx.setCode(HTTPCodes.InternalServerError)
                                    return callback();
                                }

                                r.size(targetSource, (e, size) => {
                                    if(e)
                                    {
                                        if(!ctx.setCodeFromError(e))
                                            ctx.setCode(HTTPCodes.InternalServerError)
                                    }
                                    else
                                    {
                                        ctx.setCode(HTTPCodes.OK);
                                        ctx.response.setHeader('Accept-Ranges', 'bytes')
                                        ctx.response.setHeader('Content-Type', mimeType);
                                        if(size !== null && size !== undefined && size > -1)
                                            ctx.response.setHeader('Content-Length', size.toString());
                                    }
                                    callback();
                                })
                            }))
                        })
                    //})
                })
            })
        })
    }
    
    isValidFor(ctx : HTTPRequestContext, type : ResourceType)
    {
        return type && type.isFile;
    }
}
