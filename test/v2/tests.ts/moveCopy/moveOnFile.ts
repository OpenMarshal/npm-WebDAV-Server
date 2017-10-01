import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter, check } from './.createFiles'

export default ((info, isValid) =>
{
    const server1 = info.init(8);
    
    starter(info.startServer(), info, isValid, 'MOVE', 'file1', 'file1_moved', false, v2.HTTPCodes.Created, (s) => {
        check(s, info, isValid, 'file1', false, () => {
        check(s, info, isValid, 'file1_moved', true, () => {
            isValid(true);
        })
        })
    });
    
    starter(info.startServer(), info, isValid, 'MOVE', 'file1', 'folder1/file2', false, v2.HTTPCodes.PreconditionFailed);
    starter(info.startServer(), info, isValid, 'MOVE', 'file1', 'folder1/file2', true, v2.HTTPCodes.NoContent, (s) => {
        check(s, info, isValid, 'file1', false, () => {
        check(s, info, isValid, 'folder1/file2', true, () => {
            isValid(true);
        })
        })
    });
    
    starter(info.startServer(), info, isValid, 'MOVE', 'folder1/folder2/file3', 'folder1/folder2x/file3', true, v2.HTTPCodes.Created, (s) => {
        check(s, info, isValid, 'folder1/folder2/file3', false, () => {
        check(s, info, isValid, 'folder1/folder2x/file3', true, () => {
            isValid(true);
        })
        })
    });
    starter(info.startServer(), info, isValid, 'MOVE', 'folder1/folder2/file3', 'folder1/folder2x/file3', false, v2.HTTPCodes.Created, (s) => {
        check(s, info, isValid, 'folder1/folder2/file3', false, () => {
        check(s, info, isValid, 'folder1/folder2x/file3', true, () => {
            isValid(true);
        })
        })
    });

    starter(info.startServer(), info, isValid, 'MOVE', 'file1', 'file1', false, v2.HTTPCodes.Forbidden);
    starter(info.startServer(), info, isValid, 'MOVE', 'file1', 'file1/file1', false, v2.HTTPCodes.BadGateway);
    starter(info.startServer(), info, isValid, 'MOVE', 'file1', 'unmapped/file1', false, v2.HTTPCodes.Conflict);

}) as Test;
