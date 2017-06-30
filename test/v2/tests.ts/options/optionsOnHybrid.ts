import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createFiles'

export default ((info, isValid) =>
{
    const server = info.init(1);
    
    starter(server, info, isValid, 'hybrid', [
        'GET', 'PUT', 'POST', 'COPY', 'DELETE', 'HEAD', 'LOCK', 'MOVE', 'PROPFIND', 'PROPPATCH', 'UNLOCK'
    ], [
        'MKCOL'
    ], () => {
        isValid(true);
    })

}) as Test;
