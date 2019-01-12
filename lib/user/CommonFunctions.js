"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JSCompatibility_1 = require("../helper/JSCompatibility");
var crypto = require("crypto");
function md5(value) {
    return crypto.createHash('md5').update(value).digest('hex');
}
exports.md5 = md5;
function parseHTTPAuthHeader(authHeader, prefix) {
    var stepOverSeparator = function (currentString, index, separator) {
        while (currentString.length > index && /\s/.test(currentString[index].toString()))
            ++index;
        if (currentString.length <= index || currentString[index] !== separator)
            throw new Error('Invalid format');
        ++index;
        while (currentString.length > index && /\s/.test(currentString[index].toString()))
            ++index;
        if (currentString.length <= index)
            throw new Error('Invalid format');
        return index;
    };
    var getToken = function (currentString) {
        var index = 0;
        while (currentString.length > index && /\s/.test(currentString[index].toString()))
            ++index;
        var match = /^([a-zA-Z]+)/.exec(currentString.substring(index));
        var key = match[1];
        index += key.length;
        index = stepOverSeparator(currentString, index, '=');
        var value;
        if (currentString[index] === '"') {
            ++index;
            value = '';
            var startIndex = index;
            while (currentString.length > index && currentString[index] !== '"') {
                if (currentString[index] === '\\')
                    ++index;
                value += currentString[index];
                ++index;
            }
            ++index;
        }
        else {
            var match2 = /^([^\s,]+)/.exec(currentString.substring(index));
            value = match2[1];
            index += value.length;
        }
        return {
            strLeft: currentString.substring(index),
            key: key,
            value: value
        };
    };
    if (!JSCompatibility_1.startsWith(authHeader, prefix + ' '))
        throw Error('Invalid format');
    authHeader = authHeader.substring((prefix + ' ').length);
    var keyValues = {};
    var token;
    do {
        token = getToken(authHeader);
        if (token) {
            keyValues[token.key] = token.value;
            authHeader = token.strLeft.trim();
            if (authHeader.length > 0)
                authHeader = authHeader.substring(stepOverSeparator(authHeader, 0, ','));
        }
    } while (token && authHeader);
    return keyValues;
}
exports.parseHTTPAuthHeader = parseHTTPAuthHeader;
