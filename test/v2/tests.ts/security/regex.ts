import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import * as safe from 'safe-regex'

export default ((info, isValid) =>
{
    const options = {
        limit: 25
    };

    const test = (regex, callback) => {
        if(!safe(regex, options))
        {
            isValid(false, regex.source);
            callback();
        }
        else
        {
            isValid(true);
            callback();
        }
    };

    const regexes = [
        /((not)|<([^>]+)>|\[([^\]]+)\]|<(DAV:no-lock)>)/ig,
        /^[ ]*\([ ]*<([^>]+)>[ ]*\)[ ]*$/,
        ///(?:<([^>]+)>)?\s*\(([^\)]+)\)/g,
        /(^\/|\/$)/g,
        /(-| )/g,
        /[^a-z0-9A-Z]xml$/,
        /[^a-z0-9A-Z]json$/,
        /([0-9]+)-([0-9]+)/,
        /([0-9]+)-/,
        /-([0-9]+)/,
        /^Basic \s*[a-zA-Z0-9]+=*\s*$/
    ];

    info.expect(regexes.length);

    let index = 0;

    const exec = () => {
        if(index >= regexes.length)
            return;
        
        test(regexes[index], () => {
            ++index;
            exec();
        });
    };
    exec();

}) as Test;
