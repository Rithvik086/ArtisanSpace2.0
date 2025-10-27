"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { TrendingDown } from "lucide-react";
import { useRef, useState, useId } from "react";
import { useSpring, useMotionValueEvent } from "motion/react";

const chartData = [
  { month: "January", mobile: 245 },
  { month: "February", mobile: 654 },
  { month: "March", mobile: 387 },
  { month: "April", mobile: 521 },
  { month: "May", mobile: 412 },
  { month: "June", mobile: 598 },
  { month: "July", mobile: 312 },
  { month: "August", mobile: 743 },
  { month: "September", mobile: 489 },
  { month: "October", mobile: 476 },
  { month: "November", mobile: 687 },
  { month: "December", mobile: 198 },
];

const chartConfig = {
  mobile: {
    label: "Mobile",
    color: "#FCA070",
  },
} satisfies ChartConfig;

export function ClippedAreaChart(props: {
  title?: string;
  description?: string;
  data?: Array<Record<string, any>>;
  dataKey?: string;
  xKey?: string;
  config?: ChartConfig;
}) {
  const { title, description, data, dataKey, config } = props;
  const { xKey } = props;
  const chartRef = useRef<HTMLDivElement>(null);
  const [axis, setAxis] = useState(0);
  const reactId = useId();

  // motion values
  const springX = useSpring(0, {
    damping: 30,
    stiffness: 100,
  });
  const springY = useSpring(0, {
    damping: 30,
    stiffness: 100,
  });

  useMotionValueEvent(springX, "change", (latest) => {
    setAxis(latest);
  });

  const usedData = data ?? chartData;
  const usedConfig = config ?? chartConfig;
  const usedDataKey = dataKey ?? "mobile";
  const usedXKey = xKey ?? "month";
  const gradientId = `gradient-${reactId}-${usedDataKey}`;
  const maskId = `mask-${reactId}-${usedDataKey}`;
  const color = (usedConfig as any)?.[usedDataKey]?.color ?? "var(--color-mobile)";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title ?? `${springY.get().toFixed(0)}`}
          <Badge variant="secondary" className="ml-2">
            <TrendingDown className="h-4 w-4" />
            <span>-5.2%</span>
          </Badge>
        </CardTitle>
        <CardDescription>{description ?? 'Total revenue for last year'}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          ref={chartRef}
          className="h-54 w-full"
          config={usedConfig}
        >
          <AreaChart
            className="overflow-visible"
            accessibilityLayer
            data={usedData}
            onMouseMove={(state) => {
              const x = state.activeCoordinate?.x;
              const dataValue = state.activePayload?.[0]?.value;
              if (x && dataValue !== undefined) {
                springX.set(x);
                springY.set(dataValue);
              }
            }}
            onMouseLeave={() => {
              springX.set(chartRef.current?.getBoundingClientRect().width || 0);
              springY.jump(Number(((usedData as any[])[usedData.length - 1]?.[usedDataKey]) ?? 0));
            }}
            margin={{
              right: 0,
              left: 0,
            }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              horizontalCoordinatesGenerator={(props) => {
                const { height } = props;
                return [0, height - 30];
              }}
            />
            <XAxis
              dataKey={usedXKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <Area
              dataKey={usedDataKey}
              type="monotone"
              fill={`url(#${gradientId})`}
              fillOpacity={0.4}
              stroke={color}
              style={{
                clipPath: `inset(0 ${
                  Number(chartRef.current?.getBoundingClientRect().width || 0) - axis
                }px 0 0)`,
              }}
            />
            <line
              x1={axis}
              y1={0}
              x2={axis}
              y2={"85%"}
              stroke={color}
              strokeDasharray="3 3"
              strokeLinecap="round"
              strokeOpacity={0.2}
            />
            <rect
              x={axis - 50}
              y={0}
              width={50}
              height={18}
              fill={color}
            />
            <text
              x={axis - 25}
              fontWeight={600}
              y={13}
              textAnchor="middle"
              fill="var(--primary-foreground)"
            >
              ${springY.get().toFixed(0)}
            </text>
            {/* this is a ghost line behind graph */}
            <Area
              dataKey={usedDataKey}
              type="monotone"
              fill="none"
              stroke={color}
              strokeOpacity={0.1}
            />
            <defs>
              <linearGradient
                id={gradientId}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={color}
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor={color}
                  stopOpacity={0}
                />
                <mask id={maskId}>
                  <rect
                    x={0}
                    y={0}
                    width={"50%"}
                    height={"100%"}
                    fill="white"
                  />
                </mask>
              </linearGradient>
            </defs>
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
