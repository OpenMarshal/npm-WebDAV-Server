import { IResource, ReturnCallback } from '../resource/IResource'
import { WebDAVServer } from '../server/WebDAVServer'
import { FSPath } from '../manager/FSManager'
import HTTPCodes from './HTTPCodes'
import MethodCallArgs from './MethodCallArgs'
import * as http from 'http'
import * as url from 'url'

export { MethodCallArgs } from './MethodCallArgs'
export { HTTPCodes } from './HTTPCodes'

export interface WebDAVRequest
{
    (arg : MethodCallArgs, callback : () => void) : void

    chunked ?: boolean
}
