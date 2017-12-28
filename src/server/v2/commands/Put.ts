import { HTTPCodes, HTTPMethod, HTTPRequestContext } from '../WebDAVRequest'
import { ResourceType, OpenWriteStreamMode } from '../../../manager/v2/fileSystem/CommonTypes'
import { Readable } from 'stream'
import { Errors } from '../../../Errors'

export default class implements HTTPMethod
{
    isValidFor(ctx : HTTPRequestContext, type : ResourceType)
    {
        return !type || type.isFile;
    }

    chunked(ctx : HTTPRequestContext, inputStream : Readable, callback : () => void)
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
                            if(!ctx.setCodeFromError(e))
                                ctx.setCode(HTTPCodes.InternalServerError);
                            return callback();
                        }
                        else if(!type.isFile)
                        {
                            ctx.setCode(HTTPCodes.MethodNotAllowed);
                            return callback();
                        }

                        r.openWriteStream(mode, targetSource, ctx.headers.contentLength, (e, wStream, created) => {
                            if(e)
                            {
                                if(!ctx.setCodeFromError(e))
                                    ctx.setCode(e === Errors.IntermediateResourceMissing || e === Errors.WrongParentTypeForCreation ? HTTPCodes.Conflict : HTTPCodes.InternalServerError);
                                return callback();
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
                                if(!ctx.setCodeFromError(e))
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
