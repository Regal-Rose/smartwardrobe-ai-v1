// ─── Enums & Literal Types ───────────────────────────────────────────

export type GarmentCategory =
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'indian-ethnic'
  | 'fusion'
  | 'footwear'
  | 'accessories'
  | 'outerwear';

export type GarmentSubcategory =
  // Tops
  | 'shirt' | 't-shirt' | 'blouse' | 'crop-top' | 'tank-top' | 'polo'
  // Bottoms
  | 'jeans' | 'trousers' | 'shorts' | 'skirt' | 'palazzos'
  // Dresses
  | 'casual-dress' | 'formal-dress' | 'maxi-dress' | 'midi-dress'
  // Indian Ethnic
  | 'kurta' | 'kurti' | 'salwar' | 'churidar' | 'leggings' | 'dupatta' | 'saree' | 'lehenga' | 'sherwani' | 'nehru-jacket'
  // Fusion
  | 'indo-western-top' | 'dhoti-pants' | 'cape' | 'jacket-kurta'
  // Footwear
  | 'sneakers' | 'heels' | 'flats' | 'boots' | 'sandals' | 'juttis' | 'kolhapuri'
  // Accessories
  | 'tote-bag' | 'clutch' | 'backpack' | 'watch' | 'necklace' | 'earrings' | 'bangles' | 'scarf' | 'belt'
  // Outerwear
  | 'denim-jacket' | 'blazer' | 'coat' | 'cardigan' | 'hoodie' | 'windbreaker';

export type StyleType = 'western' | 'indian' | 'fusion';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'all-season';

export type Occasion =
  | 'casual'
  | 'formal'
  | 'party'
  | 'festive'
  | 'work'
  | 'college'
  | 'everyday'
  | 'wedding'
  | 'date-night'
  | 'travel';

export type GarmentColor =
  | 'black' | 'white' | 'navy' | 'blue' | 'light-blue' | 'red' | 'maroon'
  | 'green' | 'olive' | 'sage' | 'pink' | 'blush' | 'yellow' | 'mustard'
  | 'orange' | 'purple' | 'lavender' | 'brown' | 'tan' | 'beige' | 'cream'
  | 'grey' | 'charcoal' | 'teal' | 'coral' | 'gold' | 'silver' | 'multi';

export type SortOption = 'recently-added' | 'alphabetical' | 'category';

export type ViewMode = 'rail' | 'grid';

// ─── Core Models ─────────────────────────────────────────────────────

export interface Garment {
  id: string;
  name: string;
  category: GarmentCategory;
  subcategory: GarmentSubcategory;
  style: StyleType;
  color: GarmentColor;
  season: Season;
  occasions: Occasion[];
  tags: string[];
  notes: string;
  imageUrl: string;
  dateAdded: string; // ISO date
}

export interface GarmentCreateInput {
  name: string;
  category: GarmentCategory;
  subcategory: GarmentSubcategory;
  style: StyleType;
  color: GarmentColor;
  season: Season;
  occasions: Occasion[];
  tags: string[];
  notes: string;
  imageFile?: File | null;
}

export interface GarmentUpdateInput extends Partial<GarmentCreateInput> {
  id: string;
}

export interface GarmentFilters {
  search?: string;
  category?: GarmentCategory | 'all';
  style?: StyleType | 'all';
  color?: GarmentColor | 'all';
  season?: Season | 'all';
  sort?: SortOption;
}

// ─── Outfits ─────────────────────────────────────────────────────────

export interface OutfitItem {
  garmentId: string;
  role: 'top' | 'bottom' | 'dress' | 'layer' | 'footwear' | 'accessory' | 'ethnic-base' | 'ethnic-complement';
}

export interface Outfit {
  id: string;
  name: string;
  items: OutfitItem[];
  occasion: Occasion;
  season: Season;
  style: StyleType;
  dateCreated: string;
  isSaved: boolean;
  /** Ephemeral explainable score for generated recommendations; not required for saved outfits. */
  recommendationScore?: number;
  recommendationReasons?: string[];
}

export interface OutfitGenerateInput {
  occasion: Occasion;
  season?: Season;
  style?: StyleType;
}

// ─── User Preferences ───────────────────────────────────────────────

export interface UserPreferences {
  preferredStyles: StyleType[];
  favoriteColors: GarmentColor[];
  commonOccasions: Occasion[];
  seasonalPreferences: Season[];
  preferredCategories: GarmentCategory[];
  displayName: string;
}

// ─── API / Service ───────────────────────────────────────────────────

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── Category metadata ──────────────────────────────────────────────

export interface CategoryMeta {
  value: GarmentCategory | 'all';
  label: string;
  icon?: string;
  subcategories: { value: GarmentSubcategory; label: string }[];
}

