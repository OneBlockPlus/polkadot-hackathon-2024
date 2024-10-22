import assert from "assert"
import {TypeormDatabase} from "@subsquid/typeorm-store"
import {processor} from "./processor"

import {
  preprocessImplBuildsEvents,
  preprocessImplsEvents,
  preprocessJobPoliciesEvents,
  preprocessJobsEvents,
  preprocessPoolsEvents,
  preprocessPoolWorkersEvents,
  preprocessWorkersEvents,
} from "./processor_helpers"
import {
  AccountsManager,
  ImplBuildsManager,
  ImplsManager,
  JobEventsManager,
  JobPoliciesManager,
  JobsManager,
  PoolsManager,
  PoolWorkersManager,
  WorkerEventsManager,
  WorkersManager,
} from "./entity_managers"

import {Account, Impl, ImplBuild, Pool, Worker, WorkerStatus} from "./model"
import {Equal, In, IsNull} from "typeorm"

const database = new TypeormDatabase();

processor.run(database, async (ctx) => {
  // Preprocess events
  const implsChangeSet = preprocessImplsEvents(ctx)
  const implBuildsChangeSet = preprocessImplBuildsEvents(ctx)
  const workersChangeSet = preprocessWorkersEvents(ctx)
  const poolsChangeSet = preprocessPoolsEvents(ctx)
  const jobPoliciesChangeSet = preprocessJobPoliciesEvents(ctx)
  const poolWorkersChangeSet = preprocessPoolWorkersEvents(ctx)
  const jobsChangeSet = preprocessJobsEvents(ctx)

  // Initialize entity managers
  const accountsManager = new AccountsManager().init(ctx)
  const implsManager = new ImplsManager().init(ctx)
  const implBuildsManager = new ImplBuildsManager().init(ctx)
  const workersManager = new WorkersManager().init(ctx)
  const workerEventsManager = new WorkerEventsManager().init(ctx)
  const poolsManager = new PoolsManager().init(ctx)
  const jobPoliciesManager = new JobPoliciesManager().init(ctx)
  const poolWorkersManager = new PoolWorkersManager().init(ctx)
  const jobsManager = new JobsManager().init(ctx)
  const jobEventsManager = new JobEventsManager().init(ctx)

  // Prefetch entities

  // Accounts
  for (let [_id, changes] of workersChangeSet) {
    if (changes.owner) {
      accountsManager.addPrefetchItemId(changes.owner)
    }
  }
  for (let [_id, changes] of implsChangeSet) {
    if (changes.owner) {
      accountsManager.addPrefetchItemId(changes.owner)
    }
  }
  for (let [_id, changes] of poolsChangeSet) {
    if (changes.owner) {
      accountsManager.addPrefetchItemId(changes.owner)
    }
  }
  for (let [_id, changes] of jobsChangeSet) {
    if (changes.depositor) {
      accountsManager.addPrefetchItemId(changes.depositor)
    }
    if (changes.beneficiary) {
      accountsManager.addPrefetchItemId(changes.beneficiary)
    }
    if (changes.destroyer) {
      accountsManager.addPrefetchItemId(changes.destroyer)
    }
  }
  await accountsManager.prefetchEntities()

  // Impls
  for (let [id, _changes] of implsChangeSet) {
    implsManager.addPrefetchItemId(id)
  }
  for (let [_id, changes] of implBuildsChangeSet) {
    implsManager.addPrefetchItemId(changes.implId.toString())
  }
  for (let [_id, changes] of workersChangeSet) {
    if (changes.implId) {
      implsManager.addPrefetchItemId(changes.implId.toString())
    }
  }
  for (let [_id, changes] of poolsChangeSet) {
    if (changes.implId) {
      implsManager.addPrefetchItemId(changes.implId.toString())
    }
  }
  await implsManager.prefetchEntities()

  // Impl builds
  for (let [id, _changes] of implBuildsChangeSet) {
    implBuildsManager.addPrefetchItemId(id)
  }
  for (let [_id, changes] of workersChangeSet) {
    if (changes.implId && changes.implBuildVersion) {
      implBuildsManager.addPrefetchItemId(`${changes.implId}-${changes.implBuildVersion}`)
    }
  }
  await implBuildsManager.prefetchEntities()

  // Workers
  for (let [id, _changes] of workersChangeSet) {
    workersManager.addPrefetchItemId(id)
  }
  for (let [_id, changes] of poolWorkersChangeSet) {
    workersManager.addPrefetchItemId(changes.worker)
  }
  for (let [_id, changes] of jobsChangeSet) {
    if (changes.assignee) {
      workersManager.addPrefetchItemId(changes.assignee)
    }
  }
  await workersManager.prefetchEntities()

  // Pools
  for (let [id, _changes] of poolsChangeSet) {
    poolsManager.addPrefetchItemId(id)
  }
  for (let [_id, changes] of jobPoliciesChangeSet) {
    if (changes.poolId) {
      poolsManager.addPrefetchItemId(changes.poolId.toString())
    }
  }
  for (let [_id, changes] of poolWorkersChangeSet) {
    poolsManager.addPrefetchItemId(changes.poolId.toString())
  }
  for (let [_id, changes] of jobsChangeSet) {
    if (changes.poolId) {
      poolsManager.addPrefetchItemId(changes.poolId.toString())
    }
  }
  await poolsManager.prefetchEntities()

  // Creating job policies
  for (let [id, _changes] of jobPoliciesChangeSet) {
    jobPoliciesManager.addPrefetchItemId(id)
  }
  for (let [_id, changes] of jobsChangeSet) {
    if (changes.policyId) {
      assert(changes.poolId)
      jobPoliciesManager.addPrefetchItemId(`${changes.poolId}-${changes.policyId}`)
    }
  }
  await jobPoliciesManager.prefetchEntities()

  // Pool workers
  for (let [id, _changes] of poolWorkersChangeSet) {
    poolWorkersManager.addPrefetchItemId(id)
  }
  await poolWorkersManager.prefetchEntities()

  // Tasks
  for (let [id, _changes] of jobsChangeSet) {
    jobsManager.addPrefetchItemId(id)
  }
  await jobsManager.prefetchEntities()

  // Process

  // Process impls' changeset
  for (let [id, changes] of implsChangeSet) {
    await implsManager.upsert(id, async (impl) => {
      if (!impl.implId) {
        assert(changes.implId)
        impl.implId = changes.implId
      }
      if (!impl.ownerAddress) {
        assert(changes.owner)
        impl.ownerAddress = changes.owner
        impl.refOwner = await accountsManager.getOrCreate(changes.owner)
      }
      if (!impl.attestationMethod) {
        assert(changes.attestationMethod)
        impl.attestationMethod = changes.attestationMethod
      }
      if (changes.metadata !== undefined) {
        impl.metadata = changes.metadata
      }
      if (!impl.createdAt) {
        assert(changes.createdAt)
        impl.createdAt = changes.createdAt
      }
      if (changes.deletedAt !== undefined) {
        impl.deletedAt = changes.deletedAt
      }
      impl.updatedAt = changes.updatedAt
    })
  }
  await accountsManager.saveAll()
  await implsManager.saveAll()

  // Process impl builds' changeset
  for (let [id, changes] of implBuildsChangeSet) {
    await implBuildsManager.upsert(id, async (implBuild) => {
      if (!implBuild.implId) {
        assert(changes.implId)
        implBuild.implId = changes.implId
        implBuild.refImpl = (await implsManager.get(changes.implId.toString()))!
      }
      if (!implBuild.version) {
        assert(changes.version)
        implBuild.version = changes.version
      }
      implBuild.status = changes.status
      if (changes.magicBytes !== undefined) {
        implBuild.magicBytes = changes.magicBytes
      }
      if (!implBuild.createdAt) {
        implBuild.createdAt = changes.createdAt
      }
      if (changes.deletedAt !== undefined) {
        implBuild.deletedAt = changes.deletedAt
      }
      implBuild.updatedAt = changes.updatedAt
    })
  }
  await implBuildsManager.saveAll()

  // Process workers' changeset
  for (let [id, changes] of workersChangeSet) {
    await workersManager.upsert(id, async (worker) => {
      if (!worker.address) {
        assert(changes.address)
        worker.address = changes.address
      }
      if (!worker.ownerAddress) {
        assert(changes.owner)
        worker.ownerAddress = changes.owner
        worker.refOwner = await accountsManager.getOrCreate(changes.owner)
      }
      if (!worker.implId) {
        assert(changes.implId)
        worker.implId = changes.implId
        worker.refImpl = (await implsManager.get(changes.implId.toString()))!
      }
      if (changes.implBuildVersion) {
        assert(worker.implId)
        worker.implBuildVersion = changes.implBuildVersion
        worker.refImplBuild = (await implBuildsManager.get(`${worker.implId}-${changes.implBuildVersion}`))!
      }
      if (changes.implSpecVersion) {
        worker.implSpecVersion = changes.implSpecVersion
      }
      if (changes.attestationMethod) {
        worker.attestationMethod = changes.attestationMethod
      }
      if (changes.attestationExpiresAt !== undefined) {
        worker.attestationExpiresAt = changes.attestationExpiresAt
      }
      if (changes.lastAttestedAt !== undefined) {
        worker.lastAttestedAt = changes.lastAttestedAt
      }
      if (changes.lastHeartbeatReceivedAt !== undefined) {
        worker.lastHeartbeatReceivedAt = changes.lastHeartbeatReceivedAt
      }
      if (changes.status) {
        worker.status = changes.status

        if (changes.status == WorkerStatus.Offline) {
          assert(changes.offlineAt)
          assert(changes.offlineReason)
          worker.offlineAt = changes.offlineAt
          worker.offlineReason = changes.offlineReason
        } else {
          worker.offlineAt = null
          worker.offlineReason = null
        }
      }
      if (!worker.createdAt) {
        assert(changes.createdAt)
        worker.createdAt = changes.createdAt
      }
      if (changes.deletedAt) {
        worker.status = WorkerStatus.Deregistered
        worker.deletedAt = changes.deletedAt
      }
      worker.updatedAt = changes.updatedAt

      for (let e of changes.events) {
        await workerEventsManager.create(e.id, async (event) => {
          event.sequence = e.sequence
          event.refWorker = worker
          event.kind = e.kind
          event.payload = e.payload
          event.blockNumber = e.blockNumber
          event.blockTime = e.blockTime
        })
      }
    });
  }
  await accountsManager.saveAll()
  await workersManager.saveAll()
  await workerEventsManager.saveAll()

  // Process pools' changeset
  for (let [id, changes] of poolsChangeSet) {
    await poolsManager.upsert(id, async (pool) => {
      if (!pool.ownerAddress) {
        assert(changes.owner)
        pool.ownerAddress = changes.owner
        pool.refOwner = await accountsManager.getOrCreate(changes.owner)
      }
      if (!pool.poolId) {
        assert(changes.poolId)
        pool.poolId = changes.poolId
      }
      if (!pool.implId) {
        assert(changes.implId)
        pool.implId = changes.implId
        pool.refImpl = (await implsManager.get(changes.implId.toString()))!
      }
      if (changes.jobScheduler !== undefined) {
        pool.jobScheduler = changes.jobScheduler
      }
      if (changes.createJobEnabled !== undefined) {
        pool.createJobEnabled = changes.createJobEnabled
      }
      if (changes.autoDestroyProcessedJobEnabled !== undefined) {
        pool.autoDestroyProcessedJobEnabled = changes.autoDestroyProcessedJobEnabled
      }
      if (changes.metadata !== undefined) {
        pool.metadata = changes.metadata
      }
      if (!pool.createdAt) {
        assert(changes.createdAt)
        pool.createdAt = changes.createdAt
      }
      if (changes.deletedAt !== undefined) {
        pool.deletedAt = changes.deletedAt
      }
      pool.updatedAt = changes.updatedAt
    })
  }
  await accountsManager.saveAll()
  await poolsManager.saveAll()

  // Process create job policies' changeset
  for (let [id, changes] of jobPoliciesChangeSet) {
    await jobPoliciesManager.upsert(id, async (jobPolicy) => {
      if (!jobPolicy.poolId) {
        assert(changes.poolId)
        jobPolicy.poolId = changes.poolId
        jobPolicy.refPool = (await poolsManager.get(changes.poolId.toString()))!
      }
      if (!jobPolicy.policyId) {
        assert(changes.policyId)
        jobPolicy.policyId = changes.policyId
      }
      if (changes.enabled !== undefined) {
        jobPolicy.enabled = changes.enabled
      }
      if (changes.applicableScope) {
        jobPolicy.applicableScope = changes.applicableScope
      }
      if (changes.startBlock !== undefined) {
        jobPolicy.startBlock = changes.startBlock
      }
      if (changes.endBlock !== undefined) {
        jobPolicy.endBlock = changes.endBlock
      }
      if (!jobPolicy.createdAt) {
        jobPolicy.createdAt = changes.createdAt
      }
      if (changes.deletedAt !== undefined) {
        jobPolicy.deletedAt = changes.deletedAt
      }
      jobPolicy.updatedAt = changes.updatedAt
    })
  }
  await jobPoliciesManager.saveAll()

  // Process pool workers' changeset
  for (let [id, changes] of poolWorkersChangeSet) {
    await poolWorkersManager.upsert(id, async (poolWorker) => {
      if (!poolWorker.poolId) {
        assert(changes.poolId)
        poolWorker.poolId = changes.poolId
        poolWorker.refPool = (await poolsManager.get(changes.poolId.toString()))!
      }
      if (!poolWorker.workerAddress) {
        assert(changes.worker)
        poolWorker.workerAddress = changes.worker
        poolWorker.refWorker = (await workersManager.get(changes.worker))!
      }
      if (!poolWorker.createdAt) {
        poolWorker.createdAt = changes.createdAt
      }
      if (changes.deletedAt !== undefined) {
        poolWorker.deletedAt = changes.deletedAt
      }
      poolWorker.updatedAt = changes.updatedAt

      for (let e of changes.workerEvents) {
        await workerEventsManager.create(e.id, async (event) => {
          event.sequence = e.sequence
          event.refWorker = poolWorker.refWorker
          event.kind = e.kind
          event.payload = e.payload
          event.blockNumber = e.blockNumber
          event.blockTime = e.blockTime
        })
      }
    })
  }
  await poolWorkersManager.saveAll()
  await workerEventsManager.saveAll()

  // Process jobs' changeset
  for (let [id, changes] of jobsChangeSet) {
    await jobsManager.upsert(id, async (job) => {
      if (!job.jobId) {
        job.jobId = changes.jobId
      }
      if (!job.poolId) {
        assert(changes.poolId)
        job.poolId = changes.poolId
        job.refPool = (await poolsManager.get(changes.poolId.toString()))!
      }
      if (!job.policyId) {
        assert(changes.policyId)
        job.policyId = changes.policyId
        job.refPolicy = (await jobPoliciesManager.get(`${changes.poolId}-${changes.policyId}`))!
      }
      if (changes.uniqueTrackId) {
        job.uniqueTrackId = changes.uniqueTrackId
      }
      if (changes.depositor) {
        job.depositorAddress = changes.depositor
        job.refDepositor = await accountsManager.getOrCreate(changes.depositor)
      }
      if (changes.beneficiary) {
        job.beneficiaryAddress = changes.beneficiary
        job.refBeneficiary = await accountsManager.getOrCreate(changes.beneficiary)
      }
      if (changes.assignee) {
        job.assigneeAddress = changes.assignee
        job.refAssignee = (await workersManager.get(changes.assignee))!
      }
      if (changes.implBuildVersion !== undefined) {
        job.implBuildVersion = changes.implBuildVersion
      }
      if (changes.destroyer) {
        job.destroyerAddress = changes.destroyer
        job.refDestroyer = (await accountsManager.get(changes.destroyer))!
      }
      if (changes.implSpecVersion) {
        job.implSpecVersion = changes.implSpecVersion
      }
      if (changes.status) {
        job.status = changes.status
      }
      if (changes.result) {
        job.result = changes.result
      }
      if (changes.input !== undefined) {
        job.input = changes.input
      }
      if (changes.output !== undefined) {
        job.output = changes.output
      }
      if (changes.proof !== undefined) {
        job.proof = changes.proof
      }
      if (changes.expiresAt !== undefined) {
        job.expiresAt = changes.expiresAt
      }
      if (changes.assignedAt !== undefined) {
        job.assignedAt = changes.assignedAt
      }
      if (changes.processingAt !== undefined) {
        job.processingAt = changes.processingAt
      }
      if (changes.endedAt !== undefined) {
        job.endedAt = changes.endedAt
      }
      if (!job.createdAt) {
        assert(changes.createdAt)
        job.createdAt = changes.createdAt
      }
      if (changes.deletedAt !== undefined) {
        job.deletedAt = changes.deletedAt
      }
      job.updatedAt = changes.updatedAt

      for (let e of changes.events) {
        await jobEventsManager.create(e.id, async (event) => {
          event.sequence = e.sequence
          event.refJob = job
          event.kind = e.kind
          event.payload = e.payload
          event.blockNumber = e.blockNumber
          event.blockTime = e.blockTime
        })
      }

      await poolsManager.upsert(job.poolId.toString(), async (pool) => {
        pool.pendingJobsCount += changes.pendingJobsCountChange
        pool.processingJobsCount += changes.processingJobsCountChange
        pool.processedJobsCount += changes.processedJobsCountChange
        pool.successfulJobsCount += changes.successfulJobsCountChange
        pool.failedJobsCount += changes.failedJobsCountChange
        pool.erroredJobsCount += changes.erroredJobsCountChange
        pool.panickyJobsCount += changes.panickyJobsCountChange
      })

      if (job.assigneeAddress) {
        await workersManager.upsert(job.assigneeAddress.toString(), async (worker) => {
          worker.pendingJobsCount += changes.workerPendingJobsCountChange
          worker.processingJobsCount += changes.processingJobsCountChange
          worker.processedJobsCount += changes.processedJobsCountChange
          worker.successfulJobsCount += changes.successfulJobsCountChange
          worker.failedJobsCount += changes.failedJobsCountChange
          worker.erroredJobsCount += changes.erroredJobsCountChange
          worker.panickyJobsCount += changes.panickyJobsCountChange
        })
      }
    })
  }
  await accountsManager.saveAll()
  await jobsManager.saveAll()
  await jobEventsManager.saveAll()
  await poolsManager.saveAll()

  // Update stats

  await ctx.store.find(Worker, {
    relations: {
      subscribedPools: true,
    },
    where: {
      subscribedPools: {
        deletedAt: IsNull(),
        poolId: In(
          Array.from(poolWorkersChangeSet.values())
            .filter(changes => changes.poolWorkerCountChange != 0)
            .map(changes => changes.poolId)
        )
      }
    }
  }).then((workers: Worker[]) => workers.forEach(worker => workersManager.add(worker)))
  await ctx.store.find(Pool, {
    relations: {
      workers: true,
    },
    where: {
      workers: {
        deletedAt: IsNull(),
        workerAddress: In(
          Array.from(poolWorkersChangeSet.values())
            .filter(changes => changes.poolWorkerCountChange != 0)
            .map(changes => changes.worker)
        )
      }
    }
  }).then((pools: Pool[]) => pools.forEach(pool => poolsManager.add(pool)))
  for (let [_id, changes] of poolWorkersChangeSet) {
    if (changes.poolWorkerCountChange == 0) {
      continue
    }

    const worker = await workersManager.get(changes.worker)
    assert(worker)
    worker.poolsCount += changes.poolWorkerCountChange
    workersManager.add(worker)

    const pool = await poolsManager.get(changes.poolId.toString())
    assert(pool)
    pool.workersCount += changes.poolWorkerCountChange
    if (worker.status === "Online") {
      pool.onlineWorkersCount += changes.poolWorkerCountChange
    }

    poolsManager.add(pool)
  }
  await poolsManager.saveAll()
  await workersManager.saveAll()

  await ctx.store.find(Worker, {
    where: {
      id: In(
        Array.from(workersChangeSet.values())
          .filter(changes => changes.onlineWorkerCountChange != 0 || changes.registerWorkerCountChange != 0)
          .map(changes => changes.id)
      )
    }
  }).then((workers: Worker[]) => workers.forEach(worker => {
    workersManager.add(worker)
  }))
  await ctx.store.find(Impl, {
    where: {
      id: In(
        Array.from(workersManager.entitiesMap.values())
          .filter(worker => worker.refImpl)
          .map(worker => worker.refImpl)
      )
    }
  }).then((impls: Impl[]) => impls.forEach(impl => implsManager.add(impl)))
  await ctx.store.find(ImplBuild, {
    where: {
      id: In(
        Array.from(workersManager.entitiesMap.values())
          .filter(worker => worker.refImpl && worker.implBuildVersion)
          .map(worker => `${worker.implId}-${worker.implBuildVersion}`)
      )
    }
  }).then((implBuilds: ImplBuild[]) => implBuilds.forEach(implBuild => implBuildsManager.add(implBuild)))
  await ctx.store.find(Account, {
    where: {
      id: In(
        Array.from(workersManager.entitiesMap.values())
          .map(worker => worker.ownerAddress)
      )
    }
  }).then((accounts: Account[]) => accounts.forEach(account => accountsManager.add(account)))
  for (let [id, changes] of workersChangeSet) {
    const worker = await workersManager.get(id)
    assert(worker)

    if (changes.onlineWorkerCountChange != 0) {
      assert(worker.implId)
      assert(worker.implBuildVersion)

      await implsManager.upsert(worker.implId.toString(), async (impl) => {
        impl.onlineWorkersCount += changes.onlineWorkerCountChange
      })
      await implBuildsManager.upsert(`${worker.implId}-${worker.implBuildVersion}`, async (implBuild) => {
        implBuild.onlineWorkersCount += changes.onlineWorkerCountChange
      })

      if (worker.poolsCount > 0) {
        const pools = await ctx.store.find(Pool, {
          relations: {
            workers: true,
          },
          where: {
            workers: {
              deletedAt: IsNull(),
              workerAddress: Equal(worker.id)
            }
          }
        })
        for (let pool of pools) {
          pool.onlineWorkersCount += changes.onlineWorkerCountChange
          poolsManager.add(pool)
        }
      }
    }

    if (changes.registerWorkerCountChange != 0) {
      assert(worker.ownerAddress)
      await accountsManager.upsert(worker.ownerAddress, async (account) => {
        account.workersCount += changes.registerWorkerCountChange
      })
    }
  }

  // Save
  await accountsManager.saveAll()
  await implsManager.saveAll()
  await implBuildsManager.saveAll()
  await workersManager.saveAll()
  await workerEventsManager.saveAll()
  await poolsManager.saveAll()
  await jobPoliciesManager.saveAll()
  await poolWorkersManager.saveAll()
  await jobsManager.saveAll()
  await jobEventsManager.saveAll()
})
