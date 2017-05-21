export interface XMLElement {
    declaration?: any;
    attributes?: any;
    elements: XMLElement[];
    name?: string;
    find(name: string): XMLElement;
    findMany(name: string): XMLElement[];
}
export declare abstract class XML {
    static parse(xml: string): XMLElement;
    static toJSON(xml: string): string;
    static toXML(xml: XMLElement | any, includeDeclaration?: boolean): string;
    static createElement(name: string, attributes?: any, text?: string): {
        type: string;
        name: string;
        attributes: any;
        elements: any[];
        ele(name: string, attributes?: any): any;
        add(element: any): any;
        eleFn: (name: string, attributes?: any, text?: string) => any;
    };
}
