export interface Transaction {
  id: number;
  blockNumber: string;
  blockHash: string;
  hash: string;
  type: number;
  to: string;
  from: string;
  nonce: string;
  gasLimit: string;
  gasPrice: string;
  maxPriorityFeePerGas: string;
  maxFeePerGas: string;
  data: string;
  value: string;
  chainId: string;
  r: string;
  s: string;
  yParity: number;
  createdAt: Date;
}
