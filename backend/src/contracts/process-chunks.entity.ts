import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContractProcess } from './contract-process.entity';

export enum ChunkStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('process_chunks')
export class ProcessChunk {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ContractProcess, (process) => process.chunks, {
    onDelete: 'CASCADE',
  })
  contractProcess: ContractProcess;

  @Column()
  fromBlock: number;

  @Column()
  toBlock: number;

  @Column({
    type: 'enum',
    enum: ChunkStatus,
    default: ChunkStatus.PENDING,
  })
  status: ChunkStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
