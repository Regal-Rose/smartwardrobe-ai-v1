import { useState, useEffect, type FormEvent } from 'react';
import { Save, Check } from 'lucide-react';
import { useServices } from '../app/ServiceProvider';
import { Button } from '../components/ui/Button';
import type { UserPreferences, StyleType, GarmentColor, Occasion, Season, GarmentCategory } from '../types';
import { STYLE_LABELS, COLOR_LABELS, OCCASION_LABELS, SEASON_LABELS, CATEGORIES, COLOR_HEX } from '../types';

export function PreferencesPage() {
  const { preferencesRepo } = useServices();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    preferencesRepo.get().then((p) => {
      setPrefs(p);
      setLoading(false);
    });
  }, [preferencesRepo]);

  const toggle = <T extends string>(list: T[], item: T): T[] =>
    list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prefs) return;
    setSaving(true);
    setSaved(false);
    try {
      const updated = await preferencesRepo.update(prefs);
      setPrefs(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !prefs) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-10 w-56 rounded-lg" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="heading-editorial-lg text-ink">Style Preferences</h1>
        <p className="text-body mt-1">
          Tell us what you love. These preferences help personalise outfit suggestions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Preferred Styles */}
        <section className="bg-surface rounded-xl border border-border-light p-5 space-y-3">
          <h2 className="text-sm font-semibold text-ink">Preferred Styles</h2>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(STYLE_LABELS) as [StyleType, string][]).map(
              ([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setPrefs({
                      ...prefs,
                      preferredStyles: toggle(prefs.preferredStyles, key),
                    })
                  }
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200
                    ${
                      prefs.preferredStyles.includes(key)
                        ? 'bg-sage text-white border-sage'
                        : 'bg-surface text-ink-light border-border hover:border-sage hover:text-sage-deep'
                    }
                  `}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </section>

        {/* Favourite Colours */}
        <section className="bg-surface rounded-xl border border-border-light p-5 space-y-3">
          <h2 className="text-sm font-semibold text-ink">Favourite Colours</h2>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(COLOR_LABELS) as [GarmentColor, string][]).map(
              ([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setPrefs({
                      ...prefs,
                      favoriteColors: toggle(prefs.favoriteColors, key),
                    })
                  }
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200
                    ${
                      prefs.favoriteColors.includes(key)
                        ? 'bg-sage-pale text-sage-deep border-sage'
                        : 'bg-surface text-ink-light border-border hover:border-border-strong'
                    }
                  `}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-border-strong/50 inline-block shrink-0"
                    style={{ background: COLOR_HEX[key] || '#ccc' }}
                  />
                  {label}
                </button>
              )
            )}
          </div>
        </section>

        {/* Common Occasions */}
        <section className="bg-surface rounded-xl border border-border-light p-5 space-y-3">
          <h2 className="text-sm font-semibold text-ink">Common Occasions</h2>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(OCCASION_LABELS) as [Occasion, string][]).map(
              ([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setPrefs({
                      ...prefs,
                      commonOccasions: toggle(prefs.commonOccasions, key),
                    })
                  }
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200
                    ${
                      prefs.commonOccasions.includes(key)
                        ? 'bg-sage text-white border-sage'
                        : 'bg-surface text-ink-light border-border hover:border-sage hover:text-sage-deep'
                    }
                  `}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </section>

        {/* Seasonal Preferences */}
        <section className="bg-surface rounded-xl border border-border-light p-5 space-y-3">
          <h2 className="text-sm font-semibold text-ink">Seasonal Preferences</h2>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(SEASON_LABELS) as [Season, string][]).map(
              ([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setPrefs({
                      ...prefs,
                      seasonalPreferences: toggle(prefs.seasonalPreferences, key),
                    })
                  }
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200
                    ${
                      prefs.seasonalPreferences.includes(key)
                        ? 'bg-sage text-white border-sage'
                        : 'bg-surface text-ink-light border-border hover:border-sage hover:text-sage-deep'
                    }
                  `}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </section>

        {/* Preferred Categories */}
        <section className="bg-surface rounded-xl border border-border-light p-5 space-y-3">
          <h2 className="text-sm font-semibold text-ink">Preferred Categories</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => c.value !== 'all').map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() =>
                  setPrefs({
                    ...prefs,
                    preferredCategories: toggle(
                      prefs.preferredCategories,
                      cat.value as GarmentCategory
                    ),
                  })
                }
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200
                  ${
                    prefs.preferredCategories.includes(cat.value as GarmentCategory)
                      ? 'bg-sage text-white border-sage'
                      : 'bg-surface text-ink-light border-border hover:border-sage hover:text-sage-deep'
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Save */}
        <div className="flex items-center gap-3">
          <Button type="submit" loading={saving} size="lg">
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? 'Saved!' : 'Save Preferences'}
          </Button>
          {saved && (
            <span className="text-sm text-success font-medium animate-[fadeIn_0.3s_ease-out]">
              Your preferences have been updated.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
