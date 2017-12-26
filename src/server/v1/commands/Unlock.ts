import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource, ResourceType } from '../../../resource/v1/IResource'
import { STATUS_CODES } from 'http'
import { LockScope } from '../../../resource/v1/lock/LockScope'
import { LockKind } from '../../../resource/v1/lock/LockKind'
import { LockType } from '../../../resource/v1/lock/LockType'
import { Errors } from '../../../Errors'
import { Lock } from '../../../resource/v1/lock/Lock'
import { XML } from 'xml-js-builder'

export function method(arg : MethodCallArgs, callback)
{
    if(!arg.user)
    {
        arg.setCode(HTTPCodes.Forbidden);
        callback();
        return;
    }

    arg.noBodyExpected(() => {
        let token = arg.findHeader('Lock-Token');
        if(!token)
        {
            arg.setCode(HTTPCodes.BadRequest);
            callback();
            return;
        }
        token = token.replace('<', '').replace('>', '').trim();
        arg.response.setHeader('Lock-Token', '<' + token + '>');

        arg.getResource((e, r) => {
            if(e)
            {
                arg.setCode(HTTPCodes.NotFound);
                callback();
                return;
            }

            arg.checkIfHeader(r, () => {
                arg.requireErPrivilege([ 'canGetLock', 'canRemoveLock' ], r, (e, can) => {
                    if(e)
                    {
                        arg.setCode(HTTPCodes.InternalServerError);
                        callback();
                        return;
                    }

                    if(!can)
                    {
                        arg.setCode(HTTPCodes.Forbidden);
                        callback();
                        return;
                    }

                    r.getLock(token, (e, lock) => {
                        if(e !== Errors.MustIgnore)
                        {
                            if(e || !lock)
                            {
                                arg.setCode(HTTPCodes.Conflict);
                                callback();
                                return;
                            }

                            if(!!lock.userUid && lock.userUid !== arg.user.uid)
                            {
                                arg.setCode(HTTPCodes.Forbidden);
                                callback();
                                return;
                            }
                        }
                        else
                        {
                            lock = new Lock(new LockKind(LockScope.Exclusive, LockType.Write), undefined, undefined);
                            lock.uuid = token;
                        }

                        r.removeLock(lock.uuid, (e, done) => {
                            if(e || !done)
                                arg.setCode(HTTPCodes.Forbidden);
                            else
                            {
                                arg.invokeEvent('unlock', r, lock);
                                arg.setCode(HTTPCodes.NoContent);
                            }
                            callback();
                        })
                    })
                })
            })
        })
    })
}

(method as WebDAVRequest).isValidFor = function(type : ResourceType)
{
    return !!type;
};

export default method;
