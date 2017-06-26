import { HTTPCodes, HTTPMethod, RequestContext } from '../WebDAVRequest'
import { ResourceType, OpenWriteStreamMode } from '../../../manager/v2/fileSystem/CommonTypes'
import { Errors, HTTPError } from '../../../Errors'
import { Readable } from 'stream'
import * as path from 'path'

export default class implements HTTPMethod
{
    isValidFor(type : ResourceType)
    {
        return !type || type.isFile;
    }

    chunked(ctx : RequestContext, inputStream : Readable, callback : () => void)
    {
        const targetSource = ctx.headers.isSource;

        ctx.getResource((e, r) => {
            ctx.checkIfHeader(r, () => {
                //ctx.requirePrivilege(targetSource ? [ 'canSource', 'canWrite' ] : [ 'canWrite' ], r, () => {
                    let mode : OpenWriteStreamMode = 'canCreate';
                    r.type((e, type) => process.nextTick(() => {
                        if(e === Errors.ResourceNotFound)
                        {
                            mode = 'mustCreate';
                        }
                        else if(e)
                        {
                            ctx.setCode(HTTPCodes.InternalServerError);
                            callback();
                            return;
                        }
                        else if(!type.isFile)
                        {
                            ctx.setCode(HTTPCodes.MethodNotAllowed);
                            callback();
                            return;
                        }

                        r.openWriteStream(mode, targetSource, ctx.headers.contentLength, (e, wStream, created) => {
                            if(e)
                            {
                                ctx.setCode(e === Errors.IntermediateResourceMissing || e === Errors.WrongParentTypeForCreation ? HTTPCodes.Conflict : HTTPCodes.InternalServerError);
                                callback();
                                return;
                            }

                            inputStream.pipe(wStream);
                            wStream.on('finish', (e) => {
                                if(created)
                                    ctx.setCode(HTTPCodes.Created);
                                else
                                    ctx.setCode(HTTPCodes.OK);
                                //ctx.invokeEvent('write', r);
                                callback();
                            });
                            wStream.on('error', (e) => {
                                ctx.setCode(HTTPCodes.InternalServerError)
                                callback();
                            });
                        })
                    }))
                //})
            })
        })
    }
}
