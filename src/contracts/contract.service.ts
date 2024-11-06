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
import { IndexContractEventsDto } from './dto/index-contract-events.dto';

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

  async onModuleInit() {
    const processes = await this.contractProcessRepository.find({
      where: { status: ProcessStatus.LISTENING },
      relations: ['contract'],
    });

    for (const process of processes) {
      const contract = process.contract;

      if (!contract.abi) {
        console.warn(`The contract ${contract.address} doesn't have ABI.`);
        continue;
      }

      if (!process.startBlock) {
        console.warn(`The contract ${contract.address} doesn't have ABI.`);
        continue;
      }

      this.blockchainService.startListeningToContractEvents(
        contract,
        async () => {
          const updatedProcess = await this.contractProcessRepository.findOne({
            where: { id: process.id },
          });
          if (updatedProcess) {
            updatedProcess.status = ProcessStatus.LISTENING;
            await this.contractProcessRepository.save(updatedProcess);
          }
        },
      );
    }
  }

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
      where: { contract: { id: contract.id }, status: ProcessStatus.CREATED },
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

  async startIndexing(createContractDto: IndexContractEventsDto) {
    const { address, startBlock } = createContractDto;
    const contract = await this.contractRepository.findOne({
      where: { address },
    });
    if (!contract) {
      throw new NotFoundException('Contract not found');
    }
    const process = await this.contractProcessRepository.findOne({
      where: { contract: { id: contract.id }, status: ProcessStatus.ABI_ADDED },
    });
    if (!process) {
      throw new NotFoundException('Process not found for contract');
    }
    process.status = ProcessStatus.INDEXING;
    await this.contractProcessRepository.save(process);

    await this.blockchainService.startIndexingContractEvents(
      contract,
      startBlock,
      async () => {
        const updatedProcess = await this.contractProcessRepository.findOne({
          where: {
            contract: { id: contract.id },
            status: ProcessStatus.INDEXING,
          },
        });
        if (updatedProcess) {
          updatedProcess.status = ProcessStatus.COMPLETED;
          await this.contractProcessRepository.save(updatedProcess);
        }
      },
    );

    await this.blockchainService.startListeningToContractEvents(
      contract,
      async () => {
        const updatedProcess = await this.contractProcessRepository.findOne({
          where: { id: process.id },
        });
        if (updatedProcess) {
          updatedProcess.status = ProcessStatus.LISTENING;
          await this.contractProcessRepository.save(updatedProcess);
        }
      },
    );
    return {
      message: 'Contract updated with ABI, and event listening started',
    };
  }
}
