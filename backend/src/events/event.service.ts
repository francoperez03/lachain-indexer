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

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,

    @InjectRepository(EventLog)
    private eventLogRepository: Repository<EventLog>,

    @InjectRepository(EventParameter)
    private eventParameterRepository: Repository<EventParameter>,
  ) {}

  async createEvent(name: string, signature: string, contract: Contract) {
    let event = await this.eventRepository.findOne({
      where: {
        name,
        signature,
        contract: { id: contract.id },
      },
      relations: ['contract'],
    });

    if (!event) {
      event = this.eventRepository.create({ name, signature, contract });
      await this.eventRepository.save(event);
    }

    return event;
  }

  async getEventsByContractAddress(contractAddress: string): Promise<Event[]> {
    return this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.contract', 'contract')
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
    const existingParameters = await this.eventParameterRepository
      .createQueryBuilder('eventParameter')
      .innerJoin('eventParameter.eventLog', 'eventLog')
      .where('eventLog.id = :eventLogId', { eventLogId: eventLog.id })
      .getMany();
    const existingParameterNames = new Set(
      existingParameters.map((p) => p.name),
    );
    const parameters = [];
    for (const [key, value] of Object.entries(eventData.args)) {
      if (!existingParameterNames.has(key)) {
        const type =
          eventData.fragment.inputs.find((input) => input.name === key)?.type ||
          '';
        const eventParameter = this.eventParameterRepository.create({
          name: key,
          type,
          value: value.toString(),
          eventLog: eventLog,
        });
        parameters.push(eventParameter);
      }
    }
    if (parameters.length > 0) {
      await this.eventParameterRepository.save(parameters);
    }
    return eventLog;
  }

  async createEventParameter(
    eventParameterData: Partial<EventParameter>,
  ): Promise<EventParameter> {
    const eventParameter =
      this.eventParameterRepository.create(eventParameterData);
    return this.eventParameterRepository.save(eventParameter);
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
      .leftJoinAndSelect('eventLog.eventParameters', 'eventParameter')
      .innerJoin('event.contract', 'contract', 'contract.address = :address', {
        address,
      })
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const formattedEventLogs = eventLogs.map((eventLog) => ({
      eventid: eventLog.event.id,
      eventName: eventLog.event.name,
      signature: eventLog.event.signature,
      id: eventLog.id,
      blockNumber: eventLog.blockNumber,
      logIndex: eventLog.logIndex,
      transactionHash: eventLog.transactionHash,
      createdAt: eventLog.createdAt,
      parameters: eventLog.eventParameters.map((param) => ({
        id: param.id,
        name: param.name,
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
}
