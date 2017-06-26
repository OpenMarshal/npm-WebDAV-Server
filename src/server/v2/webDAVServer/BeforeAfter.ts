import { RequestContext, HTTPMethod } from '../WebDAVRequest'

export interface RequestListener
{
    (ctx : RequestContext, next : () => void) : void
}

function invokeBARequest(collection : RequestListener[], base : RequestContext, callback)
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

export function invokeBeforeRequest(base : RequestContext, callback)
{
    invokeBARequest(this.beforeManagers, base, callback);
}
export function invokeAfterRequest(base : RequestContext, callback)
{
    invokeBARequest(this.afterManagers, base, callback);
}