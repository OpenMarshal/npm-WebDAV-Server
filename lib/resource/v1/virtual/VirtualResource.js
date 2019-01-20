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
var VirtualFSManager_1 = require("../../../manager/v1/VirtualFSManager");
var StandardResource_1 = require("../std/StandardResource");
var VirtualResource = /** @class */ (function (_super) {
    __extends(VirtualResource, _super);
    function VirtualResource(name, parent, fsManager) {
        var _this = this;
        if (!fsManager)
            if (parent && parent.fsManager && parent.fsManager.constructor === VirtualFSManager_1.VirtualFSManager)
                fsManager = parent.fsManager;
            else
                fsManager = new VirtualFSManager_1.VirtualFSManager();
        _this = _super.call(this, parent, fsManager) || this;
        _this.name = name;
        return _this;
    }
    // ****************************** Actions ****************************** //
    VirtualResource.prototype.create = function (callback) {
        callback(null);
    };
    VirtualResource.prototype.delete = function (callback) {
        this.removeFromParent(callback);
    };
    VirtualResource.prototype.rename = function (newName, callback) {
        var oldName = this.name;
        this.name = newName;
        callback(null, oldName, newName);
    };
    // ****************************** Std meta-data ****************************** //
    VirtualResource.prototype.webName = function (callback) {
        callback(null, this.name);
    };
    return VirtualResource;
}(StandardResource_1.StandardResource));
exports.VirtualResource = VirtualResource;
