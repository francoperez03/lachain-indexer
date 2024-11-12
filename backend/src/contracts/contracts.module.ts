import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './contract.entity';
import { EventsModule } from '../events/events.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { ContractProcess } from './contract-process.entity';
import { ProgressGateway } from './progress.gateway';
import { ProcessChunk } from './process-chunks.entity';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract, ContractProcess, ProcessChunk]),
    EventsModule,
    TransactionsModule,
    BlockchainModule,
  ],
  controllers: [ContractController],
  providers: [ContractService, ProgressGateway],
  exports: [ContractService],
})
export class ContractsModule {}
