import { HTTPCodes, HTTPMethod, HTTPRequestContext } from '../WebDAVRequest'
import { StandardMethods } from '../../../manager/v2/fileSystem/StandardMethods'
import { ResourceType } from '../../../manager/v2/fileSystem/CommonTypes'
import { startsWith } from '../../../helper/JSCompatibility'
import { Errors } from '../../../Errors'
import { Path } from '../../../manager/v2/Path'

export function execute(ctx : HTTPRequestContext, methodName : string, privilegeName : string, callback : () => void)
{
    ctx.noBodyExpected(() => {
        ctx.getResource((e, r) => {
            ctx.checkIfHeader(r, () => {
                const overwrite = ctx.headers.find('overwrite') === 'T';

                let destination : any = ctx.headers.find('destination');
                if(!destination)
                {
                    ctx.setCode(HTTPCodes.BadRequest);
                    return callback();
                }
                
                const startIndex : number = destination.indexOf('://');
                if(startIndex !== -1)
                {
                    destination = destination.substring(startIndex + '://'.length)
                    destination = destination.substring(destination.indexOf('/')) // Remove the hostname + port
                }
                if(ctx.rootPath && startsWith(destination, ctx.rootPath))
                {
                    destination = destination.substring(ctx.rootPath.length);
                }

                destination = new Path(destination);
                destination.decode();

                const sDest = destination.toString(true);
                const sSource = ctx.requested.path.toString(true);
                if(sDest === sSource)
                {
                    ctx.setCode(HTTPCodes.Forbidden);
                    return callback();
                }
                if(startsWith(sDest, sSource))
                {
                    ctx.setCode(HTTPCodes.BadGateway);
                    return callback();
                }

                const cb = (e ?: Error, overwritten ?: boolean) =>
                {
                    if(e)
                    {
                        if(e === Errors.ResourceAlreadyExists)
                            ctx.setCode(HTTPCodes.PreconditionFailed);
                        else if(!ctx.setCodeFromError(e))
                            ctx.setCode(HTTPCodes.InternalServerError)
                    }
                    else if(overwritten)
                        ctx.setCode(HTTPCodes.NoContent);
                    else
                        ctx.setCode(HTTPCodes.Created);
                    callback();
                };

                ctx.server.getFileSystem(destination, (destFs, destRootPath, destSubPath) => {
                    if(destFs !== r.fs)
                    { // Standard method
                        if(methodName === 'move')
                            StandardMethods.standardMove(ctx, r.path, r.fs, destSubPath, destFs, overwrite, cb);
                        else
                            StandardMethods.standardCopy(ctx, r.path, r.fs, destSubPath, destFs, overwrite, cb);
                    }
                    else
                    { // Delegate the operation to the file system
                        r[methodName](destSubPath, overwrite, cb);
                    }
                })
            })
        })
    })
}

export default class implements HTTPMethod
{
    unchunked(ctx : HTTPRequestContext, data : Buffer, callback : () => void) : void
    {
        execute(ctx, 'move', 'canMove', callback);
    }

    isValidFor(ctx : HTTPRequestContext, type : ResourceType)
    {
        return !!type;
    }
}
