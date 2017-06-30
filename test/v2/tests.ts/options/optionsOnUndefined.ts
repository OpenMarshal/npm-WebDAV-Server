import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createFiles'

export default ((info, isValid) =>
{
    const server = info.init(1);
    
    starter(server, info, isValid, 'fileUndefined', [
        'MKCOL', 'PUT', 'POST', 'LOCK'
    ], [
        'GET', 'COPY', 'DELETE', 'HEAD', 'MOVE', 'PROPFIND', 'PROPPATCH', 'UNLOCK'
    ], () => {
        isValid(true);
    })

}) as Test;
