import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter, lockResource, unlockResource } from './.createFiles'

export default ((info, isValid) =>
{
    const server1 = info.init(1);
    
    starter(server1, info, isValid, 'file', 0, true, (lock, user1, user2) => {
        unlockResource(server1, info, isValid, user2, 'file', lock.uuid, v2.HTTPCodes.Forbidden, () => {
            unlockResource(server1, info, isValid, user1, 'file', lock.uuid, v2.HTTPCodes.NoContent, () => {
                unlockResource(server1, info, isValid, user1, 'file', lock.uuid, v2.HTTPCodes.Conflict, () => {
                    isValid(true);
                })
            })
        })
    })

}) as Test;
