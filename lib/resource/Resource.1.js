"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PhysicalResource_1 = require("./physical/PhysicalResource");
exports.PhysicalFile = PhysicalResource_1.PhysicalFile;
exports.PhysicalFolder = PhysicalResource_1.PhysicalFolder;
exports.PhysicalResource = PhysicalResource_1.PhysicalResource;
var VirtualResource_1 = require("./virtual/VirtualResource");
exports.VirtualFile = VirtualResource_1.VirtualFile;
exports.VirtualFolder = VirtualResource_1.VirtualFolder;
exports.VirtualResource = VirtualResource_1.VirtualResource;
var Lock_1 = require("./lock/Lock");
exports.Lock = Lock_1.Lock;
exports.LockBag = Lock_1.LockBag;
exports.LockKind = Lock_1.LockKind;
exports.LockScope = Lock_1.LockScope;
exports.LockType = Lock_1.LockType;
var StandardResource_1 = require("./std/StandardResource");
exports.StandardResource = StandardResource_1.StandardResource;
var ResourceChildren_1 = require("./std/ResourceChildren");
exports.ResourceChildren = ResourceChildren_1.ResourceChildren;
var RootResource_1 = require("./std/RootResource");
exports.RootResource = RootResource_1.RootResource;
var ResourceType = (function () {
    function ResourceType(isFile, isDirectory) {
        this.isFile = isFile;
        this.isDirectory = isDirectory;
    }
    return ResourceType;
}());
ResourceType.File = new ResourceType(true, false);
ResourceType.Directory = new ResourceType(false, true);
ResourceType.Hibrid = new ResourceType(true, true);
ResourceType.NoResource = new ResourceType(false, false);
exports.ResourceType = ResourceType;
