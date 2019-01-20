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
var SimpleResourceWrapper = /** @class */ (function () {
    function SimpleResourceWrapper(resource, data) {
        this.resource = resource;
        this.data = data;
    }
    Object.defineProperty(SimpleResourceWrapper.prototype, "fsManager", {
        get: function () {
            return this.resource.fsManager;
        },
        set: function (fsManager) {
            this.resource.fsManager = fsManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SimpleResourceWrapper.prototype, "parent", {
        get: function () {
            return this.resource.parent;
        },
        set: function (parent) {
            this.resource.parent = parent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SimpleResourceWrapper.prototype, "_isWrapper", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    // ****************************** Actions ****************************** //
    SimpleResourceWrapper.prototype.create = function (callback) { this._invoke('create', [callback]); };
    SimpleResourceWrapper.prototype.delete = function (callback) { this._invoke('delete', [callback]); };
    SimpleResourceWrapper.prototype.moveTo = function (parent, newName, overwrite, callback) { this._invoke('moveTo', [parent, newName, overwrite, callback]); };
    SimpleResourceWrapper.prototype.rename = function (newName, callback) { this._invoke('rename', [newName, callback]); };
    // ****************************** Content ****************************** //
    SimpleResourceWrapper.prototype.write = function (targetSource, callback, finalSize) { this._invoke('write', [targetSource, callback, finalSize]); };
    SimpleResourceWrapper.prototype.read = function (targetSource, callback) { this._invoke('read', [targetSource, callback]); };
    SimpleResourceWrapper.prototype.mimeType = function (targetSource, callback) { this._invoke('mimeType', [targetSource, callback]); };
    SimpleResourceWrapper.prototype.size = function (targetSource, callback) { this._invoke('size', [targetSource, callback]); };
    // ****************************** Locks ****************************** //
    SimpleResourceWrapper.prototype.getLocks = function (callback) { this._invoke('getLocks', [callback]); };
    SimpleResourceWrapper.prototype.setLock = function (lock, callback) { this._invoke('setLock', [lock, callback]); };
    SimpleResourceWrapper.prototype.removeLock = function (uuid, callback) { this._invoke('removeLock', [uuid, callback]); };
    SimpleResourceWrapper.prototype.getAvailableLocks = function (callback) { this._invoke('getAvailableLocks', [callback]); };
    SimpleResourceWrapper.prototype.getLock = function (uuid, callback) { this._invoke('getLock', [uuid, callback]); };
    // ****************************** Children ****************************** //
    SimpleResourceWrapper.prototype.addChild = function (resource, callback) { this._invoke('addChild', [resource, callback]); };
    SimpleResourceWrapper.prototype.removeChild = function (resource, callback) { this._invoke('removeChild', [resource, callback]); };
    SimpleResourceWrapper.prototype.getChildren = function (callback) { this._invoke('getChildren', [callback]); };
    // ****************************** Properties ****************************** //
    SimpleResourceWrapper.prototype.setProperty = function (name, value, callback) { this._invoke('setProperty', [name, value, callback]); };
    SimpleResourceWrapper.prototype.getProperty = function (name, callback) { this._invoke('getProperty', [name, callback]); };
    SimpleResourceWrapper.prototype.removeProperty = function (name, callback) { this._invoke('removeProperty', [name, callback]); };
    SimpleResourceWrapper.prototype.getProperties = function (callback) { this._invoke('getProperties', [callback]); };
    // ****************************** Std meta-data ****************************** //
    SimpleResourceWrapper.prototype.creationDate = function (callback) { this._invoke('creationDate', [callback]); };
    SimpleResourceWrapper.prototype.lastModifiedDate = function (callback) { this._invoke('lastModifiedDate', [callback]); };
    SimpleResourceWrapper.prototype.webName = function (callback) { this._invoke('webName', [callback]); };
    SimpleResourceWrapper.prototype.type = function (callback) { this._invoke('type', [callback]); };
    SimpleResourceWrapper.prototype.displayName = function (callback) {
        if (this.resource.displayName)
            this._invoke('displayName', [callback]);
        else
            this._invoke('webName', [callback]);
    };
    Object.defineProperty(SimpleResourceWrapper.prototype, "gateway", {
        // ****************************** Gateway ****************************** //
        get: function () {
            return this.resource.gateway;
        },
        enumerable: true,
        configurable: true
    });
    SimpleResourceWrapper.prototype._invoke = function (name, args) {
        args.push(this.data);
        this.resource[name].call(this.resource, args);
    };
    return SimpleResourceWrapper;
}());
exports.SimpleResourceWrapper = SimpleResourceWrapper;
var ResourceWrapper = /** @class */ (function (_super) {
    __extends(ResourceWrapper, _super);
    function ResourceWrapper(resource, ctx, data) {
        var _this = _super.call(this, resource, data) || this;
        for (var name_1 in resource)
            if (name_1 !== 'gateway' && name_1 !== '_invoke' && name_1 !== '_isWrapper' && name_1 !== 'parent' && name_1 !== 'fsManager')
                _this[name_1] = resource[name_1];
        return _this;
    }
    ResourceWrapper.prototype._invoke = function (name, args) {
        args.push(this.data);
        this.resource[name].call(this, args);
    };
    return ResourceWrapper;
}(SimpleResourceWrapper));
exports.ResourceWrapper = ResourceWrapper;
