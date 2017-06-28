import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter, lockResource } from './.createFiles'

export default ((info, isValid) =>
{
    const server = info.init(3);
    
    starter(server, info, isValid, 'fileUndefined', 0, true, v2.HTTPCodes.Created, (lock, user1) => {
        lockResource(server, info, isValid, user1, 'fileUndefined', 0, true, v2.HTTPCodes.Locked, (lock) => {
            isValid(true);
        })
    })
    
    starter(info.startServer(), info, isValid, 'folderUndefined/fileUndefined', 0, true, v2.HTTPCodes.Conflict, (lock) => {
        isValid(true);
    })
    
    starter(info.startServer(), info, isValid, 'file/subFile', 0, true, v2.HTTPCodes.Conflict, (lock) => {
        isValid(true);
    })

}) as Test;
