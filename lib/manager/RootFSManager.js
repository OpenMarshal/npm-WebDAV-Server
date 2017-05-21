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
var VirtualFSManager_1 = require("./VirtualFSManager");
var RootResource_1 = require("../resource/std/RootResource");
var RootFSManager = (function (_super) {
    __extends(RootFSManager, _super);
    function RootFSManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.uid = 'RootFSManager_1.0.2';
        return _this;
    }
    RootFSManager.prototype.serialize = function (resource, obj) {
        return {
            dateCreation: resource.dateCreation,
            dateLastModified: resource.dateLastModified,
            locks: resource.lockBag.locks,
            properties: resource.properties
        };
    };
    RootFSManager.prototype.unserialize = function (data, obj) {
        var rs = new RootResource_1.RootResource();
        rs.dateCreation = data.dateCreation;
        rs.dateLastModified = data.dateLastModified;
        rs.lockBag.locks = data.locks;
        rs.properties = data.properties;
        return rs;
    };
    return RootFSManager;
}(VirtualFSManager_1.VirtualFSManager));
exports.RootFSManager = RootFSManager;
