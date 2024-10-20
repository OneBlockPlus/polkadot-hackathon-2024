import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToMany as OneToMany_} from "typeorm"
import {Worker} from "./worker.model"
import {Pool} from "./pool.model"
import {Job} from "./job.model"

@Entity_()
export class Account {
    constructor(props?: Partial<Account>) {
        Object.assign(this, props)
    }

    /**
     * Account address
     */
    @PrimaryColumn_()
    id!: string

    @Column_("int4", {nullable: false})
    workersCount!: number

    @Column_("int4", {nullable: false})
    poolsCount!: number

    @Column_("int4", {nullable: false})
    createdJobsCount!: number

    @OneToMany_(() => Worker, e => e.refOwner)
    owningWorkers!: Worker[]

    @OneToMany_(() => Pool, e => e.refOwner)
    owningPools!: Pool[]

    @OneToMany_(() => Job, e => e.refBeneficiary)
    beneficialJobs!: Job[]
}
