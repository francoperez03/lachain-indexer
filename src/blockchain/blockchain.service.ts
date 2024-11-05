// src/blockchain/blockchain.service.ts
import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
const MAINNET_RPC_URL = 'https://rpc1.mainnet.lachain.network';

@Injectable()
export class BlockchainService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(MAINNET_RPC_URL);
  }

  async startListeningToContractEvents(
    contractAddress: string,
    startBlock: number,
  ) {
    const contractEntity = {};

    if (!contractEntity) {
      console.error('Contrato no encontrado en la base de datos');
      return;
    }
    console.log({ startBlock });
    // const contract = new ethers.Contract(contractAddress, abi, this.provider);

    // const events = await this.eventService.getEventsByContract(contractEntity);

    // // Configurar listeners para cada evento
    // for (const event of events) {
    //   const eventName = event.name;

    //   // Listener para el evento
    //   contract.on(eventName, async (...args) => {
    //     const eventData = args[args.length - 1]; // El último argumento es el objeto Event

    //     try {
    //       // Buscar o crear la transacción usando TransactionService
    //       let transaction = await this.transactionService.findByHash(eventData.transactionHash);

    //       if (!transaction) {
    //         const tx = await this.provider.getTransaction(eventData.transactionHash);
    //         transaction = await this.transactionService.createTransaction(tx, contractEntity);
    //       }

    //       // Crear y guardar el EventLog y sus parámetros usando EventService
    //       await this.eventService.createEventLog(eventData, event, transaction);
    //     } catch (error) {
    //       console.error('Error al procesar el evento:', error);
    //     }
    //   });
    // }

    // console.log(`Escuchando eventos del contrato ${contractAddress} a partir del bloque ${startBlock}`);
  }
}
