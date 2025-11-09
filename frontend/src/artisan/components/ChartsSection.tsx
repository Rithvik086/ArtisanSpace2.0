import { SalesChart } from '../../components/ui/SalesChart';
import { ProductsChart } from '../../components/ui/ProductsChart';
import { craftStyles, cn } from '../../styles/theme';

interface ChartsProps {
  total: number;
  active: number;
  pending: number;
}

export default function ChartsSection({ total, active, pending }: ChartsProps) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div className={cn(craftStyles.card.default, 'p-6')}>
        <h3 className="text-xl font-semibold text-amber-900 mb-4 font-serif">Sales Analytics</h3>
        <SalesChart />
      </div>
      <div className={cn(craftStyles.card.default, 'p-6')}>
        <h3 className="text-xl font-semibold text-amber-900 mb-4 font-serif">Product Performance</h3>
        <ProductsChart total={total} active={active} pending={pending} />
      </div>
    </section>
  );
}
