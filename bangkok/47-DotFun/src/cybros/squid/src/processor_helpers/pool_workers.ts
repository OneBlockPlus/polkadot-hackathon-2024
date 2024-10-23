import type {Context} from "../processor"
import {events} from "../types"
import {decodeSS58Address, hexToU8a} from "../utils"
import {WorkerEventKind} from "../model";
import assert from "assert";

interface WorkerEvent {
  readonly id: string
  readonly sequence: number

  readonly kind: WorkerEventKind
  readonly payload?: any

  readonly blockNumber: number
  readonly blockTime: Date
}

interface PoolWorkerChanges {
  readonly id: string
  readonly poolId: number
  readonly worker: string

  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null

  poolWorkerCountChange: number

  workerEvents: WorkerEvent[]
}

export function preprocessPoolWorkersEvents(ctx: Context): Map<string, PoolWorkerChanges> {
  const changeSet = new Map<string, PoolWorkerChanges>();

  for (let block of ctx.blocks) {
    assert(block.header.timestamp)
    const blockNumber = block.header.height
    const blockTime = new Date(block.header.timestamp);

    for (let event of block.events) {
      if (event.name == events.offchainComputingPool.workerSubscribed.name) {
        let rec: { worker: string, poolId: number }
        if (events.offchainComputingPool.workerSubscribed.v100.is(event)) {
          rec = events.offchainComputingPool.workerSubscribed.v100.decode(event)
        } else {
          throw new Error("Unsupported spec")
        }

        const worker = decodeSS58Address(hexToU8a(rec.worker))
        const id = `${rec.poolId}-${worker}`
        const changes: PoolWorkerChanges = changeSet.get(id) || {
          id,
          poolId: rec.poolId,
          worker,
          createdAt: blockTime,
          updatedAt: blockTime,
          poolWorkerCountChange: 0,
          workerEvents: []
        }

        changes.deletedAt = null
        changes.updatedAt = blockTime
        changes.poolWorkerCountChange = 1
        changes.workerEvents.push({
          id: `${id}-${blockNumber}-${event.index}`,
          sequence: blockNumber * 100 + changes.workerEvents.length,
          kind: WorkerEventKind.SubscribedPool,
          payload: {poolId: rec.poolId},
          blockNumber,
          blockTime,
        })

        changeSet.set(id, changes)
      } else if (event.name == events.offchainComputingPool.workerUnsubscribed.name) {
        let rec: { worker: string, poolId: number }
        if (events.offchainComputingPool.workerUnsubscribed.v100.is(event)) {
          rec = events.offchainComputingPool.workerUnsubscribed.v100.decode(event)
        } else {
          throw new Error('Unsupported spec')
        }

        const worker = decodeSS58Address(hexToU8a(rec.worker))
        const id = `${rec.poolId}-${worker}`
        const changes: PoolWorkerChanges = changeSet.get(id) || {
          id,
          poolId: rec.poolId,
          worker,
          createdAt: blockTime,
          updatedAt: blockTime,
          poolWorkerCountChange: 0,
          workerEvents: []
        }

        changes.deletedAt = blockTime
        changes.updatedAt = blockTime
        changes.poolWorkerCountChange = -1
        changes.workerEvents.push({
          id: `${id}-${blockNumber}-${event.index}`,
          sequence: blockNumber * 100 + changes.workerEvents.length,
          kind: WorkerEventKind.UnsubscribedPool,
          payload: {poolId: rec.poolId},
          blockNumber,
          blockTime,
        })

        changeSet.set(id, changes)
      }
    }
  }

  return changeSet
}
