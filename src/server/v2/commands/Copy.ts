import { HTTPMethod, HTTPRequestContext } from '../WebDAVRequest'
import { ResourceType } from '../../../manager/v2/fileSystem/CommonTypes'
import { execute } from './Move'

export default class implements HTTPMethod
{
    unchunked(ctx : HTTPRequestContext, data : Buffer, callback : () => void) : void
    {
        execute(ctx, 'copy', 'canCopy', callback);
    }

    isValidFor(ctx : HTTPRequestContext, type : ResourceType)
    {
        return !!type;
    }
}
