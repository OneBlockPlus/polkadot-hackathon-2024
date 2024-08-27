export declare class Base {
    ptr: number;
    protected offset: number;
    readonly rawPtr: number;
    constructor(ptr: number, memory: WebAssembly.Memory);
}
