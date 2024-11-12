import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { IndexContractEventsDto } from './dto/index-contract-events.dto';
import { AddContractAbiDto } from './dto/add-contract-abi.dto';
import { EventService } from 'src/events/event.service';
import { TransactionService } from 'src/transactions/transaction.service';

@Controller('contracts')
export class ContractController {
  constructor(
    private readonly contractService: ContractService,
    private readonly eventService: EventService,
    private readonly transactionService: TransactionService,
  ) {}

  @Get()
  async findAll() {
    return await this.contractService.findAll();
  }

  @Get(':address')
  async findByAddress(@Param('address') address: string) {
    return await this.contractService.findByAddress(address);
  }

  @Get('index/preview/:address')
  async previewIndexing(
    @Param('address') address: string,
    @Query('startBlock') startBlock: string,
  ) {
    const blockNumber = parseInt(startBlock);
    if (isNaN(blockNumber)) {
      throw new BadRequestException('Invalid start block number');
    }

    return await this.contractService.previewIndexing(address, blockNumber);
  }

  @Post()
  async createContract(@Body() createContractDto: CreateContractDto) {
    return await this.contractService.createContract(createContractDto);
  }

  @Post('add-abi')
  async addAbi(@Body() createContractDto: AddContractAbiDto) {
    return await this.contractService.addAbiToContract(createContractDto);
  }

  @Post('index')
  async startListening(@Body() indexListeningDto: IndexContractEventsDto) {
    try {
      return await this.contractService.startIndexing(indexListeningDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':address')
  async deleteContract(@Param('address') address: string) {
    await this.contractService.deleteContract(address);
    return { message: 'Contract and associated data deleted successfully' };
  }

  @Get(':address/event-logs')
  async getEventLogs(
    @Param('address') address: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (
      isNaN(pageNumber) ||
      isNaN(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1
    ) {
      throw new BadRequestException('Invalid pagination parameters');
    }

    return await this.eventService.getEventLogsPaginated(
      address,
      pageNumber,
      limitNumber,
    );
  }

  // Endpoint para obtener transactions paginados
  @Get(':address/transactions')
  async getTransactions(
    @Param('address') address: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (
      isNaN(pageNumber) ||
      isNaN(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1
    ) {
      throw new BadRequestException('Invalid pagination parameters');
    }

    return await this.transactionService.getTransactionsPaginated(
      address,
      pageNumber,
      limitNumber,
    );
  }
}
