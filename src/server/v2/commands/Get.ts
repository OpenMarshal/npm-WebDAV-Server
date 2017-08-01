import { HTTPCodes, HTTPRequestContext, HTTPMethod } from '../WebDAVRequest'
import { ResourceType } from '../../../manager/v2/fileSystem/CommonTypes'
import { Errors } from '../../../Errors'
import { Transform } from 'stream'

class RangedStream extends Transform
{
    nb : number;

    constructor(public min : number, public max : number)
    {
        super();

        this.nb = 0;
    }

    _transform(chunk : string | Buffer, encoding : string, callback : Function)
    {
        if(this.nb < this.min)
        {
            const lastNb = this.nb;
            this.nb += chunk.length;
            if(this.nb > this.min)
            {
                const start = this.min - lastNb;
                chunk = chunk.slice(start, this.nb > this.max ? this.max - this.min + 1 + start : undefined);
                callback(null, chunk);
            }
            else
                callback(null, new Buffer(0));
        }
        else if(this.nb > this.max)
        {
            this.nb += chunk.length;
            callback(null, new Buffer(0));
        }
        else
        {
            this.nb += chunk.length;
            if(this.nb > this.max)
                chunk = chunk.slice(0, this.max - (this.nb - chunk.length) + 1);
            callback(null, chunk);
        }
    }
}

export default class implements HTTPMethod
{
    unchunked(ctx : HTTPRequestContext, data : Buffer, callback : () => void) : void
    {
        ctx.noBodyExpected(() => {
            ctx.getResource((e, r) => {
                ctx.checkIfHeader(r, () => {
                    const targetSource = ctx.headers.isSource;

                    //ctx.requirePrivilegeEx(targetSource ? [ 'canRead', 'canSource', 'canGetMimeType' ] : [ 'canRead', 'canGetMimeType' ], () => {
                        r.type((e, type) => {
                            if(e)
                            {
                                if(!ctx.setCodeFromError(e))
                                    ctx.setCode(HTTPCodes.InternalServerError)
                                return callback();
                            }
                            if(!type.isFile)
                            {
                                ctx.setCode(HTTPCodes.MethodNotAllowed)
                                return callback();
                            }
                            
                            const range = ctx.headers.find('Range');
                            r.size(targetSource, (e, size) => process.nextTick(() => {
                                if(e && !range)
                                {
                                    if(!ctx.setCodeFromError(e))
                                        ctx.setCode(HTTPCodes.InternalServerError)
                                    return callback();
                                }

                                r.mimeType(targetSource, (e, mimeType) => process.nextTick(() => {
                                    if(e)
                                    {
                                        if(!ctx.setCodeFromError(e))
                                            ctx.setCode(HTTPCodes.InternalServerError)
                                        return callback();
                                    }

                                    r.openReadStream(targetSource, (e, rstream) => {
                                        if(e)
                                        {
                                            if(!ctx.setCodeFromError(e))
                                                ctx.setCode(HTTPCodes.MethodNotAllowed)
                                            return callback();
                                        }
                                        //ctx.invokeEvent('read', r);

                                        if(range)
                                        {
                                            const rex = /([0-9]+)/g;
                                            const min = parseInt(rex.exec(range)[1], 10);
                                            const max = parseInt(rex.exec(range)[1], 10);

                                            ctx.setCode(HTTPCodes.PartialContent);
                                            ctx.response.setHeader('Accept-Ranges', 'bytes')
                                            ctx.response.setHeader('Content-Type', mimeType)
                                            ctx.response.setHeader('Content-Length', Math.min(size, max - min + 1).toString())
                                            ctx.response.setHeader('Content-Range', 'bytes ' + min + '-' + max + '/*')

                                            rstream.on('end', callback);
                                            rstream.pipe(new RangedStream(min, max)).pipe(ctx.response);
                                        }
                                        else
                                        {
                                            ctx.setCode(HTTPCodes.OK);
                                            ctx.response.setHeader('Accept-Ranges', 'bytes')
                                            ctx.response.setHeader('Content-Type', mimeType);
                                            if(size !== null && size !== undefined && size > -1)
                                                ctx.response.setHeader('Content-Length', size.toString());
                                            rstream.on('end', callback);
                                            rstream.pipe(ctx.response);
                                        }
                                    })
                                }))
                            }))
                        })
                    //})
                })
            })
        })
    }
    
    isValidFor(ctx : HTTPRequestContext, type : ResourceType)
    {
        return type && type.isFile;
    }
}
