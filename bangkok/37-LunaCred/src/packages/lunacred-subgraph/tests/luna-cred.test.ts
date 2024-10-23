import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { CredibilityUpdated } from "../generated/schema"
import { CredibilityUpdated as CredibilityUpdatedEvent } from "../generated/LunaCred/LunaCred"
import { handleCredibilityUpdated } from "../src/luna-cred"
import { createCredibilityUpdatedEvent } from "./luna-cred-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let user = Address.fromString("0x0000000000000000000000000000000000000001")
    let newCredibility = BigInt.fromI32(234)
    let newCredibilityUpdatedEvent = createCredibilityUpdatedEvent(
      user,
      newCredibility
    )
    handleCredibilityUpdated(newCredibilityUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("CredibilityUpdated created and stored", () => {
    assert.entityCount("CredibilityUpdated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "CredibilityUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "user",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "CredibilityUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "newCredibility",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
