"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyOnEvent = void 0;
function applyOnEvent(result, types, fn) {
    if (result.isInBlock || result.isFinalized) {
        const records = result.filterRecords('contracts', types);
        if (records.length) {
            return fn(records);
        }
    }
    return undefined;
}
exports.applyOnEvent = applyOnEvent;
