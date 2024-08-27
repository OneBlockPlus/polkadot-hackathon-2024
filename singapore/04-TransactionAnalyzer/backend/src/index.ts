import express from "express"
import { WsProvider, ApiPromise } from "@polkadot/api"
import { TradeRouter, PoolService } from "@galacticcouncil/sdk"
import { HydrationSwapInput } from "./HydrationSwapInput"
import { ChopsticksProvider, connectParachains, setStorage, setup } from "@acala-network/chopsticks-core"

import { ChopsticksInput, XcmChopsticksInput } from "./ChopsticksInput"
import { SqliteDatabase } from "@acala-network/chopsticks-db"
import { blake2AsHex } from "@polkadot/util-crypto"
import "@polkadot/api-augment"
import { ChopsticksEventsOutput, XcmChopsticksEventsOutput } from "./ChopsticksEventsOutput"
import { hexToU8a } from "@polkadot/util"
import { disconnect } from "process"
import { error } from "console"
import { createApi } from "./helpers/fatchEvents"

const app = express()
// Middleware to parse JSON bodies
app.use(express.json())
const port = 8000

let tradeRouter: TradeRouter
const connect = async () => {
  if (tradeRouter != null) {
    return
  }
  // Initialize Polkadot API
  const wsProvider = new WsProvider("wss://rpc.hydradx.cloud")
  const api = await ApiPromise.create({ provider: wsProvider })

  // Initialize Trade Router
  const poolService = new PoolService(api)

  await poolService.syncRegistry()
  tradeRouter = new TradeRouter(poolService)
}

setInterval(connect, 1000 * 60 * 60 * 24)

app.get("/all-assets", async (req, res) => {
  await connect()

  const result = await tradeRouter.getAllAssets()
  res.send(result)
})

app.post("/dot-price", async (req, res) => {
  await connect()

  const input = req.body as HydrationSwapInput
  // Do something
  const result = await tradeRouter.getBestSpotPrice(input.tokenIn, input.tokenOut)
  res.send(result)
})

// Chopstics API
app.post("/get-extrinsic-events", async (req, res) => {
  console.log("request-body: ", req.body)
  const input = req.body as ChopsticksInput
  if (input == null || input == undefined) {
    res.status(400).send("No chopsticks input provided!")
    return
  }

  const chain = await setup({
    endpoint: input.fromEndpoint,
    block: input.fromBlockNumber,
    mockSignatureHost: true,
    db: new SqliteDatabase("cache"),
  })

  try {
    const provider = new ChopsticksProvider(chain)
    const api = new ApiPromise({ provider, noInitWarn: true })
    await api.isReadyOrError

    await setStorage(chain, {
      System: {
        Account: [
          [
            ["5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"],
            {
              providers: 1,
              data: {
                free: "1000000000000000000",
              },
            },
          ]
        ],
      },
    })

    await new Promise<void>(async (resolve) => {
      try {
        await api.rpc.author.submitAndWatchExtrinsic(input.extrinsic, async (status) => {
          if (status.isInBlock) {
            try {
              const blockHash = status.asInBlock // Get the block hash
              const signedBlock = await api.rpc.chain.getBlock(blockHash) // Get the block details
             
              const extrinsicHash = blake2AsHex(hexToU8a(input.extrinsic))

              // Find the extrinsic index in the block
              const extrinsicIndex = signedBlock.block.extrinsics.findIndex(
                ext => ext.hash.toHex() === extrinsicHash
              )
               
              const allEvents = await api.query.system.events(status.createdAtHash)

              const result: ChopsticksEventsOutput = {
                events: allEvents.toHex(),
                extrinsicIndex
              }

              console.log(result)
              res.send(result)
            }
            catch {

            }
            resolve()
          }
          if (status.isInvalid || status.isRetracted || status.isUsurped || status.isDropped || status.isNone || status.isEmpty) {
            res.status(404)

            resolve()
          }
        })
      }
      catch (e) {
        res.status(404)
      }

      resolve()
    })

  } catch (e) {
    res.status(404)
  }
  console.log("Disconecting!")

  res.status(404)  
})

