import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createFiles'
import { test } from './.test'

export default ((info, isValid) =>
{
    info.init(1);
    
    starter(info, isValid, (s) => {
        test(s, info, isValid, 'folder');
    });

}) as Test;
