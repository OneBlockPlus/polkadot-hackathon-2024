const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')

class S3 {
    constructor() {
        this.s3client = new S3Client(global.config.get('s3.client'))
    }

    run() {}

    /**
     *
     * @returns {bigint | null}
     */
    async queryLatestBatchId() {
        let conf = await this.getObject(
            global.config.get('s3.bucket'),
            'config'
        )
        if (conf) {
            if (conf.next_batch_id < 1) {
                global.MainLogger.error('DB: s3 next batch id error')
                return null
            }
            return BigInt(conf.next_batch_id) - 1n
        } else {
            return null
        }
    }

    /**
     *
     * @param {bigint} batchId The batch id to query
     * @returns {BatchProof | null}
     * BatchProof {
     *  batchId: bigint,
     *  startBlockHeight: bigint,
     *  endBlockHeight: bigint,
     *  startTxSeqId: bigint,
     *  endTxSeqId: bigint,
     *  proof: number(u8)[],
     *  instances: string[],
     * }
     */
    async queryBatchProof(batchId) {
        let latestBatchId = await this.queryLatestBatchId()
        if (latestBatchId == null) {
            return null
        } else {
            if (latestBatchId >= batchId) {
                let obj = await this.getObject(
                    config.get('s3.bucket'),
                    batchId.toString()
                )
                let batchProof = {
                    batchId: BigInt(obj.batch_id),
                    startBlockHeight: BigInt(obj.batch_range.start_block_height),
                    endBlockHeight: BigInt(obj.batch_range.end_block_height),
                    startTxSid: BigInt(obj.batch_range.start_tx_seq_id),
                    endTxSid: BigInt(obj.batch_range.end_tx_seq_id),
                    aggProof: obj.agg_proof,
                }

                let txNumber =
                    Number(batchProof.endTxSid - batchProof.startTxSid + 1n)
                if (txNumber < 1) {
                    throw new Error(
                        `Idle: batch id ${batchId}, tx number should be larger than 0, but got ${txNumber}`
                    )
                }

                return batchProof
            } else {
                return null
            }
        }
    }

    async getObject(bucket, key) {
        try {
            let path = global.config.get('s3.path')
            if (path && path.length > 0) {
                if (path.endsWith('/')) {
                    key = path + key
                } else {
                    key = path + '/' + key
                }
            }
            const getObjectCommand = new GetObjectCommand({
                Bucket: bucket,
                Key: key,
            })
            let response = await this.s3client.send(getObjectCommand)
            let obj = JSON.parse(await response.Body.transformToString())
            return obj
        } catch (err) {
            global.MainLogger.error('DB: get s3 object failed: ', err.name)
            return null
        }
    }
}

module.exports = S3
