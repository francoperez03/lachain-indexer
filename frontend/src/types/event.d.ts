export interface Event {
  id: number;
  name: string;
  signature: string;
}

export interface EventLog {
  id: number;
  eventName: string;
  signature: string;
  blockNumber: number;
  transactionHash: string;
  parameters: EventParameter[];
  createdAt: string;
}

export interface EventParameter {
  id: number;
  name: string;
  type: string;
  value: string;
}
