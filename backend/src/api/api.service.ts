// src/api/api.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { ContractService } from '../contracts/contract.service';
import { EventService } from '../events/event.service';
import { TransactionService } from '../transactions/transaction.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { EventLog } from 'src/events/event-log.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ApiService {
  constructor(
    private readonly contractService: ContractService,
    private readonly eventService: EventService,
    private readonly transactionService: TransactionService,
    private readonly blockchainService: BlockchainService,
    @InjectRepository(EventLog)
    private readonly eventLogRepository: Repository<EventLog>,
  ) {}

  async getAbi(contractAddress: string) {
    const contract = await this.contractService.findByAddress(contractAddress);
    if (!contract || !contract.abi) {
      throw new NotFoundException('ABI not found for this contract');
    }
    return contract.abi;
  }

  async getEvents(contractAddress: string) {
    const events =
      await this.eventService.getEventsByContractAddress(contractAddress);
    return events.map((event) => ({
      id: event.id,
      name: event.name,
      signature: event.signature,
      parameters: event.eventParameters,
    }));
  }

  async getEventLogs(contractAddress: string, queryParams: any) {
    const {
      page = '1',
      limit = '10',
      eventName,
      fromBlock,
      toBlock,
      parameterName,
      parameterValue,
      sortBy = 'blockNumber',
      sortDirection = 'ASC',
    } = queryParams;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      throw new Error('Invalid pagination parameters');
    }

    const query = this.eventLogRepository
      .createQueryBuilder('eventLog')
      .leftJoinAndSelect('eventLog.event', 'event')
      .leftJoinAndSelect('eventLog.eventLogParameters', 'eventLogParameter')
      .leftJoinAndSelect('eventLogParameter.eventParameter', 'eventParameter')
      .innerJoin('event.contract', 'contract', 'contract.address = :address', {
        address: contractAddress,
      })
      .skip((pageNumber - 1) * limitNumber)
      .take(limitNumber);

    if (eventName) {
      query.andWhere('event.name = :eventName', { eventName });
    }

    if (fromBlock) {
      query.andWhere('eventLog.blockNumber >= :fromBlock', {
        fromBlock: parseInt(fromBlock, 10),
      });
    }

    if (toBlock) {
      query.andWhere('eventLog.blockNumber <= :toBlock', {
        toBlock: parseInt(toBlock, 10),
      });
    }

    if (parameterName && parameterValue) {
      query
        .andWhere('eventParameter.name = :parameterName', { parameterName })
        .andWhere('eventLogParameter.value = :parameterValue', {
          parameterValue,
        });
    }

    if (sortBy) {
      const validSortFields = ['blockNumber', 'logIndex', 'createdAt'];
      if (!validSortFields.includes(sortBy)) {
        throw new Error('Invalid sortBy parameter');
      }
      query.orderBy(`eventLog.${sortBy}`, sortDirection.toUpperCase());
    }

    const [eventLogs, total] = await query.getManyAndCount();

    const formattedEventLogs = eventLogs.map((eventLog) => ({
      eventId: eventLog.event.id,
      eventName: eventLog.event.name,
      signature: eventLog.event.signature,
      id: eventLog.id,
      blockNumber: eventLog.blockNumber,
      logIndex: eventLog.logIndex,
      transactionHash: eventLog.transactionHash,
      createdAt: eventLog.createdAt,
      parameters: eventLog.eventLogParameters.map((param) => ({
        id: param.id,
        name: param.eventParameter.name,
        value: param.value,
        createdAt: param.createdAt,
      })),
    }));

    return {
      data: formattedEventLogs,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    };
  }

  async getTransactions(contractAddress: string, queryParams: any) {
    const {
      page = '1',
      limit = '10',
      fromBlock,
      toBlock,
      fromAddress,
      toAddress,
      ...otherFilters
    } = queryParams;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      throw new Error('Invalid pagination parameters');
    }

    return await this.transactionService.getTransactionsWithFilters(
      contractAddress,
      {
        fromBlock: fromBlock ? parseInt(fromBlock, 10) : undefined,
        toBlock: toBlock ? parseInt(toBlock, 10) : undefined,
        fromAddress,
        toAddress,
        ...otherFilters,
      },
      pageNumber,
      limitNumber,
    );
  }

  async getContractMetadata(contractAddress: string) {
    const contract = await this.contractService.findByAddress(contractAddress);
    if (!contract || !contract.abi) {
      throw new Error('Contract not found or ABI missing');
    }

    return await this.blockchainService.getContractMetadata(
      contractAddress,
      contract.abi,
    );
  }
}
