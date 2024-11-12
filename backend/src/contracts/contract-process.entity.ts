import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Contract } from './contract.entity';
import { ProcessChunk } from './process-chunks.entity';

export enum ProcessStatus {
  INDEXING = 'INDEXING',
  COMPLETED = 'COMPLETED',
  COMPLETED_WITH_ISSUES = 'COMPLETED_WITH_ISSUES',
  FAILED = 'FAILED',
}

@Entity('contract_processes')
export class ContractProcess {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Contract, (contract) => contract.processes, {
    onDelete: 'CASCADE',
  })
  contract: Contract;

  @Column({ nullable: true })
  status: ProcessStatus;

  @Column({ type: 'bigint', nullable: true })
  startBlock: bigint;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ProcessChunk, (chunk) => chunk.contractProcess, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  chunks: ProcessChunk[];
}
