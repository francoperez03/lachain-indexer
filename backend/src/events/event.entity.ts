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
import { EventLog } from './event-log.entity';
import { EventParameter } from './event-parameter.entity';

@ObjectType()
@Entity('events')
export class Event {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ length: 100 })
  name: string;

  @Field()
  @Column({ length: 255 })
  signature: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Contract)
  @ManyToOne(() => Contract, (contract) => contract.events, {
    onDelete: 'CASCADE',
  })
  contract: Contract;

  @Field(() => [EventLog], { nullable: true })
  @OneToMany(() => EventLog, (eventLog) => eventLog.event, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  eventLogs: EventLog[];

  @Field(() => [EventParameter], { nullable: true })
  @OneToMany(() => EventParameter, (eventParameter) => eventParameter.event, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  eventParameters: EventParameter[];
}
