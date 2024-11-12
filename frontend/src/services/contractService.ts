import apiClient from './apiClient';
import { Contract, ContractItem } from '../types/contract';
import { EventLog } from '../types/event';
import { Transaction } from '@/types/transaction';

export const getContracts = async (): Promise<ContractItem[]> => {
  const response = await apiClient.get<ContractItem[]>('/contracts');
  return response.data;
};

export const getContractByAddress = async (address: string): Promise<Contract> => {
  const response = await apiClient.get<Contract>(`/contracts/${address}`);
  return response.data;
};

export const addContract = async (contractData: Partial<Contract>): Promise<Contract> => {
  const { name, address, abi } = contractData;
  const requestCreate = { name, address };
  const requestAddAbi = { address, abi };

  try {
    const { data } = await apiClient.post<Contract>('/contracts', requestCreate);
    await apiClient.post<Contract>('/contracts/add-abi', requestAddAbi);
    return data;
  } catch (error) {
    console.error('Error creating the contract:', error);
    throw new Error('Hubo un problema al crear el contrato o al asociar el ABI. Por favor, inténtalo nuevamente.');
  }
};

export const deleteContractByAddress = async (address: string): Promise<void> => {
  await apiClient.delete(`/contracts/${address}`);
};  

export const startIndexing = async (address: string, startBlock: bigint): Promise<void> => {
  await apiClient.post(`/contracts/index`, { address, startBlock: startBlock.toString() });
};

export const previewLogs = async (address: string, startBlock: bigint) => {
  const response = await apiClient.get(`/contracts/index/preview/${address}`, {
    params: { startBlock },
  });
  return response.data;
};  

export const getEventLogsByContractAddress = async (
  address: string,
  page: number = 1,
  limit: number = 10
): Promise<{ data: EventLog[]; total: number; page: number; limit: number; totalPages: number }> => {
  const response = await apiClient.get(`/contracts/${address}/event-logs`, {
    params: { page, limit },
  });
  return response.data;
};

export const getTransactionsByContractAddress = async (
  address: string,
  page: number = 1,
  limit: number = 10
): Promise<{ data: Transaction[]; total: number; page: number; limit: number; totalPages: number }> => {
  const response = await apiClient.get(`/contracts/${address}/transactions`, {
    params: { page, limit },
  });
  return response.data;
};
