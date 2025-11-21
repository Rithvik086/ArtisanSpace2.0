"use client";

import { Pie, PieChart, Cell } from "recharts";
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

interface ProductsChartProps {
  total: number;
  active: number;
  pending: number;
}

interface ChartData {
  name: string;
  value: number;
  fill: string;
}

export function ProductsChart({ total, active, pending }: ProductsChartProps) {
  const chartData: ChartData[] = [
    { name: "Active", value: active, fill: "var(--chart-1)" },
    { name: "Pending", value: pending, fill: "var(--chart-2)" },
  ];

  const chartConfig = {
    value: {
      label: "Products",
    },
    active: {
      label: "Active",
      color: "var(--chart-1)",
    },
    pending: {
      label: "Pending",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products Overview</CardTitle>
        <CardDescription>{total} products in total</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={70}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}