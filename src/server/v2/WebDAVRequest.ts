import { ResourceType } from '../../manager/v2/fileSystem/CommonTypes'
import { HTTPRequestContext } from './RequestContext'
import { Readable } from 'stream'

export { HTTPRequestContext } from './RequestContext'
export { HTTPCodes } from '../HTTPCodes'

export interface HTTPMethod
{
    unchunked?(ctx : HTTPRequestContext, data : Buffer, callback : () => void) : void
    chunked?(ctx : HTTPRequestContext, inputStream : Readable, callback : () => void) : void
    isValidFor?(ctx : HTTPRequestContext, type ?: ResourceType) : boolean
}
