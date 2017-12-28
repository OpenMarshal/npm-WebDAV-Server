import { HTTPRequestContext } from '../WebDAVRequest'

export type RequestListener = (ctx : HTTPRequestContext, next : () => void) => void;

function invokeBARequest(collection : RequestListener[], base : HTTPRequestContext, callback)
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

export function invokeBeforeRequest(base : HTTPRequestContext, callback)
{
    invokeBARequest(this.beforeManagers, base, callback);
}
export function invokeAfterRequest(base : HTTPRequestContext, callback)
{
    invokeBARequest(this.afterManagers, base, callback);
}
