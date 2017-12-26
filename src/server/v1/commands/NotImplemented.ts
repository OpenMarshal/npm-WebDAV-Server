import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource } from '../../../resource/v1/IResource'

export default function(arg : MethodCallArgs, callback)
{
    arg.setCode(HTTPCodes.NotImplemented);
    callback();
}
