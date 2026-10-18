import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Trash2, Pencil } from 'lucide-react';
import { useServices } from '../app/ServiceProvider';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import type { Garment, Outfit } from '../types';
import { STYLE_LABELS, OCCASION_LABELS, SEASON_LABELS } from '../types';

export function SavedOutfitsPage() {
  const { outfitRepo, garmentRepo } = useServices();
  const navigate = useNavigate();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [confirmUnsave, setConfirmUnsave] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [o, g] = await Promise.all([
          outfitRepo.listSaved(),
          garmentRepo.list(),
        ]);
        setOutfits(o);
        setGarments(g);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [outfitRepo, garmentRepo]);

  const handleUnsave = async (id: string) => {
    await outfitRepo.unsave(id);
    setOutfits((prev) => prev.filter((o) => o.id !== id));
    setConfirmUnsave(null);
    if (selectedOutfit?.id === id) setSelectedOutfit(null);
  };

  const getGarment = (id: string) => garments.find((g) => g.id === id);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-48 rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-editorial-lg text-ink">Saved Outfits</h1>
        <p className="text-body mt-1">
          {outfits.length > 0
            ? `${outfits.length} outfit${outfits.length !== 1 ? 's' : ''} saved for inspiration.`
            : 'Save outfits from Discover to access them here.'}
        </p>
      </div>

      {outfits.length === 0 ? (
        <EmptyState
          icon={<Heart size={28} />}
          title="No saved outfits yet"
          description="Discover outfit combinations from your wardrobe and save the ones you love."
          action={
            <Link to="/discover">
              <Button>
                <Sparkles size={16} />
                Discover Outfits
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {outfits.map((outfit) => (
            <div
              key={outfit.id}
              className="bg-surface rounded-xl border border-border-light p-5 hover:shadow-card transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <button
                  type="button"
                  className="text-left flex-1"
                  onClick={() => setSelectedOutfit(outfit)}
                >
                  <h3 className="text-sm font-semibold text-ink hover:text-sage-deep transition-colors">
                    {outfit.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <Badge variant="sage">{STYLE_LABELS[outfit.style]}</Badge>
                    <Badge>{OCCASION_LABELS[outfit.occasion]}</Badge>
                    <Badge variant="muted">{SEASON_LABELS[outfit.season]}</Badge>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmUnsave(outfit.id)}
                  className="p-2 rounded-lg text-ink-muted hover:text-danger hover:bg-danger-light transition-colors"
                  aria-label="Remove saved outfit"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Mini garment preview */}
              <div className="flex gap-2.5 overflow-x-auto rail-scroll pb-1">
                {outfit.items.map((item) => {
                  const g = getGarment(item.garmentId);
                  if (!g) return null;
                  return (
                    <div key={item.garmentId} className="flex-none w-16">
                      <div className="aspect-square bg-ivory-warm rounded-lg overflow-hidden">
                        <img
                          src={g.imageUrl}
                          alt={g.name}
                          className="garment-image w-full h-full"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,' +
                              encodeURIComponent(
                                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" fill="#FAF8F5"/></svg>`
                              );
                          }}
                        />
                      </div>
                      <p className="text-[9px] text-ink-muted mt-1 truncate text-center capitalize">
                        {item.role.replace(/-/g, ' ')}
                      </p>
                    </div>
                  );
                })}
              </div>

              <p className="text-[10px] text-ink-faint mt-2">
                Saved {new Date(outfit.dateCreated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Outfit detail modal */}
      {selectedOutfit && (
        <Modal
          isOpen
          onClose={() => setSelectedOutfit(null)}
          title={selectedOutfit.name}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="sage">{STYLE_LABELS[selectedOutfit.style]}</Badge>
              <Badge>{OCCASION_LABELS[selectedOutfit.occasion]}</Badge>
              <Badge variant="muted">{SEASON_LABELS[selectedOutfit.season]}</Badge>
            </div>

            <h3 className="text-sm font-medium text-ink">
              Outfit Pieces ({selectedOutfit.items.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {selectedOutfit.items.map((item) => {
                const g = getGarment(item.garmentId);
                if (!g) return null;
                return (
                  <div key={item.garmentId} className="bg-ivory-warm rounded-lg p-3">
                    <div className="aspect-[3/4] rounded-lg overflow-hidden mb-2">
                      <img
                        src={g.imageUrl}
                        alt={g.name}
                        className="garment-image w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml,' +
                            encodeURIComponent(
                              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260" fill="none"><rect width="200" height="260" fill="#FAF8F5"/><text x="100" y="130" text-anchor="middle" font-family="serif" font-size="11" fill="#B0B0B0">${g.name}</text></svg>`
                            );
                        }}
                      />
                    </div>
                    <p className="text-xs font-medium text-ink">{g.name}</p>
                    <p className="text-[10px] text-ink-muted capitalize">
                      {item.role.replace(/-/g, ' ')} · {g.subcategory.replace(/-/g, ' ')}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap justify-between gap-2 pt-2 border-t border-border-light">
              <Button variant="secondary" onClick={() => { const outfit = selectedOutfit; setSelectedOutfit(null); navigate('/discover', { state: { editOutfit: outfit } }); }}>
                <Pencil size={14} /> Edit in Outfit Studio
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setConfirmUnsave(selectedOutfit.id); }}
                className="text-danger hover:bg-danger-light"
              >
                <Trash2 size={14} />
                Remove from Saved
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Unsave confirmation */}
      {confirmUnsave && (
        <Modal
          isOpen
          onClose={() => setConfirmUnsave(null)}
          title="Remove Saved Outfit?"
        >
          <p className="text-body mb-5">
            This outfit will be removed from your saved collection. You can always rediscover it later.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setConfirmUnsave(null)}>
              Keep It
            </Button>
            <Button variant="danger" onClick={() => handleUnsave(confirmUnsave)}>
              Remove
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
