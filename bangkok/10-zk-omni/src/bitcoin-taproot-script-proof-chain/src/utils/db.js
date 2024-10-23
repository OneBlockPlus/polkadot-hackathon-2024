const pg = require('pg')
const config = require('config')
const utils = require('./utils')

class DB {
    constructor() {
        this.client = new pg.Client(config.get('database'))
    }

    async run() {
        while (true) {
            try {
                await this.client.connect()
                break
            } catch (e) {
                global.MainLogger.error(`db client connect failed`, e)
                await utils.sleep(10)
            }
        }
    }

    /**
     * Query next batch id of which should be submitted to chain
     *
     * @param {string} chainName Which chain to submit proof to
     * @returns {bigint} The next batch id
     */
    async getNextBatchId(chainName) {
        const query = `SELECT * from (SELECT * from commitments WHERE name = $1 ORDER BY batch_id DESC) LIMIT 1`
        let result = await this.client.query(query, [chainName])
        const rows = result.rows
        if (rows.length > 0) {
            let batchId = parseInt(rows[0].batch_id)
            return batchId + 1
        } else {
            return 0
        }
    }

    /**
     * Try to insert batch info into db, if the batch already exists, do not insert
     *
     * @param {bigint} batchId The batch id of which will be inserted into db
     * @param {bigint} startBlockHeight
     * @param {bigint} endBlockHeight
     * @param {bigint} startTxSid
     * @param {bigint} endTxSid
     */
    async tryInsertBatchInfo(
        batchId,
        startBlockHeight,
        endBlockHeight,
        startTxSid,
        endTxSid
    ) {
        let batchInfo = await this.queryBatchInfo(batchId)
        if (batchInfo) {
            global.MainLogger.info(`Batch info of id ${batchId} already exist`)
            return true
        }

        const query = `INSERT INTO batch VALUES($1, $2, $3, $4, $5)`
        try {
            const result = await this.client.query(query, [
                batchId,
                startBlockHeight,
                endBlockHeight,
                startTxSid,
                endTxSid,
            ])
            if (result.rowCount == 1) {
                return true
            } else {
                return false
            }
        } catch (e) {
            global.MainLogger.error('insertCommitment failed', e)
            return false
        }
    }

    /**
     *
     * @param {bigint} batchId The id of which batch to query
     */
    async queryBatchInfo(batchId) {
        const query = `SELECT * from batch WHERE batch_id = $1`
        try {
            const result = await this.client.query(query, [batchId])
            if (result.rowCount == 1) {
                return result.rows[0]
            } else {
                global.MainLogger.warn(`Batch of id ${batchId} not found`)
                return null
            }
        } catch (e) {
            global.MainLogger.error('query batch info fail', e)
            return null
        }
    }

    /**
     *
     * @param {bigint} batchId
     * @param {string} chainName
     * @param {bigint} blockHeight
     * @param {string} txHash
     * @param {string} data
     * @returns {boolean} If execution successfully
     */
    async insertCommitment(batchId, chainName, blockHeight, txHash, data) {
        const query = `INSERT INTO commitments VALUES($1, $2, $3, $4, $5, $6, $7)`
        let time = Math.floor(Date.now() / 1000)
        try {
            const result = await this.client.query(query, [
                batchId,
                chainName,
                blockHeight,
                txHash,
                data,
                time,
                '',
            ])
            if (result.rowCount == 1) {
                return true
            } else {
                return false
            }
        } catch (e) {
            global.MainLogger.error('insertCommitment failed', e)
            return false
        }
    }
}

module.exports = new DB()
