import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, OneToMany as OneToMany_} from "typeorm"
import {Account} from "./account.model"
import {Impl} from "./impl.model"
import {JobScheduler} from "./_jobScheduler"
import {PoolWorkers} from "./poolWorkers.model"
import {JobPolicy} from "./jobPolicy.model"
import {Job} from "./job.model"

@Entity_()
export class Pool {
    constructor(props?: Partial<Pool>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("int4", {nullable: false})
    poolId!: number

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

    @Column_("varchar", {length: 8, nullable: false})
    jobScheduler!: JobScheduler

    @Column_("bool", {nullable: false})
    createJobEnabled!: boolean

    @Column_("bool", {nullable: false})
    autoDestroyProcessedJobEnabled!: boolean

    @Column_("bytea", {nullable: true})
    metadata!: Uint8Array | undefined | null

    @Column_("int4", {nullable: false})
    workersCount!: number

    @Column_("int4", {nullable: false})
    onlineWorkersCount!: number

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

    @OneToMany_(() => PoolWorkers, e => e.refPool)
    workers!: PoolWorkers[]

    @OneToMany_(() => JobPolicy, e => e.refPool)
    jobPolicies!: JobPolicy[]

    @OneToMany_(() => Job, e => e.refPool)
    jobs!: Job[]
}
