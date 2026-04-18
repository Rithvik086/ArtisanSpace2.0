import { craftStyles, cn } from "../../styles/theme";

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  subtext?: string;
}

export function KPICard({
  label,
  value,
  icon,
  trend,
  trendPositive = true,
  subtext,
}: KPICardProps) {
  return (
    <div className={cn(craftStyles.card.warm, "p-6")}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-700 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-3xl font-bold text-amber-900 mt-2 font-baloo">
            {value}
          </p>
          {subtext && <p className="text-xs text-amber-600 mt-1">{subtext}</p>}
          {trend && (
            <div
              className={`text-sm mt-2 font-medium ${
                trendPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend}
            </div>
          )}
        </div>
        <div className="text-amber-900 opacity-75">{icon}</div>
      </div>
    </div>
  );
}

interface StatsGridProps {
  stats: Array<{
    label: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    trendPositive?: boolean;
    subtext?: string;
  }>;
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <KPICard key={idx} {...stat} />
      ))}
    </section>
  );
}
