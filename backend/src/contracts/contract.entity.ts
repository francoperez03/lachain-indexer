import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Event } from '../events/event.entity';
import { Transaction } from '../transactions/transaction.entity';
import { InterfaceAbi } from 'ethers';
import { ContractProcess } from './contract-process.entity';

@ObjectType()
@Entity('contracts')
export class Contract {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ length: 42 })
  address: string;

  @Field({ nullable: true })
  @Column({ length: 100, nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  @Column('json', { nullable: true })
  abi: InterfaceAbi;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => [Event], { nullable: true })
  @OneToMany(() => Event, (event) => event.contract, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  events: Event[];

  @Field(() => [Transaction], { nullable: true })
  @OneToMany(() => Transaction, (transaction) => transaction.contract, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  transactions: Transaction[];

  @Field(() => [ContractProcess], { nullable: true })
  @OneToMany(() => ContractProcess, (process) => process.contract, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  processes: ContractProcess[];
}
