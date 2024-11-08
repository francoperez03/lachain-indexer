import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { EventLog } from './event-log.entity';

@ObjectType()
@Entity('event_parameters')
export class EventParameter {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ length: 100 })
  name: string;

  @Field()
  @Column({ length: 50, nullable: true })
  type: string;

  @Field()
  @Column('text')
  value: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => EventLog)
  @ManyToOne(() => EventLog, (eventLog) => eventLog.eventParameters, {
    onDelete: 'CASCADE',
  })
  eventLog: EventLog;
}
