import { VirtualFolder } from '../resource/virtual/VirtualFolder'
import { VirtualFile } from '../resource/virtual/VirtualFile'
import { IResource } from '../resource/IResource'
import { FSManager } from '../manager/FSManager'
import { XML } from '../helper/XML'

export interface ResourceTesterOptions
{
    canHaveVirtualFolderChildren : boolean
    canHaveVirtualFileChildren : boolean
    canGetLastModifiedDate : boolean
    canGetCreationDate : boolean
    canRemoveChildren : boolean
    canHaveChildren : boolean
    canGetMimeType : boolean
    canGetChildren : boolean
    canBeCreated : boolean
    canBeDeleted : boolean
    canBeRenamed : boolean
    canGetSize : boolean
    canBeMoved : boolean
    canWrite : boolean
    canRead : boolean
}
class DefaultResourceTesterOptions implements ResourceTesterOptions
{
    canHaveVirtualFolderChildren : boolean = true
    canHaveVirtualFileChildren : boolean = true
    canGetLastModifiedDate : boolean = true
    canGetCreationDate : boolean = true
    canRemoveChildren : boolean = true
    canHaveChildren : boolean = true
    canGetChildren : boolean = true
    canGetMimeType : boolean = true
    canBeCreated : boolean = true
    canBeDeleted : boolean = true
    canBeRenamed : boolean = true
    canGetSize : boolean = true
    canBeMoved : boolean = true
    canWrite : boolean = true
    canRead : boolean = true
}

export type ResourceTesterTestCallback = (error : Error, isValid : boolean, text : string, optionReverse ?: boolean, cbNext ?: () => void) => void;
export type ResourceTesterProducerCallback<T> = (resource : T) => void;
export type ResourceTesterProducer<T> = (willCreate : boolean, callback : ResourceTesterProducerCallback<T>) => void;

export class ResourceTester<T extends IResource>
{
    protected static uuid = 0;

    constructor(
        public options : ResourceTesterOptions,
        public producer : ResourceTesterProducer<T>)
    {
        const def = new DefaultResourceTesterOptions();
        for(const name of Object.keys(def))
            if(this.options[name] === undefined)
                this.options[name] = def[name];
    }

    protected multiple(callback : ResourceTesterTestCallback, nb : number) : ResourceTesterTestCallback
    {
        return (error : Error, isValid : boolean, text : string, mustBeValid : boolean = true, cbNext ?: () => void) => {
            if(nb <= 0)
                return;
            if(!mustBeValid)
            {
                if(error || !isValid)
                {
                    error = null;
                    isValid = true;
                }
                else
                {
                    error = new Error('It was supposed to fail');
                    isValid = false;
                }
            }
            if(error)
            {
                nb = -1;
                callback(error, false, text);
                return;
            }
            if(!isValid)
            {
                callback(error, false, text);
                return;
            }
            if(cbNext)
            {
                cbNext();
                return;
            }
            --nb;
            if(nb === 0)
                callback(null, isValid, text);
        }
    }

    run(callback : (results : any) => void)
    {
        let nb = 0;

        const results = {
            all: {
                isValid: true,
                errors: []
            }
        };
        function end(name : string)
        {
            return (error : Error, isValid : boolean, text : string) => {
                results[name] = {
                    error,
                    text,
                    isValid
                };

                if(error || !isValid)
                {
                    results.all.isValid = false;
                    results.all.errors.push({
                        error,
                        text,
                        toString()
                        {
                            return '[' + name + '] ' + this.text + (this.error ? ' : ' + this.error : '');
                        }
                    });
                }
                
                --nb;
                if(nb === 0)
                    callback(results);
            }
        }
        const test = (name : string) =>
        {
            ++nb;
            process.nextTick(() => this[name](end(name)));
        }

        test('create');
        test('delete');
        test('moveTo');
        test('rename');
        test('writeRead');
        test('mimeType');
        test('size');/*
        test('getLocks');
        test('setLock');
        test('removeLock');
        test('getAvailableLocks');
        test('getLock');*/
        test('addChild');
        test('removeChild');
        test('getChildren');
        test('setProperty');
        test('removeProperty');
        test('getProperties');
        test('creationDate');
        test('lastModifiedDate');
        test('webName');
        test('type');
    }

