import { MethodCallArgs } from './MethodCallArgs'
import { HTTPError } from '../Errors'

export { MethodCallArgs } from './MethodCallArgs'
export { HTTPCodes } from './HTTPCodes'

export type ChunkOnDataCallback = (chunk : Buffer, isFirst : boolean, isLast : boolean) => void
export type StartChunkedCallback = (error : HTTPError, onData : ChunkOnDataCallback) => void

export interface WebDAVRequest
{
    (arg : MethodCallArgs, callback : () => void) : void

    startChunked ?: (arg : MethodCallArgs, callback : StartChunkedCallback) => void
}
