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
        arg.setCode(HTTPCodes.Unauthorized);
        callback();
        return;
    }

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
            arg.setCode(HTTPCodes.NotFound); // TODO : must become, in  the future, a creation of the resource
            callback();
            return;
        }

        r.getLock(token, (e, lock) => {
            if(e || !lock)
            {
                arg.setCode(HTTPCodes.BadRequest);
                callback();
                return;
            }

            if(lock.user !== arg.user)
            {
                arg.setCode(HTTPCodes.Forbidden);
                callback();
                return;
            }

            r.removeLock(lock.uuid, (e, done) => {
                if(e || !done)
                    arg.setCode(HTTPCodes.Forbidden);
                else
                    arg.setCode(HTTPCodes.NoContent);
                callback();
            })
        })
    })
}
