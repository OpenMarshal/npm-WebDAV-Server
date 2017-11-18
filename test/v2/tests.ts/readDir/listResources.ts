import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createDir'

export default ((info, isValid) =>
{
    const server = info.init(1);
    
    starter(server, info, isValid, (r, subFiles, allFiles) => {
        server.listResources('/', (paths) => {
            for(const path of paths)
            {
                if(path !== '/' && path !== '/folder' && !allFiles.some((p) => '/folder/' + p === path))
                {
                    return isValid(false, 'Cannot find "' + path + '" provided by "server.listResources(...)" in [' + allFiles + ']');
                }
            }
            
            isValid(true);
        })
    })

}) as Test;
