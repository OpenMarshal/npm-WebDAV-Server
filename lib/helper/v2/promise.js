"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function promisifyCall(call) {
    return new Promise(function (resolve, reject) {
        call(function (e, result) {
            if (e)
                reject(e);
            else
                resolve(result);
        });
    });
}
exports.promisifyCall = promisifyCall;
function ensureValue(variable, value) {
    if (variable === null || variable === undefined) {
        return value;
    }
    else {
        return variable;
    }
}
exports.ensureValue = ensureValue;