    // ****************************** Actions ****************************** //
    protected create(callback : ResourceTesterTestCallback)
    {
        callback = this.multiple(callback, 1);

        this.producer(true, (r1) => {
            r1.create((e) => {
                callback(e, !e, 'create error', this.options.canBeCreated);
            })
        })
    }
    protected delete(callback : ResourceTesterTestCallback)
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
    protected moveTo(callback : ResourceTesterTestCallback)
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
                        callback(e, !e, 'moveTo must fail', undefined, () => {
                            callback(null, r1.parent === vf2, 'The parent property of the resource must be changed')
                        })
                    })
                })
            })
        })
    }

    protected rename(callback : ResourceTesterTestCallback)
    {
        callback = this.multiple(callback, 1);
        const newName = 'TEST-test_test Test%20' + (++ResourceTester.uuid).toString();

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
    
    // ****************************** Content ****************************** //
    protected writeRead(callback : ResourceTesterTestCallback)
    {
        callback = this.multiple(callback, 1);

        if(!this.options.canWrite || !this.options.canRead)
        {
            this.producer(false, (r1) => {
                r1.write(true, (e, w) => {
                    callback(e, !e, 'write error', this.options.canWrite);
                })
            })
            return;
        }

        const values = [ 'content1', 'content2' ];
        const value = values.reduce((p, s) => p + s);
        
        const write = (w, cb) =>
        {
            if(values.length === 0)
            {
                cb();
                return;
            }

            w.write(values.shift(), (e) => {
                callback(e, !e, 'write error', this.options.canWrite, () => {
                    write(w, cb);
                })
            })
        }

        this.producer(false, (r1) => {
            r1.write(true, (e, w) => {
                callback(e, !e, 'write error', undefined, () => {
                    write(w, () => {
                        w.end();
                        r1.read(true, (e, r) => {
                            callback(e, !e, 'read error', undefined, () => {
                                let fdata = '';
                                r.on('data', (data) => {
                                    fdata += data.toString();
                                })
                                r.on('end', () => {
                                    callback(null, fdata && fdata === value, 'The read value must be the same as the written value');
                                })
                            })
                        })
                    })
                });
            })
        })
    }
    protected mimeType(callback : ResourceTesterTestCallback)
    {
        callback = this.multiple(callback, 1);

        this.producer(false, (r1) => {
            r1.mimeType(true, (e) => {
                callback(e, !e, 'mimeType error', this.options.canGetMimeType);
            })
        })
    }
    protected size(callback : ResourceTesterTestCallback)
    {
        callback = this.multiple(callback, 1);

        if(!this.options.canWrite || !this.options.canGetSize)
        {
            this.producer(false, (r1) => {
                r1.size(true, (e, size) => {
                    callback(e, !e, 'The size method must fail', this.options.canGetSize)
                })
            })
            return;
        }

        const value = 'test';

        this.producer(false, (r1) => {
            r1.write(true, (e, w) => {
                callback(e, !e, 'write error', this.options.canWrite, () => {
                    w.end(value, (e) => {
                        callback(e, !e, 'Writable write error', this.options.canWrite, () => {
                            r1.size(true, (e, size) => {
                                callback(e, !e, 'size error', this.options.canGetSize, () => {
                                    callback(null, size === value.length, 'The size value provided by the size method is invalid');
                                })
                            })
                        })
                    })
                });
            })
        })
    }
    
    // ****************************** Locks ****************************** //
    /*
    protected getLocks(callback : ResourceTesterTestCallback)
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
    protected setLock(callback : ResourceTesterTestCallback)
    {
        callback = this.multiple(callback, 1);
        callback(null, true, '');
    }
    protected removeLock(callback : ResourceTesterTestCallback)
    {
        callback = this.multiple(callback, 1);
        callback(null, true, '');
    }
    protected getAvailableLocks(callback : ResourceTesterTestCallback)
    {
        callback = this.multiple(callback, 1);
        callback(null, true, '');
    }
    protected getLock(callback : ResourceTesterTestCallback)
    {
        callback = this.multiple(callback, 1);
        callback(null, true, '');
    }*/

    // ****************************** Children ****************************** //
    protected addChild(callback : ResourceTesterTestCallback)
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
    protected removeChild(callback : ResourceTesterTestCallback)
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
    protected getChildren(callback : ResourceTesterTestCallback)
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

    // ****************************** Properties ****************************** //
    protected setProperty(callback : ResourceTesterTestCallback)
    {
        callback = this.multiple(callback, 2);
        
        this.producer(false, (r1) => {
            const name = 'prop-test_test:test//test/test.test';
            const value = 'value value.value_value<value>___</value>';

            r1.setProperty(name, value, (e) => {
                callback(e, !e, 'setProperty error', undefined, () => {
                    r1.getProperty('prop-test_test:test//test/test.test', (e, v) => {
                        callback(e, v === value, 'Value returned by getProperty is different of the value provided to setProperty')
                    })
                })
            })
        })
        
        this.producer(false, (r1) => {
            const name = 'prop-test_test:test//test/test.test';
            const value = XML.parse('<actors><actor>Titi</actor><actor>Toto</actor></actors>');

            r1.setProperty(name, value, (e) => {
                callback(e, !e, 'setProperty error', undefined, () => {
                    r1.getProperty('prop-test_test:test//test/test.test', (e, v) => {
                        callback(e, v === value, 'Value returned by getProperty is different of the value provided to setProperty')
                    })
                })
            })
        })
    }
    protected removeProperty(callback : ResourceTesterTestCallback)
    {
        callback = this.multiple(callback, 1);

        this.producer(false, (r1) => {
            const name = 'prop-test_test:test//test/test.test';
            const value = 'value';

            r1.setProperty(name, value, (e) => {
                callback(e, !e, 'setProperty error', undefined, () => {
                    r1.removeProperty(name, (e) => {
                        callback(e, !e, 'removeProperty error', undefined, () => {
                            r1.getProperty('prop-test_test:test//test/test.test', (e, v) => {
                                callback(e, !e && !!v, 'The property has not been removed from removeProperty', false)
                            })
                        })
                    })
                })
            })
        })
    }
    protected getProperties(callback : ResourceTesterTestCallback)
    {
        callback = this.multiple(callback, 1);
        
        this.producer(false, (r1) => {
            const values = {
                'prop-test_test:test//test/test.test': 'value',
                'test2': 'value2',
                'value': 'value3',
            }
            const keys = Object.keys(values);

            r1.setProperty(keys[0], values[keys[0]], (e) => {
            callback(e, !e, 'setProperty error', undefined, () => {
            r1.setProperty(keys[1], values[keys[1]], (e) => {
            callback(e, !e, 'setProperty error', undefined, () => {
            r1.setProperty(keys[2], values[keys[2]], (e) => {
            callback(e, !e, 'setProperty error', undefined, () => {
                r1.getProperties((e, props) => {
                callback(e, !e && !!props, 'getProperties error', undefined, () => {
                    const valid = {};
                    for(const key of keys)
                        valid[key] = false;
                    
                    for(const name of Object.keys(props))
                        if(values[name] !== undefined)
                            valid[name] = values[name] === props[name];
                    
                    callback(null, keys.every((k) => valid[k]), 'One or many properties are invalid or missing in the response of getProperties')
                })
                })
            })
            })
            })
            })
            })
            })
        })
    }
    
    // ****************************** Std meta-data ****************************** //
    protected creationDate(callback : ResourceTesterTestCallback)
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
    protected lastModifiedDate(callback : ResourceTesterTestCallback)
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
    protected webName(callback : ResourceTesterTestCallback)
    {
        callback = this.multiple(callback, 1);

        this.producer(false, (r1) => {
            r1.webName((e) => {
                callback(e, !e, 'webName error');
            })
        })
    }
    protected type(callback : ResourceTesterTestCallback)
    {
        callback = this.multiple(callback, 1);

        this.producer(false, (r1) => {
            r1.type((e) => {
                callback(e, !e, 'type error');
            })
        })
    }
}
