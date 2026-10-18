import { useState } from 'react';
import { Plus, Search, Grid3X3, GalleryHorizontalEnd, X, SlidersHorizontal } from 'lucide-react';
import { useWardrobe } from '../hooks/useWardrobe';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { GarmentGrid } from '../components/wardrobe/GarmentGrid';
import { GarmentRail } from '../components/wardrobe/GarmentRail';
import { GarmentDetail } from '../components/wardrobe/GarmentDetail';
import { AddClothesModal } from '../components/wardrobe/AddClothesModal';
import {
  CATEGORIES,
  STYLE_LABELS,
  COLOR_LABELS,
  SEASON_LABELS,
  type StyleType,
  type GarmentColor,
  type Season,
  type GarmentCategory,
} from '../types';

export function WardrobePage() {
  const wardrobe = useWardrobe();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const categoryOptions = CATEGORIES.map((c) => ({
    value: c.value,
    label: c.label,
  }));

  const styleOptions = [
    { value: 'all', label: 'All Styles' },
    ...Object.entries(STYLE_LABELS).map(([k, v]) => ({ value: k, label: v })),
  ];

  const colorOptions = [
    { value: 'all', label: 'All Colours' },
    ...Object.entries(COLOR_LABELS).map(([k, v]) => ({ value: k, label: v })),
  ];

  const seasonOptions = [
    { value: 'all', label: 'All Seasons' },
    ...Object.entries(SEASON_LABELS).map(([k, v]) => ({ value: k, label: v })),
  ];

  const sortOptions = [
    { value: 'recently-added', label: 'Recently Added' },
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'category', label: 'By Category' },
  ];

  return (
    <div className="sw-wardrobe-page space-y-7">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="sw-top-eyebrow mb-2">A COLLECTION OF YOUR OWN</p><h1 className="heading-editorial-lg">My wardrobe<span className="text-[#b86d51]">.</span></h1>
          <p className="text-body mt-1">
            {wardrobe.totalCount > 0
              ? `${wardrobe.totalCount} piece${wardrobe.totalCount !== 1 ? 's' : ''} in your collection`
              : 'A little archive of everything you love to wear.'}
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => setShowAddModal(true)}
          id="add-clothes-button"
        >
          <Plus size={16} />
          Add Clothes
        </Button>
      </div>

      {/* Search & controls bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            placeholder="Search garments..."
            value={wardrobe.filters.search || ''}
            onChange={(e) => wardrobe.updateFilters({ search: e.target.value })}
            className="w-full pl-9 pr-3 py-2 text-sm text-ink bg-surface border border-border rounded-lg
              placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage
              transition-colors"
            id="wardrobe-search"
            aria-label="Search garments"
          />
        </div>

        {/* View toggle + filter toggle */}
        <div className="flex items-center gap-2">
          <div className="flex bg-surface border border-border rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => wardrobe.setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                wardrobe.viewMode === 'grid'
                  ? 'bg-sage-pale text-sage-deep'
                  : 'text-ink-muted hover:text-ink'
              }`}
              aria-label="Grid view"
              id="grid-view-button"
            >
              <Grid3X3 size={16} />
            </button>
            <button
              type="button"
              onClick={() => wardrobe.setViewMode('rail')}
              className={`p-1.5 rounded-md transition-colors ${
                wardrobe.viewMode === 'rail'
                  ? 'bg-sage-pale text-sage-deep'
                  : 'text-ink-muted hover:text-ink'
              }`}
              aria-label="Rail view"
              id="rail-view-button"
            >
              <GalleryHorizontalEnd size={16} />
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            id="toggle-filters-button"
          >
            <SlidersHorizontal size={14} />
            Filters
          </Button>

          {wardrobe.hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={wardrobe.clearFilters}
              id="clear-filters-button"
            >
              <X size={14} />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 bg-surface rounded-xl border border-border-light animate-[slideUp_0.2s_ease-out]">
          <Select
            label="Category"
            options={categoryOptions}
            value={wardrobe.filters.category || 'all'}
            onChange={(e) =>
              wardrobe.updateFilters({
                category: e.target.value as GarmentCategory | 'all',
              })
            }
            id="filter-category"
          />
          <Select
            label="Style"
            options={styleOptions}
            value={wardrobe.filters.style || 'all'}
            onChange={(e) =>
              wardrobe.updateFilters({
                style: e.target.value as StyleType | 'all',
              })
            }
            id="filter-style"
          />
          <Select
            label="Colour"
            options={colorOptions}
            value={wardrobe.filters.color || 'all'}
            onChange={(e) =>
              wardrobe.updateFilters({
                color: e.target.value as GarmentColor | 'all',
              })
            }
            id="filter-color"
          />
          <Select
            label="Season"
            options={seasonOptions}
            value={wardrobe.filters.season || 'all'}
            onChange={(e) =>
              wardrobe.updateFilters({
                season: e.target.value as Season | 'all',
              })
            }
            id="filter-season"
          />
          <Select
            label="Sort By"
            options={sortOptions}
            value={wardrobe.filters.sort || 'recently-added'}
            onChange={(e) =>
              wardrobe.updateFilters({
                sort: e.target.value as 'recently-added' | 'alphabetical' | 'category',
              })
            }
            id="filter-sort"
          />
        </div>
      )}

      {/* Category quick-filters */}
      <div className="sw-category-wrap"><p className="sw-side-label mb-2">BROWSE YOUR PIECES</p><div className="flex gap-4 overflow-x-auto rail-scroll border-b border-[#e4e2d8]">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => wardrobe.updateFilters({ category: cat.value })}
            className={`
              px-4 py-2 text-[11px] font-medium whitespace-nowrap border-b-2
              transition-all duration-200
              ${
                wardrobe.filters.category === cat.value
                  ? 'border-[#183b32] text-[#183b32]'
                  : 'border-transparent text-ink-muted hover:text-[#183b32] hover:border-[#d6d8cb]'
              }
            `}
            id={`category-${cat.value}`}
          >
            {cat.label}
          </button>
        ))}
      </div></div>

      {/* Content area */}
      {wardrobe.loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton aspect-[3/4] rounded-xl" />
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : wardrobe.error ? (
        <EmptyState
          title="Something went wrong"
          description={wardrobe.error}
          action={
            <Button variant="secondary" onClick={wardrobe.refresh}>
              Try Again
            </Button>
          }
        />
      ) : wardrobe.garments.length === 0 && !wardrobe.hasActiveFilters ? (
        <EmptyState
          icon={<Plus size={28} />}
          title="Your wardrobe is empty"
          description="Add your first garment to start building your digital wardrobe and discovering outfit combinations."
          action={
            <Button onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              Add Your First Piece
            </Button>
          }
        />
      ) : wardrobe.garments.length === 0 && wardrobe.hasActiveFilters ? (
        <EmptyState
          icon={<Search size={28} />}
          title="No matches found"
          description="Try adjusting your filters or search query to find what you're looking for."
          action={
            <Button variant="secondary" onClick={wardrobe.clearFilters}>
              Clear All Filters
            </Button>
          }
        />
      ) : wardrobe.viewMode === 'grid' ? (
        <GarmentGrid
          garments={wardrobe.garments}
          onSelect={wardrobe.setSelectedGarment}
        />
      ) : (
        <GarmentRail
          garments={wardrobe.garments}
          onSelect={wardrobe.setSelectedGarment}
        />
      )}

      {/* Garment detail modal */}
      {wardrobe.selectedGarment && (
        <GarmentDetail
          garment={wardrobe.selectedGarment}
          onClose={() => wardrobe.setSelectedGarment(null)}
          onUpdate={wardrobe.updateGarment}
          onDelete={wardrobe.deleteGarment}
        />
      )}

      {/* Add clothes modal */}
      <AddClothesModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={wardrobe.addGarment}
      />
    </div>
  );
}
