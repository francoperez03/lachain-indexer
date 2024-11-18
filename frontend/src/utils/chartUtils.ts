import { ChartDataItem, GraphData } from "@/types/analytics";

export const generateChartObjects = (graphData: GraphData[]) => {
  const chartData: ChartDataItem[] = [];
  const chartConfig: Record<string, { label: string; color: string }> = {};
  const colors = [
    "#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#A133FF",
    "#33FFF5", "#FFC300", "#FF5733", "#C70039", "#900C3F",
    "#DAF7A6", "#FFC300", "#FF5733", "#C70039", "#900C3F",
    "#581845", "#2ECC71", "#3498DB", "#9B59B6", "#E74C3C"
  ];


  graphData.forEach((item, index) => {
    const key = `${item.contractName}-${item.eventName}`.toLowerCase();
    chartConfig[key] = {
      label: `${item.contractName} - ${item.eventName}`,
      color: colors[index % colors.length],
    };

    item.data.forEach((dataPoint, index) => {
      if (!chartData[index]) {
        chartData[index] = {
          blockNumber: dataPoint.blockRangeEnd,
        };
      }
      chartData[index][key] = dataPoint.count;
    });
  });

  return { chartData, chartConfig };
};
