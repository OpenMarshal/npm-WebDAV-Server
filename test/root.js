var path = require('path'),
    fs = require('fs')

module.exports = callback => {
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
            fn((valid, details) => {
                details = details ? ' :: ' + details : '';
                if(valid)
                    success(name + details)
                else
                    error(name + details)
                callCallback();
            })
        }
        catch(ex)
        {
            error(name + '\r\n' + ex)
            callCallback();
        }
    }

    var root = path.join(__dirname, 'tests');
    fs.readdir(root, (e, files) => {
        if(e)
            throw e;
        
        nb = files.length;
        files.forEach(f => {
            f = path.join(root, f);
            try
            {
                require(f)(isValid);
            }
            catch(ex)
            {
                isValid(f, isValid => isValid(false, ex));
            }
        })
    })
};

if(!module.parent)
    module.exports((successes, errors) => {
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
    })
