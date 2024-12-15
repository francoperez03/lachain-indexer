import { ApiController } from './api.controller';
import { ApiKeyAuthGuard } from './api-key-aut.guard';
import { ApiService } from './api.service';
import { ContractsModule } from 'src/contracts/contracts.module';
import { EventsModule } from 'src/events/events.module';
import { Module } from '@nestjs/common';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventLog } from 'src/events/event-log.entity';

@Module({
  imports: [
    ContractsModule,
    EventsModule,
    TransactionsModule,
    BlockchainModule,
    TypeOrmModule.forFeature([EventLog]),
  ],
  controllers: [ApiController],
  providers: [ApiService, ApiKeyAuthGuard],
})
export class ApiModule {}
