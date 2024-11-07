import apiClient from './apiClient';
import { Contract } from '../types/contract';
import { EventLog } from '../types/eventLog';

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

export const getEventLogsByContractAddress = async (
  address: string
): Promise<EventLog[]> => {
  const response = await apiClient.get<EventLog[]>(`/contracts/${address}/event-logs`);
  return response.data;
};
