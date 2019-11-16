import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter } from './.createDir'

export default ((info, isValid) =>
{
    const server1 = info.init(2);
    
    starter(server1, info, isValid, (r, subFiles) => {
        info.reqXML({
            url: 'http://localhost:' + info.port + '/folder',
            method: 'PROPFIND',
            headers: {
                depth: 1
            }
        }, v2.HTTPCodes.MultiStatus, (req, body) => {
            try
            {
                const sub = body.find('DAV:multistatus').findMany('DAV:response').map((r) => r.find('DAV:propstat').find('DAV:prop').find('DAV:displayname').findText());
                subFiles.push('folder');

                for(const sf of sub)
                {
                    const index = subFiles.indexOf(sf);
                    if(index === -1)
                        return isValid(false, 'Got a file name in "readDir(...)" which must not exist here : ' + sf);
                    
                    subFiles.splice(index, 1);
                }

                isValid(subFiles.length === 0, 'All children were not returned ; here are the left ones : ' + subFiles.toString());
            }
            catch(ex)
            {
                isValid(false, 'Invalid WebDAV response body.', ex);
            }
        })
    })

    const server2 = info.startServer();
    starter(server2, info, isValid, (r, subFiles) => {
        info.reqXML({
            url: 'http://localhost:' + info.port + '/folder',
            method: 'PROPFIND',
            headers: {
                depth: 0
            }
        }, v2.HTTPCodes.MultiStatus, (req, body) => {
            try
            {
                isValid(body.find('DAV:multistatus').findMany('DAV:response').length === 1, 'Too many or not enought DAV:response tags.');
            }
            catch(ex)
            {
                isValid(false, 'Invalid WebDAV response body.', ex);
            }
        })
    })

}) as Test;
