"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var VirtualFolder_1 = require("../resource/virtual/VirtualFolder");
var VirtualFile_1 = require("../resource/virtual/VirtualFile");
var XML_1 = require("../helper/XML");
var DefaultResourceTesterOptions = (function () {
    function DefaultResourceTesterOptions() {
        this.canHaveVirtualFolderChildren = true;
        this.canHaveVirtualFileChildren = true;
        this.canGetLastModifiedDate = true;
        this.canGetCreationDate = true;
        this.canRemoveChildren = true;
        this.canHaveChildren = true;
        this.canGetChildren = true;
        this.canGetMimeType = true;
        this.canBeCreated = true;
        this.canBeDeleted = true;
        this.canBeRenamed = true;
        this.canGetSize = true;
        this.canBeMoved = true;
        this.canWrite = true;
        this.canRead = true;
    }
    return DefaultResourceTesterOptions;
}());
var ResourceTester = (function () {
    function ResourceTester(options, producer) {
        this.options = options;
        this.producer = producer;
        var def = new DefaultResourceTesterOptions();
        for (var _i = 0, _a = Object.keys(def); _i < _a.length; _i++) {
            var name_1 = _a[_i];
            if (this.options[name_1] === undefined)
                this.options[name_1] = def[name_1];
        }
    }
    ResourceTester.prototype.multiple = function (callback, nb) {
        return function (error, isValid, text, mustBeValid, cbNext) {
            if (mustBeValid === void 0) { mustBeValid = true; }
            if (nb <= 0)
                return;
            if (!mustBeValid) {
                if (error || !isValid) {
                    error = null;
                    isValid = true;
                }
                else {
                    error = new Error('It was supposed to fail');
                    isValid = false;
                }
            }
            if (error) {
                nb = -1;
                callback(error, false, text);
                return;
            }
            if (!isValid) {
                callback(error, false, text);
                return;
            }
            if (cbNext) {
                cbNext();
                return;
            }
            --nb;
            if (nb === 0)
                callback(null, isValid, text);
        };
    };
    ResourceTester.prototype.run = function (callback) {
        var _this = this;
        var nb = 0;
        var results = {
            all: {
                isValid: true,
                errors: []
            }
        };
        function end(name) {
            return function (error, isValid, text) {
                results[name] = {
                    error: error,
                    text: text,
                    isValid: isValid
                };
                if (error || !isValid) {
                    results.all.isValid = false;
                    results.all.errors.push({
                        error: error,
                        text: text,
                        toString: function () {
                            return '[' + name + '] ' + this.text + (this.error ? ' : ' + this.error : '');
                        }
                    });
                }
                --nb;
                if (nb === 0)
                    callback(results);
            };
        }
        var test = function (name) {
            ++nb;
            process.nextTick(function () { return _this[name](end(name)); });
        };
        test('create');
        test('delete');
        test('moveTo');
        test('rename');
        test('writeRead');
        test('mimeType');
        test('size');
        test('addChild');
        test('removeChild');
        test('getChildren');
        test('setProperty');
        test('removeProperty');
        test('getProperties');
        test('creationDate');
        test('lastModifiedDate');
        test('webName');
        test('type');
    };
    ResourceTester.prototype.create = function (callback) {
        var _this = this;
        callback = this.multiple(callback, 1);
        this.producer(true, function (r1) {
            r1.create(function (e) {
                callback(e, !e, 'create error', _this.options.canBeCreated);
            });
        });
    };
    ResourceTester.prototype.delete = function (callback) {
        var _this = this;
        callback = this.multiple(callback, 1);
        this.producer(true, function (r1) {
            r1.create(function (e) {
                callback(e, !e, 'create error', _this.options.canBeCreated, function () {
                    r1.delete(function (e) {
                        callback(e, !e, 'delete error', _this.options.canBeDeleted);
                    });
                });
            });
        });
    };
    ResourceTester.prototype.moveTo = function (callback) {
        callback = this.multiple(callback, 1);
        if (!this.options.canHaveChildren) {
            callback(null, true, '');
            return;
        }
        var vf1 = new VirtualFolder_1.VirtualFolder('folder1');
        var vf2 = new VirtualFolder_1.VirtualFolder('folder2');
        if (!this.options.canBeMoved) {
            this.producer(false, function (r1) {
                vf1.addChild(r1, function (e) {
                    callback(e, !e, 'addChild error', undefined, function () {
                        r1.moveTo(vf2, 'newName', false, function (e) {
                            callback(e, !e, 'moveTo must fail', false);
                        });
                    });
                });
            });
            return;
        }
        this.producer(false, function (r1) {
            vf1.addChild(r1, function (e) {
                callback(e, !e, 'addChild error of VirtualFolder', undefined, function () {
                    r1.moveTo(vf2, 'newName', false, function (e) {
                        callback(e, !e, 'moveTo must fail', undefined, function () {
                            callback(null, r1.parent === vf2, 'The parent property of the resource must be changed');
                        });
                    });
                });
            });
        });
    };
    ResourceTester.prototype.rename = function (callback) {
        var _this = this;
        callback = this.multiple(callback, 1);
        var newName = 'TEST-test_test Test%20' + (++ResourceTester.uuid).toString();
        this.producer(false, function (r1) {
            r1.rename(newName, function (e) {
                callback(e, !e, 'rename error', _this.options.canBeRenamed, function () {
                    r1.webName(function (e, name) {
                        callback(e, !e, 'webName error', undefined, function () {
                            callback(null, newName === name, 'rename did not rename the resource', _this.options.canBeRenamed);
                        });
                    });
                });
            });
        });
    };
    ResourceTester.prototype.writeRead = function (callback) {
        var _this = this;
        callback = this.multiple(callback, 1);
        if (!this.options.canWrite || !this.options.canRead) {
            this.producer(false, function (r1) {
                r1.write(true, function (e, w) {
                    callback(e, !e, 'write error', _this.options.canWrite);
                });
            });
            return;
        }
        var values = ['content1', 'content2'];
        var value = values.reduce(function (p, s) { return p + s; });
        var write = function (w, cb) {
            if (values.length === 0) {
                cb();
                return;
            }
            w.write(values.shift(), function (e) {
                callback(e, !e, 'write error', _this.options.canWrite, function () {
                    write(w, cb);
                });
            });
        };
        this.producer(false, function (r1) {
            r1.write(true, function (e, w) {
                callback(e, !e, 'write error', undefined, function () {
                    write(w, function () {
                        w.end();
                        r1.read(true, function (e, r) {
                            callback(e, !e, 'read error', undefined, function () {
                                var fdata = '';
                                r.on('data', function (data) {
                                    fdata += data.toString();
                                });
                                r.on('end', function () {
                                    callback(null, fdata && fdata === value, 'The read value must be the same as the written value');
                                });
                            });
                        });
                    });
                });
            });
        });
    };
    ResourceTester.prototype.mimeType = function (callback) {
        var _this = this;
        callback = this.multiple(callback, 1);
        this.producer(false, function (r1) {
            r1.mimeType(true, function (e) {
                callback(e, !e, 'mimeType error', _this.options.canGetMimeType);
            });
        });
    };
    ResourceTester.prototype.size = function (callback) {
        var _this = this;
        callback = this.multiple(callback, 1);
        if (!this.options.canWrite || !this.options.canGetSize) {
            this.producer(false, function (r1) {
                r1.size(true, function (e, size) {
                    callback(e, !e, 'The size method must fail', _this.options.canGetSize);
                });
            });
            return;
        }
        var value = 'test';
        this.producer(false, function (r1) {
            r1.write(true, function (e, w) {
                callback(e, !e, 'write error', _this.options.canWrite, function () {
                    w.end(value, function (e) {
                        callback(e, !e, 'Writable write error', _this.options.canWrite, function () {
                            r1.size(true, function (e, size) {
                                callback(e, !e, 'size error', _this.options.canGetSize, function () {
                                    callback(null, size === value.length, 'The size value provided by the size method is invalid');
                                });
                            });
                        });
                    });
                });
            });
        });
    };
    ResourceTester.prototype.addChild = function (callback) {
        var _this = this;
        callback = this.multiple(callback, 3);
        this.producer(false, function (r1) {
            _this.producer(false, function (r2) {
                r1.addChild(r2, function (e) {
                    callback(e, !e, 'addChild error adding a produced resource', _this.options.canHaveChildren, function () {
                        callback(null, r2.parent === r1 || !_this.options.canHaveChildren, 'The parent property of child resource is not valid');
                    });
                });
            });
        });
        this.producer(false, function (r1) {
            var vf = new VirtualFolder_1.VirtualFolder('folder');
            r1.addChild(vf, function (e) {
                callback(e, !e, 'addChild error adding a virtual folder', _this.options.canHaveVirtualFolderChildren, function () {
                    callback(null, vf.parent === r1 || !_this.options.canHaveChildren, 'The parent property of child resource is not valid');
                });
            });
        });
        this.producer(false, function (r1) {
            var vf = new VirtualFile_1.VirtualFile('file');
            r1.addChild(vf, function (e) {
                callback(e, !e, 'addChild error adding a virtual file', _this.options.canHaveVirtualFileChildren, function () {
                    callback(null, vf.parent === r1 || !_this.options.canHaveChildren, 'The parent property of child resource is not valid');
                });
            });
        });
    };
    ResourceTester.prototype.removeChild = function (callback) {
        var _this = this;
        callback = this.multiple(callback, 1);
        this.producer(false, function (r1) {
            _this.producer(false, function (r2) {
                r1.addChild(r2, function (e) {
                    callback(e, !e, 'addChild error adding a produced resource', _this.options.canHaveChildren, function () {
                        r1.removeChild(r2, function (e) {
                            callback(e, !e, 'removeChild error removing a produced resource', _this.options.canRemoveChildren, function () {
                                callback(null, !r2.parent, 'The parent property of child resource is not valid, it must be empty (null or undefined)');
                            });
                        });
                    });
                });
            });
        });
    };
    ResourceTester.prototype.getChildren = function (callback) {
        var _this = this;
        callback = this.multiple(callback, 1);
        if (!this.options.canGetChildren) {
            this.producer(false, function (r1) {
                r1.getChildren(function (e, children) {
                    callback(e, !e, 'getChildren must fail', false);
                });
            });
            return;
        }
        this.producer(false, function (r1) {
            _this.producer(false, function (r2) {
                _this.producer(false, function (r3) {
                    r1.addChild(r2, function (e) {
                        callback(e, !e, 'addChild error adding a produced resource', _this.options.canHaveChildren, function () {
                            r1.addChild(r3, function (e) {
                                callback(e, !e, 'addChild error adding a produced resource', _this.options.canHaveChildren, function () {
                                    r1.getChildren(function (e, children) {
                                        callback(e, !e, 'getChildren error', undefined, function () {
                                            var valid = {
                                                r3: false,
                                                r2: false
                                            };
                                            for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                                                var child = children_1[_i];
                                                if (child === r3)
                                                    valid.r3 = true;
                                                else if (child === r2)
                                                    valid.r2 = true;
                                            }
                                            callback(null, valid.r3 && valid.r2, 'At least one of the added resources is not present in the result of getChildren');
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    };
    ResourceTester.prototype.setProperty = function (callback) {
        callback = this.multiple(callback, 2);
        this.producer(false, function (r1) {
            var name = 'prop-test_test:test//test/test.test';
            var value = 'value value.value_value<value>___</value>';
            r1.setProperty(name, value, function (e) {
                callback(e, !e, 'setProperty error', undefined, function () {
                    r1.getProperty('prop-test_test:test//test/test.test', function (e, v) {
                        callback(e, v === value, 'Value returned by getProperty is different of the value provided to setProperty');
                    });
                });
            });
        });
        this.producer(false, function (r1) {
            var name = 'prop-test_test:test//test/test.test';
            var value = XML_1.XML.parse('<actors><actor>Titi</actor><actor>Toto</actor></actors>');
            r1.setProperty(name, value, function (e) {
                callback(e, !e, 'setProperty error', undefined, function () {
                    r1.getProperty('prop-test_test:test//test/test.test', function (e, v) {
                        callback(e, v === value, 'Value returned by getProperty is different of the value provided to setProperty');
                    });
                });
            });
        });
    };
    ResourceTester.prototype.removeProperty = function (callback) {
        callback = this.multiple(callback, 1);
        this.producer(false, function (r1) {
            var name = 'prop-test_test:test//test/test.test';
            var value = 'value';
            r1.setProperty(name, value, function (e) {
                callback(e, !e, 'setProperty error', undefined, function () {
                    r1.removeProperty(name, function (e) {
                        callback(e, !e, 'removeProperty error', undefined, function () {
                            r1.getProperty('prop-test_test:test//test/test.test', function (e, v) {
                                callback(e, !e && !!v, 'The property has not been removed from removeProperty', false);
                            });
                        });
                    });
                });
            });
        });
    };
    ResourceTester.prototype.getProperties = function (callback) {
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
                                                var name_2 = _b[_a];
                                                if (values[name_2] !== undefined)
                                                    valid[name_2] = values[name_2] === props[name_2];
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
    };
    ResourceTester.prototype.creationDate = function (callback) {
        var _this = this;
        callback = this.multiple(callback, 1);
        this.producer(true, function (r1) {
            r1.create(function (e) {
                callback(e, !e, 'create error', _this.options.canBeCreated, function () {
                    r1.creationDate(function (e, date) {
                        callback(e, !e, 'creationDate error', _this.options.canGetCreationDate);
                    });
                });
            });
        });
    };
    ResourceTester.prototype.lastModifiedDate = function (callback) {
        var _this = this;
        callback = this.multiple(callback, 1);
        this.producer(true, function (r1) {
            r1.create(function (e) {
                callback(e, !e, 'create error', _this.options.canBeCreated, function () {
                    r1.lastModifiedDate(function (e, date) {
                        callback(e, !e, 'lastModifiedDate error', _this.options.canGetLastModifiedDate);
                    });
                });
            });
        });
    };
    ResourceTester.prototype.webName = function (callback) {
        callback = this.multiple(callback, 1);
        this.producer(false, function (r1) {
            r1.webName(function (e) {
                callback(e, !e, 'webName error');
            });
        });
    };
    ResourceTester.prototype.type = function (callback) {
        callback = this.multiple(callback, 1);
        this.producer(false, function (r1) {
            r1.type(function (e) {
                callback(e, !e, 'type error');
            });
        });
    };
    return ResourceTester;
}());
ResourceTester.uuid = 0;
exports.ResourceTester = ResourceTester;
