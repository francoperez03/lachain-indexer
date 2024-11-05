// src/seeds/seeder.ts

import { DataSource } from 'typeorm';
import { seedContracts } from './contract.seeder';
import { seedEvents } from './event.seeder';
import { seedTransactions } from './transaction.seeder';

export async function seedDatabase(dataSource: DataSource) {
  console.log('Starting database seeding...');

  try {
    await dataSource.manager.delete('EventParameter', {});
    await dataSource.manager.delete('EventLog', {});
    await dataSource.manager.delete('Event', {});
    await dataSource.manager.delete('Contract', {});

    const contracts = await seedContracts(dataSource);
    const transactions = await seedTransactions(dataSource, contracts);
    await seedEvents(dataSource, contracts, transactions);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
