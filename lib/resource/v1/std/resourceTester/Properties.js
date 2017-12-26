"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xml_js_builder_1 = require("xml-js-builder");
// ****************************** Properties ****************************** //
function setProperty(callback) {
    callback = this.multiple(callback, 2);
    this.producer(false, function (r1) {
        var name = 'prop-test_test:test//test/test.test';
        var value = 'value value.value_value<value>___</value>';
        r1.setProperty(name, value, function (e) {
            callback(e, !e, 'setProperty error', undefined, function () {
                r1.getProperty(name, function (e, v) {
                    callback(e, v === value, 'Value returned by getProperty is different of the value provided to setProperty');
                });
            });
        });
    });
    this.producer(false, function (r1) {
        var name = 'prop-test_test:test//test/test.test';
        var value = xml_js_builder_1.XML.parse('<actors><actor>Titi</actor><actor>Toto</actor></actors>');
        r1.setProperty(name, value, function (e) {
            callback(e, !e, 'setProperty error', undefined, function () {
                r1.getProperty(name, function (e, v) {
                    callback(e, v === value, 'Value returned by getProperty is different of the value provided to setProperty');
                });
            });
        });
    });
}
exports.setProperty = setProperty;
function removeProperty(callback) {
    callback = this.multiple(callback, 1);
    this.producer(false, function (r1) {
        var name = 'prop-test_test:test//test/test.test';
        var value = 'value';
        r1.setProperty(name, value, function (e) {
            callback(e, !e, 'setProperty error', undefined, function () {
                r1.removeProperty(name, function (e) {
                    callback(e, !e, 'removeProperty error', undefined, function () {
                        r1.getProperty(name, function (e, v) {
                            callback(e, !e && !!v, 'The property has not been removed from removeProperty', false);
                        });
                    });
                });
            });
        });
    });
}
exports.removeProperty = removeProperty;
function getProperties(callback) {
    callback = this.multiple(callback, 1);
    this.producer(false, function (r1) {
        var values = {
            'prop-test_test:test//test/test.test': 'value',
            'test2': 'value2',
            'value': 'value3',
        };
        var keys = Object.keys(values);
        r1.setProperty(keys[0], values[keys[0]], function (e) {
            callback(e, !e, 'setProperty error', undefined, function () {
                r1.setProperty(keys[1], values[keys[1]], function (e) {
                    callback(e, !e, 'setProperty error', undefined, function () {
                        r1.setProperty(keys[2], values[keys[2]], function (e) {
                            callback(e, !e, 'setProperty error', undefined, function () {
                                r1.getProperties(function (e, props) {
                                    callback(e, !e && !!props, 'getProperties error', undefined, function () {
                                        var valid = {};
                                        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                                            var key = keys_1[_i];
                                            valid[key] = false;
                                        }
                                        for (var _a = 0, _b = Object.keys(props); _a < _b.length; _a++) {
                                            var name_1 = _b[_a];
                                            if (values[name_1] !== undefined)
                                                valid[name_1] = values[name_1] === props[name_1];
                                        }
                                        callback(null, keys.every(function (k) { return valid[k]; }), 'One or many properties are invalid or missing in the response of getProperties');
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}
exports.getProperties = getProperties;
