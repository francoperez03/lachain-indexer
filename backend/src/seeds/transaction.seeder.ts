import { DataSource } from 'typeorm';
import { Transaction } from '../transactions/transaction.entity';
import { Contract } from '../contracts/contract.entity';

const transactionsData = [
  {
    blockNumber: 10740376,
    blockHash:
      '0x816c291bf631315eacb9ca689bd6792206eae1f8658954b01a22e4f6f153621b',
    index: 0,
    hash: '0xc0bed25ac1aa7fad5565d8f01fa0dc243c05db17232625218be31e75a1154e82',
    type: 2,
    to: '0x123Abe3A273FDBCeC7fc0EBedc05AaeF4eE63060',
    from: '0x0A6EADa0d955951CFCFc1fcf4a295d4E72e0BC67',
    nonce: 8,
    gasLimit: BigInt(102020),
    gasPrice: BigInt(2500000007),
    maxPriorityFeePerGas: BigInt(2500000000),
    maxFeePerGas: BigInt(2500000014),
    maxFeePerBlobGas: null,
    data: '0xede4edd0000000000000000000000000465ebfceb3953e2922b686f2b4006173664d16ce',
    value: BigInt(0),
    chainId: BigInt(274),
    signature: {
      r: '0xe93dc140fecf8d3a015bca410e5ff9dba787f5c43c21730d035118fee62152fb',
      s: '0x4d17466b315cc9e0d100d2bedd85fae13f1f6485e223af5ad80f8c38909f2b6c',
      yParity: 0,
      networkV: null,
    },
    accessList: [],
    blobVersionedHashes: null,
  },
  {
    blockNumber: 10744692,
    blockHash:
      '0x5aff97e3abeae89e616e39b0450223cc2418f19df6e8731d51c16245df02346f',
    index: 0,
    hash: '0x8e166f64fc01dfde00ca9fae9ce318498bfa05d9bb5626570f4f38f64da08cc1',
    type: 2,
    to: '0x123Abe3A273FDBCeC7fc0EBedc05AaeF4eE63060',
    from: '0x677f699053987fA3F6C52506b4C9317bBF63aF47',
    nonce: 105,
    gasLimit: BigInt(192020),
    gasPrice: BigInt(2500000007),
    maxPriorityFeePerGas: BigInt(2500000000),
    maxFeePerGas: BigInt(2500000014),
    maxFeePerBlobGas: null,
    data: '0x0e752702000000000000000000000000000000000000000000000000000000001adc4899',
    value: BigInt(0),
    chainId: BigInt(274),
    signature: {
      r: '0x2618dd365d74efdccb6a5779ea2b8f98c87c9f758ecb3f816f73e2f209c95989',
      s: '0x72791c3624a4d7ad79953e70007a2b252d4c29424aec38e17566eefc145ec413',
      yParity: 1,
      networkV: null,
    },
    accessList: [],
    blobVersionedHashes: null,
  },
];

export async function seedTransactions(
  dataSource: DataSource,
  contracts: Contract[],
) {
  const transactionRepository = dataSource.getRepository(Transaction);
  const transactions: Transaction[] = [];

  for (const tx of transactionsData) {
    const contract = contracts.find((contract) => contract.address === tx.to);
    const transaction = transactionRepository.create({
      blockNumber: tx.blockNumber,
      blockHash: tx.blockHash,
      hash: tx.hash,
      type: tx.type,
      to: tx.to,
      from: tx.from,
      nonce: tx.nonce,
      gasLimit: tx.gasLimit.toString(),
      gasPrice: tx.gasPrice.toString(),
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas?.toString(),
      maxFeePerGas: tx.maxFeePerGas?.toString(),
      data: tx.data,
      value: tx.value.toString(),
      chainId: tx.chainId.toString(),
      r: tx.signature.r,
      s: tx.signature.s,
      yParity: tx.signature.yParity ? 1 : 0,
      contract,
    });
    await transactionRepository.save(transaction);
    transactions.push(transaction);
  }
  console.log('Transactions created!');
  return transactions;
}
