import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createFiles'

export default ((info, isValid) =>
{
    const server = info.init(1);
    
    starter(server, info, isValid, 'noResource', [
        'COPY', 'DELETE', 'LOCK', 'MOVE', 'PROPFIND', 'PROPPATCH', 'UNLOCK'
    ], [
        'GET', 'PUT', 'POST', 'HEAD', 'MKCOL'
    ], () => {
        isValid(true);
    })

}) as Test;
