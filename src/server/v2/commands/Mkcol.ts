import { HTTPCodes, HTTPMethod, HTTPRequestContext } from '../WebDAVRequest'
import { ResourceType } from '../../../manager/v2/fileSystem/CommonTypes'
import { Errors } from '../../../Errors'

export default class implements HTTPMethod
{
    unchunked(ctx : HTTPRequestContext, data : Buffer, callback : () => void) : void
    {
        ctx.noBodyExpected(() => {
            ctx.checkIfHeader(undefined, () => {
                ctx.getResource((e, r) => {
                    ctx.getResource(ctx.requested.path.getParent(), (e, rParent) => {
                        rParent.type((e, parentType) => {
                            if(e)
                            {
                                if(e === Errors.ResourceNotFound)
                                    ctx.setCode(HTTPCodes.Conflict);
                                else if(!ctx.setCodeFromError(e))
                                    ctx.setCode(HTTPCodes.InternalServerError)
                                return callback();
                            }
                            if(!parentType.isDirectory)
                            {
                                ctx.setCode(HTTPCodes.Forbidden);
                                return callback();
                            }
                            
                            r.create(ResourceType.Directory, (e) => {
                                if(e)
                                {
                                    if(e === Errors.ResourceAlreadyExists)
                                        ctx.setCode(HTTPCodes.MethodNotAllowed);
                                    else if(!ctx.setCodeFromError(e))
                                        ctx.setCode(HTTPCodes.InternalServerError)
                                }
                                else
                                    ctx.setCode(HTTPCodes.Created)
                                callback();
                            })
                        })
                    })
                })
            })
        })
    }

    isValidFor(ctx : HTTPRequestContext, type : ResourceType)
    {
        return !type;
    }
}
