import { HTTPCodes, HTTPMethod, HTTPRequestContext } from '../WebDAVRequest'
import { ResourceType } from '../../../manager/v2/fileSystem/CommonTypes'

export default class implements HTTPMethod
{
    unchunked(ctx : HTTPRequestContext, data : Buffer, callback : () => void) : void
    {
        if(!ctx.user)
        {
            ctx.setCode(HTTPCodes.Forbidden);
            callback();
            return;
        }

        ctx.noBodyExpected(() => {
            let token = ctx.headers.find('Lock-Token');
            if(!token)
            {
                ctx.setCode(HTTPCodes.BadRequest);
                callback();
                return;
            }
            token = token.replace('<', '').replace('>', '').trim();
            ctx.response.setHeader('Lock-Token', '<' + token + '>');

            ctx.getResource((e, r) => {
                ctx.checkIfHeader(r, () => {
                    /*ctx.requireErPrivilege([ 'canGetLock', 'canRemoveLock' ], r, (e, can) => {
                        if(e)
                        {
                            ctx.setCode(HTTPCodes.InternalServerError);
                            callback();
                            return;
                        }

                        if(!can)
                        {
                            ctx.setCode(HTTPCodes.Forbidden);
                            callback();
                            return;
                        }*/

                        r.lockManager((e, lm) => {
                            if(e)
                            {
                                if(!ctx.setCodeFromError(e))
                                    ctx.setCode(HTTPCodes.InternalServerError)
                                return callback();
                            }
                            
                            lm.getLock(token, (e, lock) => {
                                if(e || !lock)
                                {
                                    if(!lock)
                                        ctx.setCode(HTTPCodes.Conflict)
                                    else if(!ctx.setCodeFromError(e))
                                        ctx.setCode(HTTPCodes.InternalServerError)
                                    return callback();
                                }

                                if(!!lock.userUid && lock.userUid !== ctx.user.uid)
                                {
                                    ctx.setCode(HTTPCodes.Forbidden);
                                    return callback();
                                }

                                lm.removeLock(lock.uuid, (e, done) => {
                                    if(e || !done)
                                    {
                                        if(!done)
                                            ctx.setCode(HTTPCodes.Forbidden);
                                        else if(!ctx.setCodeFromError(e))
                                            ctx.setCode(HTTPCodes.InternalServerError)
                                    }
                                    else
                                    {
                                        //ctx.invokeEvent('unlock', r, lock);
                                        ctx.setCode(HTTPCodes.NoContent);
                                    }
                                    callback();
                                })
                            })
                        })
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
