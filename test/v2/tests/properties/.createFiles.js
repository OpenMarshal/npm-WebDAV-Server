"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
function proppatch(server, info, path, expectedStatusCode, bodySet, bodyRemove, callback) {
    var body = '<D:propertyupdate xmlns:D="DAV:" xmlns:Z="http://ns.example.com/standards/z39.50/">';
    if (bodySet && bodySet.length > 0)
        body += '<D:set><D:prop>' + bodySet.join() + '</D:prop></D:set>';
    if (bodyRemove && bodyRemove.length > 0)
        body += '<D:remove><D:prop>' + bodyRemove.join() + '</D:prop></D:remove>';
    body += '</D:propertyupdate>';
    info.reqXML({
        url: 'http://localhost:' + server.options.port + '/' + path,
        method: 'PROPPATCH',
        body: body
    }, expectedStatusCode, function (res, xml) {
        callback(xml);
    });
}
exports.proppatch = proppatch;
function propfind(server, info, path, expectedStatusCode, depth, body, callback) {
    info.reqXML({
        url: 'http://localhost:' + server.options.port + '/' + path,
        method: 'PROPFIND',
        headers: {
            depth: depth
        },
        body: body
    }, expectedStatusCode, function (res, xml) {
        callback(xml);
    });
}
exports.propfind = propfind;
function starter(info, isValid, callback) {
    var server = info.startServer();
    server.rootFileSystem().addSubTree(index_js_1.v2.ExternalRequestContext.create(server), {
        'folder': index_js_1.v2.ResourceType.Directory,
        'file': index_js_1.v2.ResourceType.File
    }, function (e) {
        if (e)
            return isValid(false, 'Cannot call "addSubTree(...)".', e);
        callback(server);
    });
}
exports.starter = starter;
