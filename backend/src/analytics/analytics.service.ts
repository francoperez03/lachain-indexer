import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventLog } from '../events/event-log.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(EventLog)
    private readonly eventLogRepository: Repository<EventLog>,
  ) {}

  async getEventLogsGroupedByBlockRange(
    contractAddress: string,
    eventName: string,
    startBlock: number,
    endBlock: number,
    tickSize: number,
  ) {
    if (startBlock >= endBlock) {
      throw new Error('startBlock must be less than endBlock');
    }
    if (tickSize <= 0) {
      throw new Error('tickSize must be greater than 0');
    }
    if ((endBlock - startBlock) % tickSize !== 0) {
      throw new Error('endBlock - startBlock must be divisible by tickSize');
    }

    const result = await this.eventLogRepository
      .createQueryBuilder('eventLog')
      .innerJoin('eventLog.event', 'event')
      .innerJoin(
        'event.contract',
        'contract',
        'contract.address = :contractAddress',
        {
          contractAddress,
        },
      )
      .where('event.name = :eventName', { eventName })
      .andWhere('eventLog.blockNumber BETWEEN :startBlock AND :endBlock', {
        startBlock,
        endBlock,
      })
      .select('FLOOR((eventLog.blockNumber - :startBlock) / :tickSize)', 'tick')
      .addSelect('COUNT(eventLog.id)', 'count')
      .setParameters({ startBlock, tickSize })
      .groupBy('tick')
      .orderBy('tick', 'ASC')
      .getRawMany();

    const totalIntervals = Math.ceil((endBlock - startBlock + 1) / tickSize);
    const intervals = Array.from({ length: totalIntervals }, (_, i) => ({
      blockRangeStart: startBlock + i * tickSize,
      blockRangeEnd: startBlock + (i + 1) * tickSize - 1,
      count: 0,
    }));

    for (const row of result) {
      const index = Number(row.tick);
      intervals[index].count = parseInt(row.count, 10);
    }

    return {
      contractAddress,
      eventName,
      data: intervals,
    };
  }
}
