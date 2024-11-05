// src/transactions/transaction.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  findAll() {
    return this.transactionRepository.find({ relations: ['contract'] });
  }

  findOne(id: number) {
    return this.transactionRepository.findOne({
      where: { id },
      relations: ['contract'],
    });
  }

  async findByHash(txHash: string): Promise<Transaction> {
    return this.transactionRepository.findOne({
      where: { hash: txHash },
      relations: ['contract'],
    });
  }

  async create(transactionData: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.transactionRepository.create(transactionData);
    return this.transactionRepository.save(transaction);
  }
}
