import type { GarmentRepository } from '../interfaces';
import type {
  Garment,
  GarmentCreateInput,
  GarmentUpdateInput,
  GarmentFilters,
} from '../../../types';
import { MOCK_GARMENTS } from './mockData';

const STORAGE_KEY = 'smartwardrobe_garments';

function loadGarments(): Garment[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Garment[];
  } catch {
    // fall through to seed data
  }
  const seed = [...MOCK_GARMENTS];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

function saveGarments(garments: Garment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(garments));
}

function applyFilters(garments: Garment[], filters?: GarmentFilters): Garment[] {
  let result = [...garments];

  if (!filters) return result;

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.tags.some((t) => t.toLowerCase().includes(q)) ||
        g.notes.toLowerCase().includes(q)
    );
  }

  if (filters.category && filters.category !== 'all') {
    result = result.filter((g) => g.category === filters.category);
  }

  if (filters.style && filters.style !== 'all') {
    result = result.filter((g) => g.style === filters.style);
  }

  if (filters.color && filters.color !== 'all') {
    result = result.filter((g) => g.color === filters.color);
  }

  if (filters.season && filters.season !== 'all') {
    result = result.filter(
      (g) => g.season === filters.season || g.season === 'all-season'
    );
  }

  // Sorting
  switch (filters.sort) {
    case 'alphabetical':
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'category':
      result.sort((a, b) => a.category.localeCompare(b.category));
      break;
    case 'recently-added':
    default:
      result.sort(
        (a, b) =>
          new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
      );
      break;
  }

  return result;
}

function generateId(): string {
  return `g-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export class MockGarmentRepository implements GarmentRepository {
  async list(filters?: GarmentFilters): Promise<Garment[]> {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 300));
    return applyFilters(loadGarments(), filters);
  }

  async getById(id: string): Promise<Garment | null> {
    await new Promise((r) => setTimeout(r, 150));
    return loadGarments().find((g) => g.id === id) ?? null;
  }

  async create(input: GarmentCreateInput): Promise<Garment> {
    await new Promise((r) => setTimeout(r, 400));
    const garments = loadGarments();

    let imageUrl = '';
    if (input.imageFile) {
      // In mock mode, create an object URL for the uploaded file
      imageUrl = URL.createObjectURL(input.imageFile);
    }

    const newGarment: Garment = {
      id: generateId(),
      name: input.name,
      category: input.category,
      subcategory: input.subcategory,
      style: input.style,
      color: input.color,
      season: input.season,
      occasions: input.occasions,
      tags: input.tags,
      notes: input.notes,
      imageUrl,
      dateAdded: new Date().toISOString(),
    };

    garments.unshift(newGarment);
    saveGarments(garments);
    return newGarment;
  }

  async update(id: string, input: GarmentUpdateInput): Promise<Garment> {
    await new Promise((r) => setTimeout(r, 300));
    const garments = loadGarments();
    const index = garments.findIndex((g) => g.id === id);
    if (index === -1) throw new Error(`Garment ${id} not found`);

    let imageUrl = garments[index].imageUrl;
    if (input.imageFile) {
      imageUrl = URL.createObjectURL(input.imageFile);
    }

    const updated: Garment = {
      ...garments[index],
      ...(input.name !== undefined && { name: input.name }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.subcategory !== undefined && { subcategory: input.subcategory }),
      ...(input.style !== undefined && { style: input.style }),
      ...(input.color !== undefined && { color: input.color }),
      ...(input.season !== undefined && { season: input.season }),
      ...(input.occasions !== undefined && { occasions: input.occasions }),
      ...(input.tags !== undefined && { tags: input.tags }),
      ...(input.notes !== undefined && { notes: input.notes }),
      imageUrl,
    };

    garments[index] = updated;
    saveGarments(garments);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
    const garments = loadGarments();
    const filtered = garments.filter((g) => g.id !== id);
    if (filtered.length === garments.length) {
      throw new Error(`Garment ${id} not found`);
    }
    saveGarments(filtered);
  }
}
