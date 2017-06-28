import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createFiles'

export default ((info, isValid) =>
{
    const server1 = info.init(3);
    
    starter(info.startServer(), info, isValid, 'file1', v2.HTTPCodes.OK);
    starter(info.startServer(), info, isValid, 'folder1/file2', v2.HTTPCodes.OK);
    starter(info.startServer(), info, isValid, 'folder1/folder2/file3', v2.HTTPCodes.OK);

}) as Test;
