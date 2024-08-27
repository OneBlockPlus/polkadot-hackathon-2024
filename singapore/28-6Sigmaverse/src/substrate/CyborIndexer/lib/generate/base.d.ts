import { TypeDef } from '../parser/types.js';
import { Output } from './output.js';
import { PayloadMethod } from '../utils/index.js';
export declare class BaseGenerator {
    protected _out: Output;
    constructor(_out: Output);
    protected getType(def: TypeDef, payloadMethod?: PayloadMethod): string;
}
