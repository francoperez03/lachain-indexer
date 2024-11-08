import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Event } from './event.entity';
import { EventLog } from './event-log.entity';
import { EventParameter } from './event-parameter.entity';
import { Contract } from '../contracts/contract.entity';
import { Transaction } from '../transactions/transaction.entity';
import { ethers, LogDescription } from 'ethers';

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

  async getEventLogsByContractAddress(contractAddress: string) {
    return await this.eventLogRepository
      .createQueryBuilder('eventLog')
      .leftJoinAndSelect('eventLog.event', 'event')
      .leftJoinAndSelect('eventLog.eventParameters', 'eventParameter')
      .innerJoin(
        'event.contract',
        'contract',
        'contract.address = :contractAddress',
        { contractAddress },
      )
      .getMany();
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
}
