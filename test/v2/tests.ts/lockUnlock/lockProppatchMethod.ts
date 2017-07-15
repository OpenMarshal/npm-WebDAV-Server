import { Test } from '../Type'
import { v2 } from '../../../../lib/index.js'
import { methodTesterBlocking } from './.createFiles'
import { XMLElementUtil } from 'xml-js-builder'

export default ((info, isValid) =>
{
    const proppatch = '<?xml version="1.0" encoding="utf-8" ?><D:propertyupdate xmlns:D="DAV:" xmlns:Z="http://ns.example.com/standards/z39.50/"><D:set><D:prop><Z:Authors><Z:Author>Jim Whitehead</Z:Author><Z:Author>Roy Fielding</Z:Author></Z:Authors></D:prop></D:set></D:propertyupdate>';

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
    
    methodTesterBlocking(info, isValid, (port, user1, user2, cb) => {
        info.reqXML({
            url: 'http://localhost:' + port + '/folder/folder2/folder3/folder4/file',
            method: 'PROPPATCH',
            headers: {
                Authorization: 'Basic ' + user1
            },
            body: proppatch
        }, v2.HTTPCodes.MultiStatus, (res, xml) => {
            testStatus(xml, v2.HTTPCodes.OK, () => {
                info.reqXML({
                    url: 'http://localhost:' + port + '/folder/folder2/folder3/folder4/file',
                    method: 'PROPPATCH',
                    headers: {
                        Authorization: 'Basic ' + user2
                    },
                    body: proppatch
                }, v2.HTTPCodes.Locked, (res, xml) => {
                    cb();
                })
            })
        })
    }, (port, user2) => {
        info.reqXML({
            url: 'http://localhost:' + port + '/folder/folder2/folder3/folder4/file',
            method: 'PROPPATCH',
            headers: {
                Authorization: 'Basic ' + user2
            },
            body: proppatch
        }, v2.HTTPCodes.MultiStatus, (res, xml) => {
            testStatus(xml, v2.HTTPCodes.OK, () => {
                isValid(true);
            })
        })
    })

}) as Test;
