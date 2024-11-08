import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { EventsModule } from '../events/events.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { BlockchainController } from './blockchain.controller';

@Module({
  imports: [EventsModule, TransactionsModule],
  providers: [BlockchainService],
  controllers: [BlockchainController],
  exports: [BlockchainService],
})
export class BlockchainModule {}
