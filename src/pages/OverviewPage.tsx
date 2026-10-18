import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight, ArrowRight, Check, Heart, RefreshCw, Shirt,
  Sparkles, WandSparkles, Plus, BookmarkCheck, AlertCircle,
} from 'lucide-react';
import { useServices } from '../app/ServiceProvider';
import type { Garment, Outfit } from '../types';
import { CATEGORIES, OCCASION_LABELS, STYLE_LABELS } from '../types';

const imageFallback = (label: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 300"><rect width="240" height="300" fill="#F0F0EB"/><path d="M82 100l38-24 38 24 24 45-24 12-12-24v95H94v-95l-12 24-24-12z" fill="#D7D9D5"/><text x="120" y="265" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="#555B61">${label.replace(/[<>&]/g, '')}</text></svg>`)}`;

export function OverviewPage() {
  const { garmentRepo, outfitRepo, dataMode } = useServices();
  const [garments, setGarments] = useState<Garment[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);
  const [recommendations, setRecommendations] = useState<Outfit[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const generateRecommendations = useCallback(async (wardrobe: Garment[]) => {
    if (wardrobe.length === 0) {
      setRecommendations([]);
      return;
    }
    // Current repository implementation uses transparent, category-based rules rather than a trained AI model.
    const primary = await outfitRepo.generate({ occasion: 'casual' }, wardrobe);
    const fallback = primary.length ? primary : await outfitRepo.generate({ occasion: 'everyday' }, wardrobe);
    setRecommendations(fallback.filter((outfit) => outfit.items.every((item) => wardrobe.some((g) => g.id === item.garmentId))));
    setFeaturedIndex(0);
  }, [outfitRepo]);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const [wardrobe, saved] = await Promise.all([garmentRepo.list(), outfitRepo.listSaved()]);
      setGarments(wardrobe);
      setSavedOutfits(saved);
      await generateRecommendations(wardrobe);
    } catch {
      setError('We couldn’t load your wardrobe right now. Your saved items haven’t been changed.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [garmentRepo, outfitRepo, generateRecommendations]);

  useEffect(() => { void load(); }, [load]);

  const visibleRecommendations = useMemo(
    () => recommendations.filter((outfit) => !dismissed.includes(outfit.id)),
    [recommendations, dismissed],
  );
  const featured = visibleRecommendations[featuredIndex % Math.max(visibleRecommendations.length, 1)];
  const alternatives = visibleRecommendations.filter((outfit) => outfit.id !== featured?.id).slice(0, 2);
  const getGarment = (id: string) => garments.find((g) => g.id === id);
  // Demo seed URLs can point to generic stock photos that do not match the garment label.
  // Use a branded, labelled placeholder in demo mode; use uploaded/backend images in HTTP mode.
  const getGarmentImage = (garment: Garment) =>
    dataMode === 'mock' || !garment.imageUrl?.trim()
      ? imageFallback(garment.name)
      : garment.imageUrl;
  const recentGarments = [...garments].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded)).slice(0, 4);
  const categoryCount = CATEGORIES.filter((category) => category.value !== 'all')
    .reduce((sum, category) => sum + garments.filter((g) => g.category === category.value).length, 0);

  const handleSave = async (outfit: Outfit) => {
    setSavingId(outfit.id);
    setFeedback('');
    try {
      const saved = await outfitRepo.save(outfit);
      setSavedOutfits((previous) => [saved, ...previous.filter((item) => item.id !== saved.id)]);
      setFeedback('Look saved to your collection.');
    } catch {
      setFeedback('Could not save this look. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  const handleTryAnother = async () => {
    if (visibleRecommendations.length > 1) {
      setFeaturedIndex((index) => (index + 1) % visibleRecommendations.length);
      setFeedback('');
      return;
    }
    setRefreshing(true);
    try {
      await generateRecommendations(garments);
      setFeedback('We refreshed the available combinations from your wardrobe.');
    } catch {
      setFeedback('Could not refresh looks right now. Try again in a moment.');
    } finally {
      setRefreshing(false);
    }
  };

  const renderOutfitImage = (outfit: Outfit, className: string) => {
    const items = outfit.items.map((item) => getGarment(item.garmentId)).filter((g): g is Garment => Boolean(g));
    return <div className={className}>
      {items.slice(0, 3).map((garment, index) => (
        <div className="today-cutout" key={garment.id} style={{ zIndex: 4 - index }}>
          <img src={getGarmentImage(garment)} alt={garment.name} loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = imageFallback(garment.name); }} />
        </div>
      ))}
      {items.length === 0 && <div className="today-image-empty"><Shirt size={40}/><span>Your garments appear here</span></div>}
    </div>;
  };

  if (loading) return <div className="today-page" aria-busy="true">
    <div className="today-page-heading"><div className="skeleton h-3 w-28"/><div className="skeleton h-12 w-72 mt-4"/><div className="skeleton h-4 w-60 mt-3"/></div>
    <div className="skeleton today-feature-skeleton mt-8"/><div className="grid grid-cols-2 gap-5 mt-6"><div className="skeleton h-48"/><div className="skeleton h-48"/></div>
  </div>;

  return <div className="today-page">
    <section className="today-page-heading">
      <div className="today-kicker"><span className="today-kicker-mark"/> YOUR WARDROBE, IN MOTION</div>
      <div className="today-heading-row">
        <div><h1 className="today-title">What are we <em>wearing?</em></h1><p className="today-subtitle">Good outfits start with what you already own.</p></div>
        <button type="button" className="today-refresh" onClick={() => void load(true)} disabled={refreshing} aria-label="Refresh Today">
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''}/><span>Refresh</span>
        </button>
      </div>
      {dataMode === 'mock' && <p className="today-mode-note">Demo wardrobe mode is active.</p>}
      {error && <div className="today-alert" role="alert"><AlertCircle size={17}/><span>{error}</span><button type="button" onClick={() => void load(true)}>Retry</button></div>}
    </section>

    {garments.length === 0 ? <section className="today-empty-state">
      <div className="today-empty-art"><div className="today-empty-swatch swatch-blue"/><div className="today-empty-swatch swatch-yellow"/><div className="today-empty-swatch swatch-red"/><Shirt size={54} strokeWidth={1.2}/></div>
      <p className="today-kicker">A GOOD PLACE TO START</p><h2>Your next favourite outfit<br/><em>starts with one piece.</em></h2>
      <p>Add a few clothes you already own. We’ll use them to build outfit combinations you can save and make your own.</p>
      <Link className="today-primary-button" to="/wardrobe"><Plus size={16}/> Add your first clothes <ArrowRight size={15}/></Link>
      <span className="today-empty-footnote">Your wardrobe stays yours. Sample looks are not shown as personal recommendations.</span>
    </section> : visibleRecommendations.length === 0 ? <section className="today-empty-state today-no-looks">
      <div className="today-empty-art"><WandSparkles size={48} strokeWidth={1.2}/></div>
      <p className="today-kicker">READY FOR A NEW COMBINATION?</p><h2>Let’s make more room<br/><em>for outfit possibilities.</em></h2>
      <p>We couldn’t find a complete combination from the available garment details yet. Add or update tops, bottoms, dresses, footwear, or Indian-wear pairings to expand your options.</p>
      <Link className="today-primary-button" to="/wardrobe"><Plus size={16}/> Add or edit clothes <ArrowRight size={15}/></Link>
    </section> : <>
      {featured && <section className="today-featured-section">
        <div className="today-section-heading"><div><p className="today-kicker">01 / THE FEATURED LOOK</p><h2>One to wear today.</h2></div><span className="today-rule-note">Made from your wardrobe</span></div>
        <div className="today-featured">
          <div className="today-featured-visual">
            <div className="today-visual-topline"><span>LOOK NO. {String(featuredIndex + 1).padStart(2, '0')}</span><span>{STYLE_LABELS[featured.style]}</span></div>
            {renderOutfitImage(featured, 'today-outfit-collage')}
            <span className="today-visual-caption">YOUR PIECES, NEW PERSPECTIVE.</span>
          </div>
          <div className="today-featured-copy">
            <div className="today-featured-tag"><Sparkles size={14}/> FROM YOUR OWN CLOSET</div>
            <h3>{featured.name}</h3>
            <p className="today-featured-description">A combination assembled from your saved garments using category and occasion compatibility rules.</p>
            <div className="today-piece-list">{featured.items.map((item) => { const garment = getGarment(item.garmentId); return garment ? <Link key={item.garmentId} to="/wardrobe" className="today-piece-row"><img src={getGarmentImage(garment)} alt="" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = imageFallback(garment.name); }}/><span><strong>{garment.name}</strong><small>{item.role.replace(/-/g, ' ')}</small></span><ArrowDownRight size={15}/></Link> : null; })}</div>
            <div className="today-featured-actions">
              <button type="button" className="today-primary-button" disabled={savingId === featured.id || savedOutfits.some((outfit) => outfit.id === featured.id)} onClick={() => void handleSave(featured)}>
                {savedOutfits.some((outfit) => outfit.id === featured.id) ? <><Check size={16}/> Saved</> : <><Heart size={16}/> {savingId === featured.id ? 'Saving…' : 'Save this look'}</>}
              </button>
              <button type="button" className="today-secondary-button" onClick={() => void handleTryAnother()} disabled={refreshing}><RefreshCw size={15}/> Try another</button>
              <button type="button" className="today-dismiss-button" onClick={() => { setDismissed((items) => [...items, featured.id]); setFeaturedIndex(0); setFeedback('We’ll leave this look out of today’s suggestions.'); }}>Dismiss</button>
            </div>
            <Link to="/discover" className="today-edit-link">Open outfit studio <ArrowRight size={14}/></Link>
          </div>
        </div>
        {feedback && <p className="today-feedback" role="status">{feedback}</p>}
      </section>}

      {alternatives.length > 0 && <section className="today-alternatives-section">
        <div className="today-section-heading"><div><p className="today-kicker">02 / KEEP EXPLORING</p><h2>More ways to wear it.</h2></div><Link to="/discover" className="today-text-link">Discover all <ArrowRight size={14}/></Link></div>
        <div className="today-alternative-grid">{alternatives.map((outfit, index) => <article className={`today-alternative-card alternative-${index + 1}`} key={outfit.id}>
          <div className="today-alternative-visual"><span className="today-alt-index">0{index + 2}</span>{renderOutfitImage(outfit, 'today-alt-collage')}<span className="today-alt-style">{STYLE_LABELS[outfit.style]}</span></div>
          <div className="today-alternative-copy"><h3>{outfit.name}</h3><p>{outfit.items.length} pieces · {OCCASION_LABELS[outfit.occasion]}</p><button type="button" onClick={() => { const idx = visibleRecommendations.findIndex((item) => item.id === outfit.id); setFeaturedIndex(idx); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Make this the featured look <ArrowRight size={14}/></button></div>
        </article>)}</div>
      </section>}

      <section className="today-recent-section">
        <div className="today-section-heading"><div><p className="today-kicker">03 / YOUR PERSONAL ARCHIVE</p><h2>Recently added.</h2></div><Link to="/wardrobe" className="today-text-link">Open wardrobe <ArrowRight size={14}/></Link></div>
        {recentGarments.length ? <div className="today-recent-grid">{recentGarments.map((garment, index) => <Link to="/wardrobe" key={garment.id} className="today-recent-item"><div className="today-recent-image"><img src={getGarmentImage(garment)} alt={garment.name} loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = imageFallback(garment.name); }}/><span>0{index + 1}</span></div><strong>{garment.name}</strong><small>{garment.subcategory.replace(/-/g, ' ')}</small></Link>)}</div> : <p className="today-muted">Your latest additions will appear here.</p>}
      </section>

      <section className="today-bottom-strip"><div className="today-bottom-mark"><Shirt size={23}/></div><div><p className="today-kicker">YOUR CLOSET, YOUR RULES</p><h2>{categoryCount} garments. More ways to make them yours.</h2><p>Browse your pieces, discover combinations, and keep the looks that feel like you.</p></div><Link to="/wardrobe" className="today-bottom-link">Explore wardrobe <ArrowRight size={15}/></Link><span className="today-bottom-number">{garments.length.toString().padStart(2, '0')}</span></section>
      {savedOutfits.length > 0 && <section className="today-saved-note"><BookmarkCheck size={17}/><span>You have <strong>{savedOutfits.length} saved {savedOutfits.length === 1 ? 'look' : 'looks'}</strong> ready for another day.</span><Link to="/saved">See saved looks <ArrowRight size={13}/></Link></section>}
    </>}
  </div>;
}
