// src/blockchain/blockchain.service.ts
import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { Contract } from 'src/contracts/contract.entity';
import { EventService } from 'src/events/event.service';
import { Event } from 'src/events/event.entity';
// import { Transaction } from 'src/transactions/transaction.entity';
import { TransactionService } from 'src/transactions/transaction.service';
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

  async startListeningToContractEvents(
    contractEntity: Contract,
    startBlock: number,
  ) {
    const { address, abi } = contractEntity;
    const contract = new ethers.Contract(address, abi, this.provider);

    const events: Event[] =
      await this.eventService.getEventsByContractAddress(address);
    for (const event of events) {
      await this.processPastEvents(contract, contractEntity, event, startBlock);
    }

    // for (const event of events) {
    //   const eventName = event.name;

    //   contract.on(eventName, async (...args) => {
    //     const eventData = args[args.length - 1];
    //     console.log({ eventData });
    //     try {
    //       const transaction = await this.transactionService.findByHash(
    //         eventData.transactionHash,
    //       );
    //       if (!transaction) {
    //         const tx = await this.provider.getTransaction(
    //           eventData.transactionHash,
    //         );
    //         console.log({ tx });
    //         // transaction = await this.transactionService.createTransaction(
    //         //   tx,
    //         //   contractEntity,
    //         // );
    //       }

    //       await this.eventService.createEventLog(
    //         eventData,
    //         event,
    //         {} as Transaction,
    //       );
    //     } catch (error) {
    //       console.error('Error al procesar el evento:', error);
    //     }
    //   });
    // }

    console.log(
      `Listening events from  ${address} from the block ${startBlock}`,
    );
  }

  private async processPastEvents(
    contract: ethers.Contract,
    contractEntity: Contract,
    event: Event,
    startBlock: number,
  ) {
    const eventName = event.name;
    const eventFilter = contract.filters[eventName]();
    const logs = await contract.queryFilter(eventFilter, startBlock);
    for (const log of logs) {
      try {
        const eventData = contract.interface.parseLog(log);
        let transaction = await this.transactionService.findByHash(
          log.transactionHash,
        );
        if (!transaction) {
          const tx = await this.provider.getTransaction(log.transactionHash);
          transaction = await this.transactionService.createTransaction(
            tx,
            contractEntity,
          );
        }
        await this.eventService.createEventLog(
          eventData,
          log,
          event,
          transaction,
        );
      } catch (error) {
        console.error('Error al procesar evento pasado:', error);
      }
    }
  }
}
