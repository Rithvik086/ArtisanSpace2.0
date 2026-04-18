"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";

interface SalesData {
  label: string;
  sales: number;
}

const chartConfig = {
  sales: {
    label: "Sales (₹)",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface SalesChartProps {
  data: SalesData[];
  periodLabel: string;
  revenueChange?: string;
}

export function SalesChart({
  data,
  periodLabel,
  revenueChange,
}: SalesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Total Sales
          {revenueChange ? (
            <Badge
              variant="secondary"
              className="text-green-600 bg-green-500/10 border-none ml-2"
            >
              <TrendingUp className="h-4 w-4" />
              <span>{revenueChange}</span>
            </Badge>
          ) : null}
        </CardTitle>
        <CardDescription>{periodLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value: any) =>
                    `₹${Number(value).toLocaleString()}`
                  }
                />
              }
            />
            <Line
              dataKey="sales"
              type="bump"
              stroke="url(#colorSales)"
              dot={false}
              strokeWidth={2}
              filter="url(#rainbow-line-glow)"
            />
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0B84CE" stopOpacity={0.8} />
                <stop offset="20%" stopColor="#224CD1" stopOpacity={0.8} />
                <stop offset="40%" stopColor="#3A11C7" stopOpacity={0.8} />
                <stop offset="60%" stopColor="#7107C6" stopOpacity={0.8} />
                <stop offset="80%" stopColor="#C900BD" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#D80155" stopOpacity={0.8} />
              </linearGradient>
              <filter
                id="rainbow-line-glow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
