import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Drip {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "bigint", default: () => "CURRENT_TIMESTAMP" })
  timestamp: number;

  @Column({ nullable: true })
  @Index()
  usernameSha256: string;

  @Column()
  @Index()
  addressSha256: string;
}
