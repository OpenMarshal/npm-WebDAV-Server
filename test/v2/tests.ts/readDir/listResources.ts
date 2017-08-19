import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createDir'

export default ((info, isValid) =>
{
    const server = info.init(1);
    
    starter(server, info, isValid, (r, subFiles) => {
        let error = false;

        server.listResources('/', (paths) => {
            for(const path of paths)
            {
                if(path !== '/' && path !== '/folder' && !subFiles.some((p) => '/folder/' + p == path))
                {
                    error = true;
                    return isValid(false, 'The result of "server.listResources(...)" is invalid.');
                }
            }
            
            isValid(true);
        })
    })

}) as Test;
