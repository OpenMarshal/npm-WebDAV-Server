import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter, propfind, proppatch } from './.createFiles'

export default ((info, isValid) =>
{
    info.init(3);
    
    starter(info, isValid, (s) => {
        proppatch(s, info, 'file', v2.HTTPCodes.MultiStatus, [ '<D:getetag>"Value"</D:getetag>' ], null, (xml) => {
            const propstat = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat')
            let value = propstat.find('DAV:prop').elements[0].name;
            if(value !== 'DAV:getetag')
                return isValid(false, 'The element in the "prop" element must be "getetag" but got : ' + value)
            
            value = propstat.find('DAV:status').findText();
            if(value.indexOf(v2.HTTPCodes.Forbidden.toString()) === -1)
                return isValid(false, 'The status must be ' + v2.HTTPCodes.Forbidden + ' but got : ' + value);
            
            isValid(true);
        })
    });
    
    starter(info, isValid, (s) => {
        proppatch(s, info, 'file', v2.HTTPCodes.MultiStatus, [ '<D:getetagxx>"Value"</D:getetagxx>' ], null, (xml) => {
            const propstat = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat')
            let value = propstat.find('DAV:prop').elements[0].name;
            if(value !== 'DAV:getetagxx')
                return isValid(false, 'The element in the "prop" element must be "getetagxx" but got : ' + value)
            
            value = propstat.find('DAV:status').findText();
            if(value.indexOf(v2.HTTPCodes.Forbidden.toString()) === -1)
                return isValid(false, 'The status must be ' + v2.HTTPCodes.Forbidden + ' but got : ' + value);
            
            isValid(true);
        })
    });
    
    starter(info, isValid, (s) => {
        proppatch(s, info, 'file', v2.HTTPCodes.MultiStatus, null, [ '<D:getetagxx>"Value"</D:getetagxx>' ], (xml) => {
            const propstat = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat')
            let value = propstat.find('DAV:prop').elements[0].name;
            if(value !== 'DAV:getetagxx')
                return isValid(false, 'The element in the "prop" element must be "getetagxx" but got : ' + value)
            
            value = propstat.find('DAV:status').findText();
            if(value.indexOf(v2.HTTPCodes.Forbidden.toString()) === -1)
                return isValid(false, 'The status must be ' + v2.HTTPCodes.Forbidden + ' but got : ' + value);
            
            isValid(true);
        })
    });

}) as Test;
