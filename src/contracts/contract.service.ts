// src/contracts/contract.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './contract.entity';
import { EventService } from 'src/events/event.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { ContractProcess, ProcessStatus } from './contract-process.entity';
import { AddContractAbiDto } from './dto/add-contract-abi.dto';
import { ListenContractEventsDto } from './dto/listen-contract-events.dto';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    @InjectRepository(ContractProcess)
    private readonly contractProcessRepository: Repository<ContractProcess>,
    private eventService: EventService,
    private blockchainService: BlockchainService,
  ) {}

  async findAll() {
    return await this.contractRepository
      .createQueryBuilder('contract')
      .loadRelationCountAndMap('contract.eventsCount', 'contract.events')
      .loadRelationCountAndMap(
        'contract.transactionsCount',
        'contract.transactions',
      )
      .select([
        'contract.id',
        'contract.address',
        'contract.name',
        'contract.createdAt',
      ])
      .getMany();
  }

  async findByAddress(address: string) {
    const contract = await this.contractRepository
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.transactions', 'transaction')
      .leftJoinAndSelect('contract.events', 'event')
      .where('contract.address = :address', { address })
      .getOne();

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    const eventLogs =
      await this.eventService.getEventLogsByContractAddress(address);

    const eventsLogs = eventLogs.map((eventLog) => ({
      eventid: eventLog.event.id,
      eventname: eventLog.event.name,
      signature: eventLog.event.signature,
      id: eventLog.id,
      blockNumber: eventLog.blockNumber,
      logIndex: eventLog.logIndex,
      createdAt: eventLog.createdAt,
      parameters: eventLog.eventParameters.map((param) => ({
        id: param.id,
        name: param.name,
        value: param.value,
        createdAt: param.createdAt,
      })),
    }));

    return {
      id: contract.id,
      address: contract.address,
      name: contract.name,
      abi: contract.abi,
      createdAt: contract.createdAt,
      events: contract.events,
      eventsLogs,
      transactions: contract.transactions,
    };
  }

  async createContract(contractData: CreateContractDto) {
    const { name, address } = contractData;

    const existingContract = await this.contractRepository.findOne({
      where: { address },
    });
    if (existingContract) {
      throw new BadRequestException(
        'Contract with this address already exists',
      );
    }

    // Crear y guardar el contrato
    const contract = this.contractRepository.create({ name, address });
    const savedContract = await this.contractRepository.save(contract);

    // Crear un proceso inicial
    const process = this.contractProcessRepository.create({
      contract: savedContract,
      status: ProcessStatus.CREATED,
    });
    await this.contractProcessRepository.save(process);

    return savedContract;
  }

  async addAbiToContract(
    createContractDto: AddContractAbiDto,
  ): Promise<ContractProcess> {
    const { address, abi } = createContractDto;

    const contract = await this.contractRepository.findOne({
      where: { address },
    });
    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    contract.abi = abi;
    await this.contractRepository.save(contract);

    for (const item of abi) {
      if (item.type === 'event') {
        const inputs = item.inputs.map((input) => input.type).join(',');
        const signature = `${item.name}(${inputs})`;
        console.log({ signature });
        await this.eventService.createEvent(item.name, signature, contract);
      }
    }

    const process = await this.contractProcessRepository.findOne({
      where: { contract: { id: contract.id }, status: ProcessStatus.ABI_ADDED },
    });

    if (process) {
      process.status = ProcessStatus.ABI_ADDED;
      process.abi = JSON.stringify(abi);
      await this.contractProcessRepository.save(process);
      return process;
    } else {
      throw new BadRequestException(
        'No initial process found for the contract',
      );
    }
  }

  async startListening(createContractDto: ListenContractEventsDto) {
    const { address, startBlock } = createContractDto;

    const contract = await this.contractRepository.findOne({
      where: { address },
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    this.blockchainService.startListeningToContractEvents(contract, startBlock);

    return {
      message: 'Contract updated with ABI, and event listening started',
    };
  }
}
