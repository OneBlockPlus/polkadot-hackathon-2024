'use strict'

const fs = require('fs')
const {
    Psbt,
    networks,
    payments,
    initEccLib,
    script,
    crypto,
    Transaction
} = require('bitcoinjs-lib')
const tinysecp = require('tiny-secp256k1')
const { BIP32Factory } = require('bip32')
const utils = require('../../utils/utils.js')
const bitcoin = require('./bitcoin.js')
const STATE = require('../../utils/globalDefine.js').STATE
const Backend = require('./backend.js');
initEccLib(tinysecp)
const bip32 = BIP32Factory(tinysecp)

class BitcoinHandler {
    constructor(chainName) {
        this.chainName = chainName
    }

    async init(hdMgr) {
        this.backend = new Backend(config.get(`networks.${this.chainName}.server`));
        this.hdMgr = hdMgr
        this.logger = global.logger.getLogger(this.chainName.toLowerCase())
        this.logger.info(
            utils.format(
                'Init handler: {0}, compatible chain: {1}',
                this.chainName,
                'bitcoin'
            )
        )

        if (!config.has('secret')) {
            throw new Error('Fatal: Secret path not configured')
        }
        try {
            let secret = JSON.parse(fs.readFileSync(config.get('secret')))
            this.testAccountPrivateKey = secret[this.chainName]
        } catch (e) {
            throw new Error('Fatal: No private key')
        }

        if (!this.testAccountPrivateKey) {
            throw new Error('Fatal: No private key')
        }

        if (!config.has(`networks.${this.chainName}.gas`)) {
            throw new Error('Fatal: Gas not configured')
        }

        if (!config.has(`networks.${this.chainName}.networkType`)) {
            throw new Error('Fatal: Network type not configured')
        }
        this.network =
            networks[config.get(`networks.${this.chainName}.networkType`)]

        if (!config.get(`networks.${this.chainName}.p2trExistAmount`)) {
            throw new Error('Fatal: p2tr existing token amount not configured')
        }
        this.p2trExistAmount = config.get(
            `networks.${this.chainName}.p2trExistAmount`
        )
        
        this.messages = []

        let provider = config.get(`networks.${this.chainName}.url`);
        if (!provider) {
            throw new Error('Fatal: bitcoin rpc url not configured')
        }

        let rpcuser = config.get(`networks.${this.chainName}.rpcuser`);
        if (!rpcuser) {
            throw new Error('Fatal: bitcoin rpcuser not configured')
        }

        let rpcpassword = config.get(`networks.${this.chainName}.rpcpassword`);
        if (!rpcpassword) {
            throw new Error('Fatal: bitcoin rpcpassword not configured')
        }
        console.log('asdf', provider, rpcuser, rpcpassword)
        bitcoin.setProvider(provider, rpcuser, rpcpassword)

        this.latestBatch = global.stateDB.getValue(
            `${this.chainName}-batch`,
            null
        )
        this.state = global.stateDB.getValue(
            `${this.chainName}-state`,
            STATE.IDLE
        )

        this.internalKey = bip32.fromSeed(
            Buffer.from(this.testAccountPrivateKey.substr(2), 'hex'),
            this.network
        )

        const { output, address, hash } = payments.p2tr({
            internalPubkey: utils.toXOnly(this.internalKey.publicKey),
            network: this.network,
        })

        this.logger.info(`public key: ${this.internalKey.publicKey.toString('hex')}, address: ${address}`)
    }

    /**
     *
     * @param {string} to Transition to state `to` if specified
     * @param {boolean} trigger Trigger update immediately
     */
    async transitionState(to, trigger = false) {
        if (to) {
            this.state = to
        } else {
            if (this.state == STATE.IDLE) {
                this.state = STATE.PUSHING_ONTO_CHAIN
            } else if (this.state == STATE.PUSHING_ONTO_CHAIN) {
                this.state = STATE.SAVING_INTO_DB
            } else if (this.state == STATE.SAVING_INTO_DB) {
                this.state = STATE.IDLE
            }
        }
        global.stateDB.setValue(`${this.chainName}-state`, this.state)
        if (trigger) {
            await this.update()
        }
    }

    /**
     * Working state loop
     * IDLE => PUSHING_ONTO_CHAIN => SAVING_INTO_DB => IDLE
     */
    async update() {
        if (this.state == STATE.IDLE) {
            await this.idle()
        } else if (this.state == STATE.PUSHING_ONTO_CHAIN) {
            await this.pushingOntoChain()
        } else if (this.state == STATE.SAVING_INTO_DB) {
            await this.savingIntoDB()
        }
    }

