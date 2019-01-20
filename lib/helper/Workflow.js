"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Workflow = /** @class */ (function () {
    function Workflow(exitOnError) {
        if (exitOnError === void 0) { exitOnError = true; }
        this.exitOnError = !!exitOnError;
        this.intermediateFn = null;
        this.counter = 0;
        this.data = [];
        this.errorFn = null;
        this.doneFn = null;
        this.started = false;
    }
    Workflow.prototype._done = function (subject, e, data) {
        var _this = this;
        if (this.counter <= 0)
            return;
        if (e) {
            if (this.exitOnError)
                this.counter = -1000;
            if (this.errorFn)
                process.nextTick(function () { return _this.errorFn(e); });
            if (this.exitOnError) {
                this.started = false;
                return;
            }
        }
        if (this.intermediateFn)
            this.intermediateFn(subject, e, data);
        --this.counter;
        this.data.push(data);
        if (this.counter === 0 && this.doneFn) {
            this.started = false;
            process.nextTick(function () { return _this.doneFn(_this.data); });
        }
        if (data && this.firstFn) {
            this.counter = -1;
            this.started = false;
            process.nextTick(function () { return _this.firstFn(data); });
        }
        if (this.counter === 0 && this.notFound) {
            this.started = false;
            process.nextTick(function () { return _this.notFound(); });
        }
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
            _this.started = true;
            var _loop_1 = function (name_1) {
                process.nextTick(function () {
                    if (!_this.started)
                        return;
                    fn(name_1, object[name_1], function (e, d) {
                        var _a;
                        return _this._done((_a = {}, _a[name_1] = object[name_1], _a), e, d);
                    });
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
    Workflow.prototype.first = function (fn, notFound) {
        var _this = this;
        this.firstFn = fn;
        if (this.counter === 0)
            process.nextTick(function () { return _this.notFound(); });
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
var WorkflowUnique = /** @class */ (function (_super) {
    __extends(WorkflowUnique, _super);
    function WorkflowUnique() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WorkflowUnique.prototype._done = function (subject, e, data) {
        _super.prototype._done.call(this, subject, e, data);
        var filtered = this.data.filter(function (d) { return !!d; });
        if (this.counter !== 0 && filtered.length === 1) {
            var _doneFs = this.doneFn;
            this.doneFn = function () { };
            _doneFs.bind(this)(filtered[0]);
        }
    };
    return WorkflowUnique;
}(Workflow));
exports.WorkflowUnique = WorkflowUnique;
