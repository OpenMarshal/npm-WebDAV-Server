import { HTTPCodes, HTTPMethod, RequestContext } from '../WebDAVRequest'
import { ResourceType } from '../../../manager/v2/fileSystem/CommonTypes'
import { Path } from '../../../manager/v2/Path'
import { Errors } from '../../../Errors'
import * as path from 'path'

export default class implements HTTPMethod
{
    unchunked(ctx : RequestContext, data : Buffer, callback : () => void) : void
    {
        ctx.noBodyExpected(() => {
            ctx.checkIfHeader(undefined, () => {
                ctx.getResource((e, r) => {
                    ctx.getResource(r.path.getParent(), (e, rParent) => {
                        rParent.type((e, parentType) => {
                            if(e)
                            {
                                ctx.setCode(e === Errors.ResourceNotFound ? HTTPCodes.Conflict : HTTPCodes.InternalServerError);
                                callback();
                                return;
                            }
                            if(!parentType.isDirectory)
                            {
                                ctx.setCode(HTTPCodes.Forbidden);
                                callback();
                                return;
                            }
                            
                            r.create(ResourceType.Directory, (e) => {
                                if(e)
                                {
                                    if(e === Errors.WrongParentTypeForCreation)
                                        ctx.setCode(HTTPCodes.Conflict);
                                    else if(e === Errors.ResourceAlreadyExists)
                                        ctx.setCode(HTTPCodes.MethodNotAllowed);
                                    else
                                        ctx.setCode(HTTPCodes.InternalServerError);
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

    isValidFor(type : ResourceType)
    {
        return !type;
    }
}
