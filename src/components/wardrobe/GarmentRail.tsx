import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Garment } from '../../types';
import { COLOR_HEX } from '../../types';

interface GarmentRailProps {
  garments: Garment[];
  onSelect: (garment: Garment) => void;
}

export function GarmentRail({ garments, onSelect }: GarmentRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.6;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative">
      {/* Rail background — inspired by clothing rail aesthetic */}
      <div className="relative bg-surface rounded-2xl border border-border-light p-6 overflow-hidden">
        {/* Top rail bar visual */}
        <div className="absolute top-8 left-8 right-8 h-[2px] bg-border-strong/60 rounded-full" />
        <div className="absolute top-6 left-8 w-[3px] h-6 bg-border-strong/80 rounded-full" />
        <div className="absolute top-6 right-8 w-[3px] h-6 bg-border-strong/80 rounded-full" />

        {/* Scroll arrows */}
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-surface/90 border border-border shadow-card flex items-center justify-center text-ink-muted hover:text-ink hover:shadow-elevated transition-all"
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-surface/90 border border-border shadow-card flex items-center justify-center text-ink-muted hover:text-ink hover:shadow-elevated transition-all"
          aria-label="Scroll right"
        >
          <ChevronRight size={18} />
        </button>

        {/* Scrollable garment rail */}
        <div
          ref={scrollRef}
          className="rail-scroll flex gap-6 pt-10 pb-2 px-2"
        >
          {garments.map((garment) => (
            <button
              key={garment.id}
              type="button"
              onClick={() => onSelect(garment)}
              className="group flex-none flex flex-col items-center w-36 sm:w-44 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage rounded-lg"
              aria-label={`View ${garment.name}`}
            >
              {/* Hanger hook visual */}
              <div className="relative mb-1">
                <div className="w-[2px] h-5 bg-border-strong/60 mx-auto" />
                <div className="w-6 h-3 border-t-2 border-l-2 border-r-2 border-border-strong/60 rounded-t-full mx-auto -mt-[1px]" />
              </div>

              {/* Garment image */}
              <div className="relative w-full aspect-[3/4] bg-ivory-warm rounded-xl overflow-hidden shadow-subtle group-hover:shadow-card transition-shadow duration-300">
                <img
                  src={garment.imageUrl}
                  alt={garment.name}
                  className="garment-image w-full h-full group-hover:scale-[1.03] transition-transform duration-500 ease-smooth"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml,' +
                      encodeURIComponent(
                        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" fill="none"><rect width="300" height="400" fill="#FAF8F5"/><text x="150" y="200" text-anchor="middle" font-family="serif" font-size="14" fill="#B0B0B0">${garment.name}</text></svg>`
                      );
                  }}
                />
              </div>

              {/* Label */}
              <div className="mt-3 text-center w-full px-1">
                <p className="text-xs font-medium text-ink truncate group-hover:text-sage-deep transition-colors">
                  {garment.name}
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full border border-border-strong/50"
                    style={{ background: COLOR_HEX[garment.color] || '#ccc' }}
                  />
                  <span className="text-[10px] text-ink-muted capitalize">
                    {garment.subcategory.replace(/-/g, ' ')}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
