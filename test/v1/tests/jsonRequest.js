"use strict";
var webdav = require('../../../lib/index.js'),
    request = require('request')

module.exports = (test, options, index) => test('request with a JSON body instead of XML', (isValid, server) =>
{
    isValid = isValid.multiple(1, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }

    const fileName = 'file.txt';
    const fileNameDest = 'file.dest.txt';
    server.addResourceTree([
        new webdav.VirtualFile(fileName),
        new webdav.VirtualFile(fileNameDest),
    ], e => _(e, () => {
        request({
            url: 'http://localhost:' + (options.port + index) + '/',
            method: 'PROPFIND',
            headers: {
                depth: 1,
                Accept: 'application/json'
            },
            body: JSON.stringify({
                'd:propfind': {
                    _attributes: { 'xmlns:d': 'DAV:' },
                    'd:prop': {
                        'd:displayname': {},
                        'd:resourcetype': {},
                        'd:supportedlock': {}
                    }
                }
            })
        }, (e, res, body) => _(e, () => {
            body = JSON.parse(body);

            const responses = body['D:multistatus'][0]['D:response'];

            if(responses.length !== 3)
            {
                isValid(false, 'The responses body must contains 3 \'DAV:response\' XML elements');
                return;
            }

            for(let i = 0; i < 3; ++i)
            {
                const propstat = responses[i]['D:propstat'];
                if(propstat.length !== 1)
                {
                    isValid(false, 'There must be only one propstart element (because no 404 expected) per response');
                    return;
                }

                const props = propstat[0]['D:prop'][0];
                const values = [ 'displayname', 'resourcetype', 'supportedlock' ];
                let found = 0;
                for(const name in props)
                {
                    for(let j = 0; j < values.length; ++j)
                    {
                        if(name.indexOf(values[j]) !== -1)
                        {
                            ++found;
                            values.splice(j, 1);
                        }
                    }
                }

                if(values.length !== 0)
                {
                    isValid(false, 'Too few properties returned by the request');
                    return;
                }


                if(found !== Object.keys(props).length)
                {
                    isValid(false, 'Too many properties returned by the request');
                    return;
                }
            }

            isValid(true);
        }))
    }));
})