import { v2 } from '../../../lib/index.js'
import { RequestResponse, Options, Request } from 'request'
import { XMLElementUtil } from 'xml-js-builder'

export interface TestInfo
{
    port : number
    ctx : v2.RequestContext
    easyError : (e : Error, cb : () => void) => (e, arg1, arg2, arg3) => void
    startServer : (options ?: v2.WebDAVServerOptions, autoStart ?: boolean) => v2.WebDAVServer
    init : (nbExpected : number, name ?: v2.WebDAVServerOptions | string, autoStart ?: boolean) => v2.WebDAVServer
    req : {
        (config : Options, callback : (res : RequestResponse, body ?: string) => void) : void
        (config : Options, codeStatusExpected : number, callback : (res : RequestResponse, body ?: string) => void) : void
    }
    reqXML : {
        (config : Options, callback : (res : RequestResponse, body ?: XMLElementUtil, bodyStr ?: string) => void) : void
        (config : Options, codeStatusExpected : number, callback : (res : RequestResponse, body ?: XMLElementUtil, bodyStr ?: string) => void) : void
    }
    reqStream : (config : Options & { canFail ?: boolean }, callback : (res : RequestResponse, body ?: string) => void) => Request
    expect : (nb : number) => void
}

export interface TestCallback
{
    (good : boolean, msg ?: string | Error, error ?: Error | string) : void
}

export interface Test
{
    (info : TestInfo, isValid : TestCallback) : void
}
