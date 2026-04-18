import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { craftStyles, cn } from "../../styles/theme";

interface TrendData {
  date: string;
  revenue: number;
  orders: number;
}

interface ChartProps {
  data: TrendData[];
  loading?: boolean;
}

export function RevenueTrend({ data, loading }: ChartProps) {
  if (loading) {
    return (
      <div
        className={cn(
          craftStyles.card.warm,
          "p-6 h-96 flex items-center justify-center",
        )}
      >
        <p className="text-amber-600">Loading chart data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          craftStyles.card.warm,
          "p-6 h-96 flex items-center justify-center",
        )}
      >
        <p className="text-amber-600">No data available yet</p>
      </div>
    );
  }

  return (
    <div className={cn(craftStyles.card.warm, "p-6")}>
      <h3 className="text-lg font-semibold text-amber-900 mb-4 font-baloo flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Revenue Trend (Last 30 Days)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d4a574" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "#78350f" }}
            stroke="#d4a574"
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#78350f" }}
            stroke="#d4a574"
            yAxisId="left"
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: "#78350f" }}
            stroke="#d4a574"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fffbeb",
              border: "1px solid #d4a574",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#78350f" }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke="#b45309"
            strokeWidth={2}
            dot={{ fill: "#b45309", r: 4 }}
            activeDot={{ r: 6 }}
            name="Revenue (₹)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            stroke="#7c3aed"
            strokeWidth={2}
            dot={{ fill: "#7c3aed", r: 4 }}
            activeDot={{ r: 6 }}
            name="Orders"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrdersTrend({ data, loading }: ChartProps) {
  if (loading) {
    return (
      <div
        className={cn(
          craftStyles.card.warm,
          "p-6 h-96 flex items-center justify-center",
        )}
      >
        <p className="text-amber-600">Loading chart data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          craftStyles.card.warm,
          "p-6 h-96 flex items-center justify-center",
        )}
      >
        <p className="text-amber-600">No data available yet</p>
      </div>
    );
  }

  return (
    <div className={cn(craftStyles.card.warm, "p-6")}>
      <h3 className="text-lg font-semibold text-amber-900 mb-4 font-baloo">
        Orders Trend (Last 30 Days)
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d4a574" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "#78350f" }}
            stroke="#d4a574"
          />
          <YAxis tick={{ fontSize: 12, fill: "#78350f" }} stroke="#d4a574" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fffbeb",
              border: "1px solid #d4a574",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#78350f" }}
          />
          <Bar dataKey="orders" fill="#d97706" name="Orders" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
