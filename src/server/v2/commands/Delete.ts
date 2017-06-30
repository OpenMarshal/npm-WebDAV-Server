import { HTTPCodes, HTTPRequestContext, HTTPMethod } from '../WebDAVRequest'
import { ResourceType } from '../../../manager/v2/fileSystem/CommonTypes'

export default class implements HTTPMethod
{
    unchunked(ctx : HTTPRequestContext, data : Buffer, callback : () => void) : void
    {
        ctx.noBodyExpected(() => {
            ctx.getResource((e, r) => {
                ctx.checkIfHeader(r, () => {
                    //ctx.requirePrivilege([ 'canDelete' ], r, () => {
                        r.delete((e) => process.nextTick(() => {
                            if(e)
                            {
                                if(!ctx.setCodeFromError(e))
                                    ctx.setCode(HTTPCodes.InternalServerError);
                            }
                            else
                            {
                                ctx.setCode(HTTPCodes.OK);
                                //ctx.invokeEvent('delete', r);
                            }
                            callback();
                        }))
                    //})
                })
            })
        })
    }

    isValidFor(ctx : HTTPRequestContext, type : ResourceType)
    {
        return !!type;
    }
}
