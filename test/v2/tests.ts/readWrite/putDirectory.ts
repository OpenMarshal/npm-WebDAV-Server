import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createFileTxt'

export default ((info, isValid) =>
{
    const server = info.init(1);
    
    starter(server, info, isValid, 'Invalid', v2.ResourceType.Directory, (r) => {
        info.req({
            url: 'http://localhost:' + info.port + '/file.txt',
            method: 'PUT',
            body: 'Invalid Content'
        }, v2.HTTPCodes.MethodNotAllowed, () => {
            isValid(true);
        })
    })

}) as Test;
