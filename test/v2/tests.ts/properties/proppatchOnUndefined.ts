import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter, propfind, proppatch } from './.createFiles'

export default ((info, isValid) =>
{
    info.init(2);
    
    starter(info, isValid, (s) => {
        proppatch(s, info, 'undefined', v2.HTTPCodes.NotFound, [ '<test1></test1>' ], null, (xml) => {
            isValid(true);
        })
    });
    
    starter(info, isValid, (s) => {
        proppatch(s, info, 'file', v2.HTTPCodes.MultiStatus, null, [ '<test1 />' ], (xml) => {
            const propstat = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat')
            let value = propstat.find('DAV:prop').elements[0].name;
            if(value !== 'test1')
                return isValid(false, 'The element in the "prop" element must be "test1" but got : ' + value)
            
            value = propstat.find('DAV:status').findText();
            if(value.indexOf(v2.HTTPCodes.OK.toString()) === -1)
                return isValid(false, 'The status must be ' + v2.HTTPCodes.OK + ' but got : ' + value);
            
            isValid(true);
        })
    });

}) as Test;
