import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource } from '../../resource/IResource'

export default function(arg : MethodCallArgs, callback)
{
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
                        arg.setCode(HTTPCodes.OK);
                    callback();
                }))
            })
        })
    })
}
