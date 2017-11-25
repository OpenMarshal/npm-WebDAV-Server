import { WebDAVServer } from '../server/v2/export'
import { Path } from '../manager/v2/Path'

/**
 * Mount a WebDAVServer instance on a ExpressJS server.
 * 
 * @param root Root path of the mount
 * @param server Server to mount
 */
export function express(root : string, server : WebDAVServer)
{
    const path = new Path(root).toString(false);

    const pathRegex = new RegExp('^' + path + '((\/[^\/]+)*)\/?$');
    
    return function(req, res, next)
    {
        const matches = pathRegex.exec(req.url);
        if(!matches)
            return next();
        
        const subUrl = matches[1];
    
        req.url = new Path(subUrl).toString(false);
    
        server.executeRequest(req, res, path);
    };
}
