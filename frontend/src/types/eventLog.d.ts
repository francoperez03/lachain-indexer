export interface EventLog {
  id: number;
  eventName: string;
  blockNumber: number;
  transactionHash: string;
  parameters: EventParameter[];
  createdAt: string;
  // Otros campos que sean necesarios
}

export interface EventParameter {
  id: number;
  name: string;
  type: string;
  value: string;
}
