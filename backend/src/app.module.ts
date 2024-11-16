import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';

import { BlockchainModule } from './blockchain/blockchain.module';
import { ContractsModule } from './contracts/contracts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { EventsModule } from './events/events.module';
import { typeOrmConfig } from '../config/ormconfig';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmConfig),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), './schema.gql'),
    }),
    BlockchainModule,
    ContractsModule,
    TransactionsModule,
    EventsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
