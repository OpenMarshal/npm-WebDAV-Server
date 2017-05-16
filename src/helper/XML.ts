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

function mutateNodeNS(node : any, parentNS = { _default: 'DAV' })
{
    var nss = seekForNS(node, parentNS);

    if(node.name)
    {
        for(var ns in nss)
        {
            if(ns === '_default')
                continue;
            if(node.name.indexOf(ns + ':') === 0)
                node.name = nss[ns] + node.name.substring((ns + ':').length);
        }
    }

    node.find = function(name : string) : XMLElement
    {
        for(const index in node.elements)
            if(node.elements[index].name && node.elements[index].name === name)
                return node.elements[index];
        throw new Error('Can\'t find the element.');
    }
    node.findMany = function(name : string) : XMLElement[]
    {
        const elements : XMLElement[] = [];

        for(const index in node.elements)
            if(node.elements[index].name && node.elements[index].name === name)
                elements.push(node.elements[index]);
        
        return elements;
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

    find(name : string) : XMLElement
    findMany(name : string) : XMLElement[]
}

export abstract class XML
{
    static parse(xml : string) : XMLElement
    {
        const x = xmljs.xml2js(xml, {
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

    static createElement(name : string, attributes ?: any, text ?: string)
    {
        if(!attributes)
            attributes = {};
        
        let lindex = name.lastIndexOf('/');
        if(lindex !== -1)
        {
            ++lindex;
            attributes['xmlns:x'] = name.substring(0, lindex);
            name = 'x:' + name.substring(lindex);
        }

        const result = {
            type: 'element',
            name: name,
            attributes: attributes,
            elements: [],
            ele: function(name : string, attributes ?: any)
            {
                const el = result.eleFn(name, attributes);
                result.elements.push(el);
                return el;
            },
            add: function(element : any)
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
                        
                    let lindex = element.name.lastIndexOf('/');
                    if(lindex !== -1)
                    {
                        ++lindex;
                        element.attributes['xmlns:x'] = element.name.substring(0, lindex);
                        element.name = 'x:' + element.name.substring(lindex);
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

