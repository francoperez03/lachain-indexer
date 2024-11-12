import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract, ContractStatus } from './contract.entity';
import { EventService } from '../events/event.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ContractProcess, ProcessStatus } from './contract-process.entity';
import { AddContractAbiDto } from './dto/add-contract-abi.dto';
import { IndexContractEventsDto } from './dto/index-contract-events.dto';
import { ProgressGateway } from './progress.gateway';
import { ProcessChunk } from './process-chunks.entity';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    @InjectRepository(ContractProcess)
    private readonly contractProcessRepository: Repository<ContractProcess>,
    @InjectRepository(ProcessChunk)
    private readonly processChunkRepository: Repository<ProcessChunk>,
    private eventService: EventService,
    private blockchainService: BlockchainService,
    private readonly progressGateway: ProgressGateway,
  ) {}

  // async onModuleInit() {
  // const processes = await this.contractProcessRepository.find({
  //   where: { status: ProcessStatus.COMPLETED },
  //   relations: ['contract'],
  // });
  // for (const process of processes) {
  // const contract = process.contract;

  // if (!contract.abi) {
  //   console.warn(`The contract ${contract.address} doesn't have ABI.`);
  //   continue;
  // }

  // if (!process.startBlock) {
  //   console.warn(
  //     `The contract ${contract.address} doesn't define a startBlock.`,
  //   );
  //   continue;
  // }

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
  // }
  // }

  async onApplicationShutdown() {
    await this.stopListeningToContracts();
  }

  private async stopListeningToContracts() {
    // const processes = await this.contractProcessRepository.find({
    //   where: { status: ProcessStatus.LISTENING },
    //   relations: ['contract'],
    // });
    // for (const process of processes) {
    //   process.status = ProcessStatus.COMPLETED;
    //   await this.contractProcessRepository.save(process);
    // }
  }

  async findAll() {
    // Primera consulta: Obtener contratos con conteos de eventos y transacciones
    const contracts: any = await this.contractRepository
      .createQueryBuilder('contract')
      .loadRelationCountAndMap('contract.eventsCount', 'contract.events')
      .loadRelationCountAndMap(
        'contract.transactionsCount',
        'contract.transactions',
      )
      .loadRelationCountAndMap(
        'contract.eventLogsCount',
        'contract.events.eventLogs',
        'eventLogs',
      )
      .select([
        'contract.id',
        'contract.address',
        'contract.name',
        'contract.createdAt',
      ])
      .getMany();

    const eventLogsCounts = await this.contractRepository
      .createQueryBuilder('contract')
      .leftJoin('contract.events', 'event')
      .leftJoin('event.eventLogs', 'eventLog')
      .select('contract.id', 'contractId')
      .addSelect('COUNT(eventLog.id)', 'eventLogsCount')
      .groupBy('contract.id')
      .getRawMany();

    const countsMap = {};
    eventLogsCounts.forEach((row) => {
      countsMap[row.contractId] = parseInt(row.eventLogsCount, 10);
    });

    contracts.forEach((contract) => {
      contract.eventLogsCount = countsMap[contract.id] || 0;
    });

    return contracts;
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

    const contract = this.contractRepository.create({
      name,
      address,
      status: ContractStatus.CREATED,
    });
    const savedContract = await this.contractRepository.save(contract);

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
  ): Promise<Contract> {
    const { address, abi } = createContractDto;

    const contract = await this.contractRepository.findOne({
      where: { address },
    });
    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    contract.abi = abi;
    contract.status = ContractStatus.ABI_ADDED;
    await this.contractRepository.save(contract);

    for (const item of abi) {
      if (item.type === 'event') {
        const inputs = item.inputs.map((input) => input.type).join(',');
        const signature = `${item.name}(${inputs})`;
        await this.eventService.createEvent(item.name, signature, contract);
      }
    }
    return contract;
  }

  async startIndexing(createContractDto: IndexContractEventsDto) {
    const PAGE_SIZE = 500_000n;
    const { address, startBlock } = createContractDto;
    const contract = await this.contractRepository.findOne({
      where: { address },
    });
    if (!contract) {
      throw new NotFoundException('Contract not found');
    }
    contract.status = ContractStatus.INDEXING;

    const process: ContractProcess = this.contractProcessRepository.create({
      status: ProcessStatus.INDEXING,
      contract,
      startBlock: BigInt(startBlock),
    });
    await this.contractProcessRepository.save(process);
    console.log({ address, startBlock });
    this.blockchainService.startIndexingContractEvents(
      contract,
      startBlock,
      PAGE_SIZE,
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

          contract.status = ContractStatus.PAUSED;
          await this.contractRepository.save(contract);
        }
      },
      async (chunkData) => {
        const { fromBlock, toBlock, status } = chunkData;

        const processChunk = this.processChunkRepository.create({
          contractProcess: process,
          fromBlock,
          toBlock,
          status,
        });
        await this.processChunkRepository.save(processChunk);
      },
      (percentage) => {
        this.progressGateway.sendProgressUpdate(percentage);
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
