import { HTTPCodes, HTTPRequestContext, HTTPMethod } from '../WebDAVRequest'
import { WebDAVServerStartCallback } from './WebDAVServer'
import { Errors } from '../../../Errors'
import * as https from 'https'
import * as http from 'http'

export function executeRequest(req : http.IncomingMessage, res : http.ServerResponse, rootPath ?: string) : void
{
    let method : HTTPMethod = this.methods[this.normalizeMethodName(req.method)];
    if(!method)
        method = this.unknownMethod;

    HTTPRequestContext.create(this, req, res, rootPath, (e, base) => {
        if(e)
        {
            if(e === Errors.AuenticationPropertyMissing || e === Errors.MissingAuthorisationHeader || e === Errors.BadAuthentication || e === Errors.WrongHeaderFormat)
                base.setCode(HTTPCodes.Unauthorized);
            else
                base.setCode(HTTPCodes.InternalServerError);
            res.end();
            return;
        }

        base.exit = () =>
        {
            base.response.end();
            this.invokeAfterRequest(base, null);
        };

        if(!method.chunked)
        {
            const go = (data : Buffer) =>
            {
                this.invokeBeforeRequest(base, () => {
                    method.unchunked(base, data, base.exit);
                })
            }

            if(base.headers.contentLength <= 0)
            {
                go(Buffer.alloc(0));
            }
            else
            {
                const data = Buffer.alloc(base.headers.contentLength);
                let index = 0;
                req.on('data', (chunk) => {
                    if(chunk.constructor === String)
                        chunk = Buffer.from(chunk as string);
                    
                    for(let i = 0; i < chunk.length && index < data.length; ++i, ++index)
                        data[index] = (chunk as Buffer)[i];
                    
                    if(index >= base.headers.contentLength)
                        go(data);
                });
            }
        }
        else
        {
            this.invokeBeforeRequest(base, () => {
                method.chunked(base, req, base.exit);
            })
        }
    })
}

export function start(port ?: number | WebDAVServerStartCallback, callback ?: WebDAVServerStartCallback)
{
    let _port : number = this.options.port;
    let _callback : WebDAVServerStartCallback;

    if(port && typeof port === 'number')
        _port = port;
    else if(callback && typeof callback === 'number')
        _port = callback;

    if(port && typeof port === 'function')
        _callback = port;
    else if(callback && typeof callback === 'function')
        _callback = callback;

    if(!this.server)
    {
        const serverCreator = this.options.https ? (c) => https.createServer(this.options.https, c) : (c) => http.createServer(c);
        this.server = serverCreator(executeRequest.bind(this));

        this.autoSave();
    }

    this.server.listen(_port, this.options.hostname, () => {
        if(_callback)
            _callback(this.server);
    });
}

export function stop(callback : () => void)
{
    callback = callback ? callback : () => { };

    if(this.server)
    {
        this.server.close(callback);
        this.server = null;
    }
    else
        process.nextTick(callback);
}
