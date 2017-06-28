import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createFiles'

export default ((info, isValid) =>
{
    const server1 = info.init(2);

    function test(path : string)
    {
        return (server : v2.WebDAVServer) => {
            info.req({
                url: 'http://localhost:' + server.options.port + '/' + path,
                method: 'PROPFIND',
                headers: {
                    Depth: 0
                }
            }, v2.HTTPCodes.NotFound, () => {
                isValid(true);
            })
        }
    }
    
    starter(info.startServer(), info, isValid, 'folder1', v2.HTTPCodes.OK, test('folder1/file2'));
    starter(info.startServer(), info, isValid, 'folder1/folder2', v2.HTTPCodes.OK, test('folder1/folder2/file3'));

}) as Test;
