import { ReturnCallback, SimpleCallback, ResourcePropertyValue } from './CommonTypes';
export interface PropertyBag {
    [name: string]: ResourcePropertyValue;
}
export interface IPropertyManager {
    setProperty(name: string, value: ResourcePropertyValue, callback: SimpleCallback): void;
    getProperty(name: string, callback: ReturnCallback<ResourcePropertyValue>): void;
    removeProperty(name: string, callback: SimpleCallback): void;
    getProperties(callback: ReturnCallback<PropertyBag>, byCopy?: boolean): void;
}
export declare class LocalPropertyManager implements IPropertyManager {
    properties: {
        [name: string]: ResourcePropertyValue;
    };
    setProperty(name: string, value: ResourcePropertyValue, callback: SimpleCallback): void;
    getProperty(name: string, callback: ReturnCallback<ResourcePropertyValue>): void;
    removeProperty(name: string, callback: SimpleCallback): void;
    getProperties(callback: ReturnCallback<PropertyBag>, byCopy?: boolean): void;
}
