import { createContext, useContext, type ReactNode } from 'react';
import type { GarmentRepository, OutfitRepository, PreferencesRepository } from '../services/repositories/interfaces';
import { MockGarmentRepository, MockOutfitRepository, MockPreferencesRepository } from '../services/repositories/mock';
import { HttpGarmentRepository } from '../services/repositories/HttpGarmentRepository';
import { HttpOutfitRepository } from '../services/repositories/HttpOutfitRepository';
import { HttpPreferencesRepository } from '../services/repositories/HttpPreferencesRepository';

export interface ServiceContainer {
  garmentRepo: GarmentRepository;
  outfitRepo: OutfitRepository;
  preferencesRepo: PreferencesRepository;
  dataMode: 'mock' | 'http';
}

// Use the authenticated backend by default. Set VITE_DATA_MODE=mock explicitly for local demo data.
const dataMode = ((import.meta.env.VITE_DATA_MODE as string) || 'http') === 'mock' ? 'mock' : 'http';
const services: ServiceContainer = dataMode === 'http'
  ? { garmentRepo: new HttpGarmentRepository(), outfitRepo: new HttpOutfitRepository(), preferencesRepo: new HttpPreferencesRepository(), dataMode: 'http' }
  : { garmentRepo: new MockGarmentRepository(), outfitRepo: new MockOutfitRepository(), preferencesRepo: new MockPreferencesRepository(), dataMode: 'mock' };
const ServiceContext = createContext<ServiceContainer>(services);

export function ServiceProvider({ children }: { children: ReactNode }) {
  return <ServiceContext.Provider value={services}>{children}</ServiceContext.Provider>;
}
export function useServices(): ServiceContainer { return useContext(ServiceContext); }
