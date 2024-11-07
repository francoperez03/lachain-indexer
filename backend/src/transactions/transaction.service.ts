import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { ethers } from 'ethers';
import { Contract } from '../contracts/contract.entity';

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

  async createTransaction(
    tx: ethers.TransactionResponse,
    contract: Contract,
  ): Promise<Transaction> {
    const {
      blockNumber,
      blockHash = '',
      hash,
      type = 0,
      to = '',
      from = '',
      nonce,
      gasLimit,
      gasPrice,
      maxPriorityFeePerGas,
      maxFeePerGas,
      data,
      value,
      chainId,
      signature: { r, s, yParity = 0 },
    } = tx;
    const existingTransaction = await this.transactionRepository.findOne({
      where: { hash },
    });
    if (existingTransaction) {
      return existingTransaction;
    }
    const transaction: Transaction = this.transactionRepository.create({
      blockNumber: blockNumber,
      blockHash,
      hash,
      type,
      to,
      from,
      nonce: nonce,
      gasLimit: gasLimit.toString(),
      gasPrice: gasPrice?.toString() ?? null,
      maxPriorityFeePerGas: maxPriorityFeePerGas?.toString() ?? null,
      maxFeePerGas: maxFeePerGas?.toString() ?? null,
      data,
      value: value.toString(),
      chainId: chainId.toString(),
      r,
      s,
      yParity,
      contract,
    });
    transaction.contract = contract;
    return await this.transactionRepository.save(transaction);
  }
}
