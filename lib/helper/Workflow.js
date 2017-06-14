"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Workflow = (function () {
    function Workflow(exitOnError) {
        if (exitOnError === void 0) { exitOnError = true; }
        this.exitOnError = !!exitOnError;
        this.intermediateFn = null;
        this.counter = 0;
        this.data = [];
        this.errorFn = null;
        this.doneFn = null;
    }
    Workflow.prototype._done = function (subject, e, data) {
        if (this.counter <= 0)
            return;
        if (e) {
            if (this.exitOnError)
                this.counter = -1000;
            if (this.errorFn)
                this.errorFn(e);
            if (this.exitOnError)
                return;
        }
        if (this.intermediateFn)
            this.intermediateFn(subject, e, data);
        --this.counter;
        this.data.push(data);
        if (this.counter === 0 && this.doneFn)
            this.doneFn(this.data);
    };
    Workflow.prototype.each = function (subjects, fn) {
        var _this = this;
        this.counter = subjects.length;
        subjects.forEach(function (s) { return process.nextTick(function () { return fn(s, function (e, d) { return _this._done(s, e, d); }); }); });
        return this;
    };
    Workflow.prototype.eachProperties = function (object, fn) {
        var _this = this;
        this.counter = Object.keys(object).length;
        process.nextTick(function () {
            var _loop_1 = function (name_1) {
                fn(name_1, object[name_1], function (e, d) {
                    return _this._done((_a = {}, _a[name_1] = object[name_1], _a), e, d);
                    var _a;
                });
            };
            for (var name_1 in object) {
                _loop_1(name_1);
            }
        });
        return this;
    };
    Workflow.prototype.intermediate = function (fn) {
        this.intermediateFn = fn;
        return this;
    };
    Workflow.prototype.error = function (fn) {
        this.errorFn = fn;
        return this;
    };
    Workflow.prototype.done = function (fn) {
        var _this = this;
        this.doneFn = fn;
        if (this.counter === 0)
            process.nextTick(function () { return _this.doneFn(_this.data); });
        return this;
    };
    return Workflow;
}());
exports.Workflow = Workflow;
