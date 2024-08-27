import { FuncParam, Service } from './service.js';
import { Type } from './types.js';
import { Base } from './visitor.js';
export declare class Program {
    private _services;
    private _types;
    private _context;
    private _ctor;
    constructor();
    addService(service: Service): void;
    addType(type: Type): number;
    get services(): Service[];
    get ctor(): Ctor;
    getType(id: number): Type;
    getContext(id: number): any;
    addContext(id: number, ctx: any): void;
    get types(): Type[];
    getTypeByName(name: string): Type;
    addCtor(ctor: Ctor): void;
}
export declare class Ctor extends Base {
    readonly funcs: CtorFunc[];
    constructor(ptr: number, memory: WebAssembly.Memory);
    addFunc(func: CtorFunc): void;
}
export declare class CtorFunc extends Base {
    private _params;
    readonly name: string;
    constructor(ptr: number, memory: WebAssembly.Memory);
    addFuncParam(ptr: number, param: FuncParam): void;
    get params(): FuncParam[];
}
