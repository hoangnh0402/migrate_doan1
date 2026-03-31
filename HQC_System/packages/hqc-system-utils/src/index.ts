// Copyright (c) 2025 HQC System Contributors
// Licensed under the GNU General Public License v3.0 (GPL-3.0)
/**
 * HQC System Utils - Tiá»‡n Ã­ch xá»­ lÃ½ dá»¯ liá»‡u Ä‘Ã´ thá»‹ thÃ´ng minh
 * 
 * ThÆ° viá»‡n nÃ y cung cáº¥p cÃ¡c hÃ m tiá»‡n Ã­ch cho viá»‡c xá»­ lÃ½ dá»¯ liá»‡u trong
 * ná»n táº£ng HQC System Smart City.
 * 
 * Copyright (C) 2025 HQC System Team
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

// ============================================================
// Tiá»‡n Ã­ch xá»­ lÃ½ tá»a Ä‘á»™ Ä‘á»‹a lÃ½
// ============================================================

/**
 * TÃ­nh khoáº£ng cÃ¡ch giá»¯a hai Ä‘iá»ƒm tá»a Ä‘á»™ (Haversine formula)
 * @param lat1 VÄ© Ä‘á»™ Ä‘iá»ƒm 1
 * @param lon1 Kinh Ä‘á»™ Ä‘iá»ƒm 1
 * @param lat2 VÄ© Ä‘á»™ Ä‘iá»ƒm 2
 * @param lon2 Kinh Ä‘á»™ Ä‘iá»ƒm 2
 * @returns Khoáº£ng cÃ¡ch tÃ­nh báº±ng km
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // BÃ¡n kÃ­nh TrÃ¡i Äáº¥t (km)
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Chuyá»ƒn Ä‘á»•i Ä‘á»™ sang radian
 */
export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Chuyá»ƒn Ä‘á»•i radian sang Ä‘á»™
 */
export function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Kiá»ƒm tra tá»a Ä‘á»™ cÃ³ há»£p lá»‡ khÃ´ng
 */
