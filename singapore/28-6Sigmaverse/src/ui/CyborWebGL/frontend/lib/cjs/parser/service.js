var types = require('./types.js');
var util = require('./util.js');
var visitor = require('./visitor.js');

class Service extends visitor.Base {
    funcs;
    events;
    name;
    constructor(ptr, memory) {
        super(ptr, memory);
        const { name, offset } = util.getName(ptr, this.offset, memory);
        this.name = name || 'Service';
        this.offset = offset;
        this.funcs = [];
        this.events = [];
    }
    addFunc(func) {
        this.funcs.push(func);
    }
    addEvent(event) {
        this.events.push(event);
    }
}
class ServiceEvent extends types.EnumVariant {
}
class ServiceFunc extends types.WithDef {
    name;
    isQuery;
    _params;
    constructor(ptr, memory) {
        super(ptr, memory);
        const { name, offset } = util.getName(ptr, this.offset, memory);
        this.name = name;
        this.offset = offset;
        const is_query_buf = new Uint8Array(memory.buffer.slice(ptr + this.offset, ptr + this.offset + 1));
        const is_query_dv = new DataView(is_query_buf.buffer, 0);
        this.isQuery = is_query_dv.getUint8(0) === 1;
        this._params = new Map();
    }
    addFuncParam(ptr, param) {
        this._params.set(ptr, param);
    }
    get params() {
        if (this._params.size === 0)
            return [];
        return Array.from(this._params.values());
    }
}
class FuncParam extends types.WithDef {
    name;
    constructor(ptr, memory) {
        super(ptr, memory);
        const { name, offset } = util.getName(ptr, this.offset, memory);
        this.name = name;
        this.offset = offset;
    }
}

exports.FuncParam = FuncParam;
exports.Service = Service;
exports.ServiceEvent = ServiceEvent;
exports.ServiceFunc = ServiceFunc;
