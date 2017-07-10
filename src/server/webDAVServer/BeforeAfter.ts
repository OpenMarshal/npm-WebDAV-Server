import { MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'

export function beforeRequest(manager : WebDAVRequest)
{
    this.beforeManagers.push(manager);
}
export function afterRequest(manager : WebDAVRequest)
{
    this.afterManagers.push(manager);
}

function invokeBARequest(collection : WebDAVRequest[], base : MethodCallArgs, callback)
{
    function callCallback()
    {
        if(callback)
            process.nextTick(callback);
    }

    if(collection.length === 0)
    {
        callCallback();
        return;
    }

    base.callback = next;
    let nb = collection.length + 1;
    
    function next()
    {
        --nb;
        if(nb === 0)
        {
            callCallback();
        }
        else
            process.nextTick(() => collection[collection.length - nb](base, next))
    }
    next();
}

export function invokeBeforeRequest(base : MethodCallArgs, callback)
{
    invokeBARequest(this.beforeManagers, base, callback);
}
export function invokeAfterRequest(base : MethodCallArgs, callback)
{
    invokeBARequest(this.afterManagers, base, callback);
}
