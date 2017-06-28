import { HTTPCodes, HTTPMethod, RequestContext } from '../WebDAVRequest'
import { ResourceType } from '../../../manager/v2/fileSystem/CommonTypes'
import { StandardMethods } from '../../../manager/v2/fileSystem/StandardMethods'
import { Path } from '../../../manager/v2/Path'
import { Errors } from '../../../Errors'

export function execute(ctx : RequestContext, methodName : string, privilegeName : string, callback : () => void)
{
    ctx.noBodyExpected(() => {
        ctx.getResource((e, r) => {
            ctx.checkIfHeader(r, () => {
                //ctx.requirePrivilege([ privilegeName ], r, () => {
                    const overwrite = ctx.headers.find('overwrite') === 'T';

                    let destination : any = ctx.headers.find('destination');
                    if(!destination)
                    {
                        ctx.setCode(HTTPCodes.BadRequest);
                        return callback();
                    }
                    
                    const startIndex = destination.indexOf('://');
                    if(startIndex !== -1)
                    {
                        destination = destination.substring(startIndex + '://'.length)
                        destination = destination.substring(destination.indexOf('/')) // Remove the hostname + port
                    }
                    destination = new Path(destination);

                    if(destination.toString() === ctx.requested.path.toString())
                    {
                        ctx.setCode(HTTPCodes.Forbidden);
                        return callback();
                    }

                    const cb = (e ?: Error, overwritten ?: boolean) =>
                    {
                        if(e)
                        {
                            if(!ctx.setCodeFromError(e))
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
                        { // Copy
                            if(methodName === 'move')
                                StandardMethods.standardMove(ctx, r.path, r.fs, destSubPath, destFs, overwrite, cb);
                            else
                                StandardMethods.standardCopy(ctx, r.path, r.fs, destSubPath, destFs, overwrite, cb);
                        }
                        else
                        { // Delegate the operation to the file system
                            r[methodName](destination, overwrite, cb);
                        }
                    })
                //})
            })
        })
    })
}

export default class implements HTTPMethod
{
    unchunked(ctx : RequestContext, data : Buffer, callback : () => void) : void
    {
        execute(ctx, 'move', 'canMove', callback);
    }

    isValidFor(type : ResourceType)
    {
        return !!type;
    }
}
