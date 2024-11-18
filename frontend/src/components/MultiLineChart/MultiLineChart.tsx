"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import "./MultiLineChart.css"
import { ChartDataItem } from "@/types/analytics"



interface MultiLineChartProps {
  chartConfig: Record<string, { label: string; color: string }>;
  chartData: ChartDataItem[]
}


const MultiLineChart: React.FC<MultiLineChartProps> = ({ chartData, chartConfig }) => {
  console.log({chartConfig})
  console.log({chartData})
  return (
    <Card className="card-container">
      <CardHeader>
        <CardTitle>Line Chart - Multiple</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="blockNumber"
              axisLine={{ stroke: "#FFFFFF" }}
              tick={{stroke: 'white'}} 
              tickMargin={8}
              tickFormatter={(value) => String(value).slice(0, 6)}
            />
            <ChartTooltip 
              cursor={false}
              content={<ChartTooltipContent hideLabel={true} />}
            />
            {Object.keys(chartConfig).map((key) => (
              <Line
                key={key}
                dataKey={key}
                type="monotone"
                stroke={chartConfig[key].color}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="footer-content">
          <div className="footer-stat">
            Trending up by 5.2% this month <TrendingUp className="icon" />
          </div>
          <div className="footer-description">
            Showing total visitors for the last 6 months
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default MultiLineChart;