import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createDir'

export default ((info, isValid) =>
{
    function test(inputServer, info, isValid, depth)
    {
        const server = inputServer || info.startServer();

        starter(server, info, isValid, (r, subFiles, allFiles) => {
            info.reqXML({
                url: 'http://localhost:' + info.port + '/folder',
                method: 'PROPFIND',
                headers: {
                    depth: depth
                }
            }, v2.HTTPCodes.Forbidden, () => {
                isValid(true);
            })
        })
    }

    const depthValues = [
        'infinity',
        'InFiNiTy',
        -1
    ];
    
    const firstServer = info.init(depthValues.length);

    for(let i = 0; i < depthValues.length; ++i)
    {
        const depth = depthValues[i];
        
        test(i === 0 ? firstServer : undefined, info, isValid, depth);
    }

}) as Test;
