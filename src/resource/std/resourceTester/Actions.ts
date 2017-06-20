import { ResourceTesterTestCallback } from './Types'
import { StandardResource } from '../../std/StandardResource'
import { VirtualFolder } from '../../virtual/VirtualFolder'

// ****************************** Actions ****************************** //
export function create(callback : ResourceTesterTestCallback)
{
    callback = this.multiple(callback, 1);

    this.producer(true, (r1) => {
        r1.create((e) => {
            callback(e, !e, 'create error', this.options.canBeCreated);
        })
    })
}
export function deleteResource(callback : ResourceTesterTestCallback)
{
    callback = this.multiple(callback, 1);

    this.producer(true, (r1) => {
        r1.create((e) => {
            callback(e, !e, 'create error', this.options.canBeCreated, () => {
                r1.delete((e) => {
                    callback(e, !e, 'delete error', this.options.canBeDeleted)
                })
            });
        })
    })
}
export function moveTo(callback : ResourceTesterTestCallback)
{
    callback = this.multiple(callback, 1);

    if(!this.options.canHaveChildren)
    {
        callback(null, true, '');
        return;
    }

    const vf1 = new VirtualFolder('folder1');
    const vf2 = new VirtualFolder('folder2');
    if(!this.options.canBeMoved)
    {
        this.producer(false, (r1) => {
            vf1.addChild(r1, (e) => {
                callback(e, !e, 'addChild error', undefined, () => {
                    r1.moveTo(vf2, 'newName', false, (e) => {
                        callback(e, !e, 'moveTo must fail', false)
                    })
                })
            })
        })
        return;
    }
    
    this.producer(false, (r1) => {
        vf1.addChild(r1, (e) => {
            callback(e, !e, 'addChild error of VirtualFolder', undefined, () => {
                r1.moveTo(vf2, 'newName', false, (e) => {
                    callback(e, !e, 'moveTo must not fail'/*, undefined, () => {
                        callback(null, r1.parent === vf2, 'The parent property of the resource must be changed')
                    }*/)
                })
            })
        })
    })
}

export function rename(callback : ResourceTesterTestCallback)
{
    callback = this.multiple(callback, 1);
    const newName = 'TEST-test_test Test%20' + this.uuid().toString();

    this.producer(false, (r1) => {
        r1.rename(newName, (e) => {
            callback(e, !e, 'rename error', this.options.canBeRenamed, () => {
                r1.webName((e, name) => {
                    callback(e, !e, 'webName error', undefined, () => {
                        callback(null, newName === name, 'rename did not rename the resource', this.options.canBeRenamed);
                    })
                })
            });
        })
    })
}
