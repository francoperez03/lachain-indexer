import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './contract.entity';
import { EventsModule } from 'src/events/events.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { ContractProcess } from './contract-process.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract, ContractProcess]),
    EventsModule,
    BlockchainModule,
  ],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractsModule {}
