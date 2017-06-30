import { HTTPCodes, HTTPMethod, HTTPRequestContext } from '../WebDAVRequest'
import { ResourceType, SimpleCallback } from '../../../manager/v2/fileSystem/CommonTypes'
import { Path } from '../../../manager/v2/Path'
import { Workflow } from '../../../helper/Workflow'
import { Readable } from 'stream'
import { Errors } from '../../../Errors'
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
