import type {Context} from "../processor"
import {events} from "../types"
import * as v100 from "../types/v100"
import {AttestationMethod, OfflineReason, WorkerEventKind, WorkerStatus} from "../model"
import {decodeSS58Address, hexToU8a} from "../utils"
import assert from "assert";

function decodeAttestationMethod(attestationMethod?: v100.AttestationMethod): AttestationMethod {
  if (!attestationMethod) {
    throw new Error("Unexpected undefined attestation method")
  }

  const kind = attestationMethod.__kind
  switch (kind) {
    case "OptOut":
      return AttestationMethod.OptOut
    default:
      throw new Error(`Unrecognized attestation method ${kind}`)
  }
}

function decodeOfflineReason(offlineReason?: v100.OfflineReason): OfflineReason {
  if (!offlineReason) {
    throw new Error("Unexpected undefined offline reason")
  }

  const kind = offlineReason.__kind
  switch (kind) {
    case "Graceful":
      return OfflineReason.Graceful
    case "Forced":
      return OfflineReason.Forced
    case "Unresponsive":
      return OfflineReason.Unresponsive
    case "AttestationExpired":
      return OfflineReason.AttestationExpired
    case "ImplBuildRetired":
      return OfflineReason.ImplBuildRetired
    case "InsufficientDepositFunds":
      return OfflineReason.InsufficientDepositFunds
    case "Other":
      return OfflineReason.Other
    default:
      throw new Error(`Unrecognized offline reason ${kind}`)
  }
}

interface WorkerEvent {
  readonly id: string
  readonly sequence: number

  readonly kind: WorkerEventKind
  readonly payload?: any

  readonly blockNumber: number
  readonly blockTime: Date
}

interface WorkerChanges {
  readonly id: string
  readonly address: string

  owner?: string
  implId?: number

  status?: WorkerStatus
  implSpecVersion?: number | null
  implBuildVersion?: number | null
  attestationMethod?: AttestationMethod | null
  attestationExpiresAt?: Date | null
  lastAttestedAt?: Date | null
  lastHeartbeatReceivedAt?: Date | null
  offlineAt?: Date
  offlineReason?: OfflineReason
  uptimeStartedAt?: Date | null
  uptime?: number | null

  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null

  registerWorkerCountChange: number
  onlineWorkerCountChange: number

  events: WorkerEvent[]
}

