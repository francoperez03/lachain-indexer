import { EventLog, Event } from "./event";
import { Transaction } from "./transaction";

export enum ProcessStatus {
  CREATED = 'CREATED',
  ABI_ADDED = 'ABI_ADDED',
  INDEXING = 'INDEXING',
  LISTENING = 'LISTENING',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED',
}

export interface Contract {
  id: number;
  address: string;
  name: string;
  abi: object;
  eventLogs: EventLog[]
  events: Event[]
  transactions: Transaction[]
  processes: ContractProcess[]
  createdAt: string;
}

export interface ContractItem {
  id: number;
  address: string;
  createdAt: string;
  name: string;
  eventLogsCount: number;
  eventsCount: number;
  transactionsCount: number;
  icon?: string
}

export interface ContractProcess {
  id: string
  status: ProcessStatus
}


