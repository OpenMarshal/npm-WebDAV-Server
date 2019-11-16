import { Test, TestInfo, TestCallback } from '../Type'
import { starter } from './.createDir'
import { v2 } from '../../../../lib/index.js'
import { encode } from 'punycode';

function test(info : TestInfo, isValid : TestCallback, root : string, callback : () => void) : void
{
    info.reqXML({
        url: 'http://localhost:' + info.port + '/folder' + root,
        method: 'PROPFIND',
        headers: {
            depth: 1
        }
    }, v2.HTTPCodes.MultiStatus, (req, body) => {
        try
        {
            const sub = body.find('DAV:multistatus').findMany('DAV:response').map((r) => {
                return {
                    href: r.find('DAV:href').findText(),
                    locationHref: r.find('DAV:location').find('DAV:href').findText(),
                    displayName: r.find('DAV:propstat').find('DAV:prop').find('DAV:displayname').findText()
                };
            });

            const invalidEntries = sub.filter((entry) => {
                if(entry.href === encodeURI(entry.href))
                    return false; // No need to be encoded

                return decodeURI(entry.href) === entry.href
                    || decodeURI(entry.locationHref) === entry.locationHref;
            });

            if(invalidEntries.length === 0)
                return callback();
            
            isValid(false, 'Some resource\'s url are not correctly encoded in PROPFIND in "' + root + '", displayname must not be encoded while location.href and href must be encoded : ' + invalidEntries.map((entry) => {
                return 'displayName = "' + entry.displayName + '" ; href = "' + entry.href + '" ; location.href = "' + entry.locationHref + '"';
            }).join(' && '));
        }
        catch(ex)
        {
            isValid(false, 'Invalid WebDAV response body.', ex);
        }
    })
}

export default ((info, isValid) =>
{
    starter(info.init(1), info, isValid, (r, subFiles) => {
        test(info, isValid, '/', () => {
            test(info, isValid, '/subFolder3', () => {
                test(info, isValid, '/sub Folder 4', () => {
                    isValid(true);
                });
            });
        });
    });

}) as Test;
