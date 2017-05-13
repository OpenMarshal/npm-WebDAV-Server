import { IResource, ResourceType } from '../resource/IResource'
import { PhysicalResource } from '../resource/physical/PhysicalResource'
import { PhysicalFolder } from '../resource/physical/PhysicalFolder'
import { PhysicalFile } from '../resource/physical/PhysicalFile'
import { FSManager } from './FSManager'
import * as path from 'path'

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
        const parentRealPath = (parent as any).realPath;

        if(!parentRealPath)
            throw new Error('Can\'t create a physical resource with a non-physical parent')
        
        const newRealPath = path.join(parentRealPath, name);
        
        if(type.isDirectory)
            return new PhysicalFolder(newRealPath, parent, this);
        else
            return new PhysicalFile(newRealPath, parent, this);
    }
}
