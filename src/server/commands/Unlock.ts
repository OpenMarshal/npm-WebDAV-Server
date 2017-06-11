import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { STATUS_CODES } from 'http'
import { IResource } from '../../resource/IResource'
import { Lock } from '../../resource/lock/Lock'
import { LockKind } from '../../resource/lock/LockKind'
import { LockScope } from '../../resource/lock/LockScope'
import { LockType } from '../../resource/lock/LockType'
import { XML } from '../../helper/XML'

export default function(arg : MethodCallArgs, callback)
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
                arg.requirePrivilege([ 'canGetLock', 'canRemoveLock' ], r, () => {
                    r.getLock(token, (e, lock) => {
                        if(e || !lock)
                        {
                            arg.setCode(HTTPCodes.Conflict);
                            callback();
                            return;
                        }

                        if(lock.userUid !== arg.user.uid)
                        {
                            arg.setCode(HTTPCodes.Forbidden);
                            callback();
                            return;
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
