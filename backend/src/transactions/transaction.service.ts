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
    } = tx;
    const r = tx.signature?.r ?? '';
    const s = tx.signature?.s ?? '';
    const yParity = tx.signature?.yParity ?? 0;
    const existingTransaction = await this.transactionRepository.findOne({
      where: { hash },
    });
    if (existingTransaction) {
      return existingTransaction;
    }

    const transaction: Transaction = this.transactionRepository.create({
      blockNumber,
      blockHash,
      hash,
      type,
      to,
      from,
      nonce,
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
    return await this.transactionRepository.save(transaction);
  }

  async getTransactionsPaginated(address: string, page: number, limit: number) {
    const [transactions, total] = await this.transactionRepository.findAndCount(
      {
        where: { contract: { address } },
        skip: (page - 1) * limit,
        take: limit,
      },
    );
    return {
      data: transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async countByContractId(contractId: number): Promise<number> {
    return await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.contractId = :contractId', { contractId })
      .getCount();
  }

  async getTransactionsWithFilters(
    contractAddress: string,
    filters: any,
    page: number,
    limit: number,
  ) {
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.contract', 'contract')
      .where('contract.address = :address', { address: contractAddress })
      .skip((page - 1) * limit)
      .take(limit);

    if (filters.fromBlock) {
      query.andWhere('transaction.blockNumber >= :fromBlock', {
        fromBlock: filters.fromBlock,
      });
    }

    if (filters.toBlock) {
      query.andWhere('transaction.blockNumber <= :toBlock', {
        toBlock: filters.toBlock,
      });
    }

    if (filters.fromAddress) {
      query.andWhere('transaction.from = :fromAddress', {
        fromAddress: filters.fromAddress,
      });
    }

    if (filters.toAddress) {
      query.andWhere('transaction.to = :toAddress', {
        toAddress: filters.toAddress,
      });
    }

    const [transactions, total] = await query.getManyAndCount();

    return {
      data: transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
