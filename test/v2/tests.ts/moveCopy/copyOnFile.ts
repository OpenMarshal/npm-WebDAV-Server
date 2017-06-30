import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter, check } from './.createFiles'

export default ((info, isValid) =>
{
    const server1 = info.init(6);
    
    starter(info.startServer(), info, isValid, 'COPY', 'file1', 'file1_moved', false, v2.HTTPCodes.Created, (s) => {
        check(s, info, isValid, 'file1', true, () => {
        check(s, info, isValid, 'file1_moved', true, () => {
            isValid(true);
        })
        })
    });
    
    starter(info.startServer(), info, isValid, 'COPY', 'file1', 'folder1/file2', false, v2.HTTPCodes.PreconditionFailed);
    starter(info.startServer(), info, isValid, 'COPY', 'file1', 'folder1/file2', true, v2.HTTPCodes.NoContent, (s) => {
        check(s, info, isValid, 'file1', true, () => {
        check(s, info, isValid, 'folder1/file2', true, () => {
            isValid(true);
        })
        })
    });

    starter(info.startServer(), info, isValid, 'COPY', 'file1', 'file1', false, v2.HTTPCodes.Forbidden);
    starter(info.startServer(), info, isValid, 'COPY', 'file1', 'file1/file1', false, v2.HTTPCodes.BadGateway);
    starter(info.startServer(), info, isValid, 'COPY', 'file1', 'unmapped/file1', false, v2.HTTPCodes.Conflict);

}) as Test;
