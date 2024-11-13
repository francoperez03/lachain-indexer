import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Contract } from '../contracts/contract.entity';
import { EventLog } from '../events/event-log.entity';

@ObjectType()
@Entity('transactions')
export class Transaction {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column({ type: 'integer', nullable: true })
  blockNumber: number;

  @Field()
  @Column()
  blockHash: string;

  @Field()
  @Column()
  hash: string;

  @Field(() => Int)
  @Column()
  type: number;

  @Field()
  @Column()
  to: string;

  @Field()
  @Column()
  from: string;

  @Field(() => Int)
  @Column({ nullable: true })
  nonce: number;

  @Field()
  @Column({ type: 'bigint' })
  gasLimit: string;

  @Field()
  @Column({ type: 'bigint' })
  gasPrice: string;

  @Field()
  @Column({ type: 'bigint', nullable: true })
  maxPriorityFeePerGas: string;

  @Field()
  @Column({ type: 'bigint', nullable: true })
  maxFeePerGas: string;

  @Field()
  @Column({ type: 'text' })
  data: string;

  @Field()
  @Column({ type: 'numeric', precision: 25, scale: 0, nullable: true })
  value: string;

  @Field()
  @Column({ type: 'bigint' })
  chainId: string;

  @Field()
  @Column()
  r: string;

  @Field()
  @Column()
  s: string;

  @Field(() => Int)
  @Column()
  yParity: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Contract)
  @ManyToOne(() => Contract, (contract) => contract.transactions, {
    onDelete: 'CASCADE',
  })
  contract: Contract;

  @Field(() => [EventLog], { nullable: true })
  @OneToMany(() => EventLog, (eventLog) => eventLog.transaction, {
    onDelete: 'CASCADE',
  })
  eventLogs: EventLog[];
}