// XCM Chopsticks API
app.post("/get-xcm-extrinsic-events", async (req, res) => {
  console.log("request-body: ", req.body)
  const input = req.body as XcmChopsticksInput
  if (input == null || input == undefined) {
    res.status(400).send("No chopsticks input provided!")
    return
  }

  const fromChain = await setup({
    endpoint: input.fromEndpoint,
    block: null,
    mockSignatureHost: true,
    db: new SqliteDatabase("cache"),
  })
  
  const toChain = await setup({
    endpoint: input.toEndpoint,
    block: null,
    mockSignatureHost: true,
    db: new SqliteDatabase("cache"),
  })

  const fromId = input.fromId 
  const toId = input.toId 
  await connectParachains([
    fromChain,
    toChain,
  ])

  try {
    const fromApi = await createApi(fromChain)
    const toApi = await createApi(toChain)

    await setStorage(fromChain, {
      System: {
        Account: [
          [
            ["5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"],
            {
              providers: 1,
              data: {
                free: "1000000000000000000",
              },
            },
          ]
        ],
      },
    })

    await new Promise<void>(async (resolve) => {
      try {
        await fromApi.rpc.author.submitAndWatchExtrinsic(input.extrinsic, async (status) => {
          if (status.isInBlock) {
            try {
              const blockHash = status.asInBlock // Get the block hash
              const signedBlock = await fromApi.rpc.chain.getBlock(blockHash) // Get the block details
             
              const extrinsicHash = blake2AsHex(hexToU8a(input.extrinsic))

              // Find the extrinsic index in the block
              const extrinsicIndex = signedBlock.block.extrinsics.findIndex(
                ext => ext.hash.toHex() === extrinsicHash
              )
               
              const allFromEvents = await fromApi.query.system.events(status.createdAtHash)

              await new Promise(resolve => setTimeout(resolve, 10000));

              const allToEvents = await toApi.query.system.events()

              const fromResult: ChopsticksEventsOutput = {
                events: allFromEvents.toHex(),
                extrinsicIndex
              }

              const toResult: ChopsticksEventsOutput = {
                events: allToEvents.toHex(),
                extrinsicIndex: 0
              }

              const result: XcmChopsticksEventsOutput = {
                fromEvents: fromResult,
                toEvents: toResult
              }

              console.log(result.fromEvents.events.length)
              console.log(result.toEvents.events.length)

              res.send(result)
            }
            catch {

            }
            resolve()
          }
          if (status.isInvalid || status.isRetracted || status.isUsurped || status.isDropped || status.isNone || status.isEmpty) {
            res.status(404)

            resolve()
          }
        })
      }
      catch (e) {
        res.status(404)
      }

      resolve()
    })

  } catch (e) {
    res.status(404)
  }
  console.log("Disconecting!")

  res.status(404)  
})


// Chopstics API
app.post("/dry-run-extrinsic", async (req, res) => {
  console.log("request-body: ", req.body)
  const input = req.body as ChopsticksInput
  if (input == null || input == undefined) {
    res.status(400).send("No chopsticks input provided!")
    return
  }

  const chain = await setup({
    endpoint: input.fromEndpoint,
    block: input.fromBlockNumber,
    mockSignatureHost: true,
    db: undefined, //new IdbDatabase("cache"),
  })

  try {
    const { outcome, storageDiff } = await chain.dryRunExtrinsic({
      call: input.extrinsic,
      address: ""//input.address,
    })
    const dryRunResult = JSON.stringify({ outcome: outcome.toHuman(), storageDiff }, null, 2)
    res.send(dryRunResult)
    console.log("dry-run-extrinsic Done! Resulted in: ", dryRunResult)
  } catch (e) {
    res.status(404)
  }
})


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})

