"use strict";
var webdav = require('../../../lib/index.js'),
    request = require('request');

module.exports = (test, options, index) => test('date', (isValid, server) =>
{
    isValid = isValid.multiple(1, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }

    request({
        url: 'http://localhost:' + (options.port + index) + '/',
        method: 'OPTIONS'
    }, (e, res, body) => _(e, () => {
        isValid(Object.keys(res.headers).some(n => n.toLowerCase() === 'date'), 'The \'date\' header is missing in the response')
    }));
})