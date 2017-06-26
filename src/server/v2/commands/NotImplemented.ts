import { HTTPCodes, RequestContext, HTTPMethod } from '../WebDAVRequest'

export default class implements HTTPMethod
{
    unchunked(ctx : RequestContext, data : Buffer, callback : () => void) : void
    {
        ctx.setCode(HTTPCodes.NotImplemented);
        callback();
    }
}
