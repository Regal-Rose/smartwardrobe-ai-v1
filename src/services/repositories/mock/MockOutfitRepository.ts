import type { OutfitRepository } from '../interfaces';
import type {
  Outfit,
  OutfitGenerateInput,
  OutfitItem,
  Garment,
  GarmentCategory,
  UserPreferences,
  StyleType,
} from '../../../types';

const STORAGE_KEY = 'smartwardrobe_outfits';

function loadOutfits(): Outfit[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Outfit[];
  } catch {
    // Ignore unavailable or invalid browser storage.
  }
  return [];
}

function saveOutfits(outfits: Outfit[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(outfits));
}

function generateId(): string {
  return `o-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

type ScoredOutfit = Outfit & {
  recommendationScore: number;
  recommendationReasons: string[];
};

const COLOR_FAMILIES: Record<string, string> = {
  black: 'neutral', white: 'neutral', grey: 'neutral', charcoal: 'neutral', cream: 'neutral', beige: 'neutral', tan: 'neutral', brown: 'earth',
  navy: 'blue', blue: 'blue', 'light-blue': 'blue', teal: 'blue',
  red: 'red', maroon: 'red', coral: 'red', pink: 'pink', blush: 'pink',
  green: 'green', olive: 'green', sage: 'green', yellow: 'yellow', mustard: 'yellow', orange: 'orange',
  purple: 'purple', lavender: 'purple', gold: 'metallic', silver: 'metallic', multi: 'multi',
};

function colorScore(a: Garment, b: Garment): number {
  if (a.color === b.color) return 7;
  const first = COLOR_FAMILIES[a.color] || 'other';
  const second = COLOR_FAMILIES[b.color] || 'other';
  if (first === 'neutral' || second === 'neutral') return 9;
  if (first === second) return 7;
  if (first === 'multi' || second === 'multi') return 4;
  if (first === 'metallic' || second === 'metallic') return 6;
  const complementary: Record<string, string[]> = {
    blue: ['orange', 'yellow', 'earth'], orange: ['blue', 'purple'], red: ['green', 'blue'], green: ['red', 'pink'],
    pink: ['green', 'blue'], yellow: ['purple', 'blue'], purple: ['yellow', 'orange'], earth: ['blue', 'green'],
  };
  return complementary[first]?.includes(second) || complementary[second]?.includes(first) ? 8 : 3;
}

function outfitStyle(items: Garment[]): StyleType {
  // Shoes, bags and outerwear should not turn an otherwise Indian outfit into fusion.
  const core = items.filter((item) => !['footwear', 'accessories', 'outerwear'].includes(item.category));
  const styles = core.map((item) => item.style);
  const hasIndian = styles.includes('indian') || core.some((g) => g.category === 'indian-ethnic');
  const hasWestern = core.some((g) => ['tops', 'bottoms', 'dresses'].includes(g.category) && g.style !== 'indian');
  if (hasIndian && hasWestern) return 'fusion';
  if (styles.includes('fusion') || core.some((g) => g.category === 'fusion')) return 'fusion';
  return hasIndian ? 'indian' : 'western';
}

function roleFor(garment: Garment): OutfitItem['role'] {
  if (garment.category === 'tops') return 'top';
  if (garment.category === 'bottoms') return 'bottom';
  if (garment.category === 'dresses') return 'dress';
  if (garment.category === 'footwear') return 'footwear';
  if (garment.category === 'outerwear') return 'layer';
  if (garment.category === 'indian-ethnic') {
    return ['kurta', 'kurti', 'saree', 'lehenga', 'sherwani'].includes(garment.subcategory)
      ? 'ethnic-base'
      : 'ethnic-complement';
  }
  if (garment.category === 'fusion') return 'top';
  return 'accessory';
}

function buildCandidate(items: Garment[], input: OutfitGenerateInput): Outfit | null {
  const unique = [...new Map(items.map((g) => [g.id, g])).values()];
  if (unique.length === 0) return null;
  const hasDress = unique.some((g) => g.category === 'dresses' || ['saree', 'lehenga', 'sherwani'].includes(g.subcategory));
  const hasTop = unique.some((g) => ['tops', 'fusion'].includes(g.category) || ['kurta', 'kurti'].includes(g.subcategory));
  const hasBottom = unique.some((g) => g.category === 'bottoms' || ['salwar', 'churidar', 'leggings', 'dhoti-pants'].includes(g.subcategory));
  if (!hasDress && !(hasTop && hasBottom)) return null;

  const lead = unique.find((g) => ['tops', 'fusion', 'dresses', 'indian-ethnic'].includes(g.category)) || unique[0];
  const bottom = unique.find((g) => g.category === 'bottoms' || ['salwar', 'churidar', 'leggings', 'dhoti-pants'].includes(g.subcategory));
  const name = hasDress
    ? `${lead.name} Look`
    : `${lead.name}${bottom ? ` with ${bottom.name}` : ''}`;
  const season = input.season || 'all-season';
  return {
    id: generateId(),
    name,
    items: unique.map((g) => ({ garmentId: g.id, role: roleFor(g) })),
    occasion: input.occasion,
    season,
    style: outfitStyle(unique),
    dateCreated: new Date().toISOString(),
    isSaved: false,
  };
}

function scoreCandidate(
  outfit: Outfit,
  garments: Garment[],
  input: OutfitGenerateInput,
  preferences?: UserPreferences,
): ScoredOutfit {
  const items = outfit.items.map((item) => garments.find((g) => g.id === item.garmentId)).filter((g): g is Garment => Boolean(g));
  let score = 30;
  const reasons: string[] = [];

  const occasionMatches = items.filter((g) => g.occasions.includes(input.occasion)).length;
  if (occasionMatches === items.length) { score += 16; reasons.push('Fits your occasion'); }
  else if (occasionMatches > 0) { score += 8; reasons.push('Some pieces suit the occasion'); }
  else score -= 8;

  const season = input.season;
  if (!season || season === 'all-season') {
    const seasonFit = items.every((g) => g.season === 'all-season');
    if (seasonFit) score += 5;
  } else {
    const seasonMatches = items.filter((g) => g.season === season || g.season === 'all-season').length;
    score += Math.round((seasonMatches / Math.max(items.length, 1)) * 10) - 5;
    if (seasonMatches === items.length) reasons.push('Season-friendly');
  }

  const pairs: Array<[Garment, Garment]> = [];
  for (let i = 0; i < items.length; i += 1) for (let j = i + 1; j < items.length; j += 1) pairs.push([items[i], items[j]]);
  if (pairs.length) {
    const harmony = pairs.reduce((sum, [a, b]) => sum + colorScore(a, b), 0) / pairs.length;
    score += Math.round((harmony - 5) * 2);
    if (harmony >= 7) reasons.push('Colours work well together');
  }

  if (preferences) {
    if (preferences.preferredStyles.includes(outfit.style)) { score += 10; reasons.push(`Matches your ${outfit.style} style`); }
    else if (outfit.style === 'fusion' && preferences.preferredStyles.length) score += 4;
    const favoriteCount = items.filter((g) => preferences.favoriteColors.includes(g.color)).length;
    if (favoriteCount) { score += Math.min(9, favoriteCount * 3); reasons.push('Uses your favourite colours'); }
    const categoryCount = items.filter((g) => preferences.preferredCategories.includes(g.category)).length;
    score += Math.min(6, categoryCount * 2);
    if (preferences.commonOccasions.includes(input.occasion)) { score += 7; reasons.push('Matches your usual occasions'); }
    if (season && preferences.seasonalPreferences.includes(season)) score += 4;
  }

  const tags = items.flatMap((g) => g.tags.map((tag) => tag.toLowerCase()));
  if (tags.some((tag) => ['versatile', 'favorite', 'favourite', 'go-to'].includes(tag))) { score += 3; reasons.push('Includes a go-to piece'); }
  if (items.length >= 3) score += 3;
  if (items.length > 5) score -= (items.length - 5) * 2;
  score = Math.max(1, Math.min(99, score));
  if (!reasons.length) reasons.push('Built from pieces in your wardrobe');

  return { ...outfit, recommendationScore: score, recommendationReasons: [...new Set(reasons)].slice(0, 3) };
}

function generateOutfitCombinations(
  garments: Garment[],
  input: OutfitGenerateInput,
  preferences?: UserPreferences,
): ScoredOutfit[] {
  if (garments.length < 1) return [];
  const byCategory = (category: GarmentCategory) => garments.filter((g) => g.category === category);
  const tops = [...byCategory('tops'), ...byCategory('fusion')];
  const dresses = byCategory('dresses');
  const ethnic = byCategory('indian-ethnic');
  const fusion = byCategory('fusion');
  const footwear = byCategory('footwear');
  const accessories = byCategory('accessories');
  const outerwear = byCategory('outerwear');
  const candidates: Outfit[] = [];
  const add = (items: Garment[]) => {
    const candidate = buildCandidate(items, input);
    if (candidate) candidates.push(candidate);
  };
  const accessoryFor = (items: Garment[], pool: Garment[]) => {
    const base = items[0];
    return [...pool].sort((a, b) => colorScore(base, b) - colorScore(base, a));
  };

  // Western and everyday looks: explore combinations rather than always choosing the first item.
  for (const top of tops) for (const bottom of byCategory('bottoms')) {
    const pair = [top, bottom];
    const bestShoes = accessoryFor(pair, footwear)[0];
    const look = [...pair];
    if (bestShoes) look.push(bestShoes);
    const bestAccessory = accessoryFor(pair, accessories)[0];
    if (bestAccessory) look.push(bestAccessory);
    if (input.season === 'winter' || input.season === 'autumn') {
      const layer = accessoryFor(pair, outerwear)[0];
      if (layer) look.push(layer);
    }
    add(look);
  }

  for (const dress of dresses) {
    const shoes = accessoryFor([dress], footwear)[0];
    const accessory = accessoryFor([dress], accessories)[0];
    add([dress, ...(shoes ? [shoes] : []), ...(accessory ? [accessory] : [])]);
  }

  // Indian combinations include kurta/kurti + salwar/churidar/leggings and dupatta.
  const ethnicTops = ethnic.filter((g) => ['kurta', 'kurti'].includes(g.subcategory));
  const ethnicBottoms = ethnic.filter((g) => ['salwar', 'churidar', 'leggings', 'palazzos'].includes(g.subcategory));
  const dupattas = ethnic.filter((g) => g.subcategory === 'dupatta');
  for (const top of ethnicTops) for (const bottom of ethnicBottoms) {
    const pair = [top, bottom];
    const dupatta = accessoryFor(pair, dupattas)[0];
    const shoes = accessoryFor(pair, footwear.filter((g) => g.style === 'indian' || g.subcategory === 'juttis' || g.subcategory === 'kolhapuri'))[0]
      || accessoryFor(pair, footwear)[0];
    const accessory = accessoryFor(pair, accessories.filter((g) => g.style === 'indian'))[0]
      || accessoryFor(pair, accessories)[0];
    add([...pair, ...(dupatta ? [dupatta] : []), ...(shoes ? [shoes] : []), ...(accessory ? [accessory] : [])]);
  }

  // Fusion staple: an Indian kurta/kurti styled with Western jeans or trousers.
  // Ethnic tops are stored in `indian-ethnic`, so the regular tops × bottoms loop
  // will never discover them unless this cross-category pairing is explicit.
  for (const top of ethnicTops) for (const bottom of byCategory('bottoms')) {
    const pair = [top, bottom];
    const shoes = accessoryFor(pair, footwear)[0];
    const accessory = accessoryFor(pair, accessories)[0];
    add([...pair, ...(shoes ? [shoes] : []), ...(accessory ? [accessory] : [])]);
  }
  for (const saree of ethnic.filter((g) => g.subcategory === 'saree' || g.subcategory === 'lehenga' || g.subcategory === 'sherwani')) {
    const accessory = accessoryFor([saree], accessories)[0];
    const shoes = accessoryFor([saree], footwear)[0];
    add([saree, ...(accessory ? [accessory] : []), ...(shoes ? [shoes] : [])]);
  }

  // Fusion looks pair Indo-western pieces with either western or ethnic bottoms.
  for (const item of fusion) {
    const isBottom = ['dhoti-pants'].includes(item.subcategory);
    if (isBottom) {
      for (const top of [...tops.filter((g) => g.category === 'tops'), ...ethnicTops]) add([top, item]);
    } else {
      for (const bottom of [...byCategory('bottoms'), ...ethnicBottoms]) add([item, bottom]);
    }
  }

  // Filter to the requested style only after candidates are formed, allowing true fusion outfits.
  const styleCandidates = input.style
    ? candidates.filter((outfit) => outfit.style === input.style || outfit.style === 'fusion')
    : candidates;
  const scored = styleCandidates.map((outfit) => scoreCandidate(outfit, garments, input, preferences));
  const seen = new Set<string>();
  const unique = scored.filter((outfit) => {
    const signature = outfit.items.map((item) => item.garmentId).sort().join('|');
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
  // Prefer personalised high-scoring looks, but retain variety across styles.
  unique.sort((a, b) => b.recommendationScore - a.recommendationScore);
  const selected: ScoredOutfit[] = [];
  const styleCounts = new Map<StyleType, number>();
  for (const outfit of unique) {
    const count = styleCounts.get(outfit.style) || 0;
    if (count >= 4) continue;
    selected.push(outfit);
    styleCounts.set(outfit.style, count + 1);
    if (selected.length === 8) break;
  }
  return selected;
}

export class MockOutfitRepository implements OutfitRepository {
  async listSaved(): Promise<Outfit[]> {
    await new Promise((r) => setTimeout(r, 150));
    return loadOutfits();
  }

  async generate(
    input: OutfitGenerateInput,
    wardrobe: Garment[],
    preferences?: UserPreferences,
  ): Promise<Outfit[]> {
    await new Promise((r) => setTimeout(r, 350));
    return generateOutfitCombinations(wardrobe, input, preferences);
  }

  async save(outfit: Outfit): Promise<Outfit> {
    await new Promise((r) => setTimeout(r, 150));
    const saved = loadOutfits();
    const toSave = { ...outfit, isSaved: true };
    const existing = saved.findIndex((o) => o.id === outfit.id);
    if (existing >= 0) saved[existing] = toSave;
    else saved.unshift(toSave);
    saveOutfits(saved);
    return toSave;
  }

  async unsave(outfitId: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 150));
    saveOutfits(loadOutfits().filter((o) => o.id !== outfitId));
  }

  async getById(id: string): Promise<Outfit | null> {
    return loadOutfits().find((o) => o.id === id) || null;
  }
}
