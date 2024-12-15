import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiService } from './api.service';
import { GetMetadataDto } from './dto/get-metadata.dto';
import { GetEventLogsDto } from './dto/get-event-logs.dto';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { ApiKeyAuthGuard } from './api-key-aut.guard';

@UseGuards(ApiKeyAuthGuard)
@Controller('api/:contractAddress')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get('abi')
  async getAbi(@Param('contractAddress') contractAddress: string) {
    return await this.apiService.getAbi(contractAddress);
  }

  @Get('events')
  async getEvents(@Param('contractAddress') contractAddress: string) {
    return await this.apiService.getEvents(contractAddress);
  }

  @Get('metadata')
  async getContractMetadata(@Param('contractAddress') contractAddress: string) {
    const params = new GetMetadataDto();
    params.contractAddress = contractAddress;
    return await this.apiService.getContractMetadata(params.contractAddress);
  }

  @Get('event-logs')
  async getEventLogs(
    @Param('contractAddress') contractAddress: string,
    @Query() queryParams: GetEventLogsDto,
  ) {
    queryParams.contractAddress = contractAddress;
    return await this.apiService.getEventLogs(
      queryParams.contractAddress,
      queryParams,
    );
  }

  @Get('transactions')
  async getTransactions(
    @Param('contractAddress') contractAddress: string,
    @Query() queryParams: GetTransactionsDto,
  ) {
    queryParams.contractAddress = contractAddress;
    return await this.apiService.getTransactions(
      queryParams.contractAddress,
      queryParams,
    );
  }
}
