import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource, ResourceType } from '../../../resource/v1/IResource'
import { FSPath } from '../../../manager/v1/FSManager'

export function method(arg : MethodCallArgs, callback)
{
    arg.noBodyExpected(() => {
        arg.getResource((e, r) => {
            if(e)
            {
                arg.setCode(HTTPCodes.NotFound)
                callback();
                return;
            }

            arg.checkIfHeader(r, () => {
                arg.requirePrivilege([ 'canMove' ], r, () => {
                    const overwrite = arg.findHeader('overwrite') === 'T';

                    let destination : any = arg.findHeader('destination');
                    if(!destination)
                    {
                        arg.setCode(HTTPCodes.BadRequest);
                        callback();
                        return;
                    }
                    
                    destination = destination.substring(destination.indexOf('://') + '://'.length)
                    destination = destination.substring(destination.indexOf('/'))
                    destination = new FSPath(destination)

                    arg.server.getResourceFromPath(arg, destination.getParent(), (e, rDest) => {
                        if(e)
                        {
                            arg.setCode(HTTPCodes.InternalServerError);
                            return;
                        }

                        arg.requirePrivilege([ 'canAddChild' ], rDest, () => {
                            r.moveTo(rDest, destination.fileName(), overwrite, (e) => process.nextTick(() => {
                                if(e)
                                    arg.setCode(HTTPCodes.InternalServerError)
                                else
                                {
                                    arg.invokeEvent('move', r, destination);
                                    arg.setCode(HTTPCodes.Created)
                                }
                                callback()
                            }))
                        })
                    })
                })
            })
        })
    })
}

(method as WebDAVRequest).isValidFor = function(type : ResourceType)
{
    return !!type;
};

export default method;
