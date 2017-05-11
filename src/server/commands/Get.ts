import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource } from '../../resource/Resource'

export default function(arg : MethodCallArgs, callback)
{
    arg.setCode(HTTPCodes.NotImplemented);
    callback();
}