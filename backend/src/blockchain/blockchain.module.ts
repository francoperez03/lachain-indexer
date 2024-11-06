import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { EventsModule } from '../events/events.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [EventsModule, TransactionsModule],
  providers: [BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
