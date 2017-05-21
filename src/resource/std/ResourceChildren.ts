import { IResource, SimpleCallback } from '../IResource'

export class ResourceChildren
{
    children : IResource[]

    constructor()
    {
        this.children = [];
    }

    add(resource : IResource, callback : SimpleCallback)
    {
        if(this.children.some((c) => c === resource))
        {
            callback(new Error('The resource already exists.'));
            return;
        }

        this.children.push(resource);
        callback(null);
    }
    remove(resource : IResource, callback : SimpleCallback)
    {
        const index = this.children.indexOf(resource);
        if(index === -1)
        {
            callback(new Error('Can\'t find the resource.'));
            return;
        }

        this.children.splice(index, 1);
        callback(null);
    }
}
