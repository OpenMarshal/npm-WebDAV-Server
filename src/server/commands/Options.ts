import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'

export default function(arg : MethodCallArgs, callback)
{
    const methods = Object
        .keys(arg.server.methods)
        .map(s => s.toUpperCase())
        .join(',');
    
    arg.setCode(HTTPCodes.OK);
    arg.response.setHeader('Allow', methods);
    callback();
}
