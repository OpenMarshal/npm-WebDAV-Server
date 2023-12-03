import { HTTPCodes, MethodCallArgs } from '../WebDAVRequest'

export default function(arg : MethodCallArgs, callback)
{
    arg.setCode(HTTPCodes.NotImplemented);
    callback();
}
