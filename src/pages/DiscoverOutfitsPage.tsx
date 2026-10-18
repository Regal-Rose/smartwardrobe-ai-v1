import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Heart, AlertCircle, Info, Pencil, Save, X } from 'lucide-react';
import { useServices } from '../app/ServiceProvider';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import type { Garment, Outfit, Occasion, Season, StyleType, UserPreferences } from '../types';
import { OCCASION_LABELS, SEASON_LABELS, STYLE_LABELS } from '../types';

export function DiscoverOutfitsPage() {
  const { garmentRepo, outfitRepo, preferencesRepo } = useServices();
  const location = useLocation();
  const navigate = useNavigate();
  const [garments, setGarments] = useState<Garment[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | undefined>(undefined);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingWardrobe, setLoadingWardrobe] = useState(true);
  const [generated, setGenerated] = useState(false);
  const [editing, setEditing] = useState<Outfit | null>(null);
  const [notice, setNotice] = useState('');

  const [occasion, setOccasion] = useState<Occasion>('casual');
  const [season, setSeason] = useState<Season | ''>('');
  const [style, setStyle] = useState<StyleType | ''>('');

  // Load wardrobe for generation
  useEffect(() => {
    let active = true;
    Promise.all([
      garmentRepo.list(),
      preferencesRepo.get().catch(() => undefined),
    ]).then(([g, p]) => {
      if (!active) return;
      setGarments(g);
      setPreferences(p);
      setLoadingWardrobe(false);
    }).catch(() => {
      if (active) setLoadingWardrobe(false);
    });
    return () => { active = false; };
  }, [garmentRepo, preferencesRepo]);

  useEffect(() => {
    const state = location.state as { editOutfit?: Outfit } | null;
    if (state?.editOutfit) {
      setEditing({ ...state.editOutfit, items: [...state.editOutfit.items] });
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setGenerated(false);
    try {
      const results = await outfitRepo.generate(
        {
          occasion,
          season: season || undefined,
          style: style || undefined,
        },
        garments,
        preferences,
      );
      setOutfits(results);
      setGenerated(true);
    } finally {
      setLoading(false);
    }
  }, [outfitRepo, garments, preferences, occasion, season, style]);

  const handleSave = async (outfit: Outfit) => {
    const saved = await outfitRepo.save(outfit);
    setOutfits((prev) =>
      prev.map((o) => (o.id === outfit.id ? saved : o))
    );
  };

  const handleUnsave = async (outfitId: string) => {
    await outfitRepo.unsave(outfitId);
    setOutfits((prev) =>
      prev.map((o) => (o.id === outfitId ? { ...o, isSaved: false } : o))
    );
  };

  const getGarment = (id: string) => garments.find((g) => g.id === id);

  const updateEditedItem = (index: number, garmentId: string) => {
    if (!editing) return;
    const garment = garments.find((g) => g.id === garmentId);
    if (!garment) return;
    setEditing({
      ...editing,
      items: editing.items.map((item, i) => i === index
        ? { ...item, garmentId: garment.id }
        : item),
      name: editing.items.map((item, i) => {
        const current = i === index ? garment : getGarment(item.garmentId);
        return current?.name;
      }).filter(Boolean).slice(0, 2).join(' + '),
    });
  };

  const saveEditedOutfit = async () => {
    if (!editing || editing.items.length === 0) return;
    const saved = await outfitRepo.save({ ...editing, isSaved: true, dateCreated: editing.dateCreated || new Date().toISOString() });
    setOutfits((prev) => {
      const exists = prev.some((o) => o.id === saved.id);
      return exists ? prev.map((o) => o.id === saved.id ? saved : o) : [saved, ...prev];
    });
    setEditing(null);
    setNotice('Outfit saved. It will be available in Saved Outfits after refresh.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="heading-editorial-lg text-ink">Discover Outfits</h1>
        <p className="text-body mt-1">
          Find outfit combinations from your own wardrobe pieces.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-sage-pale/50 rounded-xl border border-sage-pale">
        <Info size={18} className="text-sage-deep mt-0.5 shrink-0" />
        <div className="text-sm text-sage-deep">
          <p className="font-medium">Personalised outfit matching</p>
          <p className="text-xs mt-0.5 opacity-80">
            Suggestions are ranked using your wardrobe, colour coordination, occasion, season and saved style preferences. This is an explainable rules-based recommender, not a trained AI model.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-surface rounded-xl border border-border-light p-5">
        <h2 className="text-sm font-semibold text-ink mb-4">
          What are you dressing for?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Occasion"
            options={Object.entries(OCCASION_LABELS).map(([k, v]) => ({
              value: k,
              label: v,
            }))}
            value={occasion}
            onChange={(e) => setOccasion(e.target.value as Occasion)}
            id="discover-occasion"
          />
          <Select
            label="Season (optional)"
            options={[
              { value: '', label: 'Any Season' },
              ...Object.entries(SEASON_LABELS).map(([k, v]) => ({
                value: k,
                label: v,
              })),
            ]}
            value={season}
            onChange={(e) => setSeason(e.target.value as Season | '')}
            id="discover-season"
          />
          <Select
            label="Style (optional)"
            options={[
              { value: '', label: 'Any Style' },
              ...Object.entries(STYLE_LABELS).map(([k, v]) => ({
                value: k,
                label: v,
              })),
            ]}
            value={style}
            onChange={(e) => setStyle(e.target.value as StyleType | '')}
            id="discover-style"
          />
        </div>

        <div className="mt-5">
          <Button
            onClick={handleGenerate}
            loading={loading}
            disabled={loadingWardrobe || garments.length === 0}
            size="lg"
            id="generate-outfits-button"
          >
            <Sparkles size={16} />
            Generate Outfits
          </Button>
          {garments.length === 0 && !loadingWardrobe && (
            <p className="text-xs text-danger mt-2 flex items-center gap-1">
              <AlertCircle size={12} />
              Your wardrobe is empty. Add garments first to discover outfits.
            </p>
          )}
        </div>
      </div>

      {notice && <div role="status" className="flex items-center justify-between gap-3 border border-[#cbd7f8] bg-[#eef2ff] px-4 py-3 text-sm text-[#2443a7]"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss message"><X size={15}/></button></div>}

      {/* Results */}
      {generated && outfits.length === 0 && (
        <EmptyState
          icon={<Sparkles size={28} />}
          title="No compatible outfits found"
          description={`Your wardrobe doesn't have enough compatible garments for "${OCCASION_LABELS[occasion]}" outfits. Try adding more tops, bottoms, or other categories.`}
          action={
            <Button variant="secondary" onClick={() => window.location.assign('/wardrobe')}>
              Go to Wardrobe
            </Button>
          }
        />
      )}

      {outfits.length > 0 && (
        <div className="space-y-4">
          <h2 className="heading-editorial text-lg text-ink">
            {outfits.length} outfit{outfits.length !== 1 ? 's' : ''} found
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {outfits.map((outfit) => (
              <div
                key={outfit.id}
                className="bg-surface rounded-xl border border-border-light p-5 hover:shadow-card transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-ink">
                      {outfit.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="sage">{STYLE_LABELS[outfit.style]}</Badge>
                      <Badge>{OCCASION_LABELS[outfit.occasion]}</Badge>
                      <Badge variant="muted">{outfit.items.length} pieces</Badge>
                    </div>
                    {typeof outfit.recommendationScore === 'number' && (
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#3155D9]">Style match</span>
                          <span className="text-xs font-semibold text-ink">{outfit.recommendationScore}%</span>
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#e6e8ef]" aria-label={`Style match ${outfit.recommendationScore}%`}>
                            <div className="h-full rounded-full bg-[#3155D9]" style={{ width: `${outfit.recommendationScore}%` }} />
                          </div>
                        </div>
                        {outfit.recommendationReasons?.length ? <p className="text-[11px] text-ink-muted">{outfit.recommendationReasons.join(' · ')}</p> : null}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                  <button type="button" onClick={() => { setEditing({ ...outfit, items: [...outfit.items] }); setNotice(''); }} className="p-2 rounded-lg text-ink-muted hover:text-[#3155D9] hover:bg-[#eef2ff]" aria-label="Edit outfit"><Pencil size={16}/></button>
                  <button
                    type="button"
                    onClick={() =>
                      outfit.isSaved
                        ? handleUnsave(outfit.id)
                        : handleSave(outfit)
                    }
                    className={`p-2 rounded-lg transition-colors ${
                      outfit.isSaved
                        ? 'text-danger hover:bg-danger-light'
                        : 'text-ink-muted hover:text-danger hover:bg-danger-light'
                    }`}
                    aria-label={outfit.isSaved ? 'Unsave outfit' : 'Save outfit'}
                  >
                    {outfit.isSaved ? (
                      <Heart size={18} fill="currentColor" />
                    ) : (
                      <Heart size={18} />
                    )}
                  </button>
                  </div>
                </div>

                {/* Garment items */}
                <div className="flex gap-3 overflow-x-auto rail-scroll pb-2">
                  {outfit.items.map((item) => {
                    const g = getGarment(item.garmentId);
                    if (!g) return null;
                    return (
                      <div
                        key={item.garmentId}
                        className="flex-none w-24"
                      >
                        <div className="aspect-[3/4] bg-ivory-warm rounded-lg overflow-hidden mb-1.5">
                          <img
                            src={g.imageUrl}
                            alt={g.name}
                            className="garment-image w-full h-full"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'data:image/svg+xml,' +
                                encodeURIComponent(
                                  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260" fill="none"><rect width="200" height="260" fill="#FAF8F5"/><text x="100" y="130" text-anchor="middle" font-family="serif" font-size="11" fill="#B0B0B0">${g.name}</text></svg>`
                                );
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-ink-light truncate">
                          {g.name}
                        </p>
                        <p className="text-[10px] text-ink-muted capitalize">
                          {item.role.replace(/-/g, ' ')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label="Edit outfit">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#F7F7F2] p-5 sm:p-7 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div><p className="text-[10px] tracking-[.18em] font-semibold text-[#3155D9] uppercase">Outfit Studio</p><h2 className="heading-editorial text-2xl mt-1">Make it yours.</h2><p className="text-sm text-ink-muted mt-1">Swap any piece for something already in your wardrobe.</p></div>
              <button onClick={() => setEditing(null)} className="p-2 rounded-full hover:bg-black/5" aria-label="Close editor"><X size={19}/></button>
            </div>
            <label className="block text-xs font-semibold text-ink mb-1.5" htmlFor="outfit-name">Outfit name</label>
            <input id="outfit-name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full rounded-lg border border-[#deded5] bg-white px-3 py-2.5 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-[#3155D9]/25"/>
            <div className="space-y-3">
              {editing.items.map((item, index) => {
                const current = getGarment(item.garmentId);
                return <div key={`${item.garmentId}-${index}`} className="grid grid-cols-[64px_1fr] sm:grid-cols-[76px_1fr] gap-3 items-center rounded-xl border border-[#e4e2d8] bg-white p-3">
                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-[#f1efe8]">{current?.imageUrl && <img src={current.imageUrl} alt={current.name} className="w-full h-full object-cover"/>}</div>
                  <div><p className="text-[10px] tracking-wider uppercase text-ink-muted mb-1">{item.role.replace(/-/g, ' ')}</p><select aria-label={`Replace ${item.role}`} value={item.garmentId} onChange={(e) => updateEditedItem(index, e.target.value)} className="w-full rounded-lg border border-[#deded5] bg-white px-3 py-2 text-sm">
                    {garments.map((g) => <option key={g.id} value={g.id}>{g.name} · {g.category.replace(/-/g, ' ')}</option>)}
                  </select><p className="text-xs text-ink-muted mt-1">{current?.color ?? ''} {current?.style ? `· ${current.style}` : ''}</p></div>
                </div>;
              })}
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#e4e2d8]">
              <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={saveEditedOutfit}><Save size={15}/> Save outfit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
