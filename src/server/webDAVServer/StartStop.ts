import { HTTPCodes, MethodCallArgs, WebDAVRequest, ChunkOnDataCallback } from '../WebDAVRequest'
import { WebDAVServerStartCallback } from './Types'
import { Errors, HTTPError } from '../../Errors'
import * as http from 'http'

export function start(port ?: number | WebDAVServerStartCallback, callback ?: WebDAVServerStartCallback)
{
    let _port : number = this.options.port;
    let _callback : WebDAVServerStartCallback;

    if(port && port.constructor === Number)
    {
        _port = port as number;
        if(callback)
        {
            if(callback instanceof Function)
                _callback = callback;
            else
                throw Errors.IllegalArguments;
        }
    }
    else if(port && port.constructor === Function)
    {
        _port = this.options.port;
        _callback = port as WebDAVServerStartCallback;
        if(callback)
            throw Errors.IllegalArguments;
    }

    if(!this.server)
    {
        this.server = http.createServer((req : http.IncomingMessage, res : http.ServerResponse) =>
        {
            let method : WebDAVRequest = this.methods[this.normalizeMethodName(req.method)];
            if(!method)
                method = this.unknownMethod;

            MethodCallArgs.create(this, req, res, (e, base) => {
                if(e)
                {
                    if(e === Errors.AuenticationPropertyMissing)
                        base.setCode(HTTPCodes.Forbidden);
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

                if(!this.options.canChunk || !method.startChunked || base.contentLength <= 0)
                {
                    const go = () =>
                    {
                        this.invokeBeforeRequest(base, () => {
                            method(base, base.exit);
                        })
                    }

                    if(base.contentLength <= 0)
                    {
                        base.data = new Buffer(0);
                        go();
                    }
                    else
                    {
                        const data = new Buffer(base.contentLength);
                        let index = 0;
                        req.on('data', (chunk) => {
                            if(chunk.constructor === String)
                                chunk = new Buffer(chunk as string);
                            
                            for(let i = 0; i < chunk.length && index < data.length; ++i, ++index)
                                data[index] = (chunk as Buffer)[i];
                            
                            if(index >= base.contentLength)
                            {
                                base.data = data;
                                go();
                            }
                        });
                    }
                }
                else
                {
                    this.invokeBeforeRequest(base, () => {
                        this.invokeBeforeRequest(base, () => {
                            method.startChunked(base, (error : HTTPError, onData : ChunkOnDataCallback) => {
                                if(error)
                                {
                                    base.setCode(error.HTTPCode);
                                    base.exit();
                                    return;
                                }

                                if(!onData)
                                {
                                    base.exit();
                                    return;
                                }
                                
                                let size = 0;
                                req.on('data', (chunk) => {
                                    if(chunk.constructor === String)
                                        chunk = new Buffer(chunk as string);
                                    size += chunk.length;
                                    
                                    onData(chunk as Buffer, size === chunk.length, size >= base.contentLength);
                                });
                            });
                        })
                    })
                }
            })
        })
    }

    this.server.listen(_port, this.options.hostname, () => {
        if(_callback)
            _callback(this.server);
    });
}

export function stop(callback : () => void)
{
    if(this.server)
    {
        this.server.close(callback);
        this.server = null;
    }
    else
        process.nextTick(callback);
}
