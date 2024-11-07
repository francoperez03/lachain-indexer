import { EventLog } from "./eventLog";
export interface Contract {
  id: number;
  address: string;
  name: string;
  abi: object | null;
  eventLogs: EventLog[]
  createdAt: string;
}
