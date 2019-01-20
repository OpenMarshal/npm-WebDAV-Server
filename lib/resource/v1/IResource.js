"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require("crypto");
var ResourceType = /** @class */ (function () {
    function ResourceType(isFile, isDirectory) {
        this.isFile = isFile;
        this.isDirectory = isDirectory;
    }
    ResourceType.File = new ResourceType(true, false);
    ResourceType.Directory = new ResourceType(false, true);
    ResourceType.Hibrid = new ResourceType(true, true);
    ResourceType.NoResource = new ResourceType(false, false);
    return ResourceType;
}());
exports.ResourceType = ResourceType;
var ETag = /** @class */ (function () {
    function ETag() {
    }
    ETag.createETag = function (date) {
        return '"' + crypto.createHash('md5').update(date.toString()).digest('hex') + '"';
    };
    return ETag;
}());
exports.ETag = ETag;