export function isValidCoordinate(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

// ============================================================
// Tiá»‡n Ã­ch xá»­ lÃ½ NGSI-LD Entity ID
// ============================================================

/**
 * Táº¡o NGSI-LD Entity ID theo chuáº©n
 * @param entityType Loáº¡i entity (VD: CivicIssue, AirQualityObserved)
 * @param id ID duy nháº¥t
 * @returns URN theo chuáº©n NGSI-LD
 */
export function createNgsiLdId(entityType: string, id: string | number): string {
  return `urn:ngsi-ld:${entityType}:${id}`;
}

/**
 * PhÃ¢n tÃ­ch NGSI-LD Entity ID
 * @param urn URN Ä‘áº§y Ä‘á»§
 * @returns Object chá»©a entityType vÃ  id
 */
export function parseNgsiLdId(urn: string): { entityType: string; id: string } | null {
  const pattern = /^urn:ngsi-ld:([^:]+):(.+)$/;
  const match = urn.match(pattern);
  if (match) {
    return {
      entityType: match[1],
      id: match[2],
    };
  }
  return null;
}

/**
 * Kiá»ƒm tra URN cÃ³ Ä‘Ãºng chuáº©n NGSI-LD khÃ´ng
 */
export function isValidNgsiLdUrn(urn: string): boolean {
  return /^urn:ngsi-ld:[^:]+:.+$/.test(urn);
}

// ============================================================
// Tiá»‡n Ã­ch xá»­ lÃ½ chá»‰ sá»‘ cháº¥t lÆ°á»£ng khÃ´ng khÃ­ (AQI)
// ============================================================

export enum AqiLevel {
  GOOD = 'good',
  MODERATE = 'moderate',
  UNHEALTHY_SENSITIVE = 'unhealthy_sensitive',
  UNHEALTHY = 'unhealthy',
  VERY_UNHEALTHY = 'very_unhealthy',
  HAZARDOUS = 'hazardous',
}

export interface AqiInfo {
  level: AqiLevel;
  label: string;
  labelVi: string;
  color: string;
  advice: string;
}

/**
 * Láº¥y thÃ´ng tin má»©c Ä‘á»™ AQI
 * @param aqi Chá»‰ sá»‘ AQI (0-500)
 * @returns ThÃ´ng tin chi tiáº¿t vá» má»©c Ä‘á»™ AQI
 */
export function getAqiInfo(aqi: number): AqiInfo {
  if (aqi <= 50) {
    return {
      level: AqiLevel.GOOD,
      label: 'Good',
      labelVi: 'Tá»‘t',
      color: '#00e400',
      advice: 'Cháº¥t lÆ°á»£ng khÃ´ng khÃ­ tá»‘t, phÃ¹ há»£p cho má»i hoáº¡t Ä‘á»™ng ngoÃ i trá»i.',
    };
  } else if (aqi <= 100) {
    return {
      level: AqiLevel.MODERATE,
      label: 'Moderate',
      labelVi: 'Trung bÃ¬nh',
      color: '#ffff00',
      advice: 'Cháº¥t lÆ°á»£ng khÃ´ng khÃ­ cháº¥p nháº­n Ä‘Æ°á»£c. NgÆ°á»i nháº¡y cáº£m nÃªn háº¡n cháº¿ hoáº¡t Ä‘á»™ng ngoÃ i trá»i.',
    };
  } else if (aqi <= 150) {
    return {
      level: AqiLevel.UNHEALTHY_SENSITIVE,
      label: 'Unhealthy for Sensitive Groups',
      labelVi: 'KhÃ´ng lÃ nh máº¡nh cho nhÃ³m nháº¡y cáº£m',
      color: '#ff7e00',
      advice: 'Tráº» em, ngÆ°á»i giÃ  vÃ  ngÆ°á»i cÃ³ bá»‡nh hÃ´ háº¥p nÃªn háº¡n cháº¿ hoáº¡t Ä‘á»™ng ngoÃ i trá»i.',
    };
  } else if (aqi <= 200) {
    return {
      level: AqiLevel.UNHEALTHY,
      label: 'Unhealthy',
      labelVi: 'KhÃ´ng lÃ nh máº¡nh',
      color: '#ff0000',
      advice: 'Má»i ngÆ°á»i cÃ³ thá»ƒ báº¯t Ä‘áº§u gáº·p váº¥n Ä‘á» sá»©c khá»e. Háº¡n cháº¿ hoáº¡t Ä‘á»™ng ngoÃ i trá»i.',
    };
  } else if (aqi <= 300) {
    return {
      level: AqiLevel.VERY_UNHEALTHY,
      label: 'Very Unhealthy',
      labelVi: 'Ráº¥t khÃ´ng lÃ nh máº¡nh',
      color: '#8f3f97',
      advice: 'Cáº£nh bÃ¡o sá»©c khá»e nghiÃªm trá»ng. TrÃ¡nh hoáº¡t Ä‘á»™ng ngoÃ i trá»i.',
    };
  } else {
    return {
      level: AqiLevel.HAZARDOUS,
      label: 'Hazardous',
      labelVi: 'Nguy hiá»ƒm',
      color: '#7e0023',
      advice: 'TÃ¬nh tráº¡ng kháº©n cáº¥p. ToÃ n bá»™ dÃ¢n sá»‘ bá»‹ áº£nh hÆ°á»Ÿng. á»ž trong nhÃ .',
    };
  }
}

// ============================================================
// Tiá»‡n Ã­ch format dá»¯ liá»‡u
// ============================================================

/**
 * Format sá»‘ vá»›i Ä‘Æ¡n vá»‹ Viá»‡t Nam
 * @param num Sá»‘ cáº§n format
 * @returns Chuá»—i Ä‘Ã£ format (VD: 1.234.567)
 */
export function formatNumberVi(num: number): string {
  return num.toLocaleString('vi-VN');
}

/**
 * Format ngÃ y thÃ¡ng theo Ä‘á»‹nh dáº¡ng Viá»‡t Nam
 * @param date Date object hoáº·c ISO string
 * @returns Chuá»—i ngÃ y thÃ¡ng (VD: 24/01/2025 21:30)
 */
export function formatDateVi(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format khoáº£ng cÃ¡ch thÃ¢n thiá»‡n
 * @param km Khoáº£ng cÃ¡ch tÃ­nh báº±ng km
 * @returns Chuá»—i Ä‘Ã£ format (VD: "500 m" hoáº·c "2,5 km")
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1).replace('.', ',')} km`;
}

// ============================================================
// Tiá»‡n Ã­ch xá»­ lÃ½ tráº¡ng thÃ¡i bÃ¡o cÃ¡o
// ============================================================

export enum ReportStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

export interface ReportStatusInfo {
  status: ReportStatus;
  label: string;
  labelVi: string;
  color: string;
}

/**
 * Láº¥y thÃ´ng tin tráº¡ng thÃ¡i bÃ¡o cÃ¡o
 */
export function getReportStatusInfo(status: ReportStatus): ReportStatusInfo {
  const statusMap: Record<ReportStatus, ReportStatusInfo> = {
    [ReportStatus.PENDING]: {
      status: ReportStatus.PENDING,
      label: 'Pending',
      labelVi: 'Äang chá» xá»­ lÃ½',
      color: '#f59e0b',
    },
    [ReportStatus.IN_PROGRESS]: {
      status: ReportStatus.IN_PROGRESS,
      label: 'In Progress',
      labelVi: 'Äang xá»­ lÃ½',
      color: '#3b82f6',
    },
    [ReportStatus.RESOLVED]: {
      status: ReportStatus.RESOLVED,
      label: 'Resolved',
      labelVi: 'ÄÃ£ giáº£i quyáº¿t',
      color: '#10b981',
    },
    [ReportStatus.REJECTED]: {
      status: ReportStatus.REJECTED,
      label: 'Rejected',
      labelVi: 'Tá»« chá»‘i',
      color: '#ef4444',
    },
  };
  return statusMap[status] || statusMap[ReportStatus.PENDING];
}

// ============================================================
// Xuáº¥t táº¥t cáº£
// ============================================================

export const VERSION = '1.0.0';

