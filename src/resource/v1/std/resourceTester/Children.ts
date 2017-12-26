import { ResourceTesterTestCallback } from './Types'
import { VirtualFolder } from '../../virtual/VirtualFolder'
import { VirtualFile } from '../../virtual/VirtualFile'

// ****************************** Children ****************************** //
export function addChild(callback : ResourceTesterTestCallback)
{
    callback = this.multiple(callback, 3);

    this.producer(false, (r1) => {
    this.producer(false, (r2) => {
        r1.addChild(r2, (e) => {
            callback(e, !e, 'addChild error adding a produced resource', this.options.canHaveChildren, () => {
                callback(null, r2.parent === r1 || !this.options.canHaveChildren, 'The parent property of child resource is not valid');
            });
        })
    })
    })
    
    this.producer(false, (r1) => {
        const vf = new VirtualFolder('folder');
        r1.addChild(vf, (e) => {
            callback(e, !e, 'addChild error adding a virtual folder', this.options.canHaveVirtualFolderChildren, () => {
                callback(null, vf.parent === r1 || !this.options.canHaveChildren, 'The parent property of child resource is not valid');
            });
        })
    })
    
    this.producer(false, (r1) => {
        const vf = new VirtualFile('file');
        r1.addChild(vf, (e) => {
            callback(e, !e, 'addChild error adding a virtual file', this.options.canHaveVirtualFileChildren, () => {
                callback(null, vf.parent === r1 || !this.options.canHaveChildren, 'The parent property of child resource is not valid');
            });
        })
    })
}
export function removeChild(callback : ResourceTesterTestCallback)
{
    callback = this.multiple(callback, 1);

    this.producer(false, (r1) => {
    this.producer(false, (r2) => {
        r1.addChild(r2, (e) => {
            callback(e, !e, 'addChild error adding a produced resource', this.options.canHaveChildren, () => {
                r1.removeChild(r2, (e) => {
                    callback(e, !e, 'removeChild error removing a produced resource', this.options.canRemoveChildren, () => {
                        callback(null, !r2.parent, 'The parent property of child resource is not valid, it must be empty (null or undefined)');
                    })
                })
            });
        })
    })
    })
}
export function getChildren(callback : ResourceTesterTestCallback)
{
    callback = this.multiple(callback, 1);

    if(!this.options.canGetChildren)
    {
        this.producer(false, (r1) => {
            r1.getChildren((e, children) => {
                callback(e, !e, 'getChildren must fail', false);
            })
        })
        return;
    }

    this.producer(false, (r1) => {
    this.producer(false, (r2) => {
    this.producer(false, (r3) => {
        r1.addChild(r2, (e) => {
        callback(e, !e, 'addChild error adding a produced resource', this.options.canHaveChildren, () => {
            r1.addChild(r3, (e) => {
            callback(e, !e, 'addChild error adding a produced resource', this.options.canHaveChildren, () => {
                r1.getChildren((e, children) => {
                callback(e, !e, 'getChildren error', undefined, () => {
                    const valid = {
                        r3: false,
                        r2: false
                    }
                    for(const child of children)
                    {
                        if(child === r3)
                            valid.r3 = true;
                        else if(child === r2)
                            valid.r2 = true;
                    }
                    
                    callback(null, valid.r3 && valid.r2, 'At least one of the added resources is not present in the result of getChildren');
                })
                })
            })
            })
        });
        })
    })
    })
    })
}
