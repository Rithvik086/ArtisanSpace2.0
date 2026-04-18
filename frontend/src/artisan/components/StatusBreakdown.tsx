import { Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import { craftStyles, cn } from "../../styles/theme";

interface StatusBreakdownProps {
  pending: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export function OrderStatusBreakdown({
  pending,
  shipped,
  delivered,
  cancelled,
}: StatusBreakdownProps) {
  const total = pending + shipped + delivered + cancelled;
  const getPct = (val: number) => ((val / total) * 100).toFixed(1);

  const statuses = [
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      color: "bg-yellow-100 text-yellow-700",
      barColor: "bg-yellow-400",
    },
    {
      label: "Shipped",
      value: shipped,
      icon: Truck,
      color: "bg-blue-100 text-blue-700",
      barColor: "bg-blue-400",
    },
    {
      label: "Delivered",
      value: delivered,
      icon: CheckCircle,
      color: "bg-green-100 text-green-700",
      barColor: "bg-green-400",
    },
    {
      label: "Cancelled",
      value: cancelled,
      icon: XCircle,
      color: "bg-red-100 text-red-700",
      barColor: "bg-red-400",
    },
  ];

  return (
    <div className={cn(craftStyles.card.warm, "p-6")}>
      <h3 className="text-lg font-semibold text-amber-900 mb-6 font-baloo">
        Order Status Breakdown
      </h3>
      <div className="space-y-6">
        {statuses.map((status) => {
          const Icon = status.icon;
          const percentage = parseFloat(getPct(status.value));
          return (
            <div key={status.label}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-amber-900" />
                  <span className="text-sm font-medium text-amber-900">
                    {status.label}
                  </span>
                </div>
                <span className="text-sm font-semibold text-amber-900">
                  {status.value} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-amber-100 rounded-full h-2">
                <div
                  className={cn(
                    status.barColor,
                    "h-2 rounded-full transition-all",
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ProductStatsProps {
  total: number;
  active: number;
  pending: number;
  rejected: number;
}

export function ProductStats({
  total,
  active,
  pending,
  rejected,
}: ProductStatsProps) {
  const stats = [
    {
      label: "Total",
      value: total,
      color: "text-amber-900",
      bgColor: "bg-amber-50",
    },
    {
      label: "Active",
      value: active,
      color: "text-green-700",
      bgColor: "bg-green-50",
    },
    {
      label: "Pending",
      value: pending,
      color: "text-yellow-700",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Rejected",
      value: rejected,
      color: "text-red-700",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className={cn(craftStyles.card.warm, "p-6")}>
      <h3 className="text-lg font-semibold text-amber-900 mb-6 font-baloo">
        Product Status
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={cn(stat.bgColor, "p-4 rounded-lg")}>
            <p className="text-xs text-amber-700 uppercase font-medium mb-1">
              {stat.label}
            </p>
            <p className={cn(stat.color, "text-2xl font-bold")}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface RequestStatsProps {
  total: number;
  accepted: number;
  pending: number;
}

export function RequestStats({ total, accepted, pending }: RequestStatsProps) {
  return (
    <div className={cn(craftStyles.card.warm, "p-6")}>
      <h3 className="text-lg font-semibold text-amber-900 mb-6 font-baloo">
        Custom Requests
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-900">{total}</p>
          <p className="text-xs text-amber-600 mt-1">Total Requests</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-700">{accepted}</p>
          <p className="text-xs text-green-600 mt-1">Accepted</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-700">{pending}</p>
          <p className="text-xs text-yellow-600 mt-1">Pending</p>
        </div>
      </div>
    </div>
  );
}

interface WorkshopStatsProps {
  total: number;
  accepted: number;
  pending: number;
}

export function WorkshopStats({
  total,
  accepted,
  pending,
}: WorkshopStatsProps) {
  return (
    <div className={cn(craftStyles.card.warm, "p-6")}>
      <h3 className="text-lg font-semibold text-amber-900 mb-6 font-baloo">
        Workshops
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-900">{total}</p>
          <p className="text-xs text-amber-600 mt-1">Total</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-700">{accepted}</p>
          <p className="text-xs text-green-600 mt-1">Accepted</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-700">{pending}</p>
          <p className="text-xs text-yellow-600 mt-1">Pending</p>
        </div>
      </div>
    </div>
  );
}
