import { HTTPCodes, HTTPRequestContext, HTTPMethod } from '../WebDAVRequest'

export default class implements HTTPMethod
{
    unchunked(ctx : HTTPRequestContext, data : Buffer, callback : () => void) : void
    {
        ctx.setCode(HTTPCodes.NotImplemented);
        callback();
    }
}
