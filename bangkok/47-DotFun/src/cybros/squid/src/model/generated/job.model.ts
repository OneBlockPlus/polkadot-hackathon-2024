import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, ManyToOne as ManyToOne_, OneToMany as OneToMany_} from "typeorm"
import {Pool} from "./pool.model"
import {JobPolicy} from "./jobPolicy.model"
import {Account} from "./account.model"
import {Worker} from "./worker.model"
import {JobStatus} from "./_jobStatus"
import {JobResult} from "./_jobResult"
import {JobEvent} from "./jobEvent.model"

@Entity_()
export class Job {
    constructor(props?: Partial<Job>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("int4", {nullable: false})
    jobId!: number

    @Index_()
    @Column_("text", {nullable: true})
    uniqueTrackId!: string | undefined | null

    @Index_()
    @ManyToOne_(() => Pool, {nullable: true})
    refPool!: Pool

    @Column_("int4", {nullable: false})
    poolId!: number

    @Index_()
    @ManyToOne_(() => JobPolicy, {nullable: true})
    refPolicy!: JobPolicy

    @Column_("int4", {nullable: false})
    policyId!: number

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    refDepositor!: Account

    @Column_("text", {nullable: false})
    depositorAddress!: string

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    refBeneficiary!: Account

    @Column_("text", {nullable: false})
    beneficiaryAddress!: string

    @Index_()
    @ManyToOne_(() => Worker, {nullable: true})
    refAssignee!: Worker | undefined | null

    @Column_("text", {nullable: true})
    assigneeAddress!: string | undefined | null

    @Column_("int4", {nullable: true})
    implBuildVersion!: number | undefined | null

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    refDestroyer!: Account | undefined | null

    @Column_("text", {nullable: true})
    destroyerAddress!: string | undefined | null

    @Index_()
    @Column_("varchar", {length: 10, nullable: false})
    status!: JobStatus

    @Column_("varchar", {length: 7, nullable: true})
    result!: JobResult | undefined | null

    @Column_("int4", {nullable: false})
    implSpecVersion!: number

    @Column_("text", {nullable: true})
    input!: string | undefined | null

    @Column_("text", {nullable: true})
    output!: string | undefined | null

    @Column_("text", {nullable: true})
    proof!: string | undefined | null

    @Column_("timestamp with time zone", {nullable: false})
    expiresAt!: Date

    @Column_("timestamp with time zone", {nullable: true})
    assignedAt!: Date | undefined | null

    @Column_("timestamp with time zone", {nullable: true})
    processingAt!: Date | undefined | null

    @Column_("timestamp with time zone", {nullable: true})
    endedAt!: Date | undefined | null

    @Column_("timestamp with time zone", {nullable: false})
    createdAt!: Date

    @Column_("timestamp with time zone", {nullable: false})
    updatedAt!: Date

    @Column_("timestamp with time zone", {nullable: true})
    deletedAt!: Date | undefined | null

    @OneToMany_(() => JobEvent, e => e.refJob)
    events!: JobEvent[]
}
