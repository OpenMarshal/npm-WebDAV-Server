import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createDir'

export default ((info, isValid) =>
{
    function test(inputServer, info, isValid, depth)
    {
        const server = inputServer || info.startServer();
        server.options.maxRequestDepth = Infinity;

        starter(server, info, isValid, (r, subFiles, allFiles) => {
            info.reqXML({
                url: 'http://localhost:' + info.port + '/folder',
                method: 'PROPFIND',
                headers: {
                    depth: depth
                }
            }, v2.HTTPCodes.MultiStatus, (req, body, bodySource) => {
                try
                {
                    const sub = body.find('DAV:multistatus').findMany('DAV:response').map((r) => r.find('DAV:location').find('DAV:href').findText());
                    
                    allFiles = allFiles.map((path) => `folder/${path}`);
                    allFiles.push('folder');

                    for(const sf of sub)
                    {
                        const url = decodeURIComponent(sf);
                        const path = url.substring(url.indexOf('/', url.indexOf('://') + 3) + 1);

                        const index = allFiles.indexOf(path);
                        if(index === -1)
                            return isValid(false, `Got a file name in "readDir(...)" which must not exist here with depth ${depth} : ${path}`);
                        
                        allFiles.splice(index, 1);
                    }
    
    
                    isValid(allFiles.length === 0, `All children were not returned with depth ${depth} ; here are the left ones : ${allFiles.toString()}`);
                }
                catch(ex)
                {
                    isValid(false, `Invalid WebDAV response body with depth ${depth}.`, ex);
                }
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
