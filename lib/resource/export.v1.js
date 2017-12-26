"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
// Physical resources
__export(require("./v1/physical/PhysicalResource"));
__export(require("./v1/physical/PhysicalGateway"));
__export(require("./v1/physical/PhysicalFolder"));
__export(require("./v1/physical/PhysicalFile"));
// Virtual resources
__export(require("./v1/virtual/VirtualResource"));
__export(require("./v1/virtual/VirtualFolder"));
__export(require("./v1/virtual/VirtualFile"));
// Virtual stored resources
__export(require("./v1/virtualStored/VirtualStoredResource"));
__export(require("./v1/virtualStored/VirtualStoredFolder"));
__export(require("./v1/virtualStored/VirtualStoredFile"));
// Standard classes
__export(require("./v1/std/StandardResource"));
__export(require("./v1/std/ResourceChildren"));
__export(require("./v1/std/RootResource"));
__export(require("./v1/std/resourceTester/ResourceTester"));
__export(require("./v1/std/ResourceWrapper"));
__export(require("./v1/IResource"));
// Locks
__export(require("./v1/lock/LockScope"));
__export(require("./v1/lock/LockKind"));
__export(require("./v1/lock/LockType"));
__export(require("./v1/lock/LockBag"));
__export(require("./v1/lock/Lock"));
