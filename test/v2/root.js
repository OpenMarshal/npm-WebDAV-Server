"use strict";
var webdav = require('../../lib/index.js').v2,
    request = require('request'),
    path = require('path'),
    fs = require('fs'),
    xmljs = require('xml-js-builder')

module.exports = (callback, options) => {
    var successes = [];
    var errors = [];

    function success(text)
    {
        successes.push(' \x1b[42m\x1b[37m\x1b[1m o \x1b[0m ' + text + '\x1b[0m');
    }
    function error(text)
    {
        errors.push(' \x1b[41m\x1b[37m\x1b[1m x \x1b[0m ' + text + '\x1b[0m');
    }

    var nb = 0;

    function callCallback()
    {
        --nb;
        if(nb <= 0)
            callback(successes, errors);
    }

    var root = path.join(__dirname, 'tests');
    fs.readdir(root, (e, files) => {
        if(e)
            throw e;
        
        files = files.filter((f) => f.indexOf('.js') === -1);
        nb += files.length;
        let gindex = 0;
        files.forEach((f1) => {
            const f1x = path.join(root, f1);
            fs.readdir(f1x, (e, files) => {
                if(e)
                    throw e;

                files = files.filter((f) => f.indexOf('.js') === f.length - 3 && f.indexOf('.') !== 0);
                nb += files.length;
                files.forEach((f) => {
                    const fx = path.join(f1x, f);
            
                    const info = {
                        name: undefined,
                        options,
                        port: options.port + gindex * options.nbReservedSocketPerTest,
                        easyError: (e, cb) => (e, arg1, arg2, arg3) => {
                            if(e)
                                info.isValid(false, e);
                            else
                                cb(arg1, arg2, arg3);
                        },
                        startServer: (options, autoStart) => {
                            options = options ? options : {};
                            options.port = info.port + info.servers.length;
                            options.enableLocationTag = true;
                            const startServer = new webdav.WebDAVServer(options);
                            if(autoStart || autoStart === undefined || autoStart === null)
                                startServer.start();
                            info.servers.push(startServer);
                            return startServer;
                        },
                        reqStream: (config, callback) => {
                            const stream = request(config);
                            stream.on('error', (e) => {
                                info.isValid(false, 'HTTP error.', e);
                            })
                            stream.on('complete', (res, body) => {
                                if(!config.canFail && res.statusCode >= 300)
                                    return info.isValid(false, res.statusCode + ' - ' + res.statusMessage);
                                
                                callback(res, body);
                            })
                            return stream;
                        },
                        req: (config, _codeStatusExpected, _callback) => {
                            const codeStatusExpected = _callback ? _codeStatusExpected : -1;
                            const callback = _callback ? _callback : _codeStatusExpected;

                            request(config, (e, res, body) => {
                                if(e)
                                    return info.isValid(false, 'HTTP error.', e);
                                if(codeStatusExpected === -1 && res.statusCode >= 300)
                                    return info.isValid(false, res.statusCode + ' - ' + res.statusMessage);
                                if(codeStatusExpected !== -1 && res.statusCode != codeStatusExpected)
                                    return info.isValid(false, 'Expected ' + codeStatusExpected + ' but got : ' + res.statusCode + ' - ' + res.statusMessage + ' / ' + (config.uri || config.url));
                                
                                if(body)
                                    body = body.toString();

                                callback(res, body);
                            })
                        },
                        reqXML: (config, _codeStatusExpected, _callback) => {
                            const codeStatusExpected = _callback ? _codeStatusExpected : -1;
                            const callback = _callback ? _callback : _codeStatusExpected;

                            request(config, (e, res, body) => {
                                if(e)
                                    return info.isValid(false, 'HTTP error.', e);
                                if(codeStatusExpected === -1 && res.statusCode >= 300)
                                    return info.isValid(false, res.statusCode + ' - ' + res.statusMessage);
                                if(codeStatusExpected !== -1 && res.statusCode != codeStatusExpected)
                                    return info.isValid(false, 'Expected ' + codeStatusExpected + ' but got : ' + res.statusCode + ' - ' + res.statusMessage + ' / ' + (config.uri || config.url));
                                
                                const bodySource = body;
                                if(body)
                                {
                                    try
                                    {
                                        body = xmljs.XML.parse(body);
                                    }
                                    catch(ex)
                                    {
                                        return info.isValid(false, 'Invlid XML in the response body.', body.toString());
                                    }
                                }

                                callback(res, body, bodySource);
                            })
                        },
                        init: (nbExpected, name, autoStart) => {
                            if(autoStart === undefined)
                                autoStart = true;

                            if(name !== undefined)
                            {
                                if(name.constructor === String)
                                {
                                    info.name = name;
                                    info.startServer(undefined, autoStart);
                                }
                                else
                                {
                                    name.port = info.port;
                                    info.startServer(name, autoStart);
                                }
                            }
                            else
                            {
                                info.startServer(undefined, autoStart);
                            }

                            info.ctx = webdav.ExternalRequestContext.create(info.servers[0]);
                            info.expect(nbExpected);
                            return info.servers[0];
                        },
                        servers: [],
                        expect: (nb) => {
                            let callback = (valid, details) => {
                                callback = (valid, details) => { }

                                details = details ? ' :: ' + details : '';
                                const prefix = '[' + f1.replace(/([A-Z-])/g, ' $1').trim().toLowerCase() + ' :: ' + f.replace('.js', '').replace(/([A-Z-])/g, ' $1').trim().toLowerCase() + (info.name ? ' : ' + info.name : '') + ']';
                                if(valid)
                                    success(prefix + details)
                                else
                                    error(prefix + details)
                                callCallback();
                            }

                            info.exit = (msg) => {
                                callback(false, msg);
                            }

                            var allGood = true;
                            var allMsg;
                            info.isValid = function(good, msg, error)
                            {
                                if(error)
                                {
                                    msg += ' :: ' + error;
                                    if(options.showExceptions)
                                        console.error(error);
                                }

                                --nb;
                                if(msg && allGood && !good)
                                    allMsg = msg;
                                allGood = allGood && good;
                                if(nb === 0)
                                {
                                    info.servers.forEach((s) => s.stop());
                                    callback(allGood, allMsg);
                                }
                            }
                        }
                    };
                    
                    try
                    {
                        setTimeout(() => info.exit('Timeout'), options.timeout);
                        process.nextTick(() => require(fx).default(info, (good, msg, e) => info.isValid(good, msg, e)));
                    }
                    catch(ex)
                    {
                        if(options.showExceptions)
                            console.error(ex);
                        
                        error(info.name + '\r\n' + ex)
                        callCallback();
                    }
                    ++gindex;
                })

                --nb;
            })
        })
    })
};

if(!module.parent)
    module.exports((successes, errors) => {
        console.log('=====================================');
        console.log('==== webdav-server === Version 2 ====');
        console.log('=====================================');
        console.log();
        console.log(' ' + successes.length + ' successe(s).');
        console.log(' ' + errors.length + ' error(s).');
        
        if(successes.length)
        {
            console.log();
            console.log(' Successe(s) :');
            successes.sort().forEach(v => console.log(v));
        }
        if(errors.length)
        {
            console.log();
            console.log(' Error(s) :');
            errors.sort().forEach(v => console.log(v));
        }
        
        console.log();
        console.log(' ' + successes.length + ' successe(s).');
        console.log(' ' + errors.length + ' error(s).');

        process.exit(errors.length > 0 ? 1 : 0);
    }, {
        port: 1900,
        showExceptions : true,
        timeout: 30000,
        nbReservedSocketPerTest: 30
    })
