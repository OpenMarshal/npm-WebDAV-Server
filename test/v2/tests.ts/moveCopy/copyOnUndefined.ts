import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter, check } from './.createFiles'

function execute(info, isValid, overwrite : boolean)
{
    starter(info.startServer(), info, isValid, 'COPY', 'file1Undefined', 'file1_moved', overwrite, v2.HTTPCodes.NotFound);
    starter(info.startServer(), info, isValid, 'COPY', 'file1Undefined', 'folder1/file2', overwrite, v2.HTTPCodes.NotFound);
    starter(info.startServer(), info, isValid, 'COPY', 'file1Undefined', 'file1', overwrite, v2.HTTPCodes.NotFound);
    starter(info.startServer(), info, isValid, 'COPY', 'file1Undefined', 'file1/file1', overwrite, v2.HTTPCodes.NotFound);
    starter(info.startServer(), info, isValid, 'COPY', 'file1Undefined', 'unmapped/file1', overwrite, v2.HTTPCodes.NotFound);
}

export default ((info, isValid) =>
{
    const server1 = info.init(5 * 2);

    execute(info, isValid, false);
    execute(info, isValid, true);

}) as Test;
