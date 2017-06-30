"use strict";
var webdav = require('../../../lib/index.js'),
    request = require('request')

module.exports = (test, options, index) => test('events', (isValid, server) =>
{
    isValid = isValid.multiple(10, server);

    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }

    const url = 'http://localhost:' + (options.port + index);
    function req(path, method, headers, body, callback)
    {
        request({
            url: url + path,
            method,
            headers,
            body
        }, (e, res, body) => _(e, () => {
            callback(res, body);
        }))
    }

    function attachEvent(eventName, eventsTriggered)
    {
        server.on(eventName, (arg, r, lock) => {
            eventsTriggered.push(eventName);
        })
    }
    function expectEvents(testName, events, callback)
    {
        const eventsTriggered = [];
        const set = {};
        events.forEach((e) => set[e] = true);
        Object.keys(set).forEach((e) => attachEvent(e, eventsTriggered));
        
        function check()
        {
            const ev = JSON.parse(JSON.stringify(events));

            while(ev.length > 0)
            {
                const e = ev.shift();
                const index = eventsTriggered.indexOf(e);
                if(index === -1)
                    return '[' + testName + '] Missing event "' + e + '"';
                
                eventsTriggered.splice(index, 1);
            }

            return null;
        }

        callback((path, method, headers, body) => {
            req(path, method, headers, body, (res) => {
                if(Math.floor(res.statusCode / 100) !== 2)
                    isValid(false, '[' + testName + '] Received status code : ' + res.statusCode + ' (' + res.statusMessage + ')')
                else
                {
                    const result = check();
                    isValid(!result, result);
                }
            })
        }, check);
    }

    expectEvents('LOCK on not existing resource', [ 'lock', 'create', 'addChild' ], (_, check) => {
        req('/test.txt', 'LOCK', undefined, '<?xml version="1.0" encoding="utf-8" ?><D:lockinfo xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype><D:owner><D:href>'+url+'/user</D:href></D:owner></D:lockinfo>', (res, body) => {
            const result = check();
            if(result)
            {
                isValid(false, result);
                return;
            }

            const lock = body.substring(body.indexOf('<D:locktoken><D:href>') + '<D:locktoken><D:href>'.length, body.indexOf('</D:href>', body.indexOf('<D:locktoken><D:href>')));
            expectEvents('UNLOCK', [ 'unlock' ], (r) => {
                r('/test.txt', 'UNLOCK', { 'Lock-Token': lock });
            })
        })
    })
    
    req('/test2.txt', 'PUT', undefined, 'BODY', () => {
        expectEvents('PUT on an existing resource', [ 'write' ], (req) => {
            req('/test2.txt', 'PUT', undefined, 'BODY')
        })
    })
    
    req('/test3.txt', 'PUT', undefined, 'BODY', () => {
        expectEvents('COPY to an unexisting resource', [ 'copy', 'create', 'read', 'addChild', 'write' ], (req) => {
            req('/test3.txt', 'COPY', { destination: url + '/test3.copy.txt' }, undefined)
        })
    })
    
    req('/test4.txt', 'PUT', undefined, 'BODY', () => {
        req('/test4.copy.txt', 'PUT', undefined, 'BODY', () => {
            expectEvents('COPY to an existing resource', [ 'copy', 'create', 'read', 'addChild', 'delete', 'write' ], (req) => {
                req('/test4.txt', 'COPY', { destination: url + '/test4.copy.txt', overwrite: 'T' }, undefined)
            })
        })
    })
    
    req('/test5.txt', 'PUT', undefined, 'BODY', () => {
        expectEvents('DELETE', [ 'delete' ], (req) => {
            req('/test5.txt', 'DELETE', undefined, undefined)
        })
    })
    
    req('/test6.txt', 'PUT', undefined, 'BODY', () => {
        expectEvents('GET', [ 'read' ], (req) => {
            req('/test6.txt', 'GET', undefined, undefined)
        })
    })
    
    expectEvents('MKCOL', [ 'addChild', 'create' ], (req) => {
        req('/test7', 'MKCOL', undefined, undefined)
    })
    
    req('/test8.txt', 'PUT', undefined, 'BODY', () => {
        expectEvents('MOVE to an unexisting resource', [ 'move', 'addChild' ], (req) => {
            req('/test8.txt', 'MOVE', { destination: url + '/test8.move.txt' }, undefined)
        })
    })
    
    req('/test9.txt', 'PUT', undefined, 'BODY', () => {
        req('/test9.copy.txt', 'PUT', undefined, 'BODY', () => {
            expectEvents('MOVE to an existing resource', [ 'move', 'addChild', 'delete' ], (req) => {
                req('/test9.txt', 'MOVE', { destination: url + '/test9.move.txt', overwrite: 'T' }, undefined)
            })
        })
    })
    
    req('/test10.txt', 'PUT', undefined, 'BODY', () => {
        expectEvents('PROPPATCH set property', [ 'setProperty', 'setProperty' ], (_, check) => {
            req('/test10.txt', 'PROPPATCH', undefined, '<?xml version="1.0" encoding="utf-8" ?><D:propertyupdate xmlns:D="DAV:" xmlns:Z="http://ns.example.com/standards/z39.50/"><D:set><D:prop><Z:Authors><Z:Author>Jim Whitehead</Z:Author><Z:Author>Roy Fielding</Z:Author></Z:Authors><Z:Authors2><Z:Author>Jim Whitehead</Z:Author><Z:Author>Roy Fielding</Z:Author></Z:Authors2></D:prop></D:set></D:propertyupdate>', () => {
                const result = check();
                if(result)
                {
                    isValid(false, result);
                    return;
                }
                
                expectEvents('PROPPATCH remove property', [ 'removeProperty', 'removeProperty' ], (req) => {
                    req('/test10.txt', 'PROPPATCH', undefined, '<?xml version="1.0" encoding="utf-8" ?><D:propertyupdate xmlns:D="DAV:" xmlns:Z="http://ns.example.com/standards/z39.50/"><D:remove><D:prop><Z:Authors/><Z:Authors2/></D:prop></D:remove></D:propertyupdate>')
                })
            })
        })
    })
})