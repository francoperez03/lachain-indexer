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
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import "./MultiLineChart.css"

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "desktop-line",
  },
  mobile: {
    label: "Mobile",
    color: "mobile-line",
  },
} satisfies ChartConfig

export default function Component() {
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
              dataKey="month"
              axisLine={{ stroke: "#FFFFFF" }}
              tick={{stroke: 'white'}} 
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)} 
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="desktop"
              type="monotone"
              stroke="var(--desktop-line-color)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="mobile"
              type="monotone"
              stroke="var(--mobile-line-color)"
              strokeWidth={2}
              dot={false}
            />
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
