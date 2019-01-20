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
var PhysicalFSManager_1 = require("./PhysicalFSManager");
var PhysicalGateway_1 = require("../../resource/v1/physical/PhysicalGateway");
var PhysicalGFSManager = /** @class */ (function (_super) {
    __extends(PhysicalGFSManager, _super);
    function PhysicalGFSManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.uid = 'PhysicalGFSManager_1.0.0';
        return _this;
    }
    PhysicalGFSManager.prototype.serialize = function (resource, obj) {
        if (resource.constructor !== PhysicalGateway_1.PhysicalGateway)
            return null;
        return {
            realPath: resource.realPath,
            dateCreation: resource.dateCreation,
            dateLastModified: resource.dateLastModified,
            properties: resource.properties,
            customName: resource.customName
        };
    };
    PhysicalGFSManager.prototype.unserialize = function (data, obj) {
        var rs = new PhysicalGateway_1.PhysicalGateway(data.realPath, data.customName, null, this);
        rs.dateCreation = data.dateCreation;
        rs.dateLastModified = data.dateLastModified;
        rs.properties = data.properties;
        return rs;
    };
    return PhysicalGFSManager;
}(PhysicalFSManager_1.PhysicalFSManager));
exports.PhysicalGFSManager = PhysicalGFSManager;
