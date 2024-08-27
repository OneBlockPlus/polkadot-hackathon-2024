const getText = (ptr, len, memory) => {
    const buf = new Uint8Array(memory.buffer.slice(ptr, ptr + len));
    return new TextDecoder().decode(buf);
};
const getName = (ptr, offset, memory) => {
    const name_ptr_buf = new Uint8Array(memory.buffer.slice(ptr + offset, ptr + offset + 4));
    offset += 4;
    const name_ptr_dv = new DataView(name_ptr_buf.buffer, 0);
    const name_ptr = name_ptr_dv.getUint32(0, true);
    const name_len_buf = new Uint8Array(memory.buffer.slice(ptr + offset, ptr + offset + 4));
    offset += 4;
    const name_len_dv = new DataView(name_len_buf.buffer, 0);
    const name_len = name_len_dv.getUint32(0, true);
    const name = getText(name_ptr, name_len, memory);
    return { name, offset };
};

export { getName, getText };
