import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter, lockResource } from './.createFiles'

export default ((info, isValid) =>
{
    const server1 = info.init(5);
    
    starter(server1, info, isValid, 'folder', 0, true, (lock, user1) => {
        lockResource(server1, info, isValid, user1, 'folder', 0, true, v2.HTTPCodes.Locked, (lock) => {
            isValid(true);
        })
    })
    
    const server2 = info.startServer();
    starter(server2, info, isValid, 'folder', -1, true, (lock, user1) => {
        lockResource(server2, info, isValid, user1, 'folder/folder2/folder3/folder4/file', 0, true, v2.HTTPCodes.Locked, (lock) => {
            isValid(true);
        })
    })
    
    const server3 = info.startServer();
    starter(server3, info, isValid, 'folder', 2, true, (lock, user1) => {
        lockResource(server3, info, isValid, user1, 'folder/folder2/folder3/folder4/file', 0, true, (lock) => {
            isValid(true);
        })
    })
    
    const server4 = info.startServer();
    starter(server4, info, isValid, 'folder', 2, true, (lock, user1) => {
        lockResource(server4, info, isValid, user1, 'folder/folder2/folder3/folder4/fileX', 0, true, v2.HTTPCodes.Created, (lock) => {
            isValid(true);
        })
    })
    
    const server5 = info.startServer();
    starter(server5, info, isValid, 'folder', -1, true, (lock, user1) => {
        lockResource(server5, info, isValid, user1, 'folder/folder2/folder3/folder4/fileX', 0, true, v2.HTTPCodes.Locked, (lock) => {
            isValid(true);
        })
    })

}) as Test;
