import { Errors } from '../Errors'
import * as xmljs from 'xml-js'

function seekForNS(node : any, parentNS : any) : any
{
    if(!node.attributes)
        return parentNS;
    
    const ns : any = {};
    for(const name in parentNS)
        ns[name] = parentNS[name];

    for(const name in node.attributes)
    {
        if(name.indexOf('xmlns:') === 0 || name === 'xmlns')
        {
            const value = node.attributes[name];
            if(name === 'xmlns')
                ns._default = value;
            else
                ns[name.substring('xmlns:'.length)] = value;
        }
    }
    return ns;
}

function mutateNodeNS(node : any, parentNS = { _default: 'DAV:' })
{
    if(!node)
        return;
    
    const nss = seekForNS(node, parentNS);

    if(node.name)
    {
        for(const ns in nss)
        {
            if(ns === '_default' && node.name.indexOf(':') === -1)
            {
                node.name = nss[ns] + node.name;
                break;
            }
            else if(node.name.indexOf(ns + ':') === 0)
            {
                node.name = nss[ns] + node.name.substring((ns + ':').length);
                break;
            }
        }
    }

    node.findIndex = function(name : string) : number
    {
        for(let index = 0; index < node.elements.length; ++index)
            if(node.elements[index] && node.elements[index].name && node.elements[index].name === name)
                return index;
        return -1;
    }
    node.find = function(name : string) : XMLElement
    {
        for(const element of node.elements)
            if(element && element.name && element.name === name)
                return element;
        throw new Error(Errors.XMLNotFound.message + name);
    }
    node.findMany = function(name : string) : XMLElement[]
    {
        const elements : XMLElement[] = [];

        for(const element of node.elements)
            if(element && element.name && element.name === name)
                elements.push(element);
        
        return elements;
    }
    node.findText = function() : string
    {
        for(const element of node.elements)
            if(element && element.type === 'text')
                return element.text;
        return '';
    }
    node.findTexts = function() : string[]
    {
        const texts = [];

        for(const element of node.elements)
            if(element && element.type === 'text')
                texts.push(element.text);
        
        return texts;
    }
    
    if(node.elements)
        node.elements.forEach(n => mutateNodeNS(n, nss))
    else
        node.elements = [];
}

export interface XMLElement
{
    declaration ?: any
    attributes ?: any
    elements : XMLElement[]
    name ?: string
    type ?: string

    findIndex(name : string) : number
    find(name : string) : XMLElement
    findMany(name : string) : XMLElement[]
    findText() : string
    findTexts() : string[]
}

export abstract class XML
{
    static parse(xml : string | Int8Array) : XMLElement
    {
        try
        {
            return XML.parseXML(xml);
        }
        catch(_)
        {
            try
            {
                return XML.parseJSON(xml, true);
            }
            catch(_)
            {
                return XML.parseJSON(xml, false);
            }
        }
    }

    static parseJSON(xml : string | Int8Array, compact : boolean = true) : XMLElement
    {
        return XML.parseXML(xmljs.json2xml(xml.toString(), { compact }));
    }

    static parseXML(xml : string | Int8Array) : XMLElement
    {
        const x = xmljs.xml2js(xml.constructor === String ? xml as string : new Buffer(xml as Int8Array).toString(), {
            compact: false
        });

        mutateNodeNS(x);
        return x as XMLElement;
    }

    static toJSON(xml : string) : string
    {
        if(xml === undefined || xml === null)
            return xml;
        if(xml.constructor === Number || xml.constructor === Boolean)
            return xml.toString();

        return xmljs.xml2json(xml, { compact: true, alwaysArray: true });
    }

    static toXML(xml : XMLElement | any, includeDeclaration : boolean = true) : string
    {
        let finalXml : any = xml;

        if(includeDeclaration && !xml.declaration)
            finalXml = {
                declaration: {
                    attributes: {
                        version: '1.0',
                        encoding: 'utf-8'
                    }
                },
                elements: [
                    xml
                ]
            };

        return xmljs.js2xml(finalXml, {
            compact: false
        });
    }

    private static explodeName(name, attributes)
    {
        const li1 = name.lastIndexOf(':');
        const li2 = name.indexOf(':');
        const lindex = Math.max(li1 === li2 && name.indexOf('DAV:') !== 0 ? -1 : li1, name.lastIndexOf('/')) + 1;
        if(lindex !== 0)
        {
            let kname = 'a';
            const value = name.substring(0, lindex);
            while(attributes['xmlns:' + kname] !== undefined || value.indexOf(kname + ':') === 0)
            {
                const newChar = kname.charCodeAt(0) + 1;
                if(newChar > 'z'.charCodeAt(0))
                    kname = 'x' + String.fromCharCode(newChar);
                else
                    kname = kname.substr(0, kname.length - 1) + String.fromCharCode(newChar);
            }
            attributes['xmlns:' + kname] = value;
            name = kname + ':' + name.substring(lindex);
        }

        return name;
    }

    static createElement(name : string, attributes ?: any, text ?: string)
    {
        if(!attributes)
            attributes = {};
        
        name = XML.explodeName(name, attributes);

        const result = {
            type: 'element',
            name,
            attributes,
            elements: [],
            ele(name : string, attributes ?: any, insertAtStart ?: boolean)
            {
                const el = result.eleFn(name, attributes);
                if(insertAtStart)
                    result.elements.unshift(el);
                else
                    result.elements.push(el);
                return el;
            },
            add(element : any)
            {
                if(element.constructor === String || element.constructor === Number || element.constructor === Boolean)
                    element = {
                        type: 'text',
                        text: element.toString()
                    };
                
                if(element.type === 'element')
                {
                    if(!element.attributes)
                        element.attributes = { };
                    
                    element.name = XML.explodeName(element.name, element.attributes);
                    
                    if(element.elements)
                    {
                        const list = [];
                        element.elements.forEach((e) => list.push(e));

                        while(list.length > 0)
                        {
                            const current = list.shift();
                            if(current.type !== 'element')
                                continue;
                                
                            if(current.elements)
                                current.elements.forEach((e) => list.push(e));

                            if(!current.attributes)
                                current.attributes = {};
                            current.name = XML.explodeName(current.name, current.attributes);
                        }
                    }
                }
                
                if(element.constructor === Array)
                    (element as any).forEach(result.add);
                else
                    result.elements.push(element);
                return element;
            },
            eleFn: XML.createElement
        }

        return result;
    }
}

