import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {Worker} from "./worker.model"
import {WorkerEventKind} from "./_workerEventKind"

@Entity_()
export class WorkerEvent {
    constructor(props?: Partial<WorkerEvent>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("int4", {nullable: false})
    sequence!: number

    @Index_()
    @ManyToOne_(() => Worker, {nullable: true})
    refWorker!: Worker

    @Column_("varchar", {length: 20, nullable: false})
    kind!: WorkerEventKind

    @Column_("jsonb", {nullable: true})
    payload!: unknown | undefined | null

    @Column_("int4", {nullable: false})
    blockNumber!: number

    @Column_("timestamp with time zone", {nullable: false})
    blockTime!: Date
}
