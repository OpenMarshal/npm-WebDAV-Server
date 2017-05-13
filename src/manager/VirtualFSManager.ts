import { IResource, ResourceType } from '../resource/IResource'
import { VirtualResource } from '../resource/virtual/VirtualResource'
import { VirtualFolder } from '../resource/virtual/VirtualFolder'
import { VirtualFile } from '../resource/virtual/VirtualFile'
import { FSManager } from './FSManager'

export class VirtualFSManager implements FSManager
{
    private static _instance : VirtualFSManager;
    static instance()
    {
        if(!this._instance)
            this._instance = new VirtualFSManager();
        return this._instance;
    }

    serialize(resource : any) : object
    {
        let obj : {
            name,
            children,
            content
        };

        obj.name = resource.name;
        if(resource.children)
            obj.children = resource.children;
        if(resource.content)
            obj.content = resource.content;

        return obj;
    }
    unserialize(serializedResource : { name, children, content }) : VirtualResource
    {
        if(serializedResource.children)
        {
            const rs = new VirtualFolder(serializedResource.name, null, this);
            rs.children = serializedResource.children;
            return rs;
        }

        if(serializedResource.content)
        {
            const rs = new VirtualFile(serializedResource.name, null, this);
            rs.content = serializedResource.content;
            return rs;
        }

        throw new Error('Unrecognized resource');
    }

    newResource(fullPath : string, name : string, type : ResourceType, parent : IResource) : IResource
    {
        if(type.isDirectory)
            return new VirtualFolder(name, parent, this);
        if(type.isFile)
            return new VirtualFile(name, parent, this);

        throw new Error('Unrecognized type');
    }
}
