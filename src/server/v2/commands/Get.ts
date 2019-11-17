import { HTTPCodes, HTTPRequestContext, HTTPMethod } from '../WebDAVRequest'
import { ResourceType } from '../../../manager/v2/fileSystem/CommonTypes'
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
                callback(null, Buffer.alloc(0));
        }
        else if(this.nb > this.max)
        {
            this.nb += chunk.length;
            callback(null, Buffer.alloc(0));
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

class MultipleRangedStream extends Transform
{
    streams : { stream : RangedStream, range : IRange }[]
    onEnded : () => void

    constructor(public ranges : IRange[])
    {
        super();

        this.streams = ranges.map((r) => {
            return {
                stream: new RangedStream(r.min, r.max),
                range: r
            }
        });
    }

    _transform(chunk : string | Buffer, encoding : string, callback : Function)
    {
        this.streams.forEach((streamRange) => {
            streamRange.stream.write(chunk, encoding);
        });

        callback(null, Buffer.alloc(0));
    }

    end(chunk ?: any, encoding?: any, cb?: Function): void
    {
        if(this.onEnded)
            process.nextTick(() => this.onEnded());
        super.end(chunk, encoding, cb);
    }
}

export interface IRange
{
    min : number
    max : number
}

export function parseRangeHeader(mimeType : string, size : number, range : string)
{
    const separator = Array.apply(null, { length: 20 })
        .map(() => String.fromCharCode('a'.charCodeAt(0) + Math.floor(Math.random() * 26)))
        .join('');

    const createMultipart = (range : IRange) => {
        return `--${separator}\r\nContent-Type: ${mimeType}\r\nContent-Range: bytes ${range.min}-${range.max}/*\r\n\r\n`;
    };
    const endMultipart = () => {
        return `\r\n--${separator}--`;
    };

    const ranges = range
        .split(',')
        .map((block) => parseRangeBlock(size, block));

    const len = ranges.reduce((previous, mm) => mm.max - mm.min + 1 + previous, 0)
        + (ranges.length <= 1 ?
            0 : ranges.reduce(
                (previous, mm) => createMultipart(mm).length + previous,
                endMultipart().length + '\r\n'.length * (ranges.length - 1)
            )
        );

    return {
        ranges,
        separator,
        len,
        createMultipart,
        endMultipart
    }

}

function parseRangeBlock(size : number, block : string) : IRange
{
    size -= 1;

    const rRange = /([0-9]+)-([0-9]+)/;
    let match = rRange.exec(block);
    if(match)
        return {
            min: Math.min(size, parseInt(match[1], 10)),
            max: Math.min(size, parseInt(match[2], 10))
        };
    
    const rStart = /([0-9]+)-/;
    match = rStart.exec(block);
    if(match)
        return {
            min: Math.min(size + 1, parseInt(match[1], 10)),
            max: size
        };
    
    const rEnd = /-([0-9]+)/;
    match = rEnd.exec(block);
    if(match)
        return {
            min: Math.max(0, size - parseInt(match[1], 10) + 1),
            max: size
        };
    
    throw new Error('Cannot parse the range block');
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

                                        rstream.on('error', (e) => {
                                            if(!ctx.setCodeFromError(e))
                                                ctx.setCode(HTTPCodes.InternalServerError);
                                            return callback();
                                        })

                                        if(range)
                                        {
                                            try
                                            {
                                                const { ranges, separator, len, createMultipart, endMultipart } = parseRangeHeader(mimeType, size, range);

                                                ctx.setCode(HTTPCodes.PartialContent);
                                                ctx.response.setHeader('Accept-Ranges', 'bytes')
                                                ctx.response.setHeader('Content-Length', len.toString())
                                                if(ranges.length <= 1)
                                                {
                                                    ctx.response.setHeader('Content-Type', mimeType)
                                                    ctx.response.setHeader('Content-Range', `bytes ${ranges[0].min}-${ranges[0].max}/*`)
                                                    rstream.on('end', callback);
                                                    return rstream.pipe(new RangedStream(ranges[0].min, ranges[0].max)).pipe(ctx.response);
                                                }
                                                
                                                ctx.response.setHeader('Content-Type', `multipart/byteranges; boundary=${separator}`)

                                                const multi = new MultipleRangedStream(ranges);
                                                rstream.pipe(multi);

                                                let current = 0;
                                                const dones = {};
                                                const evalNext = () => {
                                                    if(current === ranges.length)
                                                    {
                                                        return ctx.response.end(endMultipart(), () => {
                                                            callback();
                                                        });
                                                    }

                                                    const sr = dones[current];
                                                    if(sr)
                                                    {
                                                        if(current > 0)
                                                            ctx.response.write('\r\n');
                                                        ctx.response.write(createMultipart(sr.range));
                                                        
                                                        sr.stream.on('end', () => {
                                                            ++current;
                                                            evalNext();
                                                        });
                                                        sr.stream.on('data', (chunk, encoding) => {
                                                            ctx.response.write(chunk, encoding);
                                                        })
                                                        //sr.stream.pipe(ctx.response);
                                                    }
                                                }
                                                multi.streams.forEach((sr, index) => {
                                                    dones[index] = sr;
                                                })

                                                multi.onEnded = () => {
                                                    multi.streams.forEach((sr, index) => {
                                                        sr.stream.end();
                                                    });
                                                    evalNext();
                                                }
                                            }
                                            catch(ex)
                                            {
                                                ctx.setCode(HTTPCodes.BadRequest);
                                                callback();
                                            }
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
