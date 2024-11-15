// event-log-parameter.entity.ts
import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { EventLog } from './event-log.entity';
import { EventParameter } from './event-parameter.entity';

@ObjectType()
@Entity('event_log_parameters')
export class EventLogParameter {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('text')
  value: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => EventParameter)
  @ManyToOne(
    () => EventParameter,
    (eventParameter) => eventParameter.eventLogParameters,
    {
      onDelete: 'CASCADE',
    },
  )
  eventParameter: EventParameter;

  @Field(() => EventLog)
  @ManyToOne(() => EventLog, (eventLog) => eventLog.eventLogParameters, {
    onDelete: 'CASCADE',
  })
  eventLog: EventLog;
}
