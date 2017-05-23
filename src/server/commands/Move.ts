import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource, ResourceType } from '../../resource/IResource'
import { FSPath } from '../../manager/FSManager'

export default function(arg : MethodCallArgs, callback)
{
    arg.getResource((e, r) => {
        if(e)
        {
            arg.setCode(HTTPCodes.NotFound)
            callback();
            return;
        }

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

            arg.server.getResourceFromPath(destination.getParent(), (e, rDest) => {
                arg.requirePrivilege([ 'canAddChild' ], rDest, () => {
                    r.moveTo(rDest, destination.fileName(), overwrite, (e) => process.nextTick(() => {
                        if(e)
                            arg.setCode(HTTPCodes.InternalServerError)
                        else
                            arg.setCode(HTTPCodes.Created)
                        callback()
                    }))
                })
            })
        })
    })
}
