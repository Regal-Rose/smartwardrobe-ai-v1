import type { PreferencesRepository } from '../interfaces';
import type { UserPreferences } from '../../../types';

const STORAGE_KEY = 'smartwardrobe_preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  preferredStyles: ['western', 'indian'],
  favoriteColors: ['black', 'white', 'navy', 'beige'],
  commonOccasions: ['casual', 'work', 'everyday'],
  seasonalPreferences: ['all-season'],
  preferredCategories: ['tops', 'bottoms', 'indian-ethnic'],
  displayName: 'Demo User',
};

function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as UserPreferences;
  } catch {
    // ignore
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PREFERENCES));
  return { ...DEFAULT_PREFERENCES };
}

function savePreferences(prefs: UserPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export class MockPreferencesRepository implements PreferencesRepository {
  async get(): Promise<UserPreferences> {
    await new Promise((r) => setTimeout(r, 200));
    return loadPreferences();
  }

  async update(input: Partial<UserPreferences>): Promise<UserPreferences> {
    await new Promise((r) => setTimeout(r, 300));
    const current = loadPreferences();
    const updated: UserPreferences = { ...current, ...input };
    savePreferences(updated);
    return updated;
  }
}
