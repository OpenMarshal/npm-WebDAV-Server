import { ResourceTesterTestCallback } from './Types'

// ****************************** Locks ****************************** //
export function getLocks(callback : ResourceTesterTestCallback)
{
    callback = this.multiple(callback, 1);
    
    this.producer(false, (r1) => {
        r1.getLocks((e, locks) => {
            callback(e, !e, 'getLocks error', this.options.canGetLocks, () => {
                callback(null, !!locks && !!(locks as any).prototype[Symbol.iterator], 'getLocks returns an invalid value : must be an iterable', this.options.canWrite)
            });
        })
    })
}
export function setLock(callback : ResourceTesterTestCallback)
{
    callback = this.multiple(callback, 1);
    callback(null, true, '');
}
export function removeLock(callback : ResourceTesterTestCallback)
{
    callback = this.multiple(callback, 1);
    callback(null, true, '');
}
export function getAvailableLocks(callback : ResourceTesterTestCallback)
{
    callback = this.multiple(callback, 1);
    callback(null, true, '');
}
export function getLock(callback : ResourceTesterTestCallback)
{
    callback = this.multiple(callback, 1);
    callback(null, true, '');
}
