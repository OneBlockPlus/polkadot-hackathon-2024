import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, ManyToOne as ManyToOne_, OneToMany as OneToMany_} from "typeorm"
import {Account} from "./account.model"
import {Impl} from "./impl.model"
import {ImplBuild} from "./implBuild.model"
import {WorkerStatus} from "./_workerStatus"
import {AttestationMethod} from "./_attestationMethod"
import {OfflineReason} from "./_offlineReason"
import {WorkerEvent} from "./workerEvent.model"
import {PoolWorkers} from "./poolWorkers.model"
import {Job} from "./job.model"

@Entity_()
export class Worker {
    constructor(props?: Partial<Worker>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("text", {nullable: false})
    address!: string

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    refOwner!: Account

    @Column_("text", {nullable: false})
    ownerAddress!: string

    @Index_()
    @ManyToOne_(() => Impl, {nullable: true})
    refImpl!: Impl

    @Column_("int4", {nullable: false})
    implId!: number

    @Index_()
    @ManyToOne_(() => ImplBuild, {nullable: true})
    refImplBuild!: ImplBuild | undefined | null

    @Column_("int4", {nullable: true})
    implBuildVersion!: number | undefined | null

    @Index_()
    @Column_("varchar", {length: 17, nullable: false})
    status!: WorkerStatus

    @Column_("int4", {nullable: true})
    implSpecVersion!: number | undefined | null

    @Column_("varchar", {length: 6, nullable: true})
    attestationMethod!: AttestationMethod | undefined | null

    @Column_("timestamp with time zone", {nullable: true})
    attestationExpiresAt!: Date | undefined | null

    @Column_("timestamp with time zone", {nullable: true})
    lastAttestedAt!: Date | undefined | null

    @Column_("timestamp with time zone", {nullable: true})
    lastHeartbeatReceivedAt!: Date | undefined | null

    @Column_("timestamp with time zone", {nullable: true})
    offlineAt!: Date | undefined | null

    @Column_("varchar", {length: 24, nullable: true})
    offlineReason!: OfflineReason | undefined | null

    @Column_("timestamp with time zone", {nullable: true})
    uptimeStartedAt!: Date | undefined | null

    @Column_("int4", {nullable: true})
    uptime!: number | undefined | null

    @Column_("int4", {nullable: false})
    poolsCount!: number

    @Column_("int4", {nullable: false})
    pendingJobsCount!: number

    @Column_("int4", {nullable: false})
    processingJobsCount!: number

    @Column_("int4", {nullable: false})
    processedJobsCount!: number

    @Column_("int4", {nullable: false})
    successfulJobsCount!: number

    @Column_("int4", {nullable: false})
    failedJobsCount!: number

    @Column_("int4", {nullable: false})
    erroredJobsCount!: number

    @Column_("int4", {nullable: false})
    panickyJobsCount!: number

    @Column_("timestamp with time zone", {nullable: false})
    createdAt!: Date

    @Column_("timestamp with time zone", {nullable: false})
    updatedAt!: Date

    @Column_("timestamp with time zone", {nullable: true})
    deletedAt!: Date | undefined | null

    @OneToMany_(() => WorkerEvent, e => e.refWorker)
    events!: WorkerEvent[]

    @OneToMany_(() => PoolWorkers, e => e.refWorker)
    subscribedPools!: PoolWorkers[]

    @OneToMany_(() => Job, e => e.refAssignee)
    assignedJobs!: Job[]
}
