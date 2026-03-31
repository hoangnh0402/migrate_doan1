// Copyright (c) 2025 HQC System Contributors
// Licensed under the GNU General Public License v3.0 (GPL-3.0)

import { API_BASE_URL } from '../config/env';

// Sá»­ dá»¥ng API_BASE_URL tá»« env.ts
const BASE_URL = API_BASE_URL;
console.log('[TrafficService] BASE_URL:', BASE_URL);

export type TrafficFlowResponse = {
  current_speed: number;
  free_flow_speed: number;
  current_travel_time: number;
  free_flow_travel_time: number;
  confidence: number;
  status: 'thÃ´ng_thoÃ¡ng' | 'trung_bÃ¬nh' | 'cháº­m' | 'táº¯c_ngháº½n' | 'khÃ´ng_xÃ¡c_Ä‘á»‹nh';
  status_vi: string;
  speed_ratio: number | null;
  coordinates: Array<{ latitude: number; longitude: number }>;
};

async function get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  if (!BASE_URL) {
    throw new Error('API_BASE_URL chÆ°a Ä‘Æ°á»£c cáº¥u hÃ¬nh');
  }

  // Äáº£m báº£o path cÃ³ leading slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(BASE_URL + normalizedPath);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchTrafficFlow(lat: number, lon: number): Promise<TrafficFlowResponse> {
  return get<TrafficFlowResponse>('/traffic/flow', { lat, lon });
}

export async function fetchTrafficFlowByLocation(locationId: string): Promise<TrafficFlowResponse> {
  return get<TrafficFlowResponse>(`/traffic/flow/by-location/${locationId}`);
}