export const CATEGORIES: CategoryMeta[] = [
  {
    value: 'all', label: 'All Items', subcategories: [],
  },
  {
    value: 'tops', label: 'Tops',
    subcategories: [
      { value: 'shirt', label: 'Shirt' },
      { value: 't-shirt', label: 'T-Shirt' },
      { value: 'blouse', label: 'Blouse' },
      { value: 'crop-top', label: 'Crop Top' },
      { value: 'tank-top', label: 'Tank Top' },
      { value: 'polo', label: 'Polo' },
    ],
  },
  {
    value: 'bottoms', label: 'Bottoms',
    subcategories: [
      { value: 'jeans', label: 'Jeans' },
      { value: 'trousers', label: 'Trousers' },
      { value: 'shorts', label: 'Shorts' },
      { value: 'skirt', label: 'Skirt' },
      { value: 'palazzos', label: 'Palazzos' },
    ],
  },
  {
    value: 'dresses', label: 'Dresses',
    subcategories: [
      { value: 'casual-dress', label: 'Casual Dress' },
      { value: 'formal-dress', label: 'Formal Dress' },
      { value: 'maxi-dress', label: 'Maxi Dress' },
      { value: 'midi-dress', label: 'Midi Dress' },
    ],
  },
  {
    value: 'indian-ethnic', label: 'Indian Ethnic',
    subcategories: [
      { value: 'kurta', label: 'Kurta' },
      { value: 'kurti', label: 'Kurti' },
      { value: 'salwar', label: 'Salwar' },
      { value: 'churidar', label: 'Churidar' },
      { value: 'leggings', label: 'Leggings' },
      { value: 'dupatta', label: 'Dupatta' },
      { value: 'saree', label: 'Saree' },
      { value: 'lehenga', label: 'Lehenga' },
      { value: 'sherwani', label: 'Sherwani' },
      { value: 'nehru-jacket', label: 'Nehru Jacket' },
    ],
  },
  {
    value: 'fusion', label: 'Fusion',
    subcategories: [
      { value: 'indo-western-top', label: 'Indo-Western Top' },
      { value: 'dhoti-pants', label: 'Dhoti Pants' },
      { value: 'cape', label: 'Cape' },
      { value: 'jacket-kurta', label: 'Jacket Kurta' },
    ],
  },
  {
    value: 'footwear', label: 'Footwear',
    subcategories: [
      { value: 'sneakers', label: 'Sneakers' },
      { value: 'heels', label: 'Heels' },
      { value: 'flats', label: 'Flats' },
      { value: 'boots', label: 'Boots' },
      { value: 'sandals', label: 'Sandals' },
      { value: 'juttis', label: 'Juttis' },
      { value: 'kolhapuri', label: 'Kolhapuri' },
    ],
  },
  {
    value: 'accessories', label: 'Accessories',
    subcategories: [
      { value: 'tote-bag', label: 'Tote Bag' },
      { value: 'clutch', label: 'Clutch' },
      { value: 'backpack', label: 'Backpack' },
      { value: 'watch', label: 'Watch' },
      { value: 'necklace', label: 'Necklace' },
      { value: 'earrings', label: 'Earrings' },
      { value: 'bangles', label: 'Bangles' },
      { value: 'scarf', label: 'Scarf' },
      { value: 'belt', label: 'Belt' },
    ],
  },
  {
    value: 'outerwear', label: 'Outerwear',
    subcategories: [
      { value: 'denim-jacket', label: 'Denim Jacket' },
      { value: 'blazer', label: 'Blazer' },
      { value: 'coat', label: 'Coat' },
      { value: 'cardigan', label: 'Cardigan' },
      { value: 'hoodie', label: 'Hoodie' },
      { value: 'windbreaker', label: 'Windbreaker' },
    ],
  },
];

// ─── Display helpers ─────────────────────────────────────────────────

export const STYLE_LABELS: Record<StyleType, string> = {
  western: 'Western',
  indian: 'Indian',
  fusion: 'Fusion',
};

export const SEASON_LABELS: Record<Season, string> = {
  spring: 'Spring',
  summer: 'Summer',
  autumn: 'Autumn',
  winter: 'Winter',
  'all-season': 'All Season',
};

export const OCCASION_LABELS: Record<Occasion, string> = {
  casual: 'Casual',
  formal: 'Formal',
  party: 'Party',
  festive: 'Festive',
  work: 'Work',
  college: 'College',
  everyday: 'Everyday',
  wedding: 'Wedding',
  'date-night': 'Date Night',
  travel: 'Travel',
};

export const COLOR_LABELS: Record<GarmentColor, string> = {
  black: 'Black',
  white: 'White',
  navy: 'Navy',
  blue: 'Blue',
  'light-blue': 'Light Blue',
  red: 'Red',
  maroon: 'Maroon',
  green: 'Green',
  olive: 'Olive',
  sage: 'Sage',
  pink: 'Pink',
  blush: 'Blush',
  yellow: 'Yellow',
  mustard: 'Mustard',
  orange: 'Orange',
  purple: 'Purple',
  lavender: 'Lavender',
  brown: 'Brown',
  tan: 'Tan',
  beige: 'Beige',
  cream: 'Cream',
  grey: 'Grey',
  charcoal: 'Charcoal',
  teal: 'Teal',
  coral: 'Coral',
  gold: 'Gold',
  silver: 'Silver',
  multi: 'Multi',
};

export const COLOR_HEX: Record<GarmentColor, string> = {
  black: '#1a1a1a',
  white: '#fafafa',
  navy: '#1e3a5f',
  blue: '#3b82f6',
  'light-blue': '#93c5fd',
  red: '#dc2626',
  maroon: '#7f1d1d',
  green: '#16a34a',
  olive: '#6b7c3f',
  sage: '#9caf88',
  pink: '#ec4899',
  blush: '#f9a8d4',
  yellow: '#eab308',
  mustard: '#ca8a04',
  orange: '#f97316',
  purple: '#9333ea',
  lavender: '#c4b5fd',
  brown: '#78350f',
  tan: '#d2b48c',
  beige: '#f5f0e8',
  cream: '#fffdd0',
  grey: '#9ca3af',
  charcoal: '#374151',
  teal: '#0d9488',
  coral: '#fb7185',
  gold: '#d4a017',
  silver: '#c0c0c0',
  multi: 'linear-gradient(135deg, #f472b6, #818cf8, #34d399)',
};
