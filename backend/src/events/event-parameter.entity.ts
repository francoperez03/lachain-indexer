// event-parameter.entity.ts
import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Event } from './event.entity';
import { EventLogParameter } from './event-log-parameter.entity';

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
  @Column({ length: 50 })
  type: string;

  @Field(() => Int)
  @Column({ nullable: true })
  parameterIndex: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Event)
  @ManyToOne(() => Event, (event) => event.eventParameters, {
    onDelete: 'CASCADE',
  })
  event: Event;

  @Field(() => [EventLogParameter], { nullable: true })
  @OneToMany(
    () => EventLogParameter,
    (eventLogParameter) => eventLogParameter.eventParameter,
    { cascade: true, onDelete: 'CASCADE' },
  )
  eventLogParameters: EventLogParameter[];
}
