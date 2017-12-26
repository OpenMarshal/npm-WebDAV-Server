import { IResource, SimpleCallback } from '../IResource'
import { Errors } from '../../../Errors'

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
            callback(Errors.ResourceAlreadyExists);
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
            callback(Errors.ResourceNotFound);
            return;
        }

        this.children.splice(index, 1);
        callback(null);
    }
}
