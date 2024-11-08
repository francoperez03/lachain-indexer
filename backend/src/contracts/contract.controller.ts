import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { IndexContractEventsDto } from './dto/index-contract-events.dto';
import { AddContractAbiDto } from './dto/add-contract-abi.dto';

@Controller('contracts')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

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
    return await this.contractService.startIndexing(indexListeningDto);
  }

  @Delete(':address')
  async deleteContract(@Param('address') address: string) {
    await this.contractService.deleteContract(address);
    return { message: 'Contract and associated data deleted successfully' };
  }
}
