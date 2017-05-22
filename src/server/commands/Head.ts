import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource } from '../../resource/IResource'

export default function(arg : MethodCallArgs, callback)
{
    arg.getResource((e, r) => {
        if(e)
        {
            arg.setCode(HTTPCodes.NotFound)
            callback();
            return;
        }

        const targetSource = arg.findHeader('source', 'F').toUpperCase() === 'T';

        arg.requirePrivilege(targetSource ? [ 'canRead', 'canSource' ] : [ 'canRead' ], r, () => {
            r.read(targetSource, (e, c) => {
                if(e)
                    arg.setCode(HTTPCodes.MethodNotAllowed)
                else
                    arg.setCode(HTTPCodes.OK);
                callback();
            })
        })
    })
}
