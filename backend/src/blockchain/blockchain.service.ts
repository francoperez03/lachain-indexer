import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { Contract } from '../contracts/contract.entity';
import { EventService } from '../events/event.service';
import { Event } from '../events/event.entity';
import { TransactionService } from '../transactions/transaction.service';
import { ChunkStatus } from '../contracts/process-chunks.entity';
const MAINNET_RPC_URL = 'https://rpc1.mainnet.lachain.network';

@Injectable()
export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private lastBlockTimestamp: number | null = null;
  constructor(
    private readonly eventService: EventService,
    private readonly transactionService: TransactionService,
  ) {
    this.provider = new ethers.JsonRpcProvider(MAINNET_RPC_URL);
  }

  async startIndexingContractEvents(
    contractEntity: Contract,
    startBlock: bigint,
    pageSize: bigint,
    onFinish: () => Promise<void>,
    updateChunkCallback: (chunkData: {
      fromBlock: number;
      toBlock: number;
      status: ChunkStatus;
    }) => Promise<void>,
    updatePercentageCallback: (percentage: number) => void,
  ) {
    const { address, abi } = contractEntity;
    const contract = new ethers.Contract(address, abi, this.provider);
    const startBlockBigInt = BigInt(startBlock);
    const events: Event[] =
      await this.eventService.getEventsByContractAddress(address);

    const latestBlock = await this.provider.getBlockNumber();
    const totalBlocks = BigInt(latestBlock) - startBlockBigInt + 1n;
    let processedBlocks = 0n;

    const blockRanges = [];
    for (
      let currentBlock = startBlockBigInt;
      currentBlock <= BigInt(latestBlock);
      currentBlock += pageSize
    ) {
      const endBlock =
        currentBlock + pageSize - 1n > BigInt(latestBlock)
          ? BigInt(latestBlock)
          : currentBlock + pageSize - 1n;
      blockRanges.push({
        fromBlock: Number(currentBlock),
        toBlock: Number(endBlock),
      });
    }

    for (const range of blockRanges) {
      try {
        await Promise.all(
          events.map((event) =>
            this.processPastEvents(
              contract,
              contractEntity,
              event,
              BigInt(range.fromBlock),
              BigInt(range.toBlock),
            ),
          ),
        );

        processedBlocks += BigInt(range.toBlock - range.fromBlock + 1);
        const percentage = Number((processedBlocks * 100n) / totalBlocks);
        await updateChunkCallback({
          fromBlock: Number(range.fromBlock),
          toBlock: Number(range.toBlock),
          status: ChunkStatus.COMPLETED,
        });
        updatePercentageCallback(percentage);
      } catch (error) {
        console.error(
          `Error processing block range ${range.fromBlock} to ${range.toBlock}:`,
          error,
        );
        await updateChunkCallback({
          fromBlock: Number(range.fromBlock),
          toBlock: Number(range.toBlock),
          status: ChunkStatus.FAILED,
        });
      }
    }

    await onFinish();
    console.log(`Indexing completed for contract at ${address}`);
  }

  async processPastEvents(
    contract: ethers.Contract,
    contractEntity: Contract,
    event: Event,
    fromBlock: bigint,
    toBlock: bigint,
  ) {
    const eventName = event.name;
    const eventFilter = contract.filters[eventName]();

    try {
      const logs = await contract.queryFilter(eventFilter, fromBlock, toBlock);
      console.log(
        `Processing logs for event '${eventName}' from blocks ${fromBlock} to ${toBlock}. Found ${logs.length} logs.`,
      );

      await Promise.all(
        logs.map(async (log) => {
          try {
            const eventData = contract.interface.parseLog(log);
            let transaction = await this.transactionService.findByHash(
              log.transactionHash,
            );

            if (!transaction) {
              const tx = await this.provider.getTransaction(
                log.transactionHash,
              );
              if (tx) {
                transaction = await this.transactionService.createTransaction(
                  tx,
                  contractEntity,
                );
              }
            }

            await this.eventService.createEventLog(
              eventData,
              log,
              event,
              transaction,
            );
          } catch (error) {
            console.error('Error processing individual log:', error);
          }
        }),
      );
    } catch (error) {
      console.error(
        `Error processing event '${eventName}' for block range ${fromBlock} to ${toBlock}:`,
        error,
      );
    }
  }

  async startListeningToContractEvents(
    contractEntity: Contract,
    onFinish: () => Promise<void>,
  ) {
    const { address, abi } = contractEntity;
    const contract = new ethers.Contract(address, abi, this.provider);
    const events: Event[] =
      await this.eventService.getEventsByContractAddress(address);

    for (const event of events) {
      const eventName = event.name;

      contract.on(eventName, async (...args) => {
        const eventData = args[args.length - 1];
        try {
          const transaction = await this.transactionService.findByHash(
            eventData.transactionHash,
          );
          if (!transaction) {
            // const tx = await this.provider.getTransaction(
            //   eventData.transactionHash,
            // );
            // transaction = await this.transactionService.createTransaction(
            //   tx,
            //   contractEntity,
            // );
          }
          // await this.eventService.createEventLog(
          //   eventData,
          //   eventData,
          //   event,
          //   transaction,
          // );
        } catch (error) {
          console.error('Error processing live event:', error);
        }
      });
    }

    await onFinish();
    console.log(`Listening to live events for contract at ${address}`);
  }

  async countPastEventLogs(
    contractEntity: Contract,
    event: Event,
    startBlock: number,
  ): Promise<number> {
    const contract = new ethers.Contract(
      contractEntity.address,
      contractEntity.abi,
      this.provider,
    );

    const eventFilter = contract.filters[event.name]();
    const logs = await contract.queryFilter(eventFilter, startBlock);

    return logs.length;
  }

  async getBlockchainInfo() {
    const blockNumber = await this.provider.getBlockNumber();
    const network = await this.provider.getNetwork();

    return {
      blockNumber: blockNumber.toString(),
      network: {
        name: network.name,
        chainId: network.chainId.toString(),
      },
      rpcUrl: MAINNET_RPC_URL,
    };
  }

  async getContractMetadata(contractAddress: string, abi: ethers.InterfaceAbi) {
    if (!abi) {
      throw new Error('Contract ABI is required');
    }

    const ethersContract = new ethers.Contract(
      contractAddress,
      abi,
      this.provider,
    );

    let name = null;
    let symbol = null;
    let decimals = null;
    let totalSupply = null;

    try {
      name = await ethersContract.name();
    } catch {
      // Si no tiene función name
    }

    try {
      symbol = await ethersContract.symbol();
    } catch {
      // Si no tiene función symbol
    }

    try {
      decimals = await ethersContract.decimals();
    } catch {
      // Si no tiene función decimals
    }

    try {
      totalSupply = await ethersContract.totalSupply();
    } catch {
      // Si no tiene función totalSupply
    }

    return {
      address: contractAddress,
      name,
      symbol,
      decimals: decimals ? decimals.toString() : null,
      totalSupply: totalSupply ? totalSupply.toString() : null,
    };
  }
}
