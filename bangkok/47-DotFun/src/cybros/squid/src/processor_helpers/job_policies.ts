import type {Context} from "../processor"
import {events} from "../types"
import * as v100 from "../types/v100"
import {ApplicableScope} from "../model";
import assert from "assert";

function decodeScope(scope?: v100.ApplicableScope): ApplicableScope {
  if (!scope) {
    throw new Error("Unexpected undefined scope")
  }

  const kind = scope.__kind
  switch (kind) {
    case "Owner":
      return ApplicableScope.Owner
    case "Public":
      return ApplicableScope.Public
    case "AllowList":
      return ApplicableScope.AllowList
    default:
      throw new Error(`Unrecognized scope ${kind}`)
  }
}

interface JobPolicyChanges {
  readonly id: string
  readonly poolId: number
  readonly policyId: number

  enabled?: boolean
  applicableScope?: ApplicableScope
  startBlock?: number
  endBlock?: number

  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export function preprocessJobPoliciesEvents(ctx: Context): Map<string, JobPolicyChanges> {
  const changeSet = new Map<string, JobPolicyChanges>();

  for (let block of ctx.blocks) {
    assert(block.header.timestamp)
    const blockTime = new Date(block.header.timestamp);

    for (let event of block.events) {
      if (event.name == events.offchainComputingPool.jobPolicyCreated.name) {
        let rec: {
          poolId: number,
          policyId: number,
          applicableScope: v100.ApplicableScope,
          startBlock?: number,
          endBlock?: number
        }
        if (events.offchainComputingPool.jobPolicyCreated.v100.is(event)) {
          rec = events.offchainComputingPool.jobPolicyCreated.v100.decode(event)
        } else {
          throw new Error("Unsupported spec")
        }

        const id = `${rec.poolId}-${rec.policyId}`
        const changes: JobPolicyChanges = changeSet.get(id) || {
          id,
          poolId: rec.poolId,
          policyId: rec.policyId,
          createdAt: blockTime,
          updatedAt: blockTime
        }

        changes.enabled = true
        changes.applicableScope = decodeScope(rec.applicableScope)
        changes.startBlock = rec.startBlock
        changes.endBlock = rec.endBlock

        changes.deletedAt = null
        changes.updatedAt = blockTime

        changeSet.set(id, changes)
      } else if (event.name == events.offchainComputingPool.jobPolicyDestroyed.name) {
        let rec: { poolId: number, policyId: number }
        if (events.offchainComputingPool.jobPolicyDestroyed.v100.is(event)) {
          rec = events.offchainComputingPool.jobPolicyDestroyed.v100.decode(event)
        } else {
          throw new Error('Unsupported spec')
        }

        const id = `${rec.poolId}-${rec.policyId}`
        const changes: JobPolicyChanges = changeSet.get(id) || {
          id,
          poolId: rec.poolId,
          policyId: rec.policyId,
          createdAt: blockTime,
          updatedAt: blockTime
        }

        changes.enabled = false
        changes.deletedAt = blockTime
        changes.updatedAt = blockTime

        changeSet.set(id, changes)
      } else if (event.name == events.offchainComputingPool.jobPolicyEnablementUpdated.name) {
        let rec: { poolId: number, policyId: number, enabled: boolean }
        if (events.offchainComputingPool.jobPolicyEnablementUpdated.v100.is(event)) {
          rec = events.offchainComputingPool.jobPolicyEnablementUpdated.v100.decode(event)
        } else {
          throw new Error('Unsupported spec')
        }

        const id = `${rec.poolId}-${rec.policyId}`
        const changes: JobPolicyChanges = changeSet.get(id) || {
          id,
          poolId: rec.poolId,
          policyId: rec.policyId,
          createdAt: blockTime,
          updatedAt: blockTime
        }
        assert(!changes.deletedAt)

        changes.enabled = rec.enabled
        changes.updatedAt = blockTime

        changeSet.set(id, changes)
      }
    }
  }

  return changeSet
}
