// src/services/graphQLService.ts
import apiClient from './apiClient';

export const executeGraphQLQuery = async (query: string, variables?: object) => {
  const response = await apiClient.post('/graphql', {
    query,
    variables,
  });
  if (response.data.errors) {
    throw new Error(response.data.errors[0].message);
  }
  return response.data.data;
};