    /**
     * When the state is idle, the server is waiting for the next batch proof
     *
     * 1. Get the latest batch information from `state server`
     * 2. Try to get the expected batch proof from S3 server
     * 3. Fetch the last batch information from database, used to construct a new transaction
     * 4. Construct and send a transaction indicating the omniverse state transition on Bitcoin
     */
    async idle() {
        if (this.latestBatch) {
            this.logger.error(
                `this.latestBatch should be null in idle state`,
                this.latestBatch
            )
            this.latestBatch = null
        }
        
        // the next batch id queried from db
        let nextBatchId = await global.db.getNextBatchId(this.chainName)

        // get batch info from backend
        let batchInfo = await this.backend.getBatch(nextBatchId);

        if (batchInfo) {
            // Insert batch info into db directly
            await global.db.tryInsertBatchInfo(
                batchInfo.proof.batchId,
                batchInfo.proof.startBlockHeight,
                batchInfo.proof.endBlockHeight,
                batchInfo.proof.startTxSid,
                batchInfo.proof.endTxSid
            )
            await global.db.insertCommitment(
                nextBatchId,
                this.chainName,
                batchInfo.btcBlockHeight,
                batchInfo.txid,
                ''
            )
            await this.transitionState(STATE.SAVING_INTO_DB)
        } else {
            let latestBatchInfo = await this.backend.getLatestBatchData();
            let expectedNextBatchId = 0
            if (latestBatchInfo) {
                expectedNextBatchId = latestBatchInfo.proof.batchId + BigInt(1)
            }

            if (expectedNextBatchId != nextBatchId) {
                throw new Error(
                    `Backend error with expect batch id of backend is ${expectedNextBatchId}, but which of db is ${nextBatchId}. A new backend server is needed`
                )
            }

            // fetch batch proof in s3
            const batchProof = await global.s3.queryBatchProof(
                nextBatchId.toString()
            )
            if (batchProof) {
                // push to chain
                this.logger.info('idle - batch found', batchProof)

                let txNumber = Number(
                    batchProof.endTxSid -
                    batchProof.startTxSid +
                    1n
                )

                let { batchTxRootHash, UTXOSMTRootHash, AssetSMTRootHash } =
                    this.getMerkleRoots(txNumber, batchProof.aggProof)

                await global.db.tryInsertBatchInfo(
                    batchProof.batchId,
                    batchProof.startBlockHeight,
                    batchProof.endBlockHeight,
                    batchProof.startTxSid,
                    batchProof.endTxSid
                )

                let utxo
                if (nextBatchId != 0) {
                    // previous batch submission result
                    let prevBatchResult = latestBatchInfo

                    utxo = {
                        hash: prevBatchResult.txid,
                        index: prevBatchResult.index,
                        witnessUtxo: {
                            value: prevBatchResult.value,
                            script: Buffer.from(prevBatchResult.receipt, 'hex'),
                        },
                        tapInternalKey: utils.toXOnly(
                            this.internalKey.publicKey
                        ),
                        scriptRoot: Buffer.from(
                            prevBatchResult.scriptRoot,
                            'hex'
                        ),
                    }
                }

                let outputUTXO = await this.submitNewBlock(
                    batchTxRootHash,
                    UTXOSMTRootHash,
                    AssetSMTRootHash,
                    utxo
                )

                this.latestBatch = {
                    id: nextBatchId,
                    tapInternalKey: outputUTXO.tapInternalKey,
                    scriptRoot: outputUTXO.scriptRoot,
                }
                global.stateDB.setValue(
                    `${this.chainName}-batch`,
                    this.latestBatch
                )
                await this.transitionState()
            } else {
                this.logger.info('idle - no new block')
            }
        }
    }

    /**
     * Try to fetch the newest batch data from `state server`, which will
     * track the transaction after it is broadcast to Bitcoin network.
     */
    async pushingOntoChain() {
        if (!this.latestBatch) {
            this.logger.error(
                `this.latestBatch should not be null in pushing state`
            )
            await this.transitionState(STATE.IDLE, true)
            return
        }
        // Confirm the finality
        let batchInfo = await this.backend.getBatch(this.latestBatch.id);
        this.logger.info('pushingOntoChain - Next block information', batchInfo)
        if (!batchInfo) {
            this.logger.info('pushingOntoChain - Pre submition not finished')
        } else {
            this.logger.info('pushingOntoChain - Transaction confirmed, save information in db')
            let data = {
                hash: batchInfo.txid,
                index: batchInfo.index,
                witnessUtxo: {
                    value: batchInfo.value,
                    script: batchInfo.receipt,
                },
                tapInternalKey: this.latestBatch.tapInternalKey,
                scriptRoot: this.latestBatch.scriptRoot,
            }
            let insertRet = global.db.insertCommitment(
                this.latestBatch.id,
                this.chainName,
                batchInfo.btcBlockHeight,
                batchInfo.txid,
                JSON.stringify(data)
            )
            if (insertRet) {
                await this.transitionState()
            }
        }
    }

