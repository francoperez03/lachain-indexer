import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Event } from './event.entity';
import { EventLog } from './event-log.entity';
import { EventParameter } from './event-parameter.entity';
import { Contract } from '../contracts/contract.entity';
import { Transaction } from '../transactions/transaction.entity';
import { ethers, LogDescription } from 'ethers';
import { EventLogFilter } from './event-log.resolver';
import { EventLogParameter } from './event-log-parameter.entity';
@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,

    @InjectRepository(EventLog)
    private eventLogRepository: Repository<EventLog>,

    @InjectRepository(EventParameter)
    private eventParameterRepository: Repository<EventParameter>,

    @InjectRepository(EventLogParameter)
    private eventLogParameterRepository: Repository<EventLogParameter>,
  ) {}

  async createEvent(name: string, inputs: any[], contract: Contract) {
    const inputsConcatenated = inputs.map((input) => input.type).join(',');
    const signature = `${name}(${inputsConcatenated})`;

    let event = await this.eventRepository.findOne({
      where: {
        name,
        signature,
        contract: { id: contract.id },
      },
      relations: ['contract', 'eventParameters'],
    });

    if (!event) {
      event = this.eventRepository.create({ name, signature, contract });
      event.eventParameters = [];
      await this.eventRepository.save(event);

      const eventParameters = inputs.map((input, index) =>
        this.eventParameterRepository.create({
          name: input.name,
          type: input.type,
          parameterIndex: index,
          event: event,
        }),
      );
      await this.eventRepository.save(event);
      await this.eventParameterRepository.save(eventParameters);
      event.eventParameters = eventParameters;
    }

    return event;
  }

  async getEventsByContractAddress(contractAddress: string): Promise<Event[]> {
    return this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.contract', 'contract')
      .leftJoinAndSelect('event.eventParameters', 'eventParameters')
      .where('contract.address = :contractAddress', { contractAddress })
      .getMany();
  }

  findAllEvents() {
    return this.eventRepository.find({ relations: ['contract'] });
  }

  findEventById(id: number) {
    return this.eventRepository.findOne({
      where: { id },
      relations: ['contract'],
    });
  }

  async findByNameAndContract(
    name: string,
    contractId: number,
  ): Promise<Event> {
    return this.eventRepository.findOne({
      where: {
        name,
        contract: { id: contractId },
      },
      relations: ['contract'],
    });
  }

  async createEventLog(
    eventData: LogDescription,
    log: ethers.Log,
    event: Event,
    transaction: Transaction,
  ) {
    let eventLog = await this.eventLogRepository.findOne({
      where: {
        transactionHash: log.transactionHash,
        logIndex: log.index,
      },
    });

    if (!eventLog) {
      eventLog = this.eventLogRepository.create({
        blockNumber: log.blockNumber,
        logIndex: log.index,
        transactionHash: log.transactionHash,
        signature: eventData.signature,
        topic: eventData.topic,
        event: event,
        transaction: transaction,
      });
      await this.eventLogRepository.save(eventLog);
    }
    console.log(eventData.args);
    const eventLogParameters = [];
    for (const [key, value] of Object.entries(eventData.args)) {
      const eventParameter = event.eventParameters.find(
        (param) => param.parameterIndex === parseInt(key),
      );

      if (eventParameter) {
        const eventLogParameter = this.eventLogParameterRepository.create({
          value: value.toString(),
          eventLog: eventLog,
          eventParameter: eventParameter,
        });
        eventLogParameters.push(eventLogParameter);
      }
    }

    if (eventLogParameters.length > 0) {
      await this.eventLogParameterRepository.save(eventLogParameters);
    }

    return eventLog;
  }

  findAll() {
    return this.eventLogRepository.find({
      relations: ['event', 'eventParameters', 'transaction'],
    });
  }

  findEventLog(id: number) {
    console.log({ id });
    return this.eventLogRepository.find({
      relations: ['event', 'eventParameters', 'transaction'],
    });
  }

  async findEventLogsWithFilter(filter: EventLogFilter): Promise<EventLog[]> {
    const query = this.eventLogRepository
      .createQueryBuilder('eventLog')
      .leftJoinAndSelect('eventLog.event', 'event')
      .leftJoinAndSelect('eventLog.eventParameters', 'eventParameter')
      .leftJoinAndSelect('event.contract', 'contract');

    if (filter.contractAddress) {
      query.andWhere('contract.address = :contractAddress', {
        contractAddress: filter.contractAddress,
      });
    }

    if (filter.eventName) {
      query.andWhere('event.name = :eventName', {
        eventName: filter.eventName,
      });
    }

    if (filter.signature) {
      query.andWhere('eventLog.signature = :signature', {
        signature: filter.signature,
      });
    }

    return await query.getMany();
  }

  async getEventLogsPaginated(address: string, page: number, limit: number) {
    const [eventLogs, total] = await this.eventLogRepository
      .createQueryBuilder('eventLog')
      .leftJoinAndSelect('eventLog.event', 'event')
      .leftJoinAndSelect('eventLog.eventLogParameters', 'eventLogParameter')
      .leftJoinAndSelect('eventLogParameter.eventParameter', 'eventParameter')
      .innerJoin('event.contract', 'contract', 'contract.address = :address', {
        address,
      })
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    console.log(eventLogs[0].eventLogParameters);
    const formattedEventLogs = eventLogs.map((eventLog) => ({
      eventid: eventLog.event.id,
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
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async countEventLogsByContractId(contractId: number): Promise<number> {
    return await this.eventLogRepository
      .createQueryBuilder('eventLog')
      .innerJoin('eventLog.event', 'event')
      .innerJoin('event.contract', 'contract', 'contract.id = :contractId', {
        contractId,
      })
      .getCount();
  }

  async getEventLogsWithFilters(
    contractAddress: string,
    filters: any,
    page: number,
    limit: number,
  ) {
    const query = this.eventLogRepository
      .createQueryBuilder('eventLog')
      .leftJoinAndSelect('eventLog.event', 'event')
      .leftJoinAndSelect('eventLog.eventLogParameters', 'eventLogParameter')
      .leftJoinAndSelect('eventLogParameter.eventParameter', 'eventParameter')
      .innerJoin('event.contract', 'contract', 'contract.address = :address', {
        address: contractAddress,
      })
      .skip((page - 1) * limit)
      .take(limit);

    if (filters.eventName) {
      query.andWhere('event.name = :eventName', {
        eventName: filters.eventName,
      });
    }

    if (filters.fromBlock) {
      query.andWhere('eventLog.blockNumber >= :fromBlock', {
        fromBlock: filters.fromBlock,
      });
    }

    if (filters.toBlock) {
      query.andWhere('eventLog.blockNumber <= :toBlock', {
        toBlock: filters.toBlock,
      });
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
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
