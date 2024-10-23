import { EnumVariant, WithDef } from './types.js';
import { Base } from './visitor.js';
export declare class Service extends Base {
    readonly funcs: ServiceFunc[];
    readonly events: ServiceEvent[];
    readonly name: string;
    constructor(ptr: number, memory: WebAssembly.Memory);
    addFunc(func: ServiceFunc): void;
    addEvent(event: ServiceEvent): void;
}
export declare class ServiceEvent extends EnumVariant {
}
export declare class ServiceFunc extends WithDef {
    readonly name: string;
    readonly isQuery: boolean;
    private _params;
    constructor(ptr: number, memory: WebAssembly.Memory);
    addFuncParam(ptr: number, param: FuncParam): void;
    get params(): FuncParam[];
}
export declare class FuncParam extends WithDef {
    readonly name: string;
    constructor(ptr: number, memory: WebAssembly.Memory);
}
