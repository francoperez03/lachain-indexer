import { AxiosError } from 'axios';
import apiClient from './apiClient';

export const executeRestQuery = async (
  contractAddress: string,
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  queryParams?: object
) => {
  const url = `/api/${contractAddress}${endpoint}`;
  const headers = {
    'API-KEY': 'YOUR_API_KEY',
  };
  console.log('SENT')
  console.log(queryParams)
  try {
    const response =
      method === 'GET'
        ? await apiClient.get(url, { headers, params: queryParams })
        : await apiClient.post(url, queryParams, { headers });

    return response.data;
  } catch (error) {
    const err: AxiosError = error as AxiosError;
    if (err.response && err.response.data) {
      throw new Error(`Error ${err.response.status}: ${err.response.data}`);
    }
    throw new Error('Error de red o servidor desconocido');
  }
};

export const getContractAbi = async (contractAddress: string) => {
  const response = await executeRestQuery(contractAddress, '/abi', 'GET');
  return response;
};

export const getContractEvents = async (contractAddress: string) => {
  const response = await executeRestQuery(contractAddress, '/events', 'GET');
  return response;
};

export const getEventLogs = async (contractAddress: string, queryParams: object) => {
  const response = await executeRestQuery(contractAddress, '/event-logs', 'GET', queryParams);
  return response;
};

export const getTransactions = async (contractAddress: string, queryParams: object) => {
  const response = await executeRestQuery(contractAddress, '/transactions', 'GET', queryParams);
  return response;
};

export const getContractMetadata = async (contractAddress: string) => {
  const response = await executeRestQuery(contractAddress, '/metadata', 'GET');
  return response;
};
