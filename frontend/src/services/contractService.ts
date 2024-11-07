import apiClient from './apiClient';
import { Contract } from '../types/contract';

export const getContracts = async (): Promise<Contract[]> => {
  const response = await apiClient.get<Contract[]>('/contracts');
  return response.data;
};

export const getContractByAddress = async (address: string): Promise<Contract> => {
  const response = await apiClient.get<Contract>(`/contracts/${address}`);
  return response.data;
};

export const addContract = async (contractData: Partial<Contract>): Promise<Contract> => {
  const response = await apiClient.post<Contract>('/contracts', contractData);
  return response.data;
};
