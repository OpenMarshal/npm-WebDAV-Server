import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'

export default ((info, isValid) =>
{
    const server = info.init(2);

    info.req({
        url: 'http://localhost:' + info.port + '/fileUndefined.txt',
        method: 'GET'
    }, v2.HTTPCodes.NotFound, () => {
        isValid(true);
    })
    
    info.req({
        url: 'http://localhost:' + info.port + '/fileUndefined.txt',
        method: 'HEAD'
    }, v2.HTTPCodes.NotFound, () => {
        isValid(true);
    })

}) as Test;
