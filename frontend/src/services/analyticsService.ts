
import apiClient from "./apiClient";

export const fetchEventLogs = async (
  dataArray: {
    contract: { address: string };
    event: string;
  }[],
  startBlock: number,
  endBlock: number,
) => {

  const tickSize = Math.floor((endBlock - startBlock) / 10)
  const requests = dataArray.map((data) =>
    apiClient.get('/analytics/event-logs', {
      params: {
        contractAddress: data.contract.address,
        eventName: data.event,
        startBlock,
        endBlock,
        tickSize,
      },
    })
  );

  try {
    const responses = await Promise.all(requests);
    return responses.map((response) => response.data);
  } catch (error) {
    console.error("Error fetching event logs:", error);
    throw error;
  }
};
