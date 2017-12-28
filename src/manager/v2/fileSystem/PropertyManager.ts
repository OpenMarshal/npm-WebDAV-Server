import { ReturnCallback, Return2Callback, SimpleCallback, ResourcePropertyValue, PropertyAttributes } from './CommonTypes'
import { Errors } from '../../../Errors'

export interface PropertyBag
{
    [name : string] : {
        value : ResourcePropertyValue
        attributes ?: PropertyAttributes
    }
}

export interface IPropertyManager
{
    setProperty(name : string, value : ResourcePropertyValue, attributes : PropertyAttributes, callback : SimpleCallback) : void
    getProperty(name : string, callback : Return2Callback<ResourcePropertyValue, PropertyAttributes>) : void
    removeProperty(name : string, callback : SimpleCallback) : void
    getProperties(callback : ReturnCallback<PropertyBag>, byCopy ?: boolean) : void
}
export class LocalPropertyManager implements IPropertyManager
{
    properties : PropertyBag = { };
    
    constructor(serializedData ?: any)
    {
        if(serializedData)
            for(const name in serializedData)
                this[name] = serializedData[name];
    }

    setProperty(name : string, value : ResourcePropertyValue, attributes : PropertyAttributes, callback : SimpleCallback) : void
    {
        this.properties[name] = {
            value,
            attributes
        };
        callback(null);
    }

    getProperty(name : string, callback : Return2Callback<ResourcePropertyValue, PropertyAttributes>) : void
    {
        const property = this.properties[name];
        callback(property ? null : Errors.PropertyNotFound, property.value, property.attributes);
    }

    removeProperty(name : string, callback : SimpleCallback) : void
    {
        delete this.properties[name];
        callback(null);
    }

    getProperties(callback : ReturnCallback<PropertyBag>, byCopy : boolean = false) : void
    {
        callback(null, byCopy ? this.properties : JSON.parse(JSON.stringify(this.properties)));
    }
}
