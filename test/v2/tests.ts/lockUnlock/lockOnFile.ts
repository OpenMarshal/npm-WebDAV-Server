import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter, lockResource } from './.createFiles'

export default ((info, isValid) =>
{
    const server1 = info.init(2);
    
    starter(server1, info, isValid, 'file', 0, true, (lock, user1) => {
        lockResource(server1, info, isValid, user1, 'file', 0, true, v2.HTTPCodes.Locked, (lock) => {
            isValid(true);
        })
    })
    
    const server2 = info.startServer();
    starter(server2, info, isValid, 'file', -1, true, (lock, user1) => {
        lockResource(server2, info, isValid, user1, 'file', -1, true, v2.HTTPCodes.Locked, (lock) => {
            isValid(true);
        })
    })

}) as Test;
