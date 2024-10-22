import './utils/instrument'
import { createBullBoard } from '@bull-board/api'
import { FastifyAdapter } from '@bull-board/fastify'
import fastify from 'fastify'
import { ALL_QUEUES, cacheQueue, commitQueue, manualQueue, snapshotQueue } from './queue/queue'
import { BullAdapter } from '@bull-board/api/bullAdapter'
import { processCommitJob } from './queue/processors/commit'
import { processCacheJob } from './queue/processors/cache'
import { processManualJob } from './queue/processors/manual'
import { processSnapshotJob } from './queue/processors/snapshot'

async function run() {
  cacheQueue.process(processCacheJob).catch(console.error)
  manualQueue.process(processManualJob).catch(console.error)
  commitQueue.process(processCommitJob).catch(console.error)
  snapshotQueue.process(processSnapshotJob).catch(console.error)

  // update cache
  const jobs = await cacheQueue.getRepeatableJobs()
  for (const job of jobs) {
    await cacheQueue.removeRepeatableByKey(job.key)
  }
  await cacheQueue.add({}, { repeat: { every: 60_000 } })

  const server = fastify({})
  const serverAdapter = new FastifyAdapter()
  createBullBoard({
    queues: ALL_QUEUES.map((queue) => new BullAdapter(queue)),
    serverAdapter,
  })
  server.register(serverAdapter.registerPlugin())
  server.get('/api/health', () => ({ status: 'ok' }))
  await server.listen({ host: '0.0.0.0', port: 5001 })
  console.info('Queue Dashboard listening at http://0.0.0.0:5001')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
