"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var _createFiles_1 = require("./.createFiles");
function test(s, info, isValid, path) {
    _createFiles_1.proppatch(s, info, path, index_js_1.v2.HTTPCodes.MultiStatus, [
        '<namespace:testcustom>Value</namespace:testcustom>',
        '<x:testcustom2 xmlns:x="namespace:">Value</x:testcustom2>',
        '<test1></test1>',
        '<test2 />',
        '<test3>Ok</test3>',
        '<test4 attribute="Ok"></test4>',
        '<test5><subtest5>Ok</subtest5></test5>'
    ], null, function (xml) {
        try {
            var propstat = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat');
            var props = propstat.find('DAV:prop');
            props.find('namespace:testcustom');
            props.find('test1');
            props.find('test2');
            props.find('test3');
            props.find('test4');
            props.find('test5');
            var value = propstat.find('DAV:status').findText();
            if (value.indexOf(index_js_1.v2.HTTPCodes.OK.toString()) === -1)
                return isValid(false, 'The status must be ' + index_js_1.v2.HTTPCodes.OK + ' but got : ' + value);
            _createFiles_1.propfind(s, info, path, index_js_1.v2.HTTPCodes.MultiStatus, 0, undefined, function (xml) {
                try {
                    var propstat_1 = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat');
                    var props_1 = propstat_1.find('DAV:prop');
                    props_1.find('namespace:testcustom');
                    props_1.find('namespace:testcustom2');
                    props_1.find('test1');
                    props_1.find('test2');
                    var test3 = props_1.find('test3');
                    var test4_1 = props_1.find('test4');
                    var test5 = props_1.find('test5');
                    var value_1 = test3.findText();
                    if (value_1 !== 'Ok')
                        return isValid(false, 'test3 does not have the right text ; exported "Ok" but got "' + value_1 + '"');
                    value_1 = test4_1.attributes['attribute'];
                    if (value_1 !== 'Ok')
                        return isValid(false, 'test3 does not have the right attribute value ; exported "Ok" but got "' + value_1 + '"');
                    value_1 = test5.find('subtest5').findText();
                    if (value_1 !== 'Ok')
                        return isValid(false, 'test5/subtest5 does not have the right text ; exported "Ok" but got "' + value_1 + '"');
                    _createFiles_1.proppatch(s, info, path, index_js_1.v2.HTTPCodes.MultiStatus, [
                        '<test1>Ok</test1>'
                    ], ['<test4/>'], function (xml) {
                        try {
                            var propstat_2 = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat');
                            var props_2 = propstat_2.find('DAV:prop');
                            props_2.find('test1');
                            props_2.find('test4');
                            var value_2 = propstat_2.find('DAV:status').findText();
                            if (value_2.indexOf(index_js_1.v2.HTTPCodes.OK.toString()) === -1)
                                return isValid(false, 'The status must be ' + index_js_1.v2.HTTPCodes.OK + ' but got : ' + value_2);
                            _createFiles_1.propfind(s, info, path, index_js_1.v2.HTTPCodes.MultiStatus, 0, undefined, function (xml) {
                                try {
                                    var propstat_3 = xml.find('DAV:multistatus').find('DAV:response').find('DAV:propstat');
                                    var props_3 = propstat_3.find('DAV:prop');
                                    props_3.find('namespace:testcustom2');
                                    props_3.find('namespace:testcustom');
                                    props_3.find('test2');
                                    var test1 = props_3.find('test1');
                                    var test3_1 = props_3.find('test3');
                                    var test5_1 = props_3.find('test5');
                                    var value_3 = test1.findText();
                                    if (value_3 !== 'Ok')
                                        return isValid(false, 'test1 does not have the right text ; exported "Ok" but got "' + value_3 + '"');
                                    value_3 = test3_1.findText();
                                    if (value_3 !== 'Ok')
                                        return isValid(false, 'test3 does not have the right text ; exported "Ok" but got "' + value_3 + '"');
                                    value_3 = test4_1.attributes['attribute'];
                                    if (props_3.findIndex('test4') !== -1)
                                        return isValid(false, 'test4 must be removed but it is still in the PROPFIND response');
                                    value_3 = test5_1.find('subtest5').findText();
                                    if (value_3 !== 'Ok')
                                        return isValid(false, 'test5/subtest5 does not have the right text ; exported "Ok" but got "' + value_3 + '"');
                                    isValid(true);
                                }
                                catch (ex) {
                                    isValid(false, ex);
                                }
                            });
                        }
                        catch (ex) {
                            isValid(false, ex);
                        }
                    });
                }
                catch (ex) {
                    isValid(false, ex);
                }
            });
        }
        catch (ex) {
            isValid(false, ex);
        }
    });
}
exports.test = test;
