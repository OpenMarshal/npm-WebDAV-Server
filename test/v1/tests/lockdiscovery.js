"use strict";
var webdav = require('../../../lib/index.js'),
    request = require('request'),
    xmljs = require('xml-js');

module.exports = (test, options, index) => test('lockdiscovery', (isValid, server) =>
{
    isValid = isValid.multiple(1, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }
    
    server.userManager.addUser('usernameX', 'password');
    const url = 'http://127.0.0.1:' + (options.port + index);

    function propfind(path, callback)
    {
        request({
            url: url + path,
            method: 'PROPFIND',
        }, (e, res, body) => _(e, () => {
            try
            {
                callback(xmljs.xml2js(body, { compact: true, alwaysArray: true }));
            }
            catch(e)
            {
                isValid(false, e);
            }
        }))
    }

    server.addResourceTree({
        r: new webdav.VirtualFolder('testFolder'),
        c: new webdav.VirtualFile('test5.txt')
    }, e => _(e, () => {
        propfind('/testFolder', xml => {
            const lockdiscovery = xml['D:multistatus'][0]['D:response'][0]['D:propstat'][0]['D:prop'][0]['D:lockdiscovery'];
            if(lockdiscovery && Object.keys(lockdiscovery[0]).length !== 0)
            {
                isValid(false, 'There must be no D:lockdiscovery element or an empty D:lockdiscovery element in the body of the response of PROPFIND when there is no lock on the resource or on a parent');
                return;
            }
            
            request({
                url: url + '/testFolder',
                method: 'LOCK',
                headers: {
                    Authorization: 'Basic dXNlcm5hbWVYOnBhc3N3b3Jk'
                },
                body: '<?xml version="1.0" encoding="utf-8" ?><D:lockinfo xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype><D:owner><D:href>'+url+'/user</D:href></D:owner></D:lockinfo>'
            }, (e, res, body) => _(e, () => {

                function test(path, callback)
                {
                    propfind(path, xml => {
                        const activelock = xml['D:multistatus'][0]['D:response'][0]['D:propstat'][0]['D:prop'][0]['D:lockdiscovery'][0]['D:activelock'][0];
                        if(activelock['D:locktype'][0]['D:write'][0]
                            && activelock['D:lockscope'][0]['D:exclusive'][0]
                            && activelock['D:depth'][0]._text[0].toLowerCase() === 'infinity'
                            && activelock['D:owner'][0]['a:href'][0]._text[0] === url + '/user'
                            && activelock['D:locktoken'][0]['D:href'][0]
                            && activelock['D:timeout'][0]._text[0].toLowerCase().indexOf('second-') === 0
                            && activelock['D:lockroot'][0]['D:href'][0]._text[0] === url + '/testFolder')
                        {
                            callback();
                        }
                        else
                            isValid(false, 'Some values are not valid in D:lockroot or D:timeout or D:owner or D:depth')
                    })
                }
                test('/testFolder', () => {
                    test('/testFolder/test5.txt', () => isValid(true))
                })
            }))
        })
    }))
})