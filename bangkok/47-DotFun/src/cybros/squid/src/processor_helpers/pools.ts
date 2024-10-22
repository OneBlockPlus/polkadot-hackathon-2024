import type {Context} from "../processor"
import {events} from "../types"
import {decodeSS58Address, hexToString, hexToU8a} from "../utils";
import assert from "assert";
import * as v100 from "../types/v100";
import {JobScheduler} from "../model";

function decodeJobScheduler(scheduler?: v100.JobScheduler): JobScheduler {
  if (!scheduler) {
    throw new Error("Unexpected undefined scheduler")
  }

  const kind = scheduler.__kind
  switch (kind) {
    case "DemoOnly":
      return JobScheduler.DemoOnly
    default:
      throw new Error(`Unrecognized scope ${kind}`)
  }
}

interface PoolChanges {
  readonly id: string
  readonly poolId: number

  owner?: string
  implId?: number

  minImplSpecVersion?: number,
  maxImplSpecVersion?: number,
  jobScheduler?: JobScheduler,
  createJobEnabled?: boolean
  autoDestroyProcessedJobEnabled?: boolean
  metadata?: Uint8Array | null

  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export function preprocessPoolsEvents(ctx: Context): Map<string, PoolChanges> {
  const changeSet = new Map<string, PoolChanges>();

  for (let block of ctx.blocks) {
    assert(block.header.timestamp)
    const blockTime = new Date(block.header.timestamp);

    for (let event of block.events) {
      if (event.name == events.offchainComputingPool.poolCreated.name) {
        let rec: {
          owner: string,
          poolId: number,
          implId: number,
          jobScheduler: v100.JobScheduler,
          createJobEnabled: boolean,
          autoDestroyProcessedJobEnabled: boolean
        }
        if (events.offchainComputingPool.poolCreated.v100.is(event)) {
          rec = events.offchainComputingPool.poolCreated.v100.decode(event)
        } else {
          throw new Error("Unsupported spec")
        }

        const id = rec.poolId.toString()
        const changes: PoolChanges = changeSet.get(id) || {
          id,
          poolId: rec.poolId,
          createdAt: blockTime,
          updatedAt: blockTime
        }

        changes.owner = decodeSS58Address(hexToU8a(rec.owner))
        changes.implId = rec.poolId
        changes.minImplSpecVersion = 1
        changes.maxImplSpecVersion = 1
        changes.jobScheduler = decodeJobScheduler(rec.jobScheduler)
        changes.createJobEnabled = rec.createJobEnabled
        changes.autoDestroyProcessedJobEnabled = rec.autoDestroyProcessedJobEnabled
        changes.metadata = null

        changes.deletedAt = null
        changes.updatedAt = blockTime

        changeSet.set(id, changes)
      } else if (event.name == events.offchainComputingPool.poolDestroyed.name) {
        let rec: { poolId: number }
        if (events.offchainComputingPool.poolDestroyed.v100.is(event)) {
          rec = events.offchainComputingPool.poolDestroyed.v100.decode(event)
        } else {
          throw new Error('Unsupported spec')
        }

        const id = rec.poolId.toString()
        const changes: PoolChanges = changeSet.get(id) || {
          id,
          poolId: rec.poolId,
          createdAt: blockTime,
          updatedAt: blockTime
        }

        changes.deletedAt = blockTime
        changes.updatedAt = blockTime

        changeSet.set(id, changes)
      } else if (event.name == events.offchainComputingPool.poolMetadataUpdated.name) {
        let rec: { poolId: number, metadata: string }
        if (events.offchainComputingPool.poolMetadataUpdated.v100.is(event)) {
          rec = events.offchainComputingPool.poolMetadataUpdated.v100.decode(event)
        } else {
          throw new Error('Unsupported spec')
        }

        const id = rec.poolId.toString()
        const changes: PoolChanges = changeSet.get(id) || {
          id,
          poolId: rec.poolId,
          createdAt: blockTime,
          updatedAt: blockTime
        }
        assert(!changes.deletedAt)

        changes.metadata = (() => {
          if (rec.metadata === undefined) {
            return null
          }

          try {
            return JSON.parse(hexToString(rec.metadata))
          } catch (_e) {}

          return rec.metadata
        })()
        changes.updatedAt = blockTime

        changeSet.set(id, changes)
      } else if (event.name == events.offchainComputingPool.poolMetadataRemoved.name) {
        let rec: { poolId: number }
        if (events.offchainComputingPool.poolMetadataRemoved.v100.is(event)) {
          rec = events.offchainComputingPool.poolMetadataRemoved.v100.decode(event)
        } else {
          throw new Error('Unsupported spec')
        }

        const id = rec.poolId.toString()
        const changes: PoolChanges = changeSet.get(id) || {
          id,
          poolId: rec.poolId,
          createdAt: blockTime,
          updatedAt: blockTime
        }
        assert(!changes.deletedAt)

        changes.metadata = null
        changes.updatedAt = blockTime

        changeSet.set(id, changes)
      } else if (event.name == events.offchainComputingPool.poolSettingsUpdated.name) {
        let rec: {
          poolId: number,
          minImplSpecVersion: number,
          maxImplSpecVersion: number,
          createJobEnabled: boolean,
          autoDestroyProcessedJobEnabled: boolean
        }
        if (events.offchainComputingPool.poolSettingsUpdated.v100.is(event)) {
          rec = events.offchainComputingPool.poolSettingsUpdated.v100.decode(event)
        } else {
          throw new Error('Unsupported spec')
        }

        const id = rec.poolId.toString()
        const changes: PoolChanges = changeSet.get(id) || {
          id,
          poolId: rec.poolId,
          createdAt: blockTime,
          updatedAt: blockTime
        }
        assert(!changes.deletedAt)

        changes.minImplSpecVersion = rec.minImplSpecVersion
        changes.maxImplSpecVersion = rec.maxImplSpecVersion
        changes.createJobEnabled = rec.createJobEnabled
        changes.autoDestroyProcessedJobEnabled = rec.autoDestroyProcessedJobEnabled
        changes.updatedAt = blockTime

        changeSet.set(id, changes)
      }
    }
  }

  return changeSet
}
