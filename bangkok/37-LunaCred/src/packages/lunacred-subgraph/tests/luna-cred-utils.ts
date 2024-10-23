import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  CredibilityUpdated,
  Deposit,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  withdrawal
} from "../generated/LunaCred/LunaCred"

export function createCredibilityUpdatedEvent(
  user: Address,
  newCredibility: BigInt
): CredibilityUpdated {
  let credibilityUpdatedEvent = changetype<CredibilityUpdated>(newMockEvent())

  credibilityUpdatedEvent.parameters = new Array()

  credibilityUpdatedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  credibilityUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newCredibility",
      ethereum.Value.fromUnsignedBigInt(newCredibility)
    )
  )

  return credibilityUpdatedEvent
}

export function createDepositEvent(
  from: Address,
  recipient: Address,
  value: BigInt,
  credibilityAdded: BigInt
): Deposit {
  let depositEvent = changetype<Deposit>(newMockEvent())

  depositEvent.parameters = new Array()

  depositEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  depositEvent.parameters.push(
    new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  )
  depositEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )
  depositEvent.parameters.push(
    new ethereum.EventParam(
      "credibilityAdded",
      ethereum.Value.fromUnsignedBigInt(credibilityAdded)
    )
  )

  return depositEvent
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

  roleAdminChangedEvent.parameters = new Array()

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return roleAdminChangedEvent
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

  roleGrantedEvent.parameters = new Array()

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleGrantedEvent
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  roleRevokedEvent.parameters = new Array()

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleRevokedEvent
}

export function createwithdrawalEvent(
  _from: Address,
  _to: Address,
  _value: BigInt
): withdrawal {
  let withdrawalEvent = changetype<withdrawal>(newMockEvent())

  withdrawalEvent.parameters = new Array()

  withdrawalEvent.parameters.push(
    new ethereum.EventParam("_from", ethereum.Value.fromAddress(_from))
  )
  withdrawalEvent.parameters.push(
    new ethereum.EventParam("_to", ethereum.Value.fromAddress(_to))
  )
  withdrawalEvent.parameters.push(
    new ethereum.EventParam("_value", ethereum.Value.fromUnsignedBigInt(_value))
  )

  return withdrawalEvent
}
