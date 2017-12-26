import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource, ResourceType } from '../../../resource/v1/IResource'

export function method(arg : MethodCallArgs, callback)
{
    arg.noBodyExpected(() => {
        arg.getResource((e, r) => {
            if(e)
            {
                arg.setCode(HTTPCodes.NotFound)
                callback()
                return;
            }

            arg.checkIfHeader(r, () => {
                arg.requirePrivilege([ 'canDelete' ], r, () => {
                    r.delete((e) => process.nextTick(() => {
                        if(e)
                            arg.setCode(HTTPCodes.InternalServerError);
                        else
                        {
                            arg.setCode(HTTPCodes.OK);
                            arg.invokeEvent('delete', r);
                        }
                        callback();
                    }))
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
