import apiClient from './apiClient';
import { Contract } from '../types/contract';
import { EventLog } from '../types/event';

export const getContracts = async (): Promise<Contract[]> => {
  const response = await apiClient.get<Contract[]>('/contracts');
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

export const getEventLogsByContractAddress = async (
  address: string
): Promise<EventLog[]> => {
  const response = await apiClient.get<EventLog[]>(`/contracts/${address}/event-logs`);
  return response.data;
};

export const deleteContractByAddress = async (address: string): Promise<void> => {
  await apiClient.delete(`/contracts/${address}`);
};  
