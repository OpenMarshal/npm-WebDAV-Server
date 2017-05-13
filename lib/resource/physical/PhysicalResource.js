"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var PhysicalFSManager_1 = require("../../manager/PhysicalFSManager");
var StandardResource_1 = require("../std/StandardResource");
var path = require("path");
var fs = require("fs");
var PhysicalResource = (function (_super) {
    __extends(PhysicalResource, _super);
    function PhysicalResource(realPath, parent, fsManager) {
        var _this = this;
        if (!fsManager)
            if (parent && parent.fsManager && parent.fsManager.constructor === PhysicalFSManager_1.PhysicalFSManager)
                fsManager = parent.fsManager;
            else
                fsManager = PhysicalFSManager_1.PhysicalFSManager.instance();
        _this = _super.call(this, parent, fsManager) || this;
        _this.realPath = path.resolve(realPath);
        return _this;
    }
    PhysicalResource.prototype.moveTo = function (to, callback) {
        callback(new Error('Not implemented yet.'), null, null);
    };
    PhysicalResource.prototype.rename = function (newName, callback) {
        var _this = this;
        var newPath = path.join(this.realPath, '..', newName);
        fs.rename(this.realPath, newPath, function (e) {
            if (e) {
                callback(e, null, null);
                return;
            }
            var oldName = path.basename(_this.realPath);
            _this.realPath = newPath;
            _this.updateLastModified();
            callback(e, oldName, newName);
        });
    };
    PhysicalResource.prototype.webName = function (callback) {
        callback(null, path.basename(this.realPath));
    };
    return PhysicalResource;
}(StandardResource_1.StandardResource));
exports.PhysicalResource = PhysicalResource;
