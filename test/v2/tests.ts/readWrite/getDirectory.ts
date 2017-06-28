import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createFileTxt'

export default ((info, isValid) =>
{
    const server = info.init(2);
    
    starter(server, info, isValid, 'Invalid', v2.ResourceType.Directory, (r) => {
        info.req({
            url: 'http://localhost:' + info.port + '/file.txt',
            method: 'GET'
        }, v2.HTTPCodes.MethodNotAllowed, () => {
            isValid(true);
        })
    })
    
    const server2 = info.startServer();
    starter(server2, info, isValid, 'Invalid', v2.ResourceType.Directory, (r) => {
        info.req({
            url: 'http://localhost:' + server2.options.port + '/file.txt',
            method: 'HEAD'
        }, v2.HTTPCodes.MethodNotAllowed, () => {
            isValid(true);
        })
    })

}) as Test;
