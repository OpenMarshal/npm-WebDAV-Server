"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var PhysicalFSManager_1 = require("../../../manager/v1/PhysicalFSManager");
var StandardResource_1 = require("../std/StandardResource");
var Errors_1 = require("../../../Errors");
var path = require("path");
var fs = require("fs");
var PhysicalResource = /** @class */ (function (_super) {
    __extends(PhysicalResource, _super);
    function PhysicalResource(realPath, parent, fsManager) {
        var _this = this;
        if (!fsManager)
            if (parent && parent.fsManager && parent.fsManager.constructor === PhysicalFSManager_1.PhysicalFSManager)
                fsManager = parent.fsManager;
            else
                fsManager = new PhysicalFSManager_1.PhysicalFSManager();
        _this = _super.call(this, parent, fsManager) || this;
        _this.removeOnUnavailableSource = false;
        _this.deleteOnMoved = false;
        _this.realPath = path.resolve(realPath);
        _this.name = path.basename(_this.realPath);
        return _this;
    }
    PhysicalResource.prototype.manageError = function (error) {
        if (!this.removeOnUnavailableSource || !error)
            return error;
        this.removeFromParent(function (e) { });
        return Errors_1.Errors.MustIgnore;
    };
    PhysicalResource.prototype.wrapCallback = function (callback) {
        var _this = this;
        return (function (e, arg1, arg2) { return callback(_this.manageError(e), arg1, arg2); });
    };
    PhysicalResource.prototype.moveTo = function (parent, newName, overwrite, callback) {
        var _this = this;
        callback = this.wrapCallback(callback);
        var pRealPath = parent.realPath;
        if (!(parent.fsManager && this.fsManager && parent.fsManager.uid === this.fsManager.uid && pRealPath)) {
            StandardResource_1.StandardResource.standardMoveByCopy(this, parent, newName, overwrite, this.deleteOnMoved, callback);
            return;
        }
        var newRealPath = path.join(pRealPath, newName);
        fs.rename(this.realPath, newRealPath, function (e) {
            if (e) {
                callback(e);
                return;
            }
            _this.realPath = newRealPath;
            _this.name = path.basename(_this.realPath);
            _this.removeFromParent(function (e) {
                if (e) {
                    callback(e);
                    return;
                }
                _this.addToParent(parent, callback);
            });
        });
    };
    PhysicalResource.prototype.rename = function (newName, callback) {
        var _this = this;
        callback = this.wrapCallback(callback);
        var newPath = path.join(this.realPath, '..', newName);
        fs.rename(this.realPath, newPath, function (e) {
            if (e) {
                callback(_this.manageError(e), null, null);
                return;
            }
            var oldName = path.basename(_this.realPath);
            _this.realPath = newPath;
            _this.name = newName;
            _this.updateLastModified();
            callback(null, oldName, newName);
        });
    };
    // ****************************** Std meta-data ****************************** //
    PhysicalResource.prototype.webName = function (callback) {
        callback = this.wrapCallback(callback);
        callback(null, path.basename(this.name));
    };
    return PhysicalResource;
}(StandardResource_1.StandardResource));
exports.PhysicalResource = PhysicalResource;
