import { Test, TestInfo, TestCallback } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { starter, propfind, proppatch } from './.createFiles'

export function test(s : v2.WebDAVServer, info : TestInfo, isValid : TestCallback, path : string)
{
    proppatch(s, info, path, v2.HTTPCodes.MultiStatus, [
        '<namespace:testcustom>Value</namespace:testcustom>',
        '<x:testcustom2 xmlns:x="namespace:">Value</x:testcustom2>',
        '<test1></test1>',
        '<test2 />',
        '<test3>Ok</test3>',
        '<test4 attribute="Ok"></test4>',
        '<test5><subtest5>Ok</subtest5></test5>'
    ], null, (xml) => {
        try
        {
            const propstat = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat');

            const props = propstat.find('DAV:prop');
            props.find('namespace:testcustom');
            props.find('test1');
            props.find('test2');
            props.find('test3');
            props.find('test4');
            props.find('test5');
            
            const value = propstat.find('DAV:status').findText();
            if(value.indexOf(v2.HTTPCodes.OK.toString()) === -1)
                return isValid(false, 'The status must be ' + v2.HTTPCodes.OK + ' but got : ' + value);
            
            propfind(s, info, path, v2.HTTPCodes.MultiStatus, 0, undefined, (xml) => {
                try
                {
                    const propstat = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat');

                    const props = propstat.find('DAV:prop');
                    props.find('namespace:testcustom');
                    props.find('namespace:testcustom2');
                    props.find('test1');
                    props.find('test2');

                    const test3 = props.find('test3');
                    const test4 = props.find('test4');
                    const test5 = props.find('test5');

                    let value = test3.findText();
                    if(value !== 'Ok')
                        return isValid(false, 'test3 does not have the right text ; exported "Ok" but got "' + value + '"');
                    
                    value = test4.attributes['attribute'];
                    if(value !== 'Ok')
                        return isValid(false, 'test3 does not have the right attribute value ; exported "Ok" but got "' + value + '"');
                    
                    value = test5.find('subtest5').findText();
                    if(value !== 'Ok')
                        return isValid(false, 'test5/subtest5 does not have the right text ; exported "Ok" but got "' + value + '"');

                    proppatch(s, info, path, v2.HTTPCodes.MultiStatus, [
                        '<test1>Ok</test1>'
                    ], [ '<test4/>' ], (xml) => {
                        try
                        {
                            const propstat = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat');

                            const props = propstat.find('DAV:prop');
                            props.find('test1');
                            props.find('test4');
                    
                            const value = propstat.find('DAV:status').findText();
                            if(value.indexOf(v2.HTTPCodes.OK.toString()) === -1)
                                return isValid(false, 'The status must be ' + v2.HTTPCodes.OK + ' but got : ' + value);

                            propfind(s, info, path, v2.HTTPCodes.MultiStatus, 0, undefined, (xml) => {
                                try
                                {
                                    const propstat = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat');

                                    const props = propstat.find('DAV:prop');
                                    props.find('namespace:testcustom2');
                                    props.find('namespace:testcustom');
                                    props.find('test2');

                                    const test1 = props.find('test1');
                                    const test3 = props.find('test3');
                                    const test5 = props.find('test5');

                                    let value = test1.findText();
                                    if(value !== 'Ok')
                                        return isValid(false, 'test1 does not have the right text ; exported "Ok" but got "' + value + '"');

                                    value = test3.findText();
                                    if(value !== 'Ok')
                                        return isValid(false, 'test3 does not have the right text ; exported "Ok" but got "' + value + '"');
                                    
                                    value = test4.attributes['attribute'];
                                    if(props.findIndex('test4') !== -1)
                                        return isValid(false, 'test4 must be removed but it is still in the PROPFIND response');
                                    
                                    value = test5.find('subtest5').findText();
                                    if(value !== 'Ok')
                                        return isValid(false, 'test5/subtest5 does not have the right text ; exported "Ok" but got "' + value + '"');
                                    
                                    isValid(true);
                                }
                                catch(ex)
                                {
                                    isValid(false, ex);
                                }
                            })
                        }
                        catch(ex)
                        {
                            isValid(false, ex);
                        }
                    })
                }
                catch(ex)
                {
                    isValid(false, ex);
                }
            })
        }
        catch(ex)
        {
            isValid(false, ex);
        }
    })
}
