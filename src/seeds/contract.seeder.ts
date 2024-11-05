// src/seeds/contract.seeder.ts

import { DataSource } from 'typeorm';
import { Contract } from '../contracts/contract.entity';
import { capyFiAbi } from '../../abis/capyfi.abi';

export async function seedContracts(
  dataSource: DataSource,
): Promise<Contract[]> {
  const contractRepository = dataSource.getRepository(Contract);

  const contractsData = [
    {
      address: '0x123Abe3A273FDBCeC7fc0EBedc05AaeF4eE63060',
      name: 'CapyFi Contract',
      abi: capyFiAbi,
    },
  ];

  const contracts: Contract[] = [];

  for (const contractData of contractsData) {
    const contract = contractRepository.create({
      address: contractData.address,
      name: contractData.name,
    });
    await contractRepository.save(contract);
    contracts.push(contract);
  }

  console.log('Contracts seeded successfully!');
  return contracts;
}
