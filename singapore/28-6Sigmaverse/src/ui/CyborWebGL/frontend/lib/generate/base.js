import '../utils/payload-method.js';
import { getJsTypeDef } from '../utils/types.js';
import '@polkadot/util';

class BaseGenerator {
    _out;
    constructor(_out) {
        this._out = _out;
    }
    getType(def, payloadMethod) {
        const type = getJsTypeDef(def, payloadMethod);
        if (type.imports) {
            for (const imp of type.imports) {
                this._out.import('sails-js', imp);
            }
        }
        return type.type;
    }
}

export { BaseGenerator };
