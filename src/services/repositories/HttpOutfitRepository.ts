import type { Outfit, OutfitGenerateInput, Garment, UserPreferences } from '../../types';
import type { OutfitRepository } from './interfaces';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { MockOutfitRepository } from './mock/MockOutfitRepository';

// Generation remains transparent category/occasion rules; persistence is account-scoped on the API.
const rulesGenerator = new MockOutfitRepository();
export class HttpOutfitRepository implements OutfitRepository {
  async listSaved(): Promise<Outfit[]> {
    return apiClient.get<Outfit[]>(API_ENDPOINTS.OUTFITS);
  }
  async generate(input: OutfitGenerateInput, wardrobe: Garment[], preferences?: UserPreferences): Promise<Outfit[]> {
    return rulesGenerator.generate(input, wardrobe, preferences);
  }
  async save(outfit: Outfit): Promise<Outfit> {
    return apiClient.post<Outfit>(API_ENDPOINTS.OUTFITS, { ...outfit, isSaved: true });
  }
  async unsave(outfitId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.OUTFIT(outfitId));
  }
  async getById(id: string): Promise<Outfit | null> {
    try { return await apiClient.get<Outfit>(API_ENDPOINTS.OUTFIT(id)); }
    catch (error) { if (error instanceof Error && error.message.includes('404')) return null; throw error; }
  }
}
