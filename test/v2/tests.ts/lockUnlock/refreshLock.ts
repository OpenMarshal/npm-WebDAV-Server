import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter, refreshResourceLock } from './.createFiles'

export default ((info, isValid) =>
{
    {
        const server = info.init(3);
        starter(server, info, isValid, 'file', -1, true, (lock, user1) => {
            refreshResourceLock(server, info, isValid, user1, 'file', lock.uuid, {}, v2.HTTPCodes.OK, () => {
                isValid(true);
            })
        })
    }

    {
        const server = info.startServer();
        starter(server, info, isValid, 'file', -1, true, (lock, user1, user2) => {
            refreshResourceLock(server, info, isValid, user2, 'file', lock.uuid, {}, v2.HTTPCodes.Unauthorized, () => {
                isValid(true);
            })
        })
    }

    {
        const server = info.startServer();
        starter(server, info, isValid, 'file', -1, true, (lock, user1) => {
            refreshResourceLock(server, info, isValid, user1, 'file', 'wrongtoken', {}, v2.HTTPCodes.PreconditionFailed, () => {
                isValid(true);
            })
        })
    }

}) as Test;
