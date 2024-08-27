import { decodeAddress } from '@gear-js/api';
import { TypeRegistry } from '@polkadot/types/create';
import { u8aToHex } from '@polkadot/util';
import { WasmParser } from './parser/parser.js';
import './parser/types.js';
import { getServiceNamePrefix, getFnNamePrefix } from './utils/prefix.js';
import { TransactionBuilder } from './transaction-builder.js';
import { getScaleCodecDef } from './utils/types.js';
import { ZERO_ADDRESS } from './consts.js';

class Sails {
    _parser;
    _program;
    _scaleTypes;
    _registry;
    _api;
    _programId;
    constructor(parser) {
        this._parser = parser;
    }
    /** #### Create new Sails instance */
    static async new() {
        const parser = new WasmParser();
        return new Sails(await parser.init());
    }
    /** ### Set api to use for transactions */
    setApi(api) {
        this._api = api;
        return this;
    }
    /** ### Set program id to interact with */
    setProgramId(programId) {
        this._programId = programId;
        return this;
    }
    /** ### Get program id */
    get programId() {
        return this._programId;
    }
    /**
     * ### Parse IDL from string
     * @param idl - IDL string
     */
    parseIdl(idl) {
        this._program = this._parser.parse(idl);
        this.generateScaleCodeTypes();
        return this;
    }
    generateScaleCodeTypes() {
        const scaleTypes = {};
        for (const type of this._program.types) {
            scaleTypes[type.name] = getScaleCodecDef(type.def);
        }
        this._registry = new TypeRegistry();
        this._registry.setKnownTypes({ types: scaleTypes });
        this._registry.register(scaleTypes);
        this._scaleTypes = scaleTypes;
    }
    /** #### Scale code types from the parsed IDL */
    get scaleCodecTypes() {
        if (!this._program) {
            throw new Error('IDL not parsed');
        }
        return this._scaleTypes;
    }
    /** #### Registry with registered types from the parsed IDL */
    get registry() {
        if (!this._program) {
            throw new Error('IDL not parsed');
        }
        return this._registry;
    }
    _getFunctions(service) {
        const funcs = {};
        const queries = {};
        for (const func of service.funcs) {
            const params = func.params.map((p) => ({ name: p.name, type: getScaleCodecDef(p.def), typeDef: p.def }));
            const returnType = getScaleCodecDef(func.def);
            if (func.isQuery) {
                queries[func.name] = (async (origin, value = 0n, atBlock, ...args) => {
                    if (!this._api) {
                        throw new Error('API is not set. Use .setApi method to set API instance');
                    }
                    if (!this._programId) {
                        throw new Error('Program ID is not set. Use .setProgramId method to set program ID');
                    }
                    const payload = this.registry
                        .createType(`(String, String, ${params.map((p) => p.type).join(', ')})`, [service.name, func.name, ...args])
                        .toHex();
                    const reply = await this._api.message.calculateReply({
                        destination: this.programId,
                        origin: decodeAddress(origin),
                        payload,
                        value,
                        gasLimit: this._api.blockGasLimit.toBigInt(),
                        at: atBlock || null,
                    });
                    if (!reply.code.isSuccess) {
                        throw new Error(this.registry.createType('String', reply.payload).toString());
                    }
                    const result = this.registry.createType(`(String, String, ${returnType})`, reply.payload.toHex());
                    return result[2].toJSON();
                });
            }
            else {
                funcs[func.name] = ((...args) => {
                    if (!this._api) {
                        throw new Error('API is not set. Use .setApi method to set API instance');
                    }
                    if (!this._programId) {
                        throw new Error('Program ID is not set. Use .setProgramId method to set program ID');
                    }
                    return new TransactionBuilder(this._api, this.registry, 'send_message', [service.name, func.name, ...args], `(String, String, ${params.map((p) => p.type).join(', ')})`, returnType, this._programId);
                });
            }
            Object.assign(func.isQuery ? queries[func.name] : funcs[func.name], {
                args: params,
                returnType,
                returnTypeDef: func.def,
                encodePayload: (...args) => {
                    if (args.length !== args.length) {
                        throw new Error(`Expected ${params.length} arguments, but got ${args.length}`);
                    }
                    const payload = this.registry.createType(`(String, String, ${params.map((p) => p.type).join(', ')})`, [
                        service.name,
                        func.name,
                        ...args,
                    ]);
                    return payload.toHex();
                },
                decodePayload: (bytes) => {
                    const payload = this.registry.createType(`(String, String, ${params.map((p) => p.type).join(', ')})`, bytes);
                    const result = {};
                    params.forEach((param, i) => {
                        result[param.name] = payload[i + 2].toJSON();
                    });
                    return result;
                },
                decodeResult: (result) => {
                    const payload = this.registry.createType(`(String, String, ${returnType})`, result);
                    return payload[2].toJSON();
                },
            });
        }
        return { funcs, queries };
    }
    _getEvents(service) {
        const events = {};
        for (const event of service.events) {
            const t = event.def ? getScaleCodecDef(event.def) : 'Null';
            const typeStr = event.def ? getScaleCodecDef(event.def, true) : 'Null';
            events[event.name] = {
                type: t,
                typeDef: event.def,
                is: ({ data: { message } }) => {
                    if (!message.destination.eq(ZERO_ADDRESS)) {
                        return false;
                    }
                    if (getServiceNamePrefix(message.payload.toHex()) !== service.name) {
                        return false;
                    }
                    if (getFnNamePrefix(message.payload.toHex()) !== event.name) {
                        return false;
                    }
                    return true;
                },
                decode: (payload) => {
                    const data = this.registry.createType(`(String, String, ${typeStr})`, payload);
                    return data[2].toJSON();
                },
                subscribe: (cb) => {
                    if (!this._api) {
                        throw new Error('API is not set. Use .setApi method to set API instance');
                    }
                    if (!this._programId) {
                        throw new Error('Program ID is not set. Use .setProgramId method to set program ID');
                    }
                    return this._api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
                        if (!message.source.eq(this._programId))
                            return;
                        if (!message.destination.eq(ZERO_ADDRESS))
                            return;
                        const payload = message.payload.toHex();
                        if (getServiceNamePrefix(payload) === service.name && getFnNamePrefix(payload) === event.name) {
                            cb(this.registry.createType(`(String, String, ${typeStr})`, message.payload)[2].toJSON());
                        }
                    });
                },
            };
        }
        return events;
    }
    /** #### Services with functions and events from the parsed IDL */
    get services() {
        if (!this._program) {
            throw new Error('IDL is not parsed');
        }
        const services = {};
        for (const service of this._program.services) {
            const { funcs, queries } = this._getFunctions(service);
            services[service.name] = {
                functions: funcs,
                queries,
                events: this._getEvents(service),
            };
        }
        return services;
    }
    /** #### Constructor functions with arguments from the parsed IDL */
    get ctors() {
        if (!this._program) {
            throw new Error('IDL not parsed');
        }
        const ctor = this._program.ctor;
        if (!ctor) {
            return null;
        }
        const funcs = {};
        for (const func of ctor.funcs) {
            const params = func.params.map((p) => ({ name: p.name, type: getScaleCodecDef(p.def), typeDef: p.def }));
            funcs[func.name] = {
                args: params,
                encodePayload: (...args) => {
                    if (args.length !== args.length) {
                        throw new Error(`Expected ${params.length} arguments, but got ${args.length}`);
                    }
                    if (params.length === 0) {
                        return u8aToHex(this.registry.createType('String', func.name).toU8a());
                    }
                    const payload = this.registry.createType(`(String, ${params.map((p) => p.type).join(', ')})`, [
                        func.name,
                        ...args,
                    ]);
                    return payload.toHex();
                },
                decodePayload: (bytes) => {
                    const payload = this.registry.createType(`(String, ${params.map((p) => p.type).join(', ')})`, bytes);
                    const result = {};
                    params.forEach((param, i) => {
                        result[param.name] = payload[i + 1].toJSON();
                    });
                    return result;
                },
                fromCode: (code, ...args) => {
                    if (!this._api) {
                        throw new Error('API is not set. Use .setApi method to set API instance');
                    }
                    const builder = new TransactionBuilder(this._api, this.registry, 'upload_program', [func.name, ...args], `(String, ${params.map((p) => p.type).join(', ')})`, 'String', code);
                    this._programId = builder.programId;
                    return builder;
                },
                fromCodeId: (codeId, ...args) => {
                    if (!this._api) {
                        throw new Error('API is not set. Use .setApi method to set API instance');
                    }
                    const builder = new TransactionBuilder(this._api, this.registry, 'create_program', [func.name, ...args], `(String, ${params.map((p) => p.type).join(', ')})`, 'String', codeId);
                    this._programId = builder.programId;
                    return builder;
                },
            };
        }
        return funcs;
    }
    /** #### Parsed IDL */
    get program() {
        if (!this._program) {
            throw new Error('IDL is not parsed');
        }
        return this._program;
    }
    /** #### Get type definition by name */
    getTypeDef(name) {
        return this.program.getTypeByName(name).def;
    }
}

export { Sails };
