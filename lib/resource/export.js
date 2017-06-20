"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
// Physical resources
__export(require("./physical/PhysicalResource"));
__export(require("./physical/PhysicalFolder"));
__export(require("./physical/PhysicalFile"));
// Virtual resources
__export(require("./virtual/VirtualResource"));
__export(require("./virtual/VirtualFolder"));
__export(require("./virtual/VirtualFile"));
// Virtual stored resources
__export(require("./virtualStored/VirtualStoredResource"));
__export(require("./virtualStored/VirtualStoredFolder"));
__export(require("./virtualStored/VirtualStoredFile"));
// Standard classes
__export(require("./std/StandardResource"));
__export(require("./std/ResourceChildren"));
__export(require("./std/RootResource"));
__export(require("./std/resourceTester/ResourceTester"));
__export(require("./IResource"));
// Locks
__export(require("./lock/LockScope"));
__export(require("./lock/LockKind"));
__export(require("./lock/LockType"));
__export(require("./lock/LockBag"));
__export(require("./lock/Lock"));
