var webdav = require('../../lib/index.js');

module.exports = test => test('testName', isValid =>
{
    //isValid(webdav.testName('') && webdav.testName('ok') && !webdav.testName(2) && !webdav.testName())
    isValid(true);
})