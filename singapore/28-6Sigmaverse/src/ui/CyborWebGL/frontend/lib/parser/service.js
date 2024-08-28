import { EnumVariant, WithDef } from './types.js';
import { getName } from './util.js';
import { Base } from './visitor.js';

class Service extends Base {
    funcs;
    events;
    name;
    constructor(ptr, memory) {
        super(ptr, memory);
        const { name, offset } = getName(ptr, this.offset, memory);
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
class ServiceEvent extends EnumVariant {
}
class ServiceFunc extends WithDef {
    name;
    isQuery;
    _params;
    constructor(ptr, memory) {
        super(ptr, memory);
        const { name, offset } = getName(ptr, this.offset, memory);
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
class FuncParam extends WithDef {
    name;
    constructor(ptr, memory) {
        super(ptr, memory);
        const { name, offset } = getName(ptr, this.offset, memory);
        this.name = name;
        this.offset = offset;
    }
}

export { FuncParam, Service, ServiceEvent, ServiceFunc };
