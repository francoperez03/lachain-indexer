import { EventLog, Event } from "./event";
import { Transaction } from "./transaction";

export enum ProcessStatus {
  INDEXING = 'INDEXING',
  COMPLETED = 'COMPLETED',
  COMPLETED_WITH_ISSUES = 'COMPLETED_WITH_ISSUES',
}

export enum ContractStatus {
  CREATED = 'CREATED',
  ABI_ADDED = 'ABI_ADDED',
  INDEXING = 'INDEXING',
  LISTENING = 'LISTENING',
  FAILED = 'FAILED',
  PAUSED = 'PAUSED',
}

export interface Contract {
  id: number;
  address: string;
  name: string;
  abi: object;
  status: ContractStatus;
  eventLogs: EventLog[]
  events: Event[]
  transactions: Transaction[]
  createdAt: string;
  eventLogCount: number;
  transactionCount: number;
}

export interface ContractItem {
  id: number;
  address: string;
  createdAt: string;
  name: string;
  eventLogsCount: number;
  events: Event[];
  transactionsCount: number;
  icon?: string
}

export interface ContractProcess {
  id: string
  status: ProcessStatus
}


