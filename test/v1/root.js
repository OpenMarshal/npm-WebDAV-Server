"use strict";
var webdav = require('../../lib/index.js'),
    path = require('path'),
    fs = require('fs')

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
    function isValid(name, fn)
    {
        try
        {
            if(fn.constructor !== Function)
                throw fn;

            let callback = (valid, details) => {
                callback = (valid, details) => { }

                details = details ? ' :: ' + details : '';
                if(valid)
                    success(name + details)
                else
                    error(name + details)
                callCallback();
            }
            callback.multiple = (nb, server) => {
                var allGood = true;
                var allMsg;
                return function(good, msg)
                {
                    --nb;
                    if(msg && allGood && !good)
                        allMsg = msg;
                    allGood = allGood && good;
                    if(nb === 0)
                    {
                        if(server)
                            server.stop(() => {
                                callback(allGood, allMsg);
                            })
                        else
                            callback(allGood, allMsg);
                    }
                }
            }
            setTimeout(() => callback(false, 'Timeout'), options.timeout);

            const server = new webdav.WebDAVServer({
                httpAuthentication: new webdav.HTTPBasicAuthentication('default realm')
            });
            server.start(options.port + this.index, () => {
                fn(callback, server);
            })
        }
        catch(ex)
        {
            if(options.showExceptions)
                console.error(ex);
            
            error(name + '\r\n' + ex)
            callCallback();
        }
    }

    var root = path.join(__dirname, 'tests');
    fs.readdir(root, (e, files) => {
        if(e)
            throw e;
        
        files = files.filter(f => f.endsWith('.js'));
        
        nb = files.length;
        files.forEach((f, index) => {
            f = path.join(root, f);
            try
            {
                require(f)(isValid.bind({ index }), options, index);
            }
            catch(ex)
            {
                if(options.showExceptions)
                    console.error(ex);
                    
                isValid(f, ex);
            }
        })
    })
};

if(!module.parent)
    module.exports((successes, errors) => {
        console.log('=====================================');
        console.log('==== webdav-server === Version 1 ====');
        console.log('=====================================');
        console.log();
        console.log(' ' + successes.length + ' successe(s).');
        console.log(' ' + errors.length + ' error(s).');
        
        if(successes.length)
        {
            console.log();
            console.log(' Successe(s) :');
            successes.forEach(v => console.log(v));
        }
        if(errors.length)
        {
            console.log();
            console.log(' Error(s) :');
            errors.forEach(v => console.log(v));
        }
        
        console.log();
        console.log(' ' + successes.length + ' successe(s).');
        console.log(' ' + errors.length + ' error(s).');

        process.exit(errors.length > 0 ? 1 : 0);
    }, {
        port: 1900,
        showExceptions : true,
        timeout: 30000
    })