export function preprocessWorkersEvents(ctx: Context): Map<string, WorkerChanges> {
  const changeSet = new Map<string, WorkerChanges>();

  for (let block of ctx.blocks) {
    assert(block.header.timestamp)
    const blockNumber = block.header.height
    const blockTime = new Date(block.header.timestamp);

    for (let event of block.events) {
      if (event.name == events.offchainComputingInfra.workerRegistered.name) {
        let rec: { worker: string, owner: string, implId: number }
        if (events.offchainComputingInfra.workerRegistered.v100.is(event)) {
          rec = events.offchainComputingInfra.workerRegistered.v100.decode(event)
        } else {
          throw new Error("Unsupported spec")
        }

        const address = decodeSS58Address(hexToU8a(rec.worker))
        const id = address
        const changes: WorkerChanges = changeSet.get(id) || {
          id,
          address,
          createdAt: blockTime,
          updatedAt: blockTime,
          registerWorkerCountChange: 0,
          onlineWorkerCountChange: 0,
          events: []
        }

        changes.updatedAt = blockTime
        changes.deletedAt = null

        changes.owner = decodeSS58Address(hexToU8a(rec.owner))
        changes.status = WorkerStatus.Registered
        changes.implId = rec.implId

        changes.registerWorkerCountChange = 1
        changes.onlineWorkerCountChange = 0
        changes.events.push({
          id: `${id}-${blockNumber}-${event.index}`,
          sequence: blockNumber * 100 + changes.events.length,
          kind: WorkerEventKind.Registered,
          payload: {implId: rec.implId},
          blockNumber,
          blockTime,
        })

        changeSet.set(id, changes)
      } else if (event.name == events.offchainComputingInfra.workerDeregistered.name) {
        let rec: { worker: string, force: boolean }
        if (events.offchainComputingInfra.workerDeregistered.v100.is(event)) {
          rec = events.offchainComputingInfra.workerDeregistered.v100.decode(event)
        } else {
          throw new Error('Unsupported spec')
        }

        const address = decodeSS58Address(hexToU8a(rec.worker))
        const id = address
        let changes: WorkerChanges = changeSet.get(id) || {
          id,
          address,
          createdAt: blockTime,
          updatedAt: blockTime,
          registerWorkerCountChange: 0,
          onlineWorkerCountChange: 0,
          events: []
        }
        assert(!changes.deletedAt)

        changes.updatedAt = blockTime
        changes.deletedAt = blockTime

        changes.implSpecVersion = null
        changes.implBuildVersion = null
        changes.attestationMethod = null
        changes.attestationExpiresAt = null
        changes.lastAttestedAt = null
        changes.lastHeartbeatReceivedAt = null
        changes.uptime = null
        changes.uptimeStartedAt = null

        changes.registerWorkerCountChange -= 1
        changes.onlineWorkerCountChange -= rec.force ? 1 : 0
        changes.events.push({
          id: `${id}-${blockNumber}-${event.index}`,
          sequence: blockNumber * 100 + changes.events.length,
          kind: WorkerEventKind.Deregistered,
          payload: {force: rec.force},
          blockNumber,
          blockTime,
        })

        changeSet.set(id, changes)
      } else if (event.name == events.offchainComputingInfra.workerOnline.name) {
        let rec: {
          worker: string,
          implSpecVersion: number,
          implBuildVersion: number,
          attestationMethod: v100.AttestationMethod,
          attestationExpiresAt?: bigint,
          nextHeartbeat: number
        }
        if (events.offchainComputingInfra.workerOnline.v100.is(event)) {
          rec = events.offchainComputingInfra.workerOnline.v100.decode(event)
        } else {
          throw new Error('Unsupported spec')
        }

        const address = decodeSS58Address(hexToU8a(rec.worker))
        const id = address
        const changes: WorkerChanges = changeSet.get(id) || {
          id,
          address,
          createdAt: blockTime,
          updatedAt: blockTime,
          registerWorkerCountChange: 0,
          onlineWorkerCountChange: 0,
          events: []
        }
        assert(!changes.deletedAt)

        changes.status = WorkerStatus.Online
        changes.implSpecVersion = rec.implSpecVersion
        changes.implBuildVersion = rec.implBuildVersion
        changes.attestationMethod = decodeAttestationMethod(rec.attestationMethod)
        changes.attestationExpiresAt = rec.attestationExpiresAt ? new Date(Number(rec.attestationExpiresAt)) : undefined
        changes.lastAttestedAt = blockTime
        changes.lastHeartbeatReceivedAt = blockTime
        changes.uptime = 0
        changes.uptimeStartedAt = blockTime
        changes.updatedAt = blockTime

        changes.onlineWorkerCountChange += 1
        changes.events.push({
          id: `${id}-${blockNumber}-${event.index}`,
          sequence: blockNumber * 100 + changes.events.length,
          kind: WorkerEventKind.Online,
          blockNumber,
          blockTime,
        })

        changeSet.set(id, changes)
      } else if (event.name == events.offchainComputingInfra.workerUnresponsive.name) {
        let rec: { worker: string }
        if (events.offchainComputingInfra.workerUnresponsive.v100.is(event)) {
          rec = events.offchainComputingInfra.workerUnresponsive.v100.decode(event)
        } else {
          throw new Error('Unsupported spec')
        }

        const address = decodeSS58Address(hexToU8a(rec.worker))
        const id = address
        const changes: WorkerChanges = changeSet.get(id) || {
          id,
          address,
          createdAt: blockTime,
          updatedAt: blockTime,
          registerWorkerCountChange: 0,
          onlineWorkerCountChange: 0,
          events: []
        }
        assert(!changes.deletedAt)

        changes.status = WorkerStatus.Unresponsive
        changes.updatedAt = blockTime

        changes.onlineWorkerCountChange -= 1
        changes.events.push({
          id: `${id}-${blockNumber}-${event.index}`,
          sequence: blockNumber * 100 + changes.events.length,
          kind: WorkerEventKind.Unresponsive,
          blockNumber,
          blockTime,
        })

        changeSet.set(id, changes)
      } else if (event.name == events.offchainComputingInfra.workerRequestingOffline.name) {
        let rec: { worker: string }
        if (events.offchainComputingInfra.workerRequestingOffline.v100.is(event)) {
          rec = events.offchainComputingInfra.workerRequestingOffline.v100.decode(event)
        } else {
          throw new Error('Unsupported spec')
        }

        const address = decodeSS58Address(hexToU8a(rec.worker))
        const id = address
        const changes: WorkerChanges = changeSet.get(id) || {
          id,
          address,
          createdAt: blockTime,
          updatedAt: blockTime,
          registerWorkerCountChange: 0,
          onlineWorkerCountChange: 0,
          events: []
        }
        assert(!changes.deletedAt)

        changes.status = WorkerStatus.RequestingOffline
        changes.updatedAt = blockTime

        changes.events.push({
          id: `${id}-${blockNumber}-${event.index}`,
          sequence: blockNumber * 100 + changes.events.length,
          kind: WorkerEventKind.RequestingOffline,
          blockNumber,
          blockTime,
        })

        changeSet.set(id, changes)
      } else if (event.name == events.offchainComputingInfra.workerOffline.name) {
        let rec: { worker: string, reason: v100.OfflineReason }
        if (events.offchainComputingInfra.workerOffline.v100.is(event)) {
          rec = events.offchainComputingInfra.workerOffline.v100.decode(event)
        } else {
          throw new Error('Unsupported spec')
        }

        const address = decodeSS58Address(hexToU8a(rec.worker))
        const id = address
        const changes: WorkerChanges = changeSet.get(id) || {
          id,
          address,
          createdAt: blockTime,
          updatedAt: blockTime,
          registerWorkerCountChange: 0,
          onlineWorkerCountChange: 0,
          events: []
        }
        assert(!changes.deletedAt)

        changes.status = WorkerStatus.Offline
        changes.offlineReason = decodeOfflineReason(rec.reason)
        changes.offlineAt = blockTime
        changes.updatedAt = blockTime

        changes.implSpecVersion = null
        changes.implBuildVersion = null
        changes.attestationMethod = null
        changes.attestationExpiresAt = null
        changes.lastAttestedAt = null
        changes.lastHeartbeatReceivedAt = null
        changes.uptime = null
        changes.uptimeStartedAt = null

        changes.onlineWorkerCountChange -= 1
        changes.events.push({
          id: `${id}-${blockNumber}-${event.index}`,
          sequence: blockNumber * 100 + changes.events.length,
          kind: WorkerEventKind.Offline,
          blockNumber,
          blockTime,
        })

        changeSet.set(id, changes)
      } else if (event.name == events.offchainComputingInfra.workerHeartbeatReceived.name) {
        let rec: { worker: string, next: number, uptime: bigint }
        if (events.offchainComputingInfra.workerHeartbeatReceived.v100.is(event)) {
          rec = events.offchainComputingInfra.workerHeartbeatReceived.v100.decode(event)
        } else {
          throw new Error('Unsupported spec')
        }

        const address = decodeSS58Address(hexToU8a(rec.worker))
        const id = address
        const changes: WorkerChanges = changeSet.get(id) || {
          id,
          address,
          createdAt: blockTime,
          updatedAt: blockTime,
          registerWorkerCountChange: 0,
          onlineWorkerCountChange: 0,
          events: []
        }
        assert(!changes.deletedAt)

        changes.lastHeartbeatReceivedAt = blockTime
        changes.uptime = Number(rec.uptime)
        changes.updatedAt = blockTime

        changeSet.set(id, changes)
      } else if (event.name == events.offchainComputingInfra.workerAttestationRefreshed.name) {
        let rec: { worker: string, expiresAt?: bigint }
        if (events.offchainComputingInfra.workerAttestationRefreshed.v100.is(event)) {
          rec = events.offchainComputingInfra.workerAttestationRefreshed.v100.decode(event)
        } else {
          throw new Error('Unsupported spec')
        }

        const address = decodeSS58Address(hexToU8a(rec.worker))
        const id = address
        const changes: WorkerChanges = changeSet.get(id) || {
          id,
          address,
          createdAt: blockTime,
          updatedAt: blockTime,
          registerWorkerCountChange: 0,
          onlineWorkerCountChange: 0,
          events: []
        }
        assert(!changes.deletedAt)

        changes.attestationExpiresAt = rec.expiresAt ? new Date(Number(rec.expiresAt)) : null
        changes.lastAttestedAt = blockTime
        changes.updatedAt = blockTime

        changes.events.push({
          id: `${id}-${blockNumber}-${event.index}`,
          sequence: blockNumber * 100 + changes.events.length,
          kind: WorkerEventKind.AttestationRefreshed,
          blockNumber,
          blockTime,
        })

        changeSet.set(id, changes)
      }
    }
  }

  return changeSet
}
