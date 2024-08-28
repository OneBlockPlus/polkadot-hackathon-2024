var wasmBytes = require('./wasm-bytes.js');
var types = require('./types.js');
var program = require('./program.js');
var service = require('./service.js');

const WASM_PAGE_SIZE = 0x10000;
class WasmParser {
    _memory;
    _instance;
    _exports;
    _encoder;
    _program;
    _memPtr;
    _idlLen;
    _numberOfGrownPages = 0;
    constructor() {
        this._encoder = new TextEncoder();
    }
    async _decompressWasm() {
        const binaryStr = atob(wasmBytes.default);
        const binaryBase64 = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
            binaryBase64[i] = binaryStr.charCodeAt(i);
        }
        const ds = new DecompressionStream('gzip');
        const decompressed = new Response(binaryBase64).body.pipeThrough(ds);
        const reader = decompressed.getReader();
        const bytes = [];
        while (true) {
            const { value, done } = await reader.read();
            if (done)
                break;
            bytes.push(...value);
        }
        return new Uint8Array(bytes).buffer;
    }
    async init() {
        const wasmBuf = await this._decompressWasm();
        const $ = this;
        $._memory = new WebAssembly.Memory({ initial: 17 });
        const source = await WebAssembly.instantiate(wasmBuf, {
            env: {
                memory: $._memory,
                visit_type: (_, type_ptr) => {
                    const type = new types.Type(type_ptr, $._memory);
                    const id = $._program.addType(type);
                    this.handleAcceptError($._instance.exports.accept_type(type_ptr, id));
                },
                visit_optional_type_decl: (ctx, optional_type_decl_ptr) => {
                    const type = $._program.getContext(ctx);
                    const def = new types.OptionalDef(optional_type_decl_ptr, $._memory);
                    type.setDef(new types.TypeDef(def, types.DefKind.Optional));
                    $._program.addContext(def.rawPtr, def);
                    this.handleAcceptError($._exports.accept_type_decl(optional_type_decl_ptr, def.rawPtr));
                },
                visit_vector_type_decl: (ctx, vector_type_decl_ptr) => {
                    const type = $._program.getContext(ctx);
                    const def = new types.VecDef(vector_type_decl_ptr, $._memory);
                    type.setDef(new types.TypeDef(def, types.DefKind.Vec));
                    $._program.addContext(def.rawPtr, def);
                    this.handleAcceptError($._exports.accept_type_decl(vector_type_decl_ptr, def.rawPtr));
                },
                visit_array_type_decl: (ctx, array_type_decl_ptr, len) => {
                    const type = $._program.getContext(ctx);
                    const def = new types.FixedSizeArrayDef(array_type_decl_ptr, len, $._memory);
                    type.setDef(new types.TypeDef(def, types.DefKind.FixedSizeArray));
                    $._program.addContext(def.rawPtr, def);
                    this.handleAcceptError($._exports.accept_type_decl(array_type_decl_ptr, def.rawPtr));
                },
                visit_map_type_decl: (ctx, key_type_decl_ptr, value_type_decl_ptr) => {
                    const type = $._program.getContext(ctx);
                    const def = new types.MapDef(key_type_decl_ptr, value_type_decl_ptr, $._memory);
                    type.setDef(new types.TypeDef(def, types.DefKind.Map));
                    $._program.addContext(def.key.rawPtr, def.key);
                    $._program.addContext(def.value.rawPtr, def.value);
                    this.handleAcceptError($._exports.accept_type_decl(key_type_decl_ptr, def.key.rawPtr));
                    this.handleAcceptError($._exports.accept_type_decl(value_type_decl_ptr, def.value.rawPtr));
                },
                visit_result_type_decl: (ctx, ok_type_decl_ptr, err_type_decl_ptr) => {
                    const type = $._program.getContext(ctx);
                    const def = new types.ResultDef(ok_type_decl_ptr, err_type_decl_ptr, $._memory);
                    type.setDef(new types.TypeDef(def, types.DefKind.Result));
                    $._program.addContext(def.ok.rawPtr, def.ok);
                    $._program.addContext(def.err.rawPtr, def.err);
                    this.handleAcceptError($._exports.accept_type_decl(ok_type_decl_ptr, def.ok.rawPtr));
                    this.handleAcceptError($._exports.accept_type_decl(err_type_decl_ptr, def.err.rawPtr));
                },
                visit_primitive_type_id: (ctx, primitive_type_id) => {
                    const type = $._program.getContext(ctx);
                    const def = new types.PrimitiveDef(primitive_type_id);
                    type.setDef(new types.TypeDef(def, types.DefKind.Primitive));
                },
                visit_user_defined_type_id: (ctx, user_defined_type_id_ptr, user_defined_type_id_len) => {
                    const type = $._program.getContext(ctx);
                    const def = new types.UserDefinedDef(user_defined_type_id_ptr, user_defined_type_id_len, $._memory);
                    type.setDef(new types.TypeDef(def, types.DefKind.UserDefined));
                },
                visit_struct_def: (ctx, struct_def_ptr) => {
                    const type = $._program.getContext(ctx);
                    const def = new types.StructDef(struct_def_ptr, $._memory);
                    $._program.addContext(def.rawPtr, def);
                    type.setDef(new types.TypeDef(def, types.DefKind.Struct));
                    this.handleAcceptError($._exports.accept_struct_def(struct_def_ptr, def.rawPtr));
                },
                visit_struct_field: (ctx, struct_field_ptr) => {
                    const def = $._program.getContext(ctx);
                    const field = new types.StructField(struct_field_ptr, $._memory);
                    const id = def.addField(field);
                    $._program.addContext(id, field);
                    this.handleAcceptError($._exports.accept_struct_field(struct_field_ptr, id));
                },
                visit_enum_def: (ctx, enum_def_ptr) => {
                    const type = $._program.getType(ctx);
                    const def = new types.EnumDef(enum_def_ptr, $._memory);
                    $._program.addContext(def.rawPtr, def);
                    type.setDef(new types.TypeDef(def, types.DefKind.Enum));
                    $._exports.accept_enum_def(enum_def_ptr, def.rawPtr);
                },
                visit_enum_variant: (ctx, enum_variant_ptr) => {
                    const def = $._program.getContext(ctx);
                    const variant = new types.EnumVariant(enum_variant_ptr, $._memory);
                    const id = def.addVariant(variant);
                    $._program.addContext(id, variant);
                    this.handleAcceptError($._exports.accept_enum_variant(enum_variant_ptr, id));
                },
                visit_ctor: (_, ctor_ptr) => {
                    $._program.addCtor(new program.Ctor(ctor_ptr, $._memory));
                    this.handleAcceptError($._exports.accept_ctor(ctor_ptr, 0));
                },
                visit_ctor_func: (_, func_ptr) => {
                    const func = new program.CtorFunc(func_ptr, $._memory);
                    $._program.ctor.addFunc(func);
                    $._program.addContext(func.rawPtr, func);
                    this.handleAcceptError($._exports.accept_ctor_func(func_ptr, func.rawPtr));
                },
                visit_service: (_, service_ptr) => {
                    const service$1 = new service.Service(service_ptr, $._memory);
                    $._program.addContext(service$1.rawPtr, service$1);
                    $._program.addService(service$1);
                    this.handleAcceptError($._exports.accept_service(service_ptr, service$1.rawPtr));
                },
                visit_service_func: (ctx, func_ptr) => {
                    const func = new service.ServiceFunc(func_ptr, $._memory);
                    const service$1 = $._program.getContext(ctx);
                    service$1.addFunc(func);
                    $._program.addContext(func.rawPtr, func);
                    this.handleAcceptError($._exports.accept_service_func(func_ptr, func.rawPtr));
                },
                visit_service_event: (ctx, event_ptr) => {
                    const event = new service.ServiceEvent(event_ptr, $._memory);
                    const service$1 = $._program.getContext(ctx);
                    service$1.addEvent(event);
                    $._program.addContext(event.rawPtr, event);
                    this.handleAcceptError($._exports.accept_service_event(event_ptr, event.rawPtr));
                },
                visit_func_param: (ctx, func_param_ptr) => {
                    const param = new service.FuncParam(func_param_ptr, $._memory);
                    const func = $._program.getContext(ctx);
                    func.addFuncParam(param.rawPtr, param);
                    $._program.addContext(param.rawPtr, param);
                    this.handleAcceptError($._exports.accept_func_param(func_param_ptr, param.rawPtr));
                },
                visit_func_output: (ctx, func_output_ptr) => {
                    this.handleAcceptError($._exports.accept_type_decl(func_output_ptr, ctx));
                },
            },
        });
        $._instance = source.instance;
        $._exports = $._instance.exports;
        return $;
    }
    static async new() {
        const parser = new WasmParser();
        return parser.init();
    }
    fillMemory(idl) {
        const buf = this._encoder.encode(idl);
        this._idlLen = buf.length;
        const numberOfPages = Math.round(buf.length / WASM_PAGE_SIZE) + 1;
        if (!this._memPtr || numberOfPages > this._numberOfGrownPages) {
            this._memPtr = this._memory.grow(numberOfPages - this._numberOfGrownPages) * WASM_PAGE_SIZE;
            this._numberOfGrownPages = numberOfPages;
        }
        for (let i = 0; i < buf.length; i++) {
            new Uint8Array(this._memory.buffer)[i + this._memPtr] = buf[i];
        }
    }
    clearMemory() {
        for (let i = 0; i < this._numberOfGrownPages * WASM_PAGE_SIZE; i++) {
            new Uint8Array(this._memory.buffer)[i + this._memPtr] = 0;
        }
        this._idlLen = null;
    }
    readString = (ptr) => {
        const view = new DataView(this._memory.buffer);
        let len = 0;
        while (view.getUint8(ptr + len) !== 0) {
            len++;
        }
        const buf = new Uint8Array(this._memory.buffer, ptr, len);
        return new TextDecoder().decode(buf);
    };
    parse(idl) {
        this.fillMemory(idl);
        const resultPtr = this._instance.exports.parse_idl(this._memPtr, this._idlLen);
        const view = new DataView(this._memory.buffer);
        const errorCode = view.getUint32(resultPtr + 4, true);
        if (errorCode > 0) {
            // Read ParseResult enum discriminant
            const errorDetails = this.readString(view.getUint32(resultPtr + 8, true));
            throw new Error(`Error code: ${errorCode}, Error details: ${errorDetails}`);
        }
        const programPtr = view.getUint32(resultPtr, true);
        this._program = new program.Program();
        this.handleAcceptError(this._instance.exports.accept_program(programPtr, 0));
        this._exports.free_parse_result(resultPtr);
        this.clearMemory();
        return this._program;
    }
    handleAcceptError(errorCode) {
        new DataView(this._memory.buffer);
        if (errorCode > 0) {
            throw new Error(`Error code: ${errorCode}`);
        }
    }
}

exports.WasmParser = WasmParser;
