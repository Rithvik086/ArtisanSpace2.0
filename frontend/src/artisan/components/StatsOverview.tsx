import { Package, Eye, TrendingUp } from "lucide-react";
import { craftStyles, cn } from "../../styles/theme";

interface StatsProps {
  total: number;
  active: number;
  monthValue?: string | number;
}

export default function StatsOverview({
  total,
  active,
  monthValue = "—",
}: StatsProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className={cn(craftStyles.card.warm, "p-6")}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-700 uppercase tracking-wide font-baloo">
              Total Creations
            </p>
            <p className="text-3xl font-bold text-amber-900 mt-2 font-baloo">
              {total}
            </p>
          </div>
          <Package className="w-12 h-12 text-amber-900" />
        </div>
      </div>

      <div className={cn(craftStyles.card.warm, "p-6")}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-700 uppercase tracking-wide font-baloo">
              Active Listings
            </p>
            <p className="text-3xl font-bold text-amber-900 mt-2 font-baloo">
              {active}
            </p>
          </div>
          <Eye className="w-12 h-12 text-amber-900" />
        </div>
      </div>

      <div className={cn(craftStyles.card.warm, "p-6")}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-700 uppercase tracking-wide font-baloo">
              This Month
            </p>
            <p className="text-3xl font-bold text-amber-900 mt-2 font-baloo">
              {monthValue}
            </p>
          </div>
          <TrendingUp className="w-12 h-12 text-amber-900" />
        </div>
      </div>
    </section>
  );
}
