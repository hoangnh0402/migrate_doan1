// Copyright (c) 2025 HQC System Contributors
// Licensed under the GNU General Public License v3.0 (GPL-3.0)

import Constants from 'expo-constants';

// =============================================================================
// CORE API URL HELPERS
// =============================================================================

/**
 * Parse vÃ  lÃ m sáº¡ch giÃ¡ trá»‹ URL - loáº¡i bá» key náº¿u cÃ³ trong giÃ¡ trá»‹
 */
const getRawApiBaseUrl = (): string => {
  const fromExpoConfig = (Constants.expoConfig?.extra as any)?.apiBaseUrl;
  const fromProcessEnv = typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_API_BASE_URL : undefined;
  
  const result = fromExpoConfig || fromProcessEnv || 'http://localhost:8000/api/v1';
  
  // Debug log - sáº½ hiá»ƒn thá»‹ trong browser console
  console.log('[ENV] API URL sources:', {
    fromExpoConfig: fromExpoConfig || 'undefined',
    fromProcessEnv: fromProcessEnv || 'undefined',
    finalResult: result
  });
  
  return result;
};

/**
 * Normalize API base URL - Ä‘áº£m báº£o luÃ´n káº¿t thÃºc báº±ng /api/v1
 */
const normalizeApiBase = (base: string): string => {
  const trimmed = base.replace(/\/+$/, '');
  if (/\/api\/v1$/i.test(trimmed)) return trimmed;
  return `${trimmed}/api/v1`;
};

/**
 * API Base URL - ÄÃ£ normalize
 * ÄÃ¢y lÃ  nguá»“n duy nháº¥t cho táº¥t cáº£ cÃ¡c API endpoints
 * 
 * VÃ­ dá»¥: http://your-tunnel.trycloudflare.com/api/v1
 */
const rawUrl = getRawApiBaseUrl();
const normalizedUrl = normalizeApiBase(rawUrl);

console.log('[ENV] URL processing:', {
  raw: rawUrl,
  normalized: normalizedUrl,
});

export const API_BASE_URL = normalizedUrl;

// =============================================================================
// DERIVED API ENDPOINTS
// =============================================================================

/**
 * Helper Ä‘á»ƒ láº¥y API base URL hiá»‡n táº¡i (cÃ³ thá»ƒ thay Ä‘á»•i runtime)
 */
const getCurrentApiBaseUrl = (): string => {
  return API_BASE_URL;
};

/**
 * Weather API Base URL (khÃ´ng cÃ³ /api/v1)
 * DÃ¹ng cho: weather, forecast realtime endpoints
 * VÃ­ dá»¥: https://your-tunnel.trycloudflare.com
 */
export const WEATHER_API_BASE_URL = getCurrentApiBaseUrl().replace(/\/api\/v1$/, '');

/**
 * Reports API Base URL  
 * DÃ¹ng cho: /app/reports, /app/comments endpoints
 * VÃ­ dá»¥: https://your-tunnel.trycloudflare.com/api/v1/app
 */
export const REPORTS_API_BASE_URL = `${getCurrentApiBaseUrl()}/app`;

/**
 * Auth API Base URL
 * DÃ¹ng cho: /auth/login, /auth/register endpoints
 * VÃ­ dá»¥: https://your-tunnel.trycloudflare.com/api/v1/app
 */
export const AUTH_API_BASE_URL = REPORTS_API_BASE_URL;

/**
 * AI Chat API Base URL
 * DÃ¹ng cho: /ai/chat, /ai/history endpoints
 * VÃ­ dá»¥: https://your-tunnel.trycloudflare.com/api/v1/ai
 */
export const AI_API_BASE_URL = `${getCurrentApiBaseUrl()}/ai`;

/**
 * Alerts API Base URL
 * DÃ¹ng cho: /app/alerts endpoints
 * VÃ­ dá»¥: https://your-tunnel.trycloudflare.com/api/v1/app
 */
export const ALERTS_API_BASE_URL = REPORTS_API_BASE_URL;

// Log all derived URLs Ä‘á»ƒ debug
console.log('[ENV] All API URLs:', {
  API_BASE_URL,
  WEATHER_API_BASE_URL,
  REPORTS_API_BASE_URL,
  ALERTS_API_BASE_URL,
  AI_API_BASE_URL
});

/**
 * Geographic API Base URL
 * DÃ¹ng cho: /geographic/buildings, /geographic/pois endpoints
 * VÃ­ dá»¥: https://your-tunnel.trycloudflare.com/api/v1
 */
export const GEO_API_BASE_URL = getCurrentApiBaseUrl();

// =============================================================================
// OTHER CONFIGS
// =============================================================================

/**
 * TomTom API Key
 */
export const TOMTOM_API_KEY =
  Constants.expoConfig?.extra?.tomtomApiKey ||
  (typeof process !== 'undefined' && process.env?.TOMTOM_API_KEY) ||
  '';

/**
 * MongoDB Atlas Connection String
 */
export const MONGODB_URI =
  (Constants.expoConfig?.extra as any)?.mongodbUri ||
  (typeof process !== 'undefined' && process.env?.MONGODB_URI) ||
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_MONGODB_URI) ||
  '';

/**
 * MongoDB Database Name
 */
export const MONGODB_DB_NAME =
  (Constants.expoConfig?.extra as any)?.mongodbDbName ||
  (typeof process !== 'undefined' && process.env?.MONGODB_DB_NAME) ||
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_MONGODB_DB_NAME) ||
  'HQC System';

/**
 * Kiá»ƒm tra xem TomTom API key Ä‘Ã£ Ä‘Æ°á»£c cáº¥u hÃ¬nh chÆ°a
 */
export const isTomTomApiKeyConfigured = (): boolean => {
  return (
    TOMTOM_API_KEY !== '' &&
    TOMTOM_API_KEY !== 'YOUR_TOMTOM_API_KEY_HERE' &&
    TOMTOM_API_KEY.length >= 32
  );
};

// =============================================================================
// DEBUG HELPERS
// =============================================================================

/**
 * Log táº¥t cáº£ API URLs (chá»‰ dÃ¹ng cho debug)
 */
export const logApiUrls = (): void => {
  if (typeof console !== 'undefined') {
    console.log('[ENV] API URLs:', {
      API_BASE_URL,
      WEATHER_API_BASE_URL,
      REPORTS_API_BASE_URL,
      AUTH_API_BASE_URL,
      AI_API_BASE_URL,
      ALERTS_API_BASE_URL,
      GEO_API_BASE_URL,
    });
  }
};


