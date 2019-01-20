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
var VirtualResource_1 = require("../virtual/VirtualResource");
var VirtualStoredResource = /** @class */ (function (_super) {
    __extends(VirtualStoredResource, _super);
    function VirtualStoredResource(name, parent, fsManager) {
        var _this = this;
        if (!fsManager)
            if (parent && parent.fsManager && parent.fsManager.constructor.name === 'VirtualStoredFSManager')
                fsManager = parent.fsManager;
            else
                throw new Error('Cannot create a default FSManager for this resource');
        _this = _super.call(this, name, parent, fsManager) || this;
        return _this;
    }
    return VirtualStoredResource;
}(VirtualResource_1.VirtualResource));
exports.VirtualStoredResource = VirtualStoredResource;
