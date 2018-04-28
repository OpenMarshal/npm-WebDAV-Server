import { ResourceType, ResourcePropertyValue, PropertyAttributes } from './CommonTypes'
import { RequestContext } from '../../../server/v2/RequestContext'
import { XMLElement } from 'xml-js-builder'
import { FileSystem } from './FileSystem'
import { Path } from '../Path'

export type IStorageManagerEvaluateCallback = (size : number) => void;

export interface IStorageManager
{
    reserve(ctx : RequestContext, fs : FileSystem, size : number, callback : (reserved : boolean) => void) : void

    evaluateCreate(ctx : RequestContext, fs : FileSystem, path : Path, type : ResourceType, callback : IStorageManagerEvaluateCallback) : void
    evaluateContent(ctx : RequestContext, fs : FileSystem, expectedSize : number, callback : IStorageManagerEvaluateCallback) : void
    evaluateProperty(ctx : RequestContext, fs : FileSystem, name : string, value : ResourcePropertyValue, attributes : PropertyAttributes, callback : IStorageManagerEvaluateCallback) : void

    available(ctx : RequestContext, fs : FileSystem, callback : (available : number) => void) : void
    reserved(ctx : RequestContext, fs : FileSystem, callback : (reserved : number) => void) : void
}

export class NoStorageManager implements IStorageManager
{
    reserve(ctx : RequestContext, fs : FileSystem, size : number, callback : (reserved : boolean) => void) : void
    {
        callback(true);
    }

    evaluateCreate(ctx : RequestContext, fs : FileSystem, path : Path, type : ResourceType, callback : IStorageManagerEvaluateCallback) : void
    {
        callback(0);
    }
    evaluateContent(ctx : RequestContext, fs : FileSystem, expectedSize : number, callback : IStorageManagerEvaluateCallback) : void
    {
        callback(0);
    }
    evaluateProperty(ctx : RequestContext, fs : FileSystem, name : string, value : ResourcePropertyValue, attributes : PropertyAttributes, callback : IStorageManagerEvaluateCallback) : void
    {
        callback(0);
    }

    available(ctx : RequestContext, fs : FileSystem, callback : (available : number) => void) : void
    {
        callback(-1);
    }
    reserved(ctx : RequestContext, fs : FileSystem, callback : (reserved : number) => void) : void
    {
        callback(0);
    }
}

export class PerUserStorageManager implements IStorageManager
{
    storage : {
        [UUID : string] : number
    }

    constructor(public limitPerUser : number)
    {
        this.storage = {};
    }

    reserve(ctx : RequestContext, fs : FileSystem, size : number, callback : (reserved : boolean) => void) : void
    {
        let nb = this.storage[ctx.user.uid];
        if(nb === undefined)
            nb = 0;
        nb += size;

        if(nb > this.limitPerUser)
            return callback(false);

        this.storage[ctx.user.uid] = Math.max(0, nb);
        callback(true);
    }

    evaluateCreate(ctx : RequestContext, fs : FileSystem, path : Path, type : ResourceType, callback : IStorageManagerEvaluateCallback) : void
    {
        fs.getFullPath(ctx, path, (e, fullPath) => {
            callback(fullPath.toString().length);
        })
    }
    evaluateContent(ctx : RequestContext, fs : FileSystem, expectedSize : number, callback : IStorageManagerEvaluateCallback) : void
    {
        callback(expectedSize);
    }

    evalPropValue(value : ResourcePropertyValue) : number
    {
        if(!value)
            return 0;
        if(value.constructor === String)
            return (value as String).length;
        if(Array.isArray(value))
            return (value as XMLElement[]).map((el) => this.evalPropValue(el)).reduce((p, n) => p + n, 0);

        const xml = value as XMLElement;
        const attributesLength = Object.keys(xml.attributes).map((at) => at.length + (xml.attributes[at].length as number)).reduce((p, n) => p + n, 0);

        // tslint:disable-next-line:restrict-plus-operands
        return xml.name.length + attributesLength + (xml.elements && xml.elements.length > 0 ? this.evalPropValue(xml.elements) : 0);
    }
    evaluateProperty(ctx : RequestContext, fs : FileSystem, name : string, value : ResourcePropertyValue, attributes : PropertyAttributes, callback : IStorageManagerEvaluateCallback) : void
    {
        callback(name.length + Object.keys(attributes).map((ak) => attributes[ak].length + ak.length).reduce((p, n) => p + n, 0) + this.evalPropValue(value));
    }

    available(ctx : RequestContext, fs : FileSystem, callback : (available : number) => void) : void
    {
        const nb = this.storage[ctx.user.uid];
        callback(nb === undefined ? this.limitPerUser : this.limitPerUser - nb);
    }
    reserved(ctx : RequestContext, fs : FileSystem, callback : (reserved : number) => void) : void
    {
        const nb = this.storage[ctx.user.uid];
        callback(nb === undefined ? 0 : nb);
    }
}
