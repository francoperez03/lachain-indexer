// src/services/graphQLService.ts
import apiClient from './apiClient';

export const executeGraphQLQuery = async (query: string, variables?: object) => {
  const response = await apiClient.post('/graphql', {
    query,
    variables,
  });
  return response.data;
};
