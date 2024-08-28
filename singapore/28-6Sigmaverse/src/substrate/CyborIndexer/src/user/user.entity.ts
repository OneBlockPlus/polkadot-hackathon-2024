import {Entity, PrimaryGeneratedColumn, Column, BeforeInsert, JoinTable, ManyToMany, OneToMany} from 'typeorm';
import { IsEmail } from 'class-validator';

@Entity('user')
export class UserEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({length:1024})
  address: string;

  @Column()
  chain: string;

  @Column({default: 0})
  point: number;

  @Column({default: 0})
  partnerCoin: number;

  @Column({default: ''})
  @IsEmail()
  email: string;
  
  @Column({default: ''})
  tg: string;

  @Column({default: ''})
  x: string;

  @Column({default: ''})
  password: string;

  // @BeforeInsert()
  // async hashPassword() {
  //   this.password = await argon2.hash(this.password);
  // }

}
