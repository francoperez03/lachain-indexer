import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('event-logs')
  async getEventLogsGroupedByBlockRange(
    @Query('contractAddress') contractAddress: string,
    @Query('eventName') eventName: string,
    @Query('startBlock') startBlock: number,
    @Query('endBlock') endBlock: number,
    @Query('tickSize') tickSize: number,
  ) {
    if (
      !contractAddress ||
      !eventName ||
      !startBlock ||
      !endBlock ||
      !tickSize
    ) {
      throw new Error('Missing required query parameters');
    }

    return await this.analyticsService.getEventLogsGroupedByBlockRange(
      contractAddress,
      eventName,
      Number(startBlock),
      Number(endBlock),
      Number(tickSize),
    );
  }
}
