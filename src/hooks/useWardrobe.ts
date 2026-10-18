import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../app/ServiceProvider';
import type { Garment, GarmentFilters, GarmentCreateInput, GarmentUpdateInput, ViewMode } from '../types';

export function useWardrobe() {
  const { garmentRepo } = useServices();
  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GarmentFilters>({
    sort: 'recently-added',
    category: 'all',
    style: 'all',
    color: 'all',
    season: 'all',
  });
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(null);

  const fetchGarments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await garmentRepo.list(filters);
      setGarments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load garments');
    } finally {
      setLoading(false);
    }
  }, [garmentRepo, filters]);

  useEffect(() => {
    fetchGarments();
  }, [fetchGarments]);

  const addGarment = useCallback(
    async (input: GarmentCreateInput) => {
      const created = await garmentRepo.create(input);
      await fetchGarments();
      return created;
    },
    [garmentRepo, fetchGarments]
  );

  const updateGarment = useCallback(
    async (id: string, input: GarmentUpdateInput) => {
      const updated = await garmentRepo.update(id, input);
      await fetchGarments();
      setSelectedGarment(updated);
      return updated;
    },
    [garmentRepo, fetchGarments]
  );

  const deleteGarment = useCallback(
    async (id: string) => {
      await garmentRepo.delete(id);
      setSelectedGarment(null);
      await fetchGarments();
    },
    [garmentRepo, fetchGarments]
  );

  const updateFilters = useCallback((patch: Partial<GarmentFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      sort: 'recently-added',
      category: 'all',
      style: 'all',
      color: 'all',
      season: 'all',
      search: '',
    });
  }, []);

  const hasActiveFilters =
    (filters.category && filters.category !== 'all') ||
    (filters.style && filters.style !== 'all') ||
    (filters.color && filters.color !== 'all') ||
    (filters.season && filters.season !== 'all') ||
    (filters.search && filters.search.length > 0);

  return {
    garments,
    loading,
    error,
    filters,
    viewMode,
    setViewMode,
    selectedGarment,
    setSelectedGarment,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    addGarment,
    updateGarment,
    deleteGarment,
    refresh: fetchGarments,
    totalCount: garments.length,
  };
}
