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
import { useRef, useState, useId, useEffect } from "react";
import { useSpring, useMotionValueEvent } from "motion/react";

// demo dataset used when no `data` prop is provided — more pronounced peaks/valleys for demo
const chartData = [
  { month: "January", mobile: 180, evil: 320 },
  { month: "February", mobile: 420, evil: 640 },
  { month: "March", mobile: 280, evil: 190 },
  { month: "April", mobile: 520, evil: 480 },
  { month: "May", mobile: 360, evil: 720 },
  { month: "June", mobile: 760, evil: 610 },
  { month: "July", mobile: 420, evil: 330 },
  { month: "August", mobile: 920, evil: 980 },
  { month: "September", mobile: 540, evil: 450 },
  { month: "October", mobile: 480, evil: 530 },
  { month: "November", mobile: 880, evil: 760 },
  { month: "December", mobile: 260, evil: 420 },
];

const chartConfig = {
  mobile: {
    label: "Mobile",
    color: "#FCA070",
  },
  evil: {
    label: "Evil",
    color: "#FF305E",
  },
} satisfies ChartConfig;

export function ClippedAreaChart(props: {
  title?: string;
  description?: string;
  data?: Array<Record<string, any>>;
  dataKey?: string;
  xKey?: string;
  fetchUrl?: string;
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

  const [fetchedData, setFetchedData] = useState<Array<Record<string, any>> | null>(null);
  const usedData = data ?? fetchedData ?? chartData;
  const usedConfig = config ?? chartConfig;
  const usedDataKey = dataKey ?? "mobile";
  const usedXKey = xKey ?? "month";
  const gradientId = `gradient-${reactId}-${usedDataKey}`;
  // prefer configured color, otherwise fall back to an "evil" palette
  const defaultEvil = "#FF305E"; // ominous red
  const accentEvil = "#6B21A8"; // deep purple
  const color = (usedConfig as any)?.[usedDataKey]?.color ?? defaultEvil;
  const evilPrimary = color || defaultEvil;
  const evilSecondary = accentEvil;
  const glowId = `glow-${reactId}-${usedDataKey}`;

  // fetch remote data when no `data` prop is provided
  useEffect(() => {
    if (data) return;
    const url = props.fetchUrl ?? "/api/sales";
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const json = await res.json();
        if (!mounted || !Array.isArray(json)) return;
        // map backend shape like [{ month, sales }] to the chart shape
        const mapped = json.map((item: any) => ({
          [usedXKey]: item.month ?? item.label ?? item.name,
          [usedDataKey]: item.sales ?? item.value ?? item[usedDataKey],
        }));
        if (mapped.length) setFetchedData(mapped);
      } catch (e) {
        // silent fail — keep demo data
      }
    })();
    return () => {
      mounted = false;
    };
  }, [data, props.fetchUrl, usedXKey, usedDataKey]);

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
          className="h-54 w-full bg-gradient-to-b from-[#0b0710] to-[#120812] rounded-md"
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
            {/* evil chart: hide grid, red-tinted axis ticks, compact labels */}
            <CartesianGrid vertical={false} horizontal={false} />
            <XAxis
              dataKey={usedXKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => String(value).slice(0, 3).toUpperCase()}
              tick={{ fill: '#ffb4c1', fontSize: 12, fontWeight: 600 }}
            />
            <defs>
              <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <Area
              dataKey={usedDataKey}
              type="monotone"
              fill={`url(#${gradientId})`}
              fillOpacity={0.32}
              stroke={evilPrimary}
              strokeWidth={3}
              strokeOpacity={0.95}
              style={{
                clipPath: `inset(0 ${
                  Number(chartRef.current?.getBoundingClientRect().width || 0) - axis
                }px 0 0)`,
                filter: `url(#${glowId})`,
              }}
            />
            {/* indicator line + inverted tooltip pill */}
            <line
              x1={axis}
              y1={0}
              x2={axis}
              y2={"85%"}
              stroke={evilPrimary}
              strokeDasharray="6 4"
              strokeLinecap="round"
              strokeOpacity={0.35}
            />
            <rect
              x={Math.max(8, axis - 60)}
              y={6}
              width={80}
              height={22}
              rx={6}
              fill="#0b0710"
              stroke={evilPrimary}
              strokeWidth={1}
              style={{ mixBlendMode: 'screen', opacity: 0.96 }}
            />
            <text
              x={Math.max(8, axis - 20)}
              fontWeight={700}
              y={22}
              textAnchor="middle"
              fill={"#ffeef2"}
            >
              ${springY.get().toFixed(0)}
            </text>
            {/* this is a ghost line behind graph */}
            <Area dataKey={usedDataKey} type="monotone" fill="none" stroke={evilSecondary} strokeOpacity={0.06} />
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={evilPrimary} stopOpacity={0.42} />
                <stop offset="50%" stopColor={evilSecondary} stopOpacity={0.12} />
                <stop offset="95%" stopColor={evilSecondary} stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
