import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createFiles'

export default ((info, isValid) =>
{
    const server1 = info.init(1);
    
    starter(info.startServer(), info, isValid, 'fileUndefined', v2.HTTPCodes.NotFound);

}) as Test;
