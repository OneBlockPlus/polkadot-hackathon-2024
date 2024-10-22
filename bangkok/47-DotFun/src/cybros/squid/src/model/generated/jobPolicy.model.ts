import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {Pool} from "./pool.model"
import {ApplicableScope} from "./_applicableScope"

@Entity_()
export class JobPolicy {
    constructor(props?: Partial<JobPolicy>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("int4", {nullable: false})
    policyId!: number

    @Index_()
    @ManyToOne_(() => Pool, {nullable: true})
    refPool!: Pool

    @Column_("int4", {nullable: false})
    poolId!: number

    @Column_("bool", {nullable: false})
    enabled!: boolean

    @Column_("varchar", {length: 9, nullable: false})
    applicableScope!: ApplicableScope

    @Column_("int4", {nullable: true})
    startBlock!: number | undefined | null

    @Column_("int4", {nullable: true})
    endBlock!: number | undefined | null

    @Column_("timestamp with time zone", {nullable: false})
    createdAt!: Date

    @Column_("timestamp with time zone", {nullable: false})
    updatedAt!: Date

    @Column_("timestamp with time zone", {nullable: true})
    deletedAt!: Date | undefined | null
}
