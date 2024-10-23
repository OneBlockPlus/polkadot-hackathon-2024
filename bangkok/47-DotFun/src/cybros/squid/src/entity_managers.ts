import {EntitiesManager} from "./entity_manager";
import {
  Account,
  Impl,
  ImplBuild,
  Job,
  JobEvent,
  JobPolicy,
  Pool,
  PoolWorkers,
  Worker,
  WorkerEvent,
} from "./model"

export class AccountsManager extends EntitiesManager<Account> {
  constructor(entityClass?: typeof Account) {
    super({
      entityClass: entityClass ? entityClass : Account,
      newEntityFunc: id => new Account({
        id,
        workersCount: 0,
        poolsCount: 0,
        createdJobsCount: 0,
      })
    });
  }
}

export class ImplsManager extends EntitiesManager<Impl> {
  constructor(entityClass?: typeof Impl) {
    super({
      entityClass: entityClass ? entityClass : Impl,
      newEntityFunc: id => new Impl({
        id,
        onlineWorkersCount: 0,
        poolsCount: 0,
        jobsCount: 0,
      })
    });
  }
}

export class ImplBuildsManager extends EntitiesManager<ImplBuild> {
  constructor(entityClass?: typeof ImplBuild) {
    super({
      entityClass: entityClass ? entityClass : ImplBuild,
      newEntityFunc: id => new ImplBuild({
        id,
        onlineWorkersCount: 0,
      })
    });
  }
}

export class WorkersManager extends EntitiesManager<Worker> {
  constructor(entityClass?: typeof Worker) {
    super({
      entityClass: entityClass ? entityClass : Worker,
      newEntityFunc: id => new Worker({
        id,
        poolsCount: 0,
        pendingJobsCount: 0,
        processingJobsCount: 0,
        processedJobsCount: 0,
        successfulJobsCount: 0,
        failedJobsCount: 0,
        erroredJobsCount: 0,
        panickyJobsCount: 0,
      })
    });
  }
}

export class WorkerEventsManager extends EntitiesManager<WorkerEvent> {
  constructor(entityClass?: typeof WorkerEvent) {
    super({
      entityClass: entityClass ? entityClass : WorkerEvent,
      newEntityFunc: id => new WorkerEvent({id})
    });
  }
}

export class PoolsManager extends EntitiesManager<Pool> {
  constructor(entityClass?: typeof Pool) {
    super({
      entityClass: entityClass ? entityClass : Pool,
      newEntityFunc: id => new Pool({
        id,
        pendingJobsCount: 0,
        processingJobsCount: 0,
        successfulJobsCount: 0,
        processedJobsCount: 0,
        failedJobsCount: 0,
        erroredJobsCount: 0,
        panickyJobsCount: 0,
        workersCount: 0,
        onlineWorkersCount: 0,
      })
    });
  }
}

export class JobPoliciesManager extends EntitiesManager<JobPolicy> {
  constructor(entityClass?: typeof JobPolicy) {
    super({
      entityClass: entityClass ? entityClass : JobPolicy,
      newEntityFunc: id => new JobPolicy({id})
    });
  }
}

export class PoolWorkersManager extends EntitiesManager<PoolWorkers> {
  constructor(entityClass?: typeof PoolWorkers) {
    super({
      entityClass: entityClass ? entityClass : PoolWorkers,
      newEntityFunc: id => new PoolWorkers({id})
    });
  }
}

export class JobsManager extends EntitiesManager<Job> {
  constructor(entityClass?: typeof Job) {
    super({
      entityClass: entityClass ? entityClass : Job,
      newEntityFunc: id => new Job({id})
    });
  }
}

export class JobEventsManager extends EntitiesManager<JobEvent> {
  constructor(entityClass?: typeof JobEvent) {
    super({
      entityClass: entityClass ? entityClass : JobEvent,
      newEntityFunc: id => new JobEvent({id})
    });
  }
}
