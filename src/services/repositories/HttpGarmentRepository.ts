import type { Garment, GarmentCreateInput, GarmentFilters, GarmentUpdateInput } from '../../types';
import type { GarmentRepository } from './interfaces';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

async function fileToDataUrl(file?: File | null): Promise<string> {
  if (!file) return '';
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.readAsDataURL(file);
  });
}

function fromApi(value: Garment & { imageData?: string }): Garment {
  return { ...value, imageUrl: value.imageData || value.imageUrl || '' };
}

function toPayload(input: GarmentCreateInput | GarmentUpdateInput, imageData = '') {
  const { imageFile: _imageFile, id: _id, ...fields } = input as GarmentUpdateInput;
  return { ...fields, imageData };
}

export class HttpGarmentRepository implements GarmentRepository {
  async list(filters?: GarmentFilters): Promise<Garment[]> {
    const params: Record<string, string> = {};
    if (filters) {
      for (const key of ['search', 'category', 'style', 'color', 'season', 'sort'] as const) {
        const value = filters[key];
        if (value && value !== 'all') params[key] = value;
      }
    }
    const items = await apiClient.get<Array<Garment & { imageData?: string }>>(API_ENDPOINTS.GARMENTS, params);
    return items.map(fromApi);
  }

  async getById(id: string): Promise<Garment | null> {
    try { return fromApi(await apiClient.get<Garment & { imageData?: string }>(API_ENDPOINTS.GARMENT(id))); }
    catch (error) { if (error instanceof Error && error.message.includes('404')) return null; throw error; }
  }

  async create(input: GarmentCreateInput): Promise<Garment> {
    const imageData = await fileToDataUrl(input.imageFile);
    return fromApi(await apiClient.post<Garment & { imageData?: string }>(API_ENDPOINTS.GARMENTS, toPayload(input, imageData)));
  }

  async update(id: string, input: GarmentUpdateInput): Promise<Garment> {
    const imageData = input.imageFile ? await fileToDataUrl(input.imageFile) : undefined;
    const payload = toPayload(input, imageData ?? '');
    if (!input.imageFile) delete (payload as Record<string, unknown>).imageData;
    return fromApi(await apiClient.patch<Garment & { imageData?: string }>(API_ENDPOINTS.GARMENT(id), payload));
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.GARMENT(id));
  }
}
