import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {Job} from "./job.model"
import {JobEventKind} from "./_jobEventKind"

@Entity_()
export class JobEvent {
    constructor(props?: Partial<JobEvent>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("int4", {nullable: false})
    sequence!: number

    @Index_()
    @ManyToOne_(() => Job, {nullable: true})
    refJob!: Job

    @Column_("varchar", {length: 10, nullable: false})
    kind!: JobEventKind

    @Column_("jsonb", {nullable: true})
    payload!: unknown | undefined | null

    @Column_("int4", {nullable: false})
    blockNumber!: number

    @Column_("timestamp with time zone", {nullable: false})
    blockTime!: Date
}
