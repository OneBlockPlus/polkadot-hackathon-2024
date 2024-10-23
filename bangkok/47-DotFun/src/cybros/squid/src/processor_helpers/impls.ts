import type {Context} from "../processor"
import {events} from "../types"
import * as v100 from "../types/v100"
import {AttestationMethod} from "../model"
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

interface ImplChanges {
  readonly id: string
  readonly implId: number

  owner?: string

  attestationMethod?: AttestationMethod
  metadata?: Uint8Array | null

  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export function preprocessImplsEvents(ctx: Context): Map<string, ImplChanges> {
  const changeSet = new Map<string, ImplChanges>();

  for (let block of ctx.blocks) {
    assert(block.header.timestamp)
    const blockTime = new Date(block.header.timestamp);

    for (let event of block.events) {
      if (event.name == events.offchainComputingInfra.implRegistered.name) {
        let rec: {
          implId: number,
          owner: string,
          attestationMethod: v100.AttestationMethod,
        }
        if (events.offchainComputingInfra.implRegistered.v100.is(event)) {
          rec = events.offchainComputingInfra.implRegistered.v100.decode(event)
        } else {
          throw new Error("Unsupported spec")
        }

        const id = rec.implId.toString()
        const changes: ImplChanges = changeSet.get(id) || {
          id,
          implId: rec.implId,
          createdAt: blockTime,
          updatedAt: blockTime
        }

        changes.owner = decodeSS58Address(hexToU8a(rec.owner))
        changes.attestationMethod = decodeAttestationMethod(rec.attestationMethod)

        changes.deletedAt = null
        changes.updatedAt = blockTime

        changeSet.set(id, changes)
      } else if (event.name == events.offchainComputingInfra.implDeregistered.name) {
        let rec: { implId: number }
        if (events.offchainComputingInfra.implDeregistered.v100.is(event)) {
          rec = events.offchainComputingInfra.implDeregistered.v100.decode(event)
        } else {
          throw new Error('Unsupported spec')
        }

        const id = rec.implId.toString()
        let changes: ImplChanges = changeSet.get(id) || {
          id,
          implId: rec.implId,
          createdAt: blockTime,
          updatedAt: blockTime
        }
        changes.updatedAt = blockTime
        changes.deletedAt = blockTime

        changeSet.set(id, changes)
      } else if (event.name == events.offchainComputingInfra.implMetadataUpdated.name) {
        let rec: { implId: number, metadata: string }
        if (events.offchainComputingInfra.implMetadataUpdated.v100.is(event)) {
          rec = events.offchainComputingInfra.implMetadataUpdated.v100.decode(event)
        } else {
          throw new Error('Unsupported spec')
        }

        const id = rec.implId.toString()
        let changes: ImplChanges = changeSet.get(id) || {
          id,
          implId: rec.implId,
          createdAt: blockTime,
          updatedAt: blockTime
        }
        assert(!changes.deletedAt)

        changes.metadata = hexToU8a(rec.metadata)
        changes.updatedAt = blockTime

        changeSet.set(id, changes)
      } else if (event.name == "OffchainComputingInfra.ImplMetadataRemoved") {
        let rec: { implId: number }
        if (events.offchainComputingInfra.implMetadataRemoved.v100.is(event)) {
          rec = events.offchainComputingInfra.implMetadataRemoved.v100.decode(event)
        } else {
          throw new Error('Unsupported spec')
        }

        const id = rec.implId.toString()
        let changes: ImplChanges = changeSet.get(id) || {
          id,
          implId: rec.implId,
          createdAt: blockTime,
          updatedAt: blockTime
        }
        assert(!changes.deletedAt)

        changes.metadata = null
        changes.updatedAt = blockTime

        changeSet.set(id, changes)
      }
    }
  }

  return changeSet
}
