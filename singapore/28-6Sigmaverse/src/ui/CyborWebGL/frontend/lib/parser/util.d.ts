export declare const getText: (ptr: number, len: number, memory: WebAssembly.Memory) => string;
export declare const getName: (ptr: number, offset: number, memory: WebAssembly.Memory) => {
    name: string;
    offset: number;
};
