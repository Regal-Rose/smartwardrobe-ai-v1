/**
 * Planned API endpoint constants for future FastAPI backend integration.
 *
 * These map to the backend's REST API contracts.
 * Used by HTTP repository implementations (not yet active).
 */

export const API_ENDPOINTS = {
  // Auth (future)
  AUTH_REGISTER: '/api/v1/auth/register',
  AUTH_LOGIN: '/api/v1/auth/login',
  AUTH_LOGOUT: '/api/v1/auth/logout',
  AUTH_ME: '/api/v1/auth/me',

  // Categories
  CATEGORIES: '/api/v1/categories',

  // Garments
  GARMENTS: '/api/v1/garments',
  GARMENT: (id: string) => `/api/v1/garments/${id}`,
  GARMENT_IMAGE: (id: string) => `/api/v1/garments/${id}/image`,

  // Outfits
  OUTFITS_GENERATE: '/api/v1/outfits/generate',
  OUTFITS: '/api/v1/outfits',
  OUTFIT: (id: string) => `/api/v1/outfits/${id}`,

  // Preferences
  PREFERENCES: '/api/v1/preferences',

  // Analytics
  WARDROBE_ANALYTICS: '/api/v1/analytics/wardrobe',

  // Health
  HEALTH: '/api/v1/health',
} as const;
