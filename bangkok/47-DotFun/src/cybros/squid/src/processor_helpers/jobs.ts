import type {Context} from "../processor"
import {events} from "../types"
import * as v100 from "../types/v100";
import {JobEventKind, JobResult, JobStatus} from "../model";
import {decodeSS58Address, hexToString, hexToU8a} from "../utils"
import assert from "assert";

function decodeJobStatus(jobStatus?: v100.JobStatus): JobStatus {
  if (!jobStatus) {
    throw new Error("Unexpected undefined job status")
  }

  const kind = jobStatus.__kind
  switch (kind) {
    case "Pending":
      return JobStatus.Pending
    case "Processing":
      return JobStatus.Processing
    case "Processed":
      return JobStatus.Processed
    case "Discarded":
      return JobStatus.Discarded
    default:
      throw new Error(`Unrecognized job status ${kind}`)
  }
}

function decodeJobResult(jobResult?: v100.JobResult): JobResult {
  if (!jobResult) {
    throw new Error("Unexpected undefined job result")
  }

  const kind = jobResult.__kind
  switch (kind) {
    case "Success":
      return JobResult.Success
    case "Fail":
      return JobResult.Fail
    case "Error":
      return JobResult.Error
    case "Panic":
      return JobResult.Panic
    default:
      throw new Error(`Unrecognized job result ${kind}`)
  }
}

function convertJobResultToEventKind(jobResult: JobResult): JobEventKind {
  switch (jobResult) {
    case "Success":
      return JobEventKind.Success
    case "Fail":
      return JobEventKind.Fail
    case "Error":
      return JobEventKind.Error
    case "Panic":
      return JobEventKind.Panic
    default:
      throw new Error(`Unrecognized job result ${jobResult}`)
  }
}

interface JobEvent {
  readonly id: string
  readonly sequence: number

  readonly kind: JobEventKind
  readonly payload?: any

  readonly blockNumber: number
  readonly blockTime: Date
}

interface JobChanges {
  readonly id: string
  readonly jobId: number

  uniqueTrackId?: string
  poolId?: number
  policyId?: number
  depositor?: string
  beneficiary?: string
  assignee?: string | null
  destroyer?: string
  implBuildVersion?: number | null

  implSpecVersion?: number
  status?: JobStatus
  result?: JobResult

  input?: string | null
  output?: string | null
  proof?: string | null

  expiresAt?: Date
  assignedAt?: Date | null
  processingAt?: Date
  endedAt?: Date
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null

  pendingJobsCountChange: number
  workerPendingJobsCountChange: number
  processingJobsCountChange: number
  processedJobsCountChange: number
  successfulJobsCountChange: number
  failedJobsCountChange: number
  erroredJobsCountChange: number
  panickyJobsCountChange: number

  events: JobEvent[]
}

