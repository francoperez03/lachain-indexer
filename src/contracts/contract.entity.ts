// src/contracts/contract.entity.ts
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
  abi: object;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => [Event], { nullable: true })
  @OneToMany(() => Event, (event) => event.contract)
  events: Event[];

  @Field(() => [Transaction], { nullable: true })
  @OneToMany(() => Transaction, (transaction) => transaction.contract)
  transactions: Transaction[];
  processes: any;
}
