"use strict";
var webdav = require('../../../lib/index.js'),
    request = require('request')

module.exports = (test, options, index) => test('OPTIONS method', (isValid, server) =>
{
    isValid = isValid.multiple(1, server);

    request({
        url: 'http://localhost:' + (options.port + index),
        method: 'OPTIONS'
    }, (e, res, body) => {
        isValid(!e && res.headers.allow && res.headers.allow.length >= 3 && /^[a-zA-Z,]+$/g.test(res.headers.allow));
    })
})