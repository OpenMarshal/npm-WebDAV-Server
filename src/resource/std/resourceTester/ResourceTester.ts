import { ResourceTesterOptions, ResourceTesterProducer, ResourceTesterProducerCallback, ResourceTesterTestCallback } from './Types'
import { IResource } from '../../IResource'
import * as actions from './Actions'
import * as children from './Children'
import * as content from './Content'
import * as locks from './Locks'
import * as properties from './Properties'
import * as stdMetaData from './StdMetaData'

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
    canLock : boolean = true
}

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

    protected uuid()
    {
        return ++ResourceTester.uuid;
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
        test('size');
        test('lock');
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
    protected create = actions.create
    protected delete = actions.deleteResource
    protected moveTo = actions.moveTo
    protected rename = actions.rename
    
    // ****************************** Content ****************************** //
    protected writeRead = content.writeRead
    protected mimeType = content.mimeType
    protected size = content.size
    
    // ****************************** Locks ****************************** //
    protected lock = locks.lock

    // ****************************** Children ****************************** //
    protected addChild = children.addChild
    protected removeChild = children.removeChild
    protected getChildren = children.getChildren

    // ****************************** Properties ****************************** //
    protected setProperty = properties.setProperty
    protected removeProperty = properties.removeProperty
    protected getProperties = properties.getProperties
    
    // ****************************** Std meta-data ****************************** //
    protected creationDate = stdMetaData.creationDate
    protected lastModifiedDate = stdMetaData.lastModifiedDate
    protected webName = stdMetaData.webName
    protected type = stdMetaData.type
}
