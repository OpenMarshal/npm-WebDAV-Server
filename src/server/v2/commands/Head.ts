import { HTTPCodes, HTTPMethod, HTTPRequestContext } from '../WebDAVRequest'
import { parseRangeHeader } from './Get'
import { ResourceType } from '../../../manager/v2/fileSystem/CommonTypes'

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

                                const range = ctx.headers.find('Range');
                                r.size(targetSource, (e, size) => {
                                    if(e && !range)
                                    {
                                        if(!ctx.setCodeFromError(e))
                                            ctx.setCode(HTTPCodes.InternalServerError)
                                    }
                                    else if(range)
                                    {
                                        try
                                        {
                                            const { ranges, separator, len } = parseRangeHeader(mimeType, size, range);

                                            ctx.setCode(HTTPCodes.PartialContent);
                                            ctx.response.setHeader('Accept-Ranges', 'bytes')
                                            ctx.response.setHeader('Content-Length', len.toString())
                                            if(ranges.length <= 1)
                                            {
                                                ctx.response.setHeader('Content-Type', mimeType)
                                                ctx.response.setHeader('Content-Range', `bytes ${ranges[0].min}-${ranges[0].max}/*`)
                                            }
                                            else
                                                ctx.response.setHeader('Content-Type', `multipart/byteranges; boundary=${separator}`)
                                        }
                                        catch(ex)
                                        {
                                            ctx.setCode(HTTPCodes.BadRequest);
                                            callback();
                                        }
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
