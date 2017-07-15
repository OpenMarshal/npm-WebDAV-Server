import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { methodTesterNotBlocking } from './.createFiles'
import { XMLElementUtil } from 'xml-js-builder'

export default ((info, isValid) =>
{
    function testStatus(xml : XMLElementUtil, expectedCode : number, callback : () => void)
    {
        try
        {
            const status = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat').find('DAV:status').findText();
            if(status.indexOf(expectedCode.toString()) === -1)
                return isValid(false, 'The XML repsonse returned a "' + status + '" instead of a status code ' + expectedCode);

            callback();
        }
        catch(ex)
        {
            return isValid(false, 'Invalid XML response for PROPPATCH', ex);
        }
    }

    methodTesterNotBlocking(info, isValid, (port, user2, cb) => {
        info.reqXML({
            url: 'http://localhost:' + port + '/folder/folder2/folder3/folder4/file',
            method: 'PROPFIND',
            headers: {
                Authorization: 'Basic ' + user2,
                Depth: 0
            }
        }, v2.HTTPCodes.MultiStatus, (res, xml) => {
            testStatus(xml, v2.HTTPCodes.OK, () => cb())
        })
    })

}) as Test;
