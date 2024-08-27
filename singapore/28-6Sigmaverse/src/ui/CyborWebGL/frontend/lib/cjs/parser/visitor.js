class Base {
    ptr;
    offset;
    rawPtr;
    constructor(ptr, memory) {
        this.ptr = ptr;
        const rawPtrBuf = new Uint8Array(memory.buffer.slice(ptr, ptr + 4));
        const rawPtrDv = new DataView(rawPtrBuf.buffer, 0);
        this.rawPtr = rawPtrDv.getUint32(0, true);
        this.offset = 4;
    }
}

exports.Base = Base;
