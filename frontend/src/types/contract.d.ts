import { EventLog, Event } from "./event";
import { Transaction } from "./transaction";
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
  status: string
}
