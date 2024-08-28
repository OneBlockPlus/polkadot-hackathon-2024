import { getName } from './util.js';
import { Base } from './visitor.js';

class Program {
    _services;
    _types;
    _context;
    _ctor;
    constructor() {
        this._services = [];
        this._types = new Map();
        this._context = new Map();
    }
    addService(service) {
        this._services.push(service);
    }
    addType(type) {
        const id = type.rawPtr;
        this._types.set(id, type);
        this._context.set(id, type);
        return id;
    }
    get services() {
        return this._services;
    }
    get ctor() {
        return this._ctor;
    }
    getType(id) {
        return this._types.get(id);
    }
    getContext(id) {
        return this._context.get(id);
    }
    addContext(id, ctx) {
        this._context.set(id, ctx);
    }
    get types() {
        return Array.from(this._types.values());
    }
    getTypeByName(name) {
        const types = this.types.filter((type) => type.name === name);
        if (types.length > 1)
            throw new Error(`multiple types found with name ${name}`);
        if (types.length === 0)
            throw new Error(`no type found with name ${name}`);
        return types[0];
    }
    addCtor(ctor) {
        this._ctor = ctor;
    }
}
class Ctor extends Base {
    funcs;
    constructor(ptr, memory) {
        super(ptr, memory);
        this.funcs = [];
    }
    addFunc(func) {
        this.funcs.push(func);
    }
}
class CtorFunc extends Base {
    _params;
    name;
    constructor(ptr, memory) {
        super(ptr, memory);
        const { name, offset } = getName(ptr, this.offset, memory);
        this.name = name;
        this.offset = offset;
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

export { Ctor, CtorFunc, Program };
