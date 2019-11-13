"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../../../lib/index.js");
var crypto = require("crypto");
exports.default = (function (info, isValid) { return __awaiter(void 0, void 0, void 0, function () {
    var validUser, invalidUser, fileContent, createTree, checkRequest, server;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                validUser = {
                    username: 'test 1',
                    password: 'password test 1'
                };
                invalidUser = {
                    username: 'test 2',
                    password: validUser.password
                };
                fileContent = 'Hello!';
                createTree = function (server) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2, new Promise(function (resolve, reject) {
                                var userManager = new index_js_1.v2.SimpleUserManager();
                                var user = userManager.addUser(validUser.username, validUser.password, false);
                                server.httpAuthentication = new index_js_1.v2.HTTPDigestAuthentication(userManager);
                                server.privilegeManager = new index_js_1.v2.SimplePathPrivilegeManager();
                                server.options.privilegeManager = server.privilegeManager;
                                server.privilegeManager.setRights(user, '/', ['all']);
                                server.rootFileSystem().addSubTree(index_js_1.v2.ExternalRequestContext.create(server), {
                                    'folder1': {
                                        'emptyFolder2': index_js_1.v2.ResourceType.Directory,
                                        'file2': fileContent
                                    },
                                    'file1': fileContent
                                }, function (e) {
                                    if (e)
                                        reject(e);
                                    else
                                        resolve();
                                });
                            })];
                    });
                }); };
                checkRequest = function (server, userInfo, path, httpCode) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2, new Promise(function (resolve, reject) {
                                var md5 = function (data) {
                                    return crypto.createHash('md5').update(data).digest('hex');
                                };
                                userInfo = JSON.parse(JSON.stringify(userInfo));
                                userInfo.uri = userInfo.uri || path;
                                userInfo.realm = userInfo.realm || 'realm';
                                var ha1 = md5(userInfo.username + ":" + userInfo.realm + ":" + userInfo.password);
                                var ha2 = md5("PROPFIND:" + userInfo.uri);
                                var nonce = 'dcd98b7102dd2f0e8b11d0f600bfb0c093';
                                var response = md5(ha1 + ":" + nonce + ":00000001:0a4f113b:auth:" + ha2);
                                info.req({
                                    url: 'http://localhost:' + server.options.port + path,
                                    method: 'PROPFIND',
                                    headers: {
                                        Depth: 0,
                                        Authorization: "Digest username=\"" + userInfo.username + "\", realm=\"" + userInfo.realm + "\", nonce=\"" + nonce + "\", uri=\"" + userInfo.uri + "\", qop=auth, nc=00000001, cnonce=\"0a4f113b\", response=\"" + response + "\", opaque=\"5ccc069c403ebaf9f0171e9517f40e41\""
                                    }
                                }, httpCode, function () {
                                    resolve();
                                });
                            })];
                    });
                }); };
                server = info.init(1);
                return [4, createTree(server)];
            case 1:
                _a.sent();
                return [4, checkRequest(server, {
                        username: validUser.username,
                        password: validUser.password
                    }, '/', index_js_1.v2.HTTPCodes.MultiStatus)];
            case 2:
                _a.sent();
                return [4, checkRequest(server, {
                        username: validUser.username,
                        password: validUser.password
                    }, '/folder1', index_js_1.v2.HTTPCodes.MultiStatus)];
            case 3:
                _a.sent();
                return [4, checkRequest(server, {
                        username: validUser.username,
                        password: validUser.password
                    }, '/folder1/', index_js_1.v2.HTTPCodes.MultiStatus)];
            case 4:
                _a.sent();
                return [4, checkRequest(server, {
                        username: validUser.username,
                        password: validUser.password,
                        uri: '/folder1/'
                    }, '/folder1', index_js_1.v2.HTTPCodes.MultiStatus)];
            case 5:
                _a.sent();
                return [4, checkRequest(server, {
                        username: validUser.username,
                        password: validUser.password,
                        uri: '/folder1'
                    }, '/folder1/', index_js_1.v2.HTTPCodes.MultiStatus)];
            case 6:
                _a.sent();
                return [4, checkRequest(server, {
                        username: invalidUser.username,
                        password: invalidUser.password
                    }, '/', index_js_1.v2.HTTPCodes.Unauthorized)];
            case 7:
                _a.sent();
                return [4, checkRequest(server, {
                        username: invalidUser.username,
                        password: invalidUser.password
                    }, '/folder1', index_js_1.v2.HTTPCodes.Unauthorized)];
            case 8:
                _a.sent();
                return [4, checkRequest(server, {
                        username: invalidUser.username,
                        password: invalidUser.password
                    }, '/folder1/', index_js_1.v2.HTTPCodes.Unauthorized)];
            case 9:
                _a.sent();
                return [4, checkRequest(server, {
                        username: invalidUser.username,
                        password: invalidUser.password,
                        uri: '/folder1/'
                    }, '/folder1', index_js_1.v2.HTTPCodes.Unauthorized)];
            case 10:
                _a.sent();
                return [4, checkRequest(server, {
                        username: invalidUser.username,
                        password: invalidUser.password,
                        uri: '/folder1'
                    }, '/folder1/', index_js_1.v2.HTTPCodes.Unauthorized)];
            case 11:
                _a.sent();
                isValid(true);
                return [2];
        }
    });
}); });
