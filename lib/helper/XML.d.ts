export interface XMLElement {
    declaration?: any;
    attributes?: any;
    elements: XMLElement[];
    name?: string;
    type?: string;
    findIndex(name: string): number;
    find(name: string): XMLElement;
    findMany(name: string): XMLElement[];
    findText(): string;
    findTexts(): string[];
}
export declare abstract class XML {
    static parse(xml: string | Int8Array): XMLElement;
    static parseJSON(xml: string | Int8Array, compact?: boolean): XMLElement;
    static parseXML(xml: string | Int8Array): XMLElement;
    static toJSON(xml: string): string;
    static toXML(xml: XMLElement | any, includeDeclaration?: boolean): string;
    private static explodeName(name, attributes);
    static createElement(name: string, attributes?: any, text?: string): {
        type: string;
        name: string;
        attributes: any;
        elements: any[];
        ele(name: string, attributes?: any, insertAtStart?: boolean): any;
        add(element: any): any;
        eleFn: (name: string, attributes?: any, text?: string) => any;
    };
}
