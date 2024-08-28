import { Program } from './program.js';
export declare class WasmParser {
    private _memory;
    private _instance;
    private _exports;
    private _encoder;
    private _program;
    private _memPtr;
    private _idlLen;
    private _numberOfGrownPages;
    constructor();
    private _decompressWasm;
    init(): Promise<this>;
    static new(): Promise<WasmParser>;
    private fillMemory;
    private clearMemory;
    private readString;
    parse(idl: string): Program;
    private handleAcceptError;
}
