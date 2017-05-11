import { IResource, SimpleCallback } from './Resource'

export class ResourceChildren
{
    children : Array<IResource>

    constructor()
    {
        this.children = [];
    }

    add(resource : IResource, callback : SimpleCallback)
    {
        if(this.children.some(c => c === resource))
        {
            callback(new Error("The resource already exists."));
            return;
        }

        this.children.push(resource);
        callback(null);
    }
    remove(resource : IResource, callback : SimpleCallback)
    {
        var index = this.children.indexOf(resource);
        if(index === -1)
        {
            callback(new Error("Can't find the resource."));
            return;
        }

        this.children.splice(index, 1);
        callback(null);
    }
}

export function forAll<T>(array : Array<T>, itemFn : (item : T, callback : (e) => void) => void, onAllAndSuccess : () => void, onError : (e) => void) : void
{
    var nb = array.length + 1;
    var error = null;

    array.forEach(child => {
        if(error)
            return;
        itemFn(child, e => {
            if(e)
            {
                error = e;
                onError(error);
            }
            else
                go();
        });
    })
    go();
    
    function go()
    {
        --nb;
        if(nb === 0 || error)
            return;
        
        onAllAndSuccess();
    }
}
