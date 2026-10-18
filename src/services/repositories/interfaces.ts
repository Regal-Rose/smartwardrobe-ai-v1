import type {
  Garment,
  GarmentCreateInput,
  GarmentUpdateInput,
  GarmentFilters,
  Outfit,
  OutfitGenerateInput,
  UserPreferences,
} from '../../types';

/**
 * Repository contract for garment operations.
 * Mock and HTTP implementations must satisfy this interface.
 */
export interface GarmentRepository {
  list(filters?: GarmentFilters): Promise<Garment[]>;
  getById(id: string): Promise<Garment | null>;
  create(input: GarmentCreateInput): Promise<Garment>;
  update(id: string, input: GarmentUpdateInput): Promise<Garment>;
  delete(id: string): Promise<void>;
}

/**
 * Repository contract for outfit operations.
 */
export interface OutfitRepository {
  listSaved(): Promise<Outfit[]>;
  generate(input: OutfitGenerateInput, wardrobe: Garment[], preferences?: UserPreferences): Promise<Outfit[]>;
  save(outfit: Outfit): Promise<Outfit>;
  unsave(outfitId: string): Promise<void>;
  getById(id: string): Promise<Outfit | null>;
}

/**
 * Repository contract for user preferences.
 */
export interface PreferencesRepository {
  get(): Promise<UserPreferences>;
  update(input: Partial<UserPreferences>): Promise<UserPreferences>;
}
