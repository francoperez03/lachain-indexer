// src/events/event.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Event } from './event.entity';
import { EventLog } from './event-log.entity';
import { EventParameter } from './event-parameter.entity';
import { Contract } from 'src/contracts/contract.entity';

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

  async getEventsByContract(contract: Contract): Promise<Event[]> {
    return this.eventRepository.find({
      where: { contract },
    });
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

  async createEventLog(eventLogData: Partial<EventLog>): Promise<EventLog> {
    const eventLog = this.eventLogRepository.create(eventLogData);
    return this.eventLogRepository.save(eventLog);
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
