import { ResourceTesterTestCallback } from './Types'

// ****************************** Std meta-data ****************************** //
export function creationDate(callback : ResourceTesterTestCallback)
{
    callback = this.multiple(callback, 1);

    this.producer(true, (r1) => {
        r1.create((e) => {
            callback(e, !e, 'create error', this.options.canBeCreated, () => {
                r1.creationDate((e, date) => {
                    callback(e, !e, 'creationDate error', this.options.canGetCreationDate);
                })
            });
        })
    })
}
export function lastModifiedDate(callback : ResourceTesterTestCallback)
{
    callback = this.multiple(callback, 1);

    this.producer(true, (r1) => {
        r1.create((e) => {
            callback(e, !e, 'create error', this.options.canBeCreated, () => {
                r1.lastModifiedDate((e, date) => {
                    callback(e, !e, 'lastModifiedDate error', this.options.canGetLastModifiedDate);
                })
            });
        })
    })
}
export function webName(callback : ResourceTesterTestCallback)
{
    callback = this.multiple(callback, 1);

    this.producer(false, (r1) => {
        r1.webName((e) => {
            callback(e, !e, 'webName error');
        })
    })
}
export function type(callback : ResourceTesterTestCallback)
{
    callback = this.multiple(callback, 1);

    this.producer(false, (r1) => {
        r1.type((e) => {
            callback(e, !e, 'type error');
        })
    })
}
