import '../utils/payload-method.js';
import { toLowerCaseFirst } from '../utils/string.js';
import '@polkadot/util';
import { BaseGenerator } from './base.js';

class TypesGenerator extends BaseGenerator {
    _program;
    constructor(out, _program) {
        super(out);
        this._program = _program;
    }
    generate() {
        for (const { name, def } of this._program.types) {
            if (def.isStruct) {
                this.generateStruct(name, def);
            }
            else if (def.isEnum) {
                this.generateEnum(name, def.asEnum);
            }
            else if (def.isPrimitive || def.isOptional || def.isResult || def.asVec) {
                this._out.line(`export type ${name} = ${this.getType(def)}`).line();
            }
            else {
                throw new Error(`Unknown type: ${JSON.stringify(def)}`);
            }
        }
    }
    generateStruct(name, def) {
        if (def.asStruct.isTuple) {
            return this._out.line(`export type ${name} = ${this.getType(def)}`).line();
        }
        return this._out
            .block(`export interface ${name}`, () => {
            for (const field of def.asStruct.fields) {
                this._out.line(`${field.name}: ${this.getType(field.def)}`);
            }
        })
            .line();
    }
    generateEnum(typeName, def) {
        if (def.isNesting) {
            this._out.line(`export type ${typeName} = `, false).increaseIndent();
            for (let i = 0; i < def.variants.length; i++) {
                this._out.line(`| ${this.getEnumFieldString(def.variants[i])}`, i === def.variants.length - 1);
            }
            this._out.reduceIndent().line();
        }
        else {
            this._out
                .line(`export type ${typeName} = ${def.variants.map((v) => `"${toLowerCaseFirst(v.name)}"`).join(' | ')}`)
                .line();
        }
    }
    getEnumFieldString(f) {
        if (!f.def) {
            return `{ ${toLowerCaseFirst(f.name)}: null }`;
        }
        else {
            return `{ ${toLowerCaseFirst(f.name)}: ${this.getType(f.def)} }`;
        }
    }
}

export { TypesGenerator };