export function preprocessJobsEvents(ctx: Context): Map<string, JobChanges> {
  const changeSet = new Map<string, JobChanges>();

  for (let block of ctx.blocks) {
    assert(block.header.timestamp)
    const blockNumber = block.header.height
    const blockTime = new Date(block.header.timestamp);

    for (let event of block.events) {
      if (event.name == events.offchainComputingPool.jobCreated.name) {
        let rec: {
          poolId: number,
          jobId: number,
          policyId: number,
          depositor: string,
          beneficiary: string,
          implSpecVersion: number,
          input?: string,
          uniqueTrackId?: string,
          expiresIn: bigint
        }
        if (events.offchainComputingPool.jobCreated.v100.is(event)) {
          rec = events.offchainComputingPool.jobCreated.v100.decode(event)
        } else {
          throw new Error("Unsupported spec")
        }

        const id = `${rec.poolId}-${rec.jobId}`
        const changes: JobChanges = changeSet.get(id) || {
          id,
          poolId: rec.poolId,
          jobId: rec.jobId,
          createdAt: blockTime,
          updatedAt: blockTime,
          pendingJobsCountChange: 0,
          workerPendingJobsCountChange: 0,
          processingJobsCountChange: 0,
          processedJobsCountChange: 0,
          successfulJobsCountChange: 0,
          failedJobsCountChange: 0,
          erroredJobsCountChange: 0,
          panickyJobsCountChange: 0,
          events: [],
        }

        changes.uniqueTrackId = rec.uniqueTrackId
        changes.policyId = rec.policyId
        changes.depositor = decodeSS58Address(hexToU8a(rec.depositor))
        changes.beneficiary = decodeSS58Address(hexToU8a(rec.beneficiary))
        changes.status = JobStatus.Pending
        changes.implSpecVersion = rec.implSpecVersion
        changes.input = (() => {
          if (rec.input === undefined) {
            return null
          }

          try {
            return JSON.parse(hexToString(rec.input))
          } catch (_e) {}

          return rec.input
        })()
        changes.expiresAt = new Date(block.header.timestamp + Number(rec.expiresIn) * 1000)

        changes.deletedAt = null
        changes.updatedAt = blockTime

        changes.pendingJobsCountChange += 1

        changes.events.push({
          id: `${id}-${blockNumber}-${event.index}`,
          sequence: blockNumber * 100 + changes.events.length,
          kind: JobEventKind.Created,
          blockNumber,
          blockTime,
        })

        changeSet.set(id, changes)
      } else if (event.name == events.offchainComputingPool.jobDestroyed.name) {
        let rec: {
          poolId: number,
          jobId: number,
          uniqueTrackId?: string,
          destroyer: string,
          reason: v100.JobDestroyReason
        }
        if (events.offchainComputingPool.jobDestroyed.v100.is(event)) {
          rec = events.offchainComputingPool.jobDestroyed.v100.decode(event)
        } else {
          throw new Error('Unsupported spec')
        }

        const id = `${rec.poolId}-${rec.jobId}`
        const changes: JobChanges = changeSet.get(id) || {
          id,
          poolId: rec.poolId,
          jobId: rec.jobId,
          createdAt: blockTime,
          updatedAt: blockTime,
          pendingJobsCountChange: 0,
          workerPendingJobsCountChange: 0,
          processingJobsCountChange: 0,
          processedJobsCountChange: 0,
          successfulJobsCountChange: 0,
          failedJobsCountChange: 0,
          erroredJobsCountChange: 0,
          panickyJobsCountChange: 0,
          events: []
        }
        assert(!changes.deletedAt)

        changes.uniqueTrackId = rec.uniqueTrackId
        changes.destroyer = decodeSS58Address(hexToU8a(rec.destroyer))
        changes.updatedAt = blockTime
        changes.deletedAt = blockTime

        switch (rec.reason.__kind) {
          case "Safe":
            changes.pendingJobsCountChange -= 1;
            break
          case "Force":
            changes.processingJobsCountChange -= 1;
            break;
        }

        changes.events.push({
          id: `${id}-${blockNumber}-${event.index}`,
          sequence: blockNumber * 100 + changes.events.length,
          kind: JobEventKind.Destroyed,
          payload: {reason: rec.reason.__kind},
          blockNumber,
          blockTime,
        })

        changeSet.set(id, changes)
      } else if (event.name == events.offchainComputingPool.jobAssigned.name) {
        let rec: { poolId: number, jobId: number, assignee: string, implBuildVersion: number }
        if (events.offchainComputingPool.jobAssigned.v100.is(event)) {
          rec = events.offchainComputingPool.jobAssigned.v100.decode(event)
        } else {
          throw new Error('Unsupported spec')
        }

        const id = `${rec.poolId}-${rec.jobId}`
        const changes: JobChanges = changeSet.get(id) || {
          id,
          poolId: rec.poolId,
          jobId: rec.jobId,
          createdAt: blockTime,
          updatedAt: blockTime,
          pendingJobsCountChange: 0,
          workerPendingJobsCountChange: 0,
          processingJobsCountChange: 0,
          processedJobsCountChange: 0,
          successfulJobsCountChange: 0,
          failedJobsCountChange: 0,
          erroredJobsCountChange: 0,
          panickyJobsCountChange: 0,
          events: []
        }
        assert(!changes.deletedAt)

        changes.implBuildVersion = rec.implBuildVersion
        changes.assignee = decodeSS58Address(hexToU8a(rec.assignee))
        changes.assignedAt = blockTime
        changes.updatedAt = blockTime

        changes.workerPendingJobsCountChange += 1

        changes.events.push({
          id: `${id}-${blockNumber}-${event.index}`,
          sequence: blockNumber * 100 + changes.events.length,
          kind: JobEventKind.Assigned,
          payload: {assignee: changes.assignee},
          blockNumber,
          blockTime,
        })

        changeSet.set(id, changes)
      } else if (event.name == events.offchainComputingPool.jobResigned.name) {
        let rec: { poolId: number, jobId: number }
        if (events.offchainComputingPool.jobResigned.v100.is(event)) {
          rec = events.offchainComputingPool.jobResigned.v100.decode(event)
        } else {
          throw new Error('Unsupported spec')
        }

        const id = `${rec.poolId}-${rec.jobId}`
        const changes: JobChanges = changeSet.get(id) || {
          id,
          poolId: rec.poolId,
          jobId: rec.jobId,
          createdAt: blockTime,
          updatedAt: blockTime,
          pendingJobsCountChange: 0,
          workerPendingJobsCountChange: 0,
          processingJobsCountChange: 0,
          processedJobsCountChange: 0,
          successfulJobsCountChange: 0,
          failedJobsCountChange: 0,
          erroredJobsCountChange: 0,
          panickyJobsCountChange: 0,
          events: []
        }
        assert(!changes.deletedAt)

        changes.implBuildVersion = null
        changes.assignee = null
        changes.assignedAt = null
        changes.updatedAt = blockTime

        changes.workerPendingJobsCountChange -= 1

        changes.events.push({
          id: `${id}-${blockNumber}-${event.index}`,
          sequence: blockNumber * 100 + changes.events.length,
          kind: JobEventKind.Resigned,
          blockNumber,
          blockTime,
        })

        changeSet.set(id, changes)
      } else if (event.name == events.offchainComputingPool.jobStatusUpdated.name) {
        let rec: { poolId: number, jobId: number, status: v100.JobStatus }
        if (events.offchainComputingPool.jobStatusUpdated.v100.is(event)) {
          rec = events.offchainComputingPool.jobStatusUpdated.v100.decode(event)
        } else {
          throw new Error('Unsupported spec')
        }

        const id = `${rec.poolId}-${rec.jobId}`
        const changes: JobChanges = changeSet.get(id) || {
          id,
          poolId: rec.poolId,
          jobId: rec.jobId,
          createdAt: blockTime,
          updatedAt: blockTime,
          pendingJobsCountChange: 0,
          workerPendingJobsCountChange: 0,
          processingJobsCountChange: 0,
          processedJobsCountChange: 0,
          successfulJobsCountChange: 0,
          failedJobsCountChange: 0,
          erroredJobsCountChange: 0,
          panickyJobsCountChange: 0,
          events: []
        }
        assert(!changes.deletedAt)

        changes.status = decodeJobStatus(rec.status)
        if (changes.status == JobStatus.Processing) {
          changes.processingAt = blockTime
        } else if (changes.status == JobStatus.Processed) {
          changes.endedAt = blockTime
        }
        changes.updatedAt = blockTime

        if (changes.status == JobStatus.Processing) {
          changes.pendingJobsCountChange -= 1;
          changes.workerPendingJobsCountChange -= 1
          changes.processingJobsCountChange += 1;
        } else if (changes.status == JobStatus.Processed) {
          changes.processingJobsCountChange -= 1;
          changes.processedJobsCountChange += 1;
        } else if (changes.status == JobStatus.Discarded) {
          changes.processingJobsCountChange -= 1;
          changes.processedJobsCountChange += 1;
        }

        if (changes.status == JobStatus.Processing) {
          changes.events.push({
            id: `${id}-${blockNumber}-${event.index}`,
            sequence: blockNumber * 100 + changes.events.length,
            kind: JobEventKind.Processing,
            blockNumber,
            blockTime,
          })
        }

        changeSet.set(id, changes)
      } else if (event.name == events.offchainComputingPool.jobResultUpdated.name) {
        let rec: {
          poolId: number,
          jobId: number,
          result: v100.JobResult,
          output?: string,
          proof?: string
        }
        if (events.offchainComputingPool.jobResultUpdated.v100.is(event)) {
          rec = events.offchainComputingPool.jobResultUpdated.v100.decode(event)
        } else {
          throw new Error('Unsupported spec')
        }

        const id = `${rec.poolId}-${rec.jobId}`
        const changes: JobChanges = changeSet.get(id) || {
          id,
          poolId: rec.poolId,
          jobId: rec.jobId,
          createdAt: blockTime,
          updatedAt: blockTime,
          pendingJobsCountChange: 0,
          workerPendingJobsCountChange: 0,
          processingJobsCountChange: 0,
          processedJobsCountChange: 0,
          successfulJobsCountChange: 0,
          failedJobsCountChange: 0,
          erroredJobsCountChange: 0,
          panickyJobsCountChange: 0,
          events: []
        }
        assert(!changes.deletedAt)

        changes.result = decodeJobResult(rec.result)
        changes.output = (() => {
          if (rec.output === undefined) {
            return null
          }

          try {
            return JSON.parse(hexToString(rec.output))
          } catch (_e) {}

          return rec.output
        })()
        changes.proof = (() => {
          if (rec.proof === undefined) {
            return null
          }

          try {
            return JSON.parse(hexToString(rec.proof))
          } catch (_e) {}

          return rec.proof
        })()
        changes.updatedAt = blockTime

        switch (changes.result) {
          case JobResult.Success:
            changes.successfulJobsCountChange += 1
            break
          case JobResult.Fail:
            changes.failedJobsCountChange += 1
            break
          case JobResult.Error:
            changes.erroredJobsCountChange += 1
            break
          case JobResult.Panic:
            changes.panickyJobsCountChange += 1
            break
        }

        changes.events.push({
          id: `${id}-${blockNumber}-${event.index}`,
          sequence: blockNumber * 100 + changes.events.length,
          kind: convertJobResultToEventKind(changes.result),
          blockNumber,
          blockTime,
        })

        changeSet.set(id, changes)
      }
    }
  }

  return changeSet
}

