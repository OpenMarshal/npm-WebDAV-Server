import { IResource, ResourceType } from '../resource/Resource'

export interface FSManager
{
    serialize(resource : IResource) : object;
    unserialize(serializedResource : object) : IResource;

    newResource(fullPath : string, name : string, type : ResourceType, parent : IResource) : IResource;
}

export class FSPath
{
    paths : string[]

    constructor(path : FSPath | string[] | string)
    {
        if(path.constructor === String)
            this.paths = (path as string).replace(/(^\/|\/$)/g, '').split('/');
        else if(path.constructor === FSPath)
            this.paths = (path as FSPath).paths.filter((x) => true); // clone
        else
            this.paths = path as string[];
    }

    isRoot() : boolean
    {
        return this.paths.length === 0 || this.paths.length === 1 && this.paths[0].length === 0;
    }

    fileName() : string
    {
        return this.paths[this.paths.length - 1];
    }

    rootName() : string
    {
        return this.paths[0];
    }

    parentName() : string
    {
        return this.paths[this.paths.length - 2];
    }

    getParent() : FSPath
    {
        return new FSPath(this.paths.slice(0, this.paths.length - 1));
    }

    hasParent() : boolean
    {
        return this.paths.length >= 2;
    }

    removeRoot() : void
    {
        this.paths.splice(0, 1);
    }

    clone() : FSPath
    {
        return new FSPath(this);
    }

    toString() : string
    {
        return '/' + this.paths.join('/');
    }
}
