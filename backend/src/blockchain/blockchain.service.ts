import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { Contract } from '../contracts/contract.entity';
import { EventService } from '../events/event.service';
import { Event } from '../events/event.entity';
import { TransactionService } from '../transactions/transaction.service';
import { ChunkStatus } from 'src/contracts/process-chunks.entity';
const MAINNET_RPC_URL = 'https://rpc1.mainnet.lachain.network';

@Injectable()
export class BlockchainService {
  private provider: ethers.JsonRpcProvider;

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
    const events: Event[] =
      await this.eventService.getEventsByContractAddress(address);

    await Promise.all(
      events.map((event) =>
        this.processPastEvents(
          contract,
          contractEntity,
          event,
          startBlock,
          pageSize,
          updateChunkCallback,
          updatePercentageCallback,
        ),
      ),
    );

    await onFinish();
    console.log(`Indexing completed for contract at ${address}`);
  }

  async processPastEvents(
    contract: ethers.Contract,
    contractEntity: Contract,
    event: Event,
    startBlock: bigint,
    pageSize: bigint,
    updateChunkCallback: (chunkData: {
      fromBlock: number;
      toBlock: number;
      status: ChunkStatus;
    }) => Promise<void>,
    updatePercentageCallback: (percentage: number) => void,
  ) {
    const eventName = event.name;
    const eventFilter = contract.filters[eventName]();
    const latestBlock = await this.provider.getBlockNumber();
    let currentBlock = startBlock;
    const totalBlocks = BigInt(latestBlock) - startBlock + 1n;
    let processedBlocks = 0n;

    while (currentBlock <= BigInt(latestBlock)) {
      const endBlock =
        currentBlock + pageSize - 1n > BigInt(latestBlock)
          ? BigInt(latestBlock)
          : currentBlock + pageSize - 1n;

      try {
        console.log({ currentBlock, endBlock });
        const logs = await contract.queryFilter(
          eventFilter,
          currentBlock,
          endBlock,
        );
        console.log(
          `Processing logs from blocks ${currentBlock} to ${endBlock}. Found ${logs.length} logs.`,
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

        await updateChunkCallback({
          fromBlock: Number(currentBlock),
          toBlock: Number(endBlock),
          status: ChunkStatus.COMPLETED,
        });
      } catch (error) {
        console.error(
          `Error processing block range ${currentBlock} to ${endBlock}:`,
          error,
        );

        await updateChunkCallback({
          fromBlock: Number(currentBlock),
          toBlock: Number(endBlock),
          status: ChunkStatus.FAILED,
        });
      }

      // Update percentage and notify via callback
      processedBlocks += endBlock - currentBlock + 1n;
      const percentage = Number((processedBlocks * 100n) / totalBlocks);
      updatePercentageCallback(percentage);

      // Move to the next block range
      currentBlock += pageSize;
    }

    console.log(
      `Completed processing all past events for contract at ${contractEntity.address}`,
    );
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
}
