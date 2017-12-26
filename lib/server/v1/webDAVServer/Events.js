"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getEventBag(_this, event) {
    if (!_this.__events)
        _this.__events = {};
    if (event && !_this.__events[event]) {
        _this.__events[event] = {
            all: [],
            named: {}
        };
        return _this.__events[event];
    }
    return event ? _this.__events[event] : _this.__events;
}
function invoke(event, arg, subjectResource, details) {
    var events = getEventBag(this, event);
    events.all.forEach(function (e) { return process.nextTick(function () { return e(arg, subjectResource, details); }); });
}
exports.invoke = invoke;
function register(event, listener) {
    var events = getEventBag(this, event);
    events.all.push(listener);
}
exports.register = register;
function registerWithName(event, name, listener) {
    var events = getEventBag(this, event);
    events.all.push(listener);
    events.named[name] = listener;
}
exports.registerWithName = registerWithName;
function clear(event) {
    var events = getEventBag(this, event);
    events.all = [];
    events.named = {};
}
exports.clear = clear;
function clearAll(event) {
    this.__events = {};
}
exports.clearAll = clearAll;
function remove(event, listener) {
    var events = getEventBag(this, event);
    events.all.indexOf(listener);
}
exports.remove = remove;
function removeByName(event, name) {
    var events = getEventBag(this, event);
    var listener = events.named[name];
    if (listener) {
        delete events.named[name];
        events.all.splice(events.all.indexOf(listener), 1);
    }
}
exports.removeByName = removeByName;
