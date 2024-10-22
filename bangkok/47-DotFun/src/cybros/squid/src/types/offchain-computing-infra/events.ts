import {sts, Block, Bytes, Option, Result, EventType} from '../support'
import * as v100 from '../v100'

export const workerRegistered =  {
    name: 'OffchainComputingInfra.WorkerRegistered',
    /**
     * The worker registered successfully
     */
    v100: new EventType(
        'OffchainComputingInfra.WorkerRegistered',
        sts.struct({
            worker: v100.AccountId32,
            owner: v100.AccountId32,
            implId: sts.number(),
        })
    ),
}

export const workerDeregistered =  {
    name: 'OffchainComputingInfra.WorkerDeregistered',
    /**
     * The worker registered successfully
     */
    v100: new EventType(
        'OffchainComputingInfra.WorkerDeregistered',
        sts.struct({
            worker: v100.AccountId32,
            force: sts.boolean(),
        })
    ),
}

export const workerOnline =  {
    name: 'OffchainComputingInfra.WorkerOnline',
    /**
     * The worker is online
     */
    v100: new EventType(
        'OffchainComputingInfra.WorkerOnline',
        sts.struct({
            worker: v100.AccountId32,
            implSpecVersion: sts.number(),
            implBuildVersion: sts.number(),
            attestationMethod: v100.AttestationMethod,
            attestationExpiresAt: sts.option(() => sts.bigint()),
            nextHeartbeat: sts.number(),
        })
    ),
}

export const workerUnresponsive =  {
    name: 'OffchainComputingInfra.WorkerUnresponsive',
    v100: new EventType(
        'OffchainComputingInfra.WorkerUnresponsive',
        sts.struct({
            worker: v100.AccountId32,
        })
    ),
}

export const workerRequestingOffline =  {
    name: 'OffchainComputingInfra.WorkerRequestingOffline',
    /**
     * The worker is requesting offline
     */
    v100: new EventType(
        'OffchainComputingInfra.WorkerRequestingOffline',
        sts.struct({
            worker: v100.AccountId32,
        })
    ),
}

export const workerOffline =  {
    name: 'OffchainComputingInfra.WorkerOffline',
    /**
     * The worker is offline
     */
    v100: new EventType(
        'OffchainComputingInfra.WorkerOffline',
        sts.struct({
            worker: v100.AccountId32,
            reason: v100.OfflineReason,
        })
    ),
}

export const workerHeartbeatReceived =  {
    name: 'OffchainComputingInfra.WorkerHeartbeatReceived',
    /**
     * The worker send heartbeat successfully
     */
    v100: new EventType(
        'OffchainComputingInfra.WorkerHeartbeatReceived',
        sts.struct({
            worker: v100.AccountId32,
            next: sts.number(),
            uptime: sts.bigint(),
        })
    ),
}

export const workerAttestationRefreshed =  {
    name: 'OffchainComputingInfra.WorkerAttestationRefreshed',
    /**
     * The worker refresh its attestation successfully
     */
    v100: new EventType(
        'OffchainComputingInfra.WorkerAttestationRefreshed',
        sts.struct({
            worker: v100.AccountId32,
            expiresAt: sts.option(() => sts.bigint()),
        })
    ),
}

export const implRegistered =  {
    name: 'OffchainComputingInfra.ImplRegistered',
    v100: new EventType(
        'OffchainComputingInfra.ImplRegistered',
        sts.struct({
            implId: sts.number(),
            owner: v100.AccountId32,
            attestationMethod: v100.AttestationMethod,
        })
    ),
}

export const implDeregistered =  {
    name: 'OffchainComputingInfra.ImplDeregistered',
    v100: new EventType(
        'OffchainComputingInfra.ImplDeregistered',
        sts.struct({
            implId: sts.number(),
        })
    ),
}

export const implMetadataUpdated =  {
    name: 'OffchainComputingInfra.ImplMetadataUpdated',
    v100: new EventType(
        'OffchainComputingInfra.ImplMetadataUpdated',
        sts.struct({
            implId: sts.number(),
            metadata: v100.BoundedVec,
        })
    ),
}

export const implMetadataRemoved =  {
    name: 'OffchainComputingInfra.ImplMetadataRemoved',
    v100: new EventType(
        'OffchainComputingInfra.ImplMetadataRemoved',
        sts.struct({
            implId: sts.number(),
        })
    ),
}

export const implBuildRegistered =  {
    name: 'OffchainComputingInfra.ImplBuildRegistered',
    /**
     * Update worker's implementation permission successfully
     */
    v100: new EventType(
        'OffchainComputingInfra.ImplBuildRegistered',
        sts.struct({
            implId: sts.number(),
            implBuildVersion: sts.number(),
            magicBytes: sts.option(() => sts.bytes()),
        })
    ),
}

export const implBuildDeregistered =  {
    name: 'OffchainComputingInfra.ImplBuildDeregistered',
    /**
     * Remove worker's implementation permission successfully
     */
    v100: new EventType(
        'OffchainComputingInfra.ImplBuildDeregistered',
        sts.struct({
            implId: sts.number(),
            implBuildVersion: sts.number(),
        })
    ),
}

export const implBuildStatusUpdated =  {
    name: 'OffchainComputingInfra.ImplBuildStatusUpdated',
    v100: new EventType(
        'OffchainComputingInfra.ImplBuildStatusUpdated',
        sts.struct({
            implId: sts.number(),
            implBuildVersion: sts.number(),
            status: v100.ImplBuildStatus,
        })
    ),
}
