import { ReturnCallback, Return2Callback, SimpleCallback, ResourcePropertyValue, PropertyAttributes } from './CommonTypes';
export interface PropertyBag {
    [name: string]: {
        value: ResourcePropertyValue;
        attributes?: PropertyAttributes;
    };
}
export interface IPropertyManager {
    setProperty(name: string, value: ResourcePropertyValue, attributes: PropertyAttributes, callback: SimpleCallback): void;
    getProperty(name: string, callback: Return2Callback<ResourcePropertyValue, PropertyAttributes>): void;
    removeProperty(name: string, callback: SimpleCallback): void;
    getProperties(callback: ReturnCallback<PropertyBag>, byCopy?: boolean): void;
}
export declare class LocalPropertyManager implements IPropertyManager {
    properties: PropertyBag;
    constructor(serializedData?: any);
    setProperty(name: string, value: ResourcePropertyValue, attributes: PropertyAttributes, callback: SimpleCallback): void;
    getProperty(name: string, callback: Return2Callback<ResourcePropertyValue, PropertyAttributes>): void;
    removeProperty(name: string, callback: SimpleCallback): void;
    getProperties(callback: ReturnCallback<PropertyBag>, byCopy?: boolean): void;
}
