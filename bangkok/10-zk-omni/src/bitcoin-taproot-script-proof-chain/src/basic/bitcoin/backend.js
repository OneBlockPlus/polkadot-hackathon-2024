const utils = require('../../utils/utils');

function formatBatchData(batchData) {
    if (!batchData) {
        return null;
    }

    return {
        proof: {
            batchId: BigInt(batchData.proof.batchId),
            startBlockHeight: BigInt(batchData.proof.startBlockHeight),
            endBlockHeight: BigInt(batchData.proof.endBlockHeight),
            startTxSid: BigInt(batchData.proof.startTxSid),
            endTxSid: BigInt(batchData.proof.endTxSid),
        },
        btcBlockHeight: batchData.btcBlockHeight,
        txid: batchData.txid,
        index: batchData.index,
        receipt: batchData.receipt,
        value: batchData.value,
        scriptRoot: batchData.scriptRoot
    }
}

class Backend {
    constructor(url) {
        this.url = url
    }

    /**
     * Get batch data of specified batch id from backend
     * 
     * @param {bigint} batchId the id of which batch to query
     * @return {object | null} batch data or null if the batch data can not be found
     * {
     *  
     * }
     */
    async getBatch(batchId) {
        let batchData = await utils.syncRequest(
            `${this.url}api/getBatch?batchId=${batchId.toString()}`,
            'GET'
        )

        return formatBatchData(batchData);
    }

    /**
     * Get latest confirmed batch data
     * 
     * @returns {object | null} latest batch data or null if the batch data can not be found
     */
    async getLatestBatchData() {
        let batchData = await utils.syncRequest(
            `${this.url}api/getLatestBatchData`,
            'GET'
        )
        
        return formatBatchData(batchData);
    }
}

module.exports = Backend;