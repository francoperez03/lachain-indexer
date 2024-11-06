import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { EventsModule } from 'src/events/events.module';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  imports: [EventsModule, TransactionsModule],
  providers: [BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
