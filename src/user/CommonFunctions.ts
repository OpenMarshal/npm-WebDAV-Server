import { startsWith } from '../helper/JSCompatibility'

import * as crypto from 'crypto'

export function md5(value : string | Buffer) : string
{
    return crypto.createHash('md5').update(value).digest('hex');
}

export function parseHTTPAuthHeader(authHeader : string, prefix : string) : any
{
    const stepOverSeparator = (currentString, index, separator) => {
        while(currentString.length > index && /\s/.test(currentString[index].toString()))
            ++index;
        if(currentString.length <= index || currentString[index] !== separator)
            throw new Error('Invalid format');
        ++index;
        while(currentString.length > index && /\s/.test(currentString[index].toString()))
            ++index;
        
        if(currentString.length <= index)
            throw new Error('Invalid format');
        return index;
    };
    
    const getToken = (currentString) => {
        let index = 0;
    
        while(currentString.length > index && /\s/.test(currentString[index].toString()))
            ++index;
    
        const match = /^([a-zA-Z]+)/.exec(currentString.substring(index));
        const key = match[1];
        index += key.length;
        
        index = stepOverSeparator(currentString, index, '=');
    
        let value;
        if(currentString[index] === '"')
        {
            ++index;
    
            value = '';
            const startIndex = index;
            while(currentString.length > index && currentString[index] !== '"')
            {
                if(currentString[index] === '\\')
                    ++index;
                value += currentString[index];
                ++index;
            }
    
            ++index;
        }
        else
        {
            const match2 = /^([^\s,]+)/.exec(currentString.substring(index));
            value = match2[1];
    
            index += value.length;
        }
    
        return {
            strLeft: currentString.substring(index),
            key,
            value
        };
    };
    
    if(!startsWith(authHeader, prefix + ' '))
        throw Error('Invalid format');
    authHeader = authHeader.substring((prefix + ' ').length);
    
    const keyValues = {};
    
    let token;
    do
    {
        token = getToken(authHeader);
        if(token)
        {
            keyValues[token.key] = token.value;
            authHeader = token.strLeft.trim();
            
            if(authHeader.length > 0)
                authHeader = authHeader.substring(stepOverSeparator(authHeader, 0, ','));
        }
    } while(token && authHeader);
    
    return keyValues;    
}
