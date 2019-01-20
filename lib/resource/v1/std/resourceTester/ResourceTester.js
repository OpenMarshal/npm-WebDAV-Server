"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var actions = require("./Actions");
var children = require("./Children");
var content = require("./Content");
var locks = require("./Locks");
var properties = require("./Properties");
var stdMetaData = require("./StdMetaData");
var DefaultResourceTesterOptions = /** @class */ (function () {
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
        this.canLock = true;
    }
    return DefaultResourceTesterOptions;
}());
var ResourceTester = /** @class */ (function () {
    function ResourceTester(options, producer) {
        this.options = options;
        this.producer = producer;
        // ****************************** Actions ****************************** //
        this.create = actions.create;
        this.delete = actions.deleteResource;
        this.moveTo = actions.moveTo;
        this.rename = actions.rename;
        // ****************************** Content ****************************** //
        this.writeRead = content.writeRead;
        this.mimeType = content.mimeType;
        this.size = content.size;
        // ****************************** Locks ****************************** //
        this.lock = locks.lock;
        // ****************************** Children ****************************** //
        this.addChild = children.addChild;
        this.removeChild = children.removeChild;
        this.getChildren = children.getChildren;
        // ****************************** Properties ****************************** //
        this.setProperty = properties.setProperty;
        this.removeProperty = properties.removeProperty;
        this.getProperties = properties.getProperties;
        // ****************************** Std meta-data ****************************** //
        this.creationDate = stdMetaData.creationDate;
        this.lastModifiedDate = stdMetaData.lastModifiedDate;
        this.webName = stdMetaData.webName;
        this.type = stdMetaData.type;
        var def = new DefaultResourceTesterOptions();
        for (var _i = 0, _a = Object.keys(def); _i < _a.length; _i++) {
            var name_1 = _a[_i];
            if (this.options[name_1] === undefined)
                this.options[name_1] = def[name_1];
        }
    }
    ResourceTester.prototype.uuid = function () {
        return ++ResourceTester.uuid;
    };
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
        test('lock');
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
    ResourceTester.uuid = 0;
    return ResourceTester;
}());
exports.ResourceTester = ResourceTester;
