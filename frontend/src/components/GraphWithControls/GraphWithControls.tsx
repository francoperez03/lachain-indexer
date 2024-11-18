import React from "react";
import MultiLineChart from '../MultiLineChart/MultiLineChart';
import { GraphData } from "@/types/analytics";
import { generateChartObjects } from "@/utils/chartUtils";

interface GraphWithControlsProps {
  graphData: GraphData[];
}

const GraphWithControls: React.FC<GraphWithControlsProps> = ({ graphData }) => {
  const { chartData, chartConfig } = generateChartObjects(graphData);
  return (
    <div>
      <MultiLineChart chartData={chartData} chartConfig={chartConfig} />
    </div>
  );
};

export default GraphWithControls;
