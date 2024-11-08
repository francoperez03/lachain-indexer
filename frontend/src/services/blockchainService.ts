import apiClient from "./apiClient";

export const getBlockchainInfo = async () => {
  const response = await apiClient.get('/blockchain/info');
  return response.data;
};