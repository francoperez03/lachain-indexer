// src/contracts/entities/contract-process.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Contract } from './contract.entity';

export enum ProcessStatus {
  CREATED = 'CREATED',
  ABI_ADDED = 'ABI_ADDED',
  INDEXING = 'INDEXING',
  LISTENING = 'LISTENING',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED',
}

@Entity('contract_processes')
export class ContractProcess {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Contract, (contract) => contract.processes)
  contract: Contract;

  @Column({
    type: 'enum',
    enum: ProcessStatus,
    default: ProcessStatus.CREATED,
  })
  status: ProcessStatus;

  @Column({ nullable: true })
  abi: string;

  @Column({ nullable: true })
  startBlock: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
