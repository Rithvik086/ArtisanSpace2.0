import { Package, Eye, TrendingUp } from 'lucide-react';
import { craftStyles, cn } from '../../styles/theme';

interface StatsProps {
  total: number;
  active: number;
  monthValue?: string | number;
}

export default function StatsOverview({ total, active, monthValue = '—' }: StatsProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className={cn(craftStyles.card.warm, 'p-6')}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-700 uppercase tracking-wide">Total Creations</p>
            <p className="text-3xl font-bold text-amber-900 mt-2">{total}</p>
          </div>
          <Package className="w-12 h-12 text-amber-600" />
        </div>
      </div>

      <div className={cn(craftStyles.card.warm, 'p-6')}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-700 uppercase tracking-wide">Active Listings</p>
            <p className="text-3xl font-bold text-amber-900 mt-2">{active}</p>
          </div>
          <Eye className="w-12 h-12 text-amber-600" />
        </div>
      </div>

      <div className={cn(craftStyles.card.warm, 'p-6')}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-700 uppercase tracking-wide">This Month</p>
            <p className="text-3xl font-bold text-amber-900 mt-2">{monthValue}</p>
          </div>
          <TrendingUp className="w-12 h-12 text-amber-600" />
        </div>
      </div>
    </section>
  );
}
