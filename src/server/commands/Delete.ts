import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource } from '../../resource/Resource'

export default function(arg : MethodCallArgs, callback)
{
    arg.getResource((e, r) => {
        if(e)
        {
            arg.setCode(HTTPCodes.NotFound)
            callback()
            return;
        }

        arg.requirePrivilege([ 'canDelete' ], r, () => {
            r.delete((e) => {
                if(e)
                    arg.setCode(HTTPCodes.InternalServerError);
                else
                    arg.setCode(HTTPCodes.OK);
                callback();
            })
        })
    })
}
