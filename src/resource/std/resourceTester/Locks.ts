import { ResourceTesterTestCallback } from './Types'
import { IResource } from '../../IResource'
import { LockScope } from '../../lock/LockScope'
import { LockKind } from '../../lock/LockKind'
import { LockType } from '../../lock/LockType'
import { Lock } from '../../lock/Lock'

// ****************************** Locks ****************************** //
export function lock(callback : ResourceTesterTestCallback)
{
    if(!this.options.canLock)
    {
        callback = this.multiple(callback, 5);

        const lock = new Lock(new LockKind(LockScope.Exclusive, LockType.Write), '123', null);

        this.producer(false, (r1 : IResource) => r1.getLock('123', (e) => callback(e, !e, 'getLock must return an error', false)));
        this.producer(false, (r1 : IResource) => r1.setLock(lock, (e) => callback(e, !e, 'setLock must return an error', false)));
        this.producer(false, (r1 : IResource) => r1.getAvailableLocks((e, kinds) => callback(e, !e, 'getAvailableLocks must return an error', false)));
        this.producer(false, (r1 : IResource) => r1.getLocks((e, locks) => callback(e, !e, 'getLocks must return an error', false)));
        this.producer(false, (r1 : IResource) => r1.removeLock('123', (e, removed) => callback(e, !e, 'removeLock must return an error', false)));
        return;
    }

    callback = this.multiple(callback, 2);

    const lock1 = new Lock(new LockKind(LockScope.Exclusive, LockType.Write), '123', null);
    
    this.producer(false, (r1 : IResource) => {
        r1.setLock(lock1, (e) => {
            callback(e, !e, 'setLock error', undefined, () => {
                r1.getLock(lock1.uuid, (e, lock) => {
                    callback(e, !e, 'getLock error - cannot find the lock', undefined, () => {
                        callback(null, lock && lock.isSame && lock.isSame(lock1), 'The lock returned by getLock is not the one stored previously by setLock', undefined, () => {
                            r1.getLocks((e, locks) => {
                                callback(e, !e, 'getLocks error', undefined, () => {
                                    callback(null, locks && locks.length === 1 && locks[0].isSame && locks[0].isSame(lock1), 'The lock added is not listed in the result of getLocks', undefined, () => {
                                        r1.removeLock(lock1.uuid, (e, removed) => {
                                            callback(e, !e && removed, 'removeLock error', undefined, () => {
                                                r1.getLocks((e, locks) => {
                                                    callback(e, !e, 'getLocks error', undefined, () => {
                                                        callback(null, locks && locks.length === 0, 'The lock has not really been removed');
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                })
            });
        })
    })
    
    this.producer(false, (r1) => {
        r1.getAvailableLocks((e, locks) => {
            callback(e, !e, 'getAvailableLocks error', this.options.canLock, () => {
                callback(null, !!locks && !!(locks as any).constructor.prototype[Symbol.iterator], 'getAvailableLocks returns an invalid value : must be an iterable', this.options.canLock)
            });
        })
    })
}
