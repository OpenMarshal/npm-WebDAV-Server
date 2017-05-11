import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource } from '../../resource/Resource'

export default function(arg : MethodCallArgs, callback)
{
    arg.getResource((e, r) => {
        if(e)
        {
            arg.setCode(HTTPCodes.NotFound)
            callback();
            return;
        }

        r.read((e, c) => {
            if(e)
                arg.setCode(HTTPCodes.NotFound)
            else
            {
                arg.setCode(HTTPCodes.OK);
                arg.response.write(c);
            }
            callback();
        })
    })
}