"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ResourceType = /** @class */ (function () {
    function ResourceType(isFile, isDirectory) {
        this.isFile = isFile;
        this.isDirectory = isDirectory;
    }
    ResourceType.File = new ResourceType(true, false);
    ResourceType.Directory = new ResourceType(false, true);
    ResourceType.Hybrid = new ResourceType(true, true);
    ResourceType.NoResource = new ResourceType(false, false);
    return ResourceType;
}());
exports.ResourceType = ResourceType;
