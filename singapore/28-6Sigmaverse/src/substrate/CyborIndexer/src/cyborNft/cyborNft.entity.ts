import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('cybor_nft')
export class CyborNFTEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chain: string;

  @Column("cybor_nft_id")
  @Unique("cybor_nft_id", ["cybor_nft_id", "chain"])
  cyborNFTID: string;

  @Column()
  state: number; // 0: 未铸造, 1: 已铸造, 2: 已销毁, 3: 战斗中

  @Column()
  enemiesDefeated: number;

  @Column()
  highestDefense: number; // 最高塔

  @Column()
  highestSurvival: number; // 最高生存轮数

}
