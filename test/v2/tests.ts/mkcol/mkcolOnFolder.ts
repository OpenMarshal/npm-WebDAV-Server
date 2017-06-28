import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createFiles'

export default ((info, isValid) =>
{
    const server1 = info.init(3);
    
    starter(info.startServer(), info, isValid, 'folder1', v2.HTTPCodes.MethodNotAllowed);
    starter(info.startServer(), info, isValid, 'folder1/unmapped/folder', v2.HTTPCodes.Conflict);
    starter(info.startServer(), info, isValid, 'folder1/folder', v2.HTTPCodes.Created, (server) => {
        info.req({
            url: 'http://localhost:' + server.options.port + '/folder1/folder',
            method: 'PROPFIND',
            headers: {
                Depth: 0
            }
        }, v2.HTTPCodes.MultiStatus, () => {
            isValid(true);
        })
    });

}) as Test;
