import type { PreferencesRepository } from './interfaces';
import type { UserPreferences } from '../../types';
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export class HttpPreferencesRepository implements PreferencesRepository {
  async get(): Promise<UserPreferences> {
    return apiClient.get<UserPreferences>(API_ENDPOINTS.PREFERENCES);
  }
  async update(input: Partial<UserPreferences>): Promise<UserPreferences> {
    return apiClient.put<UserPreferences>(API_ENDPOINTS.PREFERENCES, input);
  }
}
