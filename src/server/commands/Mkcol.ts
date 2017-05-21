import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource, ResourceType } from '../../resource/IResource'
import { FSPath } from '../../manager/FSManager'
import * as path from 'path'

export default function(arg : MethodCallArgs, callback)
{
    arg.server.getResourceFromPath(arg.path.getParent(), (e, r) => {
        if(e)
        {
            arg.setCode(HTTPCodes.NotFound)
            callback();
            return;
        }

        if(!r.fsManager)
        {
            arg.setCode(HTTPCodes.InternalServerError)
            callback();
            return;
        }
        
        const resource = r.fsManager.newResource(arg.uri, path.basename(arg.uri), ResourceType.Directory, r);
        resource.create((e) => {
            if(e)
            {
                arg.setCode(HTTPCodes.InternalServerError)
                callback();
                return;
            }
        
            r.addChild(resource, (e) => {
                if(e)
                    arg.setCode(HTTPCodes.InternalServerError)
                else
                    arg.setCode(HTTPCodes.Created)
                callback();
            })
        })
    })
}
