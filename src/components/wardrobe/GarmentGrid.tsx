import type { Garment } from '../../types';
import { STYLE_LABELS, COLOR_HEX } from '../../types';
import { Badge } from '../ui/Badge';
import { ArrowUpRight } from 'lucide-react';

interface GarmentGridProps { garments: Garment[]; onSelect: (garment: Garment) => void; }
export function GarmentGrid({ garments, onSelect }: GarmentGridProps) {
  return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-7 lg:gap-x-6 lg:gap-y-9">
    {garments.map((garment, index) => <button key={garment.id} type="button" onClick={() => onSelect(garment)}
      className="sw-garment-card group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183b32]"
      id={`garment-card-${garment.id}`} aria-label={`View ${garment.name}`}>
      <div className="sw-garment-photo relative aspect-[3/4] overflow-hidden">
        <img src={garment.imageUrl} alt={garment.name} className="garment-image w-full h-full transition-transform duration-500 group-hover:scale-[1.035]" loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="#eeebe3"/><text x="150" y="190" text-anchor="middle" font-family="Georgia,serif" font-size="14" fill="#7b8177">Your piece</text></svg>`); }}/>
        <span className="sw-garment-index">{String(index + 1).padStart(2, '0')}</span>
        <span className="sw-garment-color" style={{ background: COLOR_HEX[garment.color] || '#ccc' }} title={garment.color}/>
        <span className="sw-garment-open"><ArrowUpRight size={16}/></span>
      </div>
      <div className="pt-3 px-0.5">
        <div className="flex items-start justify-between gap-2"><h3 className="sw-garment-name">{garment.name}</h3></div>
        <p className="sw-garment-meta">{STYLE_LABELS[garment.style]} <span>·</span> {garment.subcategory.replace(/-/g, ' ')}</p>
        <div className="mt-2 flex gap-1.5 flex-wrap"><Badge variant="sage">{STYLE_LABELS[garment.style]}</Badge></div>
      </div>
    </button>)}
  </div>;
}
