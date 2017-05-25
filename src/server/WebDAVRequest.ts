import { IResource, ReturnCallback } from '../resource/IResource'
import { MethodCallArgs } from './MethodCallArgs'
import { WebDAVServer } from '../server/WebDAVServer'
import { HTTPError } from '../Errors'
import { FSPath } from '../manager/FSManager'
import HTTPCodes from './HTTPCodes'
import * as http from 'http'
import * as url from 'url'

export { MethodCallArgs } from './MethodCallArgs'
export { HTTPCodes } from './HTTPCodes'

export type ChunkOnDataCallback = (chunk : Buffer, isFirst : boolean, isLast : boolean) => void
export type StartChunkedCallback = (error : HTTPError, onData : ChunkOnDataCallback) => void

export interface WebDAVRequest
{
    (arg : MethodCallArgs, callback : () => void) : void

    startChunked ?: (arg : MethodCallArgs, callback : StartChunkedCallback) => void
}
