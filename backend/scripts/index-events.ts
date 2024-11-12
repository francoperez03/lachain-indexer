// /scripts/indexPastEvents.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { BlockchainService } from '../src/blockchain/blockchain.service';
import { EventService } from '../src/events/event.service';
import { TransactionService } from '../src/transactions/transaction.service';
import { Contract } from '../src/contracts/contract.entity';
import { Event } from '../src/events/event.entity';
import { typeOrmConfig } from '../config/ormconfig';
import { Transaction } from '../src/transactions/transaction.entity';
import { uxdAbi } from '../abis/uxd.abi';
import { EventParameter } from '../src/events/event-parameter.entity';
import { EventLog } from '../src/events/event-log.entity';

const CONTRACT_ADDRESS = '0xDe09E74d4888Bc4e65F589e8c13Bce9F71DdF4c7';
const ABI = uxdAbi;
const START_BLOCK = 1195400n;
const PAGE_SIZE = 500_000n;
async function run() {
  const dataSource = new DataSource(typeOrmConfig);

  await dataSource.initialize();
  console.log('Database connected');

  const eventRepository = dataSource.getRepository(Event);
  const eventLogRepository = dataSource.getRepository(EventLog);
  const eventParameterRepository = dataSource.getRepository(EventParameter);
  const transactionRepository = dataSource.getRepository(Transaction);

  const eventService = new EventService(
    eventRepository,
    eventLogRepository,
    eventParameterRepository,
  );
  const transactionService = new TransactionService(transactionRepository);
  const blockchainService = new BlockchainService(
    eventService,
    transactionService,
  );

  const contractEntity = new Contract();
  contractEntity.address = CONTRACT_ADDRESS;
  contractEntity.abi = ABI;

  await blockchainService.startIndexingContractEvents(
    contractEntity,
    START_BLOCK,
    PAGE_SIZE,
    async () => {
      console.log('FINALIZADO');
    },
    async () => {
      console.log('FINALIZADO');
    },
    async () => {
      console.log('FINALIZADO');
    },
  );

  console.log('Event logs have been processed');
  process.exit(0);
}

// Ejecutar el script
run().catch((error) => {
  console.error('Error in script execution:', error);
  process.exit(1);
});
