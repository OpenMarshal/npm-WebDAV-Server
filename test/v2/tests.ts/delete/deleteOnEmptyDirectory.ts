import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createFiles'

export default ((info, isValid) =>
{
    const server1 = info.init(3);
    
    starter(info.startServer(), info, isValid, 'emptyFolder1', v2.HTTPCodes.OK);
    starter(info.startServer(), info, isValid, 'folder1/emptyFolder2', v2.HTTPCodes.OK);
    starter(info.startServer(), info, isValid, 'folder1/folder2/emptyFolder3', v2.HTTPCodes.OK);

}) as Test;
