import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Transaction } from '../transactions/transaction.entity';
import { Event } from './event.entity';
import { EventLogParameter } from './event-log-parameter.entity';

@ObjectType()
@Entity('event_logs')
export class EventLog {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  blockNumber: number;

  @Field(() => Int)
  @Column()
  logIndex: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  transactionHash: string;

  @Field({ nullable: true })
  @Column({ length: 255, nullable: true })
  signature: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  topic: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Event)
  @ManyToOne(() => Event, (event) => event.eventLogs, { onDelete: 'CASCADE' })
  event: Event;

  @Field(() => Transaction)
  @ManyToOne(() => Transaction, (transaction) => transaction.eventLogs, {
    onDelete: 'CASCADE',
  })
  transaction: Transaction;

  @Field(() => [EventLogParameter], { nullable: true })
  @OneToMany(
    () => EventLogParameter,
    (eventLogParameter) => eventLogParameter.eventLog,
    { cascade: true, onDelete: 'CASCADE' },
  )
  eventLogParameters: EventLogParameter[];
}
