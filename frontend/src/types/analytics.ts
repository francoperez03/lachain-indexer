export interface GraphData {
  contractAddress: string;
  eventName: string;
  contractName: string;
  data: {
    blockRangeStart: number;
    blockRangeEnd: number;
    count: number;
  }[];
}

export type ChartDataItem = {
  blockNumber: number;
  [key: string]: number;
};
