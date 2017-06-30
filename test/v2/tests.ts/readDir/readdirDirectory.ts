import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createDir'

export default ((info, isValid) =>
{
    const server = info.init(1);
    
    starter(server, info, isValid, (r, subFiles) => {
        r.readDir((e, sub) => {
            if(e) return isValid(false, 'Could not call "readDir(...)".', e);

            for(const sf of sub)
            {
                const index = subFiles.indexOf(sf);
                if(index === -1)
                    return isValid(false, 'Got a file name in "readDir(...)" which must not exist here : ' + sf);
                
                delete subFiles[index];
            }

            isValid(subFiles.length > 0, 'All children were not returned ; here are the left ones : ' + subFiles.toString());
        })
    })

}) as Test;
