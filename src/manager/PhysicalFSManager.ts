import { PhysicalFile, PhysicalFolder, PhysicalResource } from '../resource/PhysicalResource'
import { IResource, ResourceType } from '../resource/Resource'
import { FSManager } from './FSManager'

export class PhysicalFSManager implements FSManager
{
    private static _instance : PhysicalFSManager;
    static instance()
    {
        if(!this._instance)
            this._instance = new PhysicalFSManager();
        return this._instance;
    }

    serialize(resource : any) : object
    {
        if(!resource.realPath)
            throw new Error('Unrecognized resource');

        return { realPath: resource.realPath, isFile: resource.constructor === PhysicalFile };
    }
    unserialize(serializedResource : { realPath : string, isFile : boolean }) : PhysicalResource
    {
        if(serializedResource.realPath)
        {
            if(serializedResource.isFile)
                return new PhysicalFile(serializedResource.realPath, null, this);
            else
                return new PhysicalFolder(serializedResource.realPath, null, this);
        }

        throw new Error('Unrecognized resource');
    }

    newResource(fullPath : string, name : string, type : ResourceType, parent : IResource) : IResource
    {
        throw new Error('Not implemented yet');
    }
}
