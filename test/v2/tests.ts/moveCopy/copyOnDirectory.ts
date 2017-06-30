import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter, check } from './.createFiles'

export default ((info, isValid) =>
{
    const server1 = info.init(6);
    
    starter(info.startServer(), info, isValid, 'COPY', 'folder1', 'folder1x', false, v2.HTTPCodes.Created, (s) => {
        check(s, info, isValid, 'folder1', true, () => {
        check(s, info, isValid, 'folder1x', true, () => {
            isValid(true);
        })
        })
    });
    
    starter(info.startServer(), info, isValid, 'COPY', 'folder1/folder2x', 'folder1/folder2', false, v2.HTTPCodes.PreconditionFailed);
    starter(info.startServer(), info, isValid, 'COPY', 'folder1/folder2x', 'folder1/folder2', true, v2.HTTPCodes.NoContent, (s) => {
        check(s, info, isValid, 'folder1/folder2x', true, () => {
        check(s, info, isValid, 'folder1/folder2', true, () => {
            isValid(true);
        })
        })
    });

    starter(info.startServer(), info, isValid, 'COPY', 'folder1', 'folder1', false, v2.HTTPCodes.Forbidden);
    starter(info.startServer(), info, isValid, 'COPY', 'folder1', 'folder1/folder1', false, v2.HTTPCodes.BadGateway);
    starter(info.startServer(), info, isValid, 'COPY', 'folder1', 'unmapped/folder1', false, v2.HTTPCodes.Conflict);

}) as Test;