    /**
     * Save transaction result into database
     */
    async savingIntoDB() {
        if (!this.latestBatch) {
            this.logger.error(
                `this.latestBatch should not be null in saving state`
            )
            await this.transitionState(STATE.IDLE, true)
            return
        }
        let nextBatchId = await global.db.getNextBatchId(
            this.chainName
        )
        if (nextBatchId == this.latestBatch.id) {
          this.logger.info(`Saving to DB not finished ${this.latestBatch.id}`)
        } else if (nextBatchId == this.latestBatch.id + 1) {
          // saving completed
          this.latestBatch = null
          global.stateDB.setValue(`${this.chainName}-batch`, this.latestBatch)
          await this.transitionState()
        } else {
          await this.transitionState(STATE.IDLE)
          throw new Error(`saving into db enconuter an unexpected error, local latest batch id is ${this.latestBatch.id}, next batch id in db is ${nextBatchId}`)
        }
    }

    /**
     * Submit a new batch proof to Bitcoin network
     *
     * Construct a Bitcoin transaction consuming the UTXO representing the latest `Omniverse` state,
     * generate a new UTXO representing the newest `Omniverse` state.
     *
     * @param {string} batchTxRootHash
     * @param {string} UTXOSMTRootHash
     * @param {string} assetSMTRootHash
     * @param {object} preUTXO The UTXO represents the previous `Omniverse` state
     * @returns {Object} The UTXO information representing the new `Omniverse` state
     */
    async submitNewBlock(
        batchTxRootHash,
        UTXOSMTRootHash,
        assetSMTRootHash,
        preUTXO
    ) {
        // Construct p2tr address
        const scriptTree = [
            [
                {
                    output: Buffer.from(batchTxRootHash, 'hex'),
                },
                {
                  output: Buffer.from(UTXOSMTRootHash, 'hex'),
                },
            ],
            {
              output: Buffer.from(assetSMTRootHash, 'hex'),
            },
        ]

        const { output, address, hash } = payments.p2tr({
            internalPubkey: utils.toXOnly(this.internalKey.publicKey),
            scriptTree,
            network: this.network,
        })

        this.logger.info(`submitNewBlock - p2tr receive address ${address}, output: ${output.toString('hex')}, batchTxRootHash: ${batchTxRootHash},
            UTXOSMTRootHash: ${UTXOSMTRootHash}, assetSMTRootHash: ${assetSMTRootHash}`)

        // construct transaction
        const psbt = new Psbt({ network: this.network })
        // query last submission info
        this.logger.debug('submitNewBlock, pre UTXO is', preUTXO)
        if (preUTXO) {
            psbt.addInput(preUTXO)
        }

        // get gas UTXO
        const gas = await this.getGasUTXO()
        this.logger.debug('submitNewBlock - gas', gas)
        psbt.addInput({
            hash: gas.hash,
            index: gas.index,
            witnessUtxo: gas.witnessUtxo,
            tapInternalKey: gas.tapInternalKey,
        })
        psbt.addOutput({
            value: this.p2trExistAmount,
            address: address,
        })
        const feeRate = await bitcoin.getFeeRate()
        let remainGas = gas.witnessUtxo.value
        if (preUTXO) {
            const tweakedSigner = this.internalKey.tweak(
                crypto.taggedHash(
                    'TapTweak',
                    Buffer.concat([
                        utils.toXOnly(this.internalKey.publicKey),
                        preUTXO.scriptRoot,
                    ])
                )
            )
            let gasFee = this.getGasFee(
                [tweakedSigner, gas.signer],
                psbt,
                {
                    value:
                        parseInt(gas.witnessUtxo.value) - this.p2trExistAmount,
                    address: gas.address,
                },
                feeRate
            )

            psbt.addOutput({
                value: parseInt(gas.witnessUtxo.value) - gasFee,
                address: gas.address,
            })
            psbt.signInput(0, tweakedSigner)

            psbt.signInput(1, gas.signer)
            remainGas -= gasFee
        } else {
            let gasFee = this.getGasFee(
                [gas.signer],
                psbt,
                {
                    value:
                        parseInt(gas.witnessUtxo.value) - this.p2trExistAmount,
                    address: gas.address,
                },
                feeRate
            )

            psbt.addOutput({
                value:
                    parseInt(gas.witnessUtxo.value) -
                    this.p2trExistAmount -
                    gasFee,
                address: gas.address,
            })
            psbt.signInput(0, gas.signer)
            remainGas -= this.p2trExistAmount + gasFee
        }

        psbt.finalizeAllInputs()
        const tx = psbt.extractTransaction()
        const rawTx = tx.toBuffer()
        const hex = rawTx.toString('hex')
        const txId = await bitcoin.sendRawTransaction(hex)
        let parsedTransaction = Transaction.fromBuffer(rawTx)
        for (let i in parsedTransaction.ins) {
            this.logger.debug('parsedTransaction in', i, parsedTransaction.ins[i]);
        }

        for (let i in parsedTransaction.outs) {
            this.logger.debug('parsedTransaction out', i, parsedTransaction.outs[i]);
        }
        // save gas UTXO into state db
        if (!txId) {
            throw new Error('send raw transaction failed');
        }
        this.logger.debug('Submit new block, tx id is', txId)
        global.stateDB.setValue(`${this.chainName}-gas`, {
            hash: txId,
            index: 1,
            witnessUtxo: {
                value: remainGas,
                script: gas.witnessUtxo.script,
            },
        })

        return {
            hash: txId,
            index: 0,
            witnessUtxo: {
                value: this.p2trExistAmount,
                script: output,
            },
            tapInternalKey: utils.toXOnly(this.internalKey.publicKey),
            scriptRoot: hash,
        }
    }

