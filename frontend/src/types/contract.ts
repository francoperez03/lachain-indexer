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
  abi: object | null;
  eventLogs: EventLog[]
  events: Event[]
  transactions: Transaction[]
  processes: ContractProcess[]
  createdAt: string;
}

export interface ContractProcess {
  id: string
  status: ProcessStatus
}


