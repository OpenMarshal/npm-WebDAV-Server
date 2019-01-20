import { ResourceTreeNode, IResourceTreeNode } from './Types'
import { IResource, ReturnCallback } from '../../../resource/v1/IResource'
import { MethodCallArgs } from '../MethodCallArgs'
import { FSPath } from '../../../manager/v1/FSManager'
import { Errors } from '../../../Errors'

export function getResourceFromPath(arg : MethodCallArgs, path : FSPath | string[] | string, callbackOrRootResource : ReturnCallback<IResource> | IResource, callback ?: ReturnCallback<IResource>)
{
    let rootResource : IResource;

    if(callbackOrRootResource instanceof Function)
    {
        callback = callbackOrRootResource;
        rootResource = this.rootResource;
    }
    else
        rootResource = callbackOrRootResource;

    let paths : FSPath
    if(path.constructor === FSPath)
        paths = path as FSPath;
    else
        paths = new FSPath(path);
    
    if(rootResource.gateway && rootResource.gateway.constructor === Function)
    {
        rootResource.gateway(arg, paths, (e, r) => callback(e ? Errors.ResourceNotFound : null, r));
        return;
    }
    
    if(paths.isRoot())
    {
        callback(null, rootResource);
        return;
    }

    rootResource.getChildren((e, children) => {
        if(e)
        {
            callback(e, null);
            return;
        }
        if(children.length === 0)
        {
            callback(Errors.ResourceNotFound, null);
            return;
        }

        let found = false;
        let nb = children.length;
        function done()
        {
            --nb;
            if(nb === 0 && !found)
                process.nextTick(() => callback(Errors.ResourceNotFound, null));
        }

        for(const k in children)
        {
            if(found)
                break;

            children[k].webName((e, name) => {
                if(name === paths.rootName())
                {
                    found = true;
                    paths.removeRoot();
                    this.getResourceFromPath(arg, paths, children[k], callback);
                    return;
                }
                process.nextTick(done);
            })
        }
    })
}

export function addResourceTree(_rootResource : IResource | ResourceTreeNode, _resoureceTree : ResourceTreeNode | (() => void), _callback ?: (e : Error) => void)
{
    let rootResource : IResource
    let resoureceTree : ResourceTreeNode
    let callback = _callback;

    if(!callback)
    {
        resoureceTree = _rootResource;
        rootResource = this.rootResource;
        callback = _resoureceTree as (e : Error) => void;
    }
    else
    {
        resoureceTree = _resoureceTree as ResourceTreeNode;
        rootResource = _rootResource as IResource;
    }

    const cb = callback;
    callback = (e) => {
        if(cb)
            cb(e);
    }

    if(resoureceTree.constructor === Array)
    {
        const array = resoureceTree as any[];
        if(array.length === 0)
        {
            callback(null);
            return;
        }

        let nb = array.length;
        const doneArray = function(e)
        {
            if(nb <= 0)
                return;
            if(e)
            {
                nb = -1;
                callback(e);
                return;
            }
            --nb;
            if(nb === 0)
                callback(null);
        }

        array.forEach((r) => this.addResourceTree(rootResource, r, doneArray));
    }
    else if((resoureceTree as IResource).fsManager !== undefined)
    { // resoureceTree is IResource
        rootResource.addChild(resoureceTree as IResource, callback);
    }
    else
    { // resoureceTree is IResourceTreeNode
        const irtn = resoureceTree as IResourceTreeNode;
        const resource = irtn.r ? irtn.r : irtn.resource;
        const children = irtn.c ? irtn.c : irtn.children;
        rootResource.addChild(resource, (e) => {
            if(e)
            {
                callback(e);
                return;
            }

            if(children && children.constructor !== Array)
            {
                this.addResourceTree(resource, children, callback)
                return;
            }

            if(!children || children.length === 0)
            {
                callback(null);
                return;
            }

            let nb = children.length;
            function done(e)
            {
                if(nb <= 0)
                    return;
                if(e)
                {
                    nb = -1;
                    callback(e);
                    return;
                }
                --nb;
                if(nb === 0)
                    callback(null);
            }

            children.forEach((c) => this.addResourceTree(resource, c, done));
        })
    }
}
