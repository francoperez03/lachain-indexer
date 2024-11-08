import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './contract.entity';
import { EventService } from '../events/event.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { BlockchainService } from '../blockchain/blockchain.service';
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
      where: { status: ProcessStatus.COMPLETED },
      relations: ['contract'],
    });
    for (const process of processes) {
      const contract = process.contract;

      if (!contract.abi) {
        console.warn(`The contract ${contract.address} doesn't have ABI.`);
        continue;
      }

      if (!process.startBlock) {
        console.warn(
          `The contract ${contract.address} doesn't define a startBlock.`,
        );
        continue;
      }

      // this.blockchainService.startListeningToContractEvents(
      //   contract,
      //   async () => {
      //     const updatedProcess = await this.contractProcessRepository.findOne({
      //       where: { id: process.id },
      //     });
      //     if (updatedProcess) {
      //       updatedProcess.status = ProcessStatus.LISTENING;
      //       await this.contractProcessRepository.save(updatedProcess);
      //     }
      //   },
      // );
    }
  }

  async onApplicationShutdown() {
    await this.stopListeningToContracts();
  }

  private async stopListeningToContracts() {
    const processes = await this.contractProcessRepository.find({
      where: { status: ProcessStatus.LISTENING },
      relations: ['contract'],
    });
    for (const process of processes) {
      process.status = ProcessStatus.COMPLETED;
      await this.contractProcessRepository.save(process);
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
      .loadRelationCountAndMap(
        'contract.eventLogsCount',
        'contract.events.eventLogs',
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
      .leftJoinAndSelect('contract.processes', 'processes')
      .where('contract.address = :address', { address })
      .getOne();

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    const eventLogsResponse =
      await this.eventService.getEventLogsByContractAddress(address);

    const eventLogs = eventLogsResponse.map((eventLog) => ({
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
      id: contract.id,
      address: contract.address,
      name: contract.name,
      abi: contract.abi,
      createdAt: contract.createdAt,
      events: contract.events,
      eventLogs,
      transactions: contract.transactions,
      processes: contract.processes,
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

    const contract = this.contractRepository.create({ name, address });
    const savedContract = await this.contractRepository.save(contract);

    const process = this.contractProcessRepository.create({
      contract: savedContract,
      status: ProcessStatus.CREATED,
    });
    await this.contractProcessRepository.save(process);

    return savedContract;
  }

  async deleteContract(address: string): Promise<void> {
    try {
      const contract = await this.contractRepository.findOne({
        where: { address },
        relations: [
          'events',
          'events.eventLogs',
          'events.eventLogs.eventParameters',
          'transactions',
          'processes',
        ],
      });
      console.log({ contract });
      if (!contract) {
        throw new NotFoundException('Contract not found');
      }
      await this.contractRepository.remove(contract);
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw new Error('Failed to delete contract. Please try again later.');
    }
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
        await this.eventService.createEvent(item.name, signature, contract);
      }
    }

    const process = await this.contractProcessRepository.findOne({
      where: { contract: { id: contract.id }, status: ProcessStatus.CREATED },
    });

    if (process) {
      process.status = ProcessStatus.ABI_ADDED;
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
    console.log({ address, startBlock });
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

    // await this.blockchainService.startListeningToContractEvents(
    //   contract,
    //   async () => {
    //     const updatedProcess = await this.contractProcessRepository.findOne({
    //       where: { id: process.id },
    //     });
    //     if (updatedProcess) {
    //       updatedProcess.status = ProcessStatus.LISTENING;
    //       await this.contractProcessRepository.save(updatedProcess);
    //     }
    //   },
    // );
    return {
      message: 'Contract updated with ABI, and event listening started',
    };
  }

  async previewIndexing(address: string, startBlock: number): Promise<number> {
    const contractEntity = await this.contractRepository.findOne({
      where: { address },
      relations: ['events'],
    });

    if (!contractEntity) {
      throw new NotFoundException('Contract not found');
    }

    let totalLogs = 0;

    for (const event of contractEntity.events) {
      const logsCount = await this.blockchainService.countPastEventLogs(
        contractEntity,
        event,
        startBlock,
      );
      totalLogs += logsCount;
    }

    return totalLogs;
  }
}
