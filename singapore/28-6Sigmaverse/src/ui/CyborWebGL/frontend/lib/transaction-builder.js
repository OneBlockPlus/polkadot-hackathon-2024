import { decodeAddress } from '@gear-js/api';
import { getPayloadMethod } from './utils/payload-method.js';
import '@polkadot/util';

class TransactionBuilder {
    _api;
    _registry;
    _responseType;
    _account;
    _signerOptions;
    _tx;
    _voucher;
    programId;
    constructor(_api, _registry, extrinsic, payload, payloadType, _responseType, _programIdOrCodeOrCodeId) {
        this._api = _api;
        this._registry = _registry;
        this._responseType = _responseType;
        const _payload = this._registry.createType(payloadType, payload);
        switch (extrinsic) {
            case 'send_message': {
                this.programId = _programIdOrCodeOrCodeId;
                this._tx = this._api.message.send({
                    destination: this.programId,
                    gasLimit: 0,
                    payload: _payload.toU8a(),
                    value: 0,
                });
                break;
            }
            case 'upload_program': {
                const { programId, extrinsic } = this._api.program.upload({
                    code: _programIdOrCodeOrCodeId,
                    gasLimit: 0,
                    initPayload: _payload.toU8a(),
                });
                this.programId = programId;
                this._tx = extrinsic;
                break;
            }
            case 'create_program': {
                const { programId, extrinsic } = this._api.program.create({
                    codeId: _programIdOrCodeOrCodeId,
                    gasLimit: 0,
                    initPayload: _payload.toU8a(),
                });
                this.programId = programId;
                this._tx = extrinsic;
                break;
            }
        }
    }
    _getGas(gas, increaseGas) {
        if (increaseGas === 0)
            return gas;
        if (increaseGas < 0 || increaseGas > 100)
            throw new Error('Invalid increaseGas value (0-100)');
        return this._registry.createType('u64', gas.add(gas.muln(increaseGas / 100)));
    }
    _getValue(value) {
        return this._registry.createType('u128', value);
    }
    _setTxArg(index, value) {
        const args = this._tx.args.map((arg, i) => (i === index ? value : arg));
        switch (this._tx.method.method) {
            case 'uploadProgram': {
                this._tx = this._api.tx.gear.uploadProgram(...args);
                break;
            }
            case 'createProgram': {
                this._tx = this._api.tx.gear.createProgram(...args);
                break;
            }
            case 'sendMessage': {
                this._tx = this._api.tx.gear.sendMessage(...args);
                break;
            }
        }
    }
    /** ## Get submittable extrinsic */
    get extrinsic() {
        return this._tx;
    }
    /** ## Get payload of the transaction */
    get payload() {
        return this._tx.args[0].toHex();
    }
    /**
     * ## Calculate gas for transaction
     * @param allowOtherPanics Allow panics in other contracts to be triggered (default: false)
     * @param increaseGas Increase the gas limit by a percentage from 0 to 100 (default: 0)
     * @returns
     */
    async calculateGas(allowOtherPanics = false, increaseGas = 0) {
        if (!this._account)
            throw new Error('Account is required. Use withAccount() method to set account.');
        const source = decodeAddress(typeof this._account === 'string' ? this._account : this._account.address);
        switch (this._tx.method.method) {
            case 'uploadProgram': {
                const gas = await this._api.program.calculateGas.initUpload(source, this._tx.args[0].toHex(), this._tx.args[2].toHex(), this._tx.args[4], allowOtherPanics);
                this._setTxArg(3, this._getGas(gas.min_limit, increaseGas));
                break;
            }
            case 'createProgram': {
                const gas = await this._api.program.calculateGas.initCreate(source, this._tx.args[0].toHex(), this._tx.args[2].toHex(), this._tx.args[4], allowOtherPanics);
                this._setTxArg(3, this._getGas(gas.min_limit, increaseGas));
                break;
            }
            case 'sendMessage': {
                const gas = await this._api.program.calculateGas.handle(source, this._tx.args[0].toHex(), this._tx.args[1].toHex(), this._tx.args[3], allowOtherPanics);
                this._setTxArg(2, this._getGas(gas.min_limit, increaseGas));
                break;
            }
            default: {
                throw new Error('Unknown extrinsic');
            }
        }
        return this;
    }
    /**
     * ## Set account for transaction
     * @param account
     * @param signerOptions
     */
    withAccount(account, signerOptions) {
        this._account = account;
        if (signerOptions) {
            this._signerOptions = signerOptions;
        }
        return this;
    }
    /**
     * ## Set value for transaction
     * @param value
     */
    async withValue(value) {
        switch (this._tx.method.method) {
            case 'uploadProgram':
            case 'createProgram': {
                this._setTxArg(4, this._getValue(value));
                break;
            }
            case 'sendMessage': {
                this._setTxArg(3, this._getValue(value));
                break;
            }
            default: {
                throw new Error('Unknown extrinsic');
            }
        }
        return this;
    }
    /**
     * ## Set gas for transaction
     * @param gas
     */
    async withGas(gas) {
        switch (this._tx.method.method) {
            case 'uploadProgram':
            case 'createProgram': {
                this._setTxArg(3, this._registry.createType('u64', gas));
                break;
            }
            case 'sendMessage': {
                this._setTxArg(2, this._registry.createType('u64', gas));
                break;
            }
            default: {
                throw new Error('Unknown extrinsic');
            }
        }
        return this;
    }
    /**
     * ## Use voucher for transaction
     * @param id Voucher id
     */
    withVoucher(id) {
        if (this._tx.method.method !== 'sendMessage') {
            throw new Error('Voucher can be used only with sendMessage extrinsics');
        }
        this._voucher = id;
        return this;
    }
    /**
     * ## Get transaction fee
     */
    async transactionFee() {
        if (!this._account) {
            throw new Error('Account is required. Use withAccount() method to set account.');
        }
        const info = await this._tx.paymentInfo(this._account, this._signerOptions);
        return info.partialFee.toBigInt();
    }
    /**
     * ## Sign and send transaction
     */
    async signAndSend() {
        if (this._voucher) {
            const callParams = { SendMessage: this._tx };
            this._tx = this._api.voucher.call(this._voucher, callParams);
        }
        let resolveFinalized;
        const isFinalized = new Promise((resolve) => {
            resolveFinalized = resolve;
        });
        const { msgId, blockHash } = await new Promise((resolve, reject) => this._tx
            .signAndSend(this._account, this._signerOptions, ({ events, status }) => {
            if (status.isInBlock) {
                let msgId;
                events.forEach(({ event }) => {
                    const { method, section, data } = event;
                    if (method === 'MessageQueued' && section === 'gear') {
                        msgId = data.id.toHex();
                    }
                    else if (method === 'ExtrinsicSuccess') {
                        resolve({ msgId, blockHash: status.asInBlock.toHex() });
                    }
                    else if (method === 'ExtrinsicFailed') {
                        reject(this._api.getExtrinsicFailedError(event));
                    }
                });
            }
            else if (status.isFinalized) {
                resolveFinalized(true);
            }
        })
            .catch((error) => {
            reject(error.message);
        }));
        return {
            msgId,
            blockHash,
            txHash: this._tx.hash.toHex(),
            isFinalized,
            response: async (rawResult = false) => {
                const { data: { message }, } = await this._api.message.getReplyEvent(this.programId, msgId, blockHash);
                if (!message.details.unwrap().code.isSuccess) {
                    throw new Error(this._registry.createType('String', message.payload).toString());
                }
                if (rawResult) {
                    return message.payload.toHex();
                }
                return this._registry
                    .createType(`(String, String, ${this._responseType})`, message.payload)[2][getPayloadMethod(this._responseType)]();
            },
        };
    }
}

export { TransactionBuilder };
