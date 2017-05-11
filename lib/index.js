"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebDAVServer_1 = require("./server/WebDAVServer");
var serv = new WebDAVServer_1.WebDAVServer();
serv.beforeRequest(function (arg, next) {
    console.log(arg.uri);
    next();
});
serv.afterRequest(function (arg, next) {
    console.log('after');
    next();
});
serv.start(1900);
