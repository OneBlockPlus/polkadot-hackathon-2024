import { TypeDef } from '../parser/types.js';
import { PayloadMethod } from './payload-method.js';
export declare const getJsTypeDef: (typeDef: TypeDef, payloadMethod?: PayloadMethod) => {
    type: string;
    imports: string[];
};
export declare const getScaleCodecDef: (type: TypeDef, asString?: boolean) => any;
