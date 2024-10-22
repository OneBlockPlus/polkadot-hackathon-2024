import {sts, Block, Bytes, Option, Result, EventType} from '../support'
import * as v100 from '../v100'

export const poolCreated =  {
    name: 'OffchainComputingPool.PoolCreated',
    v100: new EventType(
        'OffchainComputingPool.PoolCreated',
        sts.struct({
            owner: v100.AccountId32,
            poolId: sts.number(),
            implId: sts.number(),
            jobScheduler: v100.JobScheduler,
            createJobEnabled: sts.boolean(),
            autoDestroyProcessedJobEnabled: sts.boolean(),
        })
    ),
}

export const poolDestroyed =  {
    name: 'OffchainComputingPool.PoolDestroyed',
    v100: new EventType(
        'OffchainComputingPool.PoolDestroyed',
        sts.struct({
            poolId: sts.number(),
        })
    ),
}

export const poolMetadataUpdated =  {
    name: 'OffchainComputingPool.PoolMetadataUpdated',
    v100: new EventType(
        'OffchainComputingPool.PoolMetadataUpdated',
        sts.struct({
            poolId: sts.number(),
            metadata: v100.BoundedVec,
        })
    ),
}

export const poolMetadataRemoved =  {
    name: 'OffchainComputingPool.PoolMetadataRemoved',
    v100: new EventType(
        'OffchainComputingPool.PoolMetadataRemoved',
        sts.struct({
            poolId: sts.number(),
        })
    ),
}

export const poolSettingsUpdated =  {
    name: 'OffchainComputingPool.PoolSettingsUpdated',
    v100: new EventType(
        'OffchainComputingPool.PoolSettingsUpdated',
        sts.struct({
            poolId: sts.number(),
            minImplSpecVersion: sts.number(),
            maxImplSpecVersion: sts.number(),
            jobScheduler: v100.JobScheduler,
            createJobEnabled: sts.boolean(),
            autoDestroyProcessedJobEnabled: sts.boolean(),
        })
    ),
}

export const jobPolicyCreated =  {
    name: 'OffchainComputingPool.JobPolicyCreated',
    v100: new EventType(
        'OffchainComputingPool.JobPolicyCreated',
        sts.struct({
            poolId: sts.number(),
            policyId: sts.number(),
            applicableScope: v100.ApplicableScope,
            startBlock: sts.option(() => sts.number()),
            endBlock: sts.option(() => sts.number()),
        })
    ),
}

export const accountAuthorized =  {
    name: 'OffchainComputingPool.AccountAuthorized',
    v100: new EventType(
        'OffchainComputingPool.AccountAuthorized',
        sts.struct({
            poolId: sts.number(),
            policyId: sts.number(),
            account: v100.AccountId32,
        })
    ),
}

export const accountRevoked =  {
    name: 'OffchainComputingPool.AccountRevoked',
    v100: new EventType(
        'OffchainComputingPool.AccountRevoked',
        sts.struct({
            poolId: sts.number(),
            policyId: sts.number(),
            account: v100.AccountId32,
        })
    ),
}

export const jobPolicyDestroyed =  {
    name: 'OffchainComputingPool.JobPolicyDestroyed',
    v100: new EventType(
        'OffchainComputingPool.JobPolicyDestroyed',
        sts.struct({
            poolId: sts.number(),
            policyId: sts.number(),
        })
    ),
}

export const jobPolicyEnablementUpdated =  {
    name: 'OffchainComputingPool.JobPolicyEnablementUpdated',
    v100: new EventType(
        'OffchainComputingPool.JobPolicyEnablementUpdated',
        sts.struct({
            poolId: sts.number(),
            policyId: sts.number(),
            enabled: sts.boolean(),
        })
    ),
}

export const workerAuthorized =  {
    name: 'OffchainComputingPool.WorkerAuthorized',
    v100: new EventType(
        'OffchainComputingPool.WorkerAuthorized',
        sts.struct({
            poolId: sts.number(),
            worker: v100.AccountId32,
        })
    ),
}

export const workerRevoked =  {
    name: 'OffchainComputingPool.WorkerRevoked',
    v100: new EventType(
        'OffchainComputingPool.WorkerRevoked',
        sts.struct({
            poolId: sts.number(),
            worker: v100.AccountId32,
        })
    ),
}

export const workerSubscribed =  {
    name: 'OffchainComputingPool.WorkerSubscribed',
    v100: new EventType(
        'OffchainComputingPool.WorkerSubscribed',
        sts.struct({
            worker: v100.AccountId32,
            poolId: sts.number(),
        })
    ),
}

export const workerUnsubscribed =  {
    name: 'OffchainComputingPool.WorkerUnsubscribed',
    v100: new EventType(
        'OffchainComputingPool.WorkerUnsubscribed',
        sts.struct({
            worker: v100.AccountId32,
            poolId: sts.number(),
        })
    ),
}

export const jobCreated =  {
    name: 'OffchainComputingPool.JobCreated',
    v100: new EventType(
        'OffchainComputingPool.JobCreated',
        sts.struct({
            poolId: sts.number(),
            jobId: sts.number(),
            uniqueTrackId: sts.option(() => sts.bytes()),
            policyId: sts.number(),
            depositor: v100.AccountId32,
            beneficiary: v100.AccountId32,
            implSpecVersion: sts.number(),
            input: sts.option(() => v100.BoundedVec),
            expiresIn: sts.bigint(),
        })
    ),
}

export const jobDestroyed =  {
    name: 'OffchainComputingPool.JobDestroyed',
    v100: new EventType(
        'OffchainComputingPool.JobDestroyed',
        sts.struct({
            poolId: sts.number(),
            jobId: sts.number(),
            uniqueTrackId: sts.option(() => sts.bytes()),
            destroyer: v100.AccountId32,
            reason: v100.JobDestroyReason,
        })
    ),
}

export const jobAssigned =  {
    name: 'OffchainComputingPool.JobAssigned',
    v100: new EventType(
        'OffchainComputingPool.JobAssigned',
        sts.struct({
            poolId: sts.number(),
            jobId: sts.number(),
            assignee: v100.AccountId32,
            implBuildVersion: sts.number(),
        })
    ),
}

export const jobResigned =  {
    name: 'OffchainComputingPool.JobResigned',
    v100: new EventType(
        'OffchainComputingPool.JobResigned',
        sts.struct({
            poolId: sts.number(),
            jobId: sts.number(),
        })
    ),
}

export const jobStatusUpdated =  {
    name: 'OffchainComputingPool.JobStatusUpdated',
    v100: new EventType(
        'OffchainComputingPool.JobStatusUpdated',
        sts.struct({
            poolId: sts.number(),
            jobId: sts.number(),
            status: v100.JobStatus,
        })
    ),
}

export const jobResultUpdated =  {
    name: 'OffchainComputingPool.JobResultUpdated',
    v100: new EventType(
        'OffchainComputingPool.JobResultUpdated',
        sts.struct({
            poolId: sts.number(),
            jobId: sts.number(),
            result: v100.JobResult,
            output: sts.option(() => v100.BoundedVec),
            proof: sts.option(() => v100.BoundedVec),
        })
    ),
}
