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
    const path = new Path(root).toString(true);

    return function(req, res, next)
    {
        if(req.url.indexOf(path) !== 0)
            return next();
        
        const subPath = req.url.substring(path.length);
        
        req.url = new Path(subPath).toString(false);
        
        server.executeRequest(req, res, path);
    };
}
