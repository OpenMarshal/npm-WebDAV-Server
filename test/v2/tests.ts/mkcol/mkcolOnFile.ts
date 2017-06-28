import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createFiles'

export default ((info, isValid) =>
{
    const server1 = info.init(3);
    
    starter(info.startServer(), info, isValid, 'file1', v2.HTTPCodes.MethodNotAllowed);
    starter(info.startServer(), info, isValid, 'file1/folder', v2.HTTPCodes.Forbidden);
    starter(info.startServer(), info, isValid, 'file1/unmapped/folder', v2.HTTPCodes.Conflict);

}) as Test;