    /**
     * @notice Estimate gas fee of the transaction
     * @param {object[]} signers Signers for inputs in `psbt`
     * @param {object} psbt
     * @param {object} gasOutput
     * @param {number} feeRate Gas fee per vByte
     * @returns {number} Estimated gas fee
     */
    getGasFee(signers, psbt, gasOutput, feeRate) {
        this.logger.info('getGasFee - feeRate: ', feeRate)
        const p = psbt.clone()
        p.addOutput(gasOutput)
        for (let i = 0; i < signers.length; i++) {
            p.signInput(i, signers[i])
        }
        p.finalizeAllInputs()
        const estTx = p.extractTransaction()
        const vBytes = estTx.virtualSize()
        const finalFee = vBytes * feeRate + 1
        this.logger.info('getGasFee - estimated gas fee', finalFee)
        return finalFee
    }

    /**
     * Get the UTXO of gas
     * @return {object} Gas UTXO used to construct a new transaction
     */
    async getGasUTXO() {
        // Run a server or use explorer api to fetch UTXO list
        // Currently, save it in local db
        // Construct p2tr address
        let p2tr = payments.p2tr({
            internalPubkey: utils.toXOnly(this.internalKey.publicKey),
            network: this.network,
        })

        let utxo = global.stateDB.getValue(`${this.chainName}-gas`)
        if (!utxo) {
            utxo = config.get(`networks.${this.chainName}.gas`)
        }

        return {
            hash: utxo.hash,
            index: utxo.index,
            address: p2tr.address,
            witnessUtxo: {
                value: utxo.witnessUtxo.value,
                script: Buffer.from(utxo.witnessUtxo.script, 'hex'),
            },
            tapInternalKey: utils.toXOnly(this.internalKey.publicKey),
            signer: this.internalKey.tweak(
                crypto.taggedHash(
                    'TapTweak',
                    utils.toXOnly(this.internalKey.publicKey)
                )
            ),
        }
    }

    /**
     * Get merkle roots from instances in batch proof
     *
     * @param {number} txNumber transaction number included in the batch proof
     * @param {Object} aggProof data of batch proof
     * @return {Object}
     * {
     *  batchTxRootHash,
     *  UTXOSMTRootHash,
     *  AssetSMTRootHash,
     * }
     */
    getMerkleRoots(txNumber, aggProof) {
        const publicValues = aggProof.publicValues.substring(10);
        // batch tx merkle root
        let batchTxRootHash = publicValues.substring(256);
        // UTXO smt root
        let UTXOSMTRootHash = publicValues.substring(192, 256);
        // asset smt root
        let AssetSMTRootHash = publicValues.substring(128, 192);
        
        return {
          batchTxRootHash: batchTxRootHash,
          UTXOSMTRootHash: UTXOSMTRootHash,
          AssetSMTRootHash: AssetSMTRootHash,
        }
    }

    getProvider() {}
}

module.exports = BitcoinHandler
