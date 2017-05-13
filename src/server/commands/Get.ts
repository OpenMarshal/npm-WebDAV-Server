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
                arg.setCode(HTTPCodes.MethodNotAllowed)
            else
            {
                arg.setCode(HTTPCodes.OK);

                let content : any = c;
                if(c === undefined || c === null)
                    content = new Buffer(0);
                else if(c.constructor === Boolean || c.constructor === Number)
                    content = c.toString()
                else
                    content = c;
                
                arg.response.write(content);
            }
            callback();
        })
    })
}
