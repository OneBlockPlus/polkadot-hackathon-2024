import {
  BlockHeader,
  DataHandlerContext,
  SubstrateBatchProcessor,
  SubstrateBatchProcessorFields,
} from "@subsquid/substrate-processor"
import {Store} from '@subsquid/typeorm-store'

import config from "./config"

export const processor = new SubstrateBatchProcessor()
  .setDataSource(config.dataSource)
  .setFields({
    block: {
      timestamp: true
    },
    extrinsic: {
      error: true,
      success: true,
      hash: true
    },
    call: {
      origin: true,
      name: true,
      args: true
    },
    event: {
      name: true,
      args: true
    }
  })
  .setBlockRange({
    from: 1
  })
  .addEvent({
    name: [
      // OffchainComputingInfra
      "OffchainComputingInfra.WorkerRegistered",
      "OffchainComputingInfra.WorkerDeregistered",
      "OffchainComputingInfra.WorkerOnline",
      "OffchainComputingInfra.WorkerUnresponsive",
      "OffchainComputingInfra.WorkerRequestingOffline",
      "OffchainComputingInfra.WorkerOffline",
      "OffchainComputingInfra.WorkerHeartbeatReceived",
      "OffchainComputingInfra.WorkerAttestationRefreshed",
      "OffchainComputingInfra.ImplRegistered",
      "OffchainComputingInfra.ImplDeregistered",
      "OffchainComputingInfra.ImplMetadataUpdated",
      "OffchainComputingInfra.ImplMetadataRemoved",
      "OffchainComputingInfra.ImplBuildRegistered",
      "OffchainComputingInfra.ImplBuildDeregistered",
      "OffchainComputingInfra.ImplBuildStatusUpdated",
      // OffchainComputingPool
      "OffchainComputingPool.PoolCreated",
      "OffchainComputingPool.PoolDestroyed",
      "OffchainComputingPool.PoolMetadataUpdated",
      "OffchainComputingPool.PoolMetadataRemoved",
      "OffchainComputingPool.PoolSettingsUpdated",
      "OffchainComputingPool.JobPolicyCreated",
      "OffchainComputingPool.JobPolicyDestroyed",
      "OffchainComputingPool.JobPolicyEnablementUpdated",
      "OffchainComputingPool.AccountAuthorized",
      "OffchainComputingPool.AccountRevoked",
      "OffchainComputingPool.WorkerAuthorized",
      "OffchainComputingPool.WorkerRevoked",
      "OffchainComputingPool.WorkerSubscribed",
      "OffchainComputingPool.WorkerUnsubscribed",
      "OffchainComputingPool.JobCreated",
      "OffchainComputingPool.JobDestroyed",
      "OffchainComputingPool.JobAssigned",
      "OffchainComputingPool.JobResigned",
      "OffchainComputingPool.JobStatusUpdated",
      "OffchainComputingPool.JobResultUpdated"
    ]
  })

export type Fields = SubstrateBatchProcessorFields<typeof processor>
export type Context = DataHandlerContext<Store, Fields>
export type Block = BlockHeader<Fields>
