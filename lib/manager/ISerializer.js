"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SerializedObject = (function () {
    function SerializedObject(managerUID, type) {
        this.managerUID = managerUID;
        this.children = [];
        this.type = type;
    }
    return SerializedObject;
}());
exports.SerializedObject = SerializedObject;
function unserialize(obj, managers, callback) {
    var _loop_1 = function (m) {
        if (m.uid === obj.managerUID) {
            var resource_1 = m.unserialize(obj.data, obj);
            if (!obj.children || obj.children.length === 0) {
                callback(null, resource_1);
                return { value: void 0 };
            }
            var nb_1 = obj.children.length;
            var go_1 = function (e) {
                if (nb_1 <= 0)
                    return;
                if (e) {
                    nb_1 = -1;
                    callback(e, resource_1);
                    return;
                }
                --nb_1;
                if (nb_1 === 0)
                    callback(null, resource_1);
            };
            obj.children.forEach(function (c) { return unserialize(c, managers, function (e, r) {
                if (e)
                    go_1(e);
                else
                    resource_1.addChild(r, go_1);
            }); });
            return { value: void 0 };
        }
    };
    for (var _i = 0, managers_1 = managers; _i < managers_1.length; _i++) {
        var m = managers_1[_i];
        var state_1 = _loop_1(m);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    callback(new Error('Cannot find the manager : ' + obj.managerUID), null);
}
exports.unserialize = unserialize;
function serialize(resource, callback) {
    resource.type(function (e, type) {
        var obj = new SerializedObject(resource.fsManager.uid, type);
        obj.data = resource.fsManager.serialize(resource, obj);
        if (!type.isDirectory) {
            callback(null, obj);
            return;
        }
        resource.getChildren(function (e, children) {
            if (e) {
                callback(e, obj);
                return;
            }
            if (children.length === 0) {
                callback(null, obj);
                return;
            }
            var nb = children.length;
            function go(error, subObj) {
                if (nb <= 0)
                    return;
                if (error) {
                    nb = -1;
                    callback(error, obj);
                    return;
                }
                obj.children.push(subObj);
                --nb;
                if (nb === 0)
                    callback(null, obj);
            }
            children.forEach(function (c) { return serialize(c, go); });
        });
    });
}
exports.serialize = serialize;
