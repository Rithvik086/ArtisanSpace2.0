import { Link } from 'react-router-dom';
import { Plus, Palette } from 'lucide-react';
import { craftStyles, cn } from '../../styles/theme';

interface HeroProps {
  title?: string;
  subtitle?: string;
  addLink?: string;
}

export default function Hero({ title = 'Artisan Workshop', subtitle = 'Where creativity meets commerce', addLink = '/artisan/add-listing' }: HeroProps) {
  return (
    <div className={cn(craftStyles.layout.container, 'py-6')}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-amber-900 font-serif">
            <Palette className="inline-block w-8 h-8 mr-3 text-amber-600" />
            {title}
          </h1>
          <p className="text-amber-700 mt-2 text-lg">{subtitle}</p>
        </div>
        <div>
          <Link to={addLink} className={cn(craftStyles.button.primary, 'flex items-center gap-2')}>
            <Plus className="w-5 h-5" />
            Add New Creation
          </Link>
        </div>
      </div>
    </div>
  );
}
