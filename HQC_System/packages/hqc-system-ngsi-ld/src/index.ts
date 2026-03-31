// Copyright (c) 2025 HQC System Contributors
// Licensed under the GNU General Public License v3.0 (GPL-3.0)
/**
 * HQC System NGSI-LD - ThÆ° viá»‡n xÃ¢y dá»±ng vÃ  xá»­ lÃ½ NGSI-LD entities
 * 
 * ThÆ° viá»‡n cung cáº¥p cÃ¡c cÃ´ng cá»¥ Ä‘á»ƒ xÃ¢y dá»±ng NGSI-LD entities theo chuáº©n ETSI,
 * há»— trá»£ cÃ¡c data models cho Smart City nhÆ° AirQualityObserved, TrafficFlowObserved,
 * vÃ  CivicIssue.
 * 
 * Copyright (C) 2025 HQC System Team
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

// ============================================================
// NGSI-LD Context vÃ  Constants
// ============================================================

/**
 * NGSI-LD Core Context URL
 */
export const NGSI_LD_CORE_CONTEXT = 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld';

/**
 * Smart Data Models Context URL
 */
export const SMART_DATA_MODELS_CONTEXT = 'https://smartdatamodels.org/context.jsonld';

/**
 * HQC System Custom Context
 */
export const HQC System_CONTEXT = 'https://HQC System.io/context/v1/HQC System.jsonld';

/**
 * Default contexts cho HQC System entities
 */
export const DEFAULT_CONTEXTS = [
  NGSI_LD_CORE_CONTEXT,
  SMART_DATA_MODELS_CONTEXT,
  HQC System_CONTEXT,
];

// ============================================================
// Äá»‹nh nghÄ©a kiá»ƒu NGSI-LD
// ============================================================

export interface NgsiLdProperty<T> {
  type: 'Property';
  value: T;
  observedAt?: string;
  unitCode?: string;
}

export interface NgsiLdGeoProperty {
  type: 'GeoProperty';
  value: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface NgsiLdRelationship {
  type: 'Relationship';
  object: string;
}

export interface NgsiLdTemporalProperty<T> {
  type: 'Property';
  value: T;
  observedAt: string;
}

export interface NgsiLdEntity {
  '@context'?: string | string[];
  id: string;
  type: string;
  [key: string]: unknown;
}

// ============================================================
// Entity ID Helpers
// ============================================================

/**
 * Táº¡o NGSI-LD Entity URN
 * @param entityType Loáº¡i entity (VD: AirQualityObserved, CivicIssue)
 * @param id ID duy nháº¥t
 * @returns URN theo chuáº©n NGSI-LD
 */
export function createEntityId(entityType: string, id: string | number): string {
  return `urn:ngsi-ld:${entityType}:${id}`;
}

/**
 * PhÃ¢n tÃ­ch NGSI-LD Entity URN
 * @param urn URN Ä‘áº§y Ä‘á»§
 * @returns Object chá»©a entityType vÃ  id, hoáº·c null náº¿u khÃ´ng há»£p lá»‡
 */
export function parseEntityId(urn: string): { entityType: string; id: string } | null {
  const pattern = /^urn:ngsi-ld:([^:]+):(.+)$/;
  const match = urn.match(pattern);
  if (match) {
    return { entityType: match[1], id: match[2] };
  }
  return null;
}

/**
 * Kiá»ƒm tra URN cÃ³ Ä‘Ãºng chuáº©n NGSI-LD khÃ´ng
 */
export function isValidEntityId(urn: string): boolean {
  return /^urn:ngsi-ld:[^:]+:.+$/.test(urn);
}

// ============================================================
// Property Builders
// ============================================================

/**
 * Táº¡o NGSI-LD Property
 */
export function createProperty<T>(
  value: T,
  options?: { observedAt?: string | Date; unitCode?: string }
): NgsiLdProperty<T> {
  const prop: NgsiLdProperty<T> = {
    type: 'Property',
    value,
  };
  if (options?.observedAt) {
    prop.observedAt = options.observedAt instanceof Date 
      ? options.observedAt.toISOString() 
      : options.observedAt;
  }
  if (options?.unitCode) {
    prop.unitCode = options.unitCode;
  }
  return prop;
}

/**
 * Táº¡o NGSI-LD GeoProperty (Point)
 * @param lat VÄ© Ä‘á»™
 * @param lon Kinh Ä‘á»™
 */
export function createGeoProperty(lat: number, lon: number): NgsiLdGeoProperty {
  return {
    type: 'GeoProperty',
    value: {
      type: 'Point',
      coordinates: [lon, lat], // GeoJSON format: [longitude, latitude]
    },
  };
}

/**
 * Táº¡o NGSI-LD Relationship
 * @param targetId URN cá»§a entity Ä‘Ã­ch
 */
export function createRelationship(targetId: string): NgsiLdRelationship {
  return {
    type: 'Relationship',
    object: targetId,
  };
}

// ============================================================
// Smart City Entity Builders
// ============================================================

export interface AirQualityObservedInput {
  id: string | number;
  location: { lat: number; lon: number };
  aqi: number;
  pm25?: number;
  pm10?: number;
  no2?: number;
  so2?: number;
  co?: number;
  o3?: number;
  observedAt?: Date | string;
  source?: string;
}

/**
 * Táº¡o AirQualityObserved entity theo Smart Data Models
 */
export function createAirQualityObserved(input: AirQualityObservedInput): NgsiLdEntity {
  const observedAt = input.observedAt 
    ? (input.observedAt instanceof Date ? input.observedAt.toISOString() : input.observedAt)
    : new Date().toISOString();

  const entity: NgsiLdEntity = {
    '@context': DEFAULT_CONTEXTS,
    id: createEntityId('AirQualityObserved', input.id),
    type: 'AirQualityObserved',
    location: createGeoProperty(input.location.lat, input.location.lon),
    airQualityIndex: createProperty(input.aqi, { observedAt }),
    dateObserved: createProperty(observedAt),
  };

  if (input.pm25 !== undefined) {
    entity.pm25 = createProperty(input.pm25, { observedAt, unitCode: 'GQ' }); // Âµg/mÂ³
  }
  if (input.pm10 !== undefined) {
    entity.pm10 = createProperty(input.pm10, { observedAt, unitCode: 'GQ' });
  }
  if (input.no2 !== undefined) {
    entity.no2 = createProperty(input.no2, { observedAt, unitCode: 'GQ' });
  }
  if (input.so2 !== undefined) {
    entity.so2 = createProperty(input.so2, { observedAt, unitCode: 'GQ' });
  }
  if (input.co !== undefined) {
    entity.co = createProperty(input.co, { observedAt, unitCode: 'GQ' });
  }
  if (input.o3 !== undefined) {
    entity.o3 = createProperty(input.o3, { observedAt, unitCode: 'GQ' });
  }
  if (input.source) {
    entity.source = createProperty(input.source);
  }

  return entity;
}

export interface TrafficFlowObservedInput {
  id: string | number;
  location: { lat: number; lon: number };
  intensity: number;
  averageSpeed?: number;
  congestionLevel?: 'free' | 'light' | 'moderate' | 'heavy' | 'severe';
  laneId?: string;
  observedAt?: Date | string;
}

/**
 * Táº¡o TrafficFlowObserved entity theo Smart Data Models
 */
export function createTrafficFlowObserved(input: TrafficFlowObservedInput): NgsiLdEntity {
  const observedAt = input.observedAt 
    ? (input.observedAt instanceof Date ? input.observedAt.toISOString() : input.observedAt)
    : new Date().toISOString();

  const entity: NgsiLdEntity = {
    '@context': DEFAULT_CONTEXTS,
    id: createEntityId('TrafficFlowObserved', input.id),
    type: 'TrafficFlowObserved',
    location: createGeoProperty(input.location.lat, input.location.lon),
    intensity: createProperty(input.intensity, { observedAt }),
    dateObserved: createProperty(observedAt),
  };

  if (input.averageSpeed !== undefined) {
    entity.averageSpeed = createProperty(input.averageSpeed, { observedAt, unitCode: 'KMH' });
  }
  if (input.congestionLevel) {
    entity.congestionLevel = createProperty(input.congestionLevel, { observedAt });
  }
  if (input.laneId) {
    entity.laneId = createProperty(input.laneId);
  }

  return entity;
}

export interface CivicIssueInput {
  id: string | number;
  title: string;
  description: string;
  location: { lat: number; lon: number };
  category: string;
  status?: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  reportedBy?: string;
  assignedTo?: string;
  createdAt?: Date | string;
  imageUrl?: string;
}

/**
 * Táº¡o CivicIssue entity (HQC System custom model)
 */
export function createCivicIssue(input: CivicIssueInput): NgsiLdEntity {
  const createdAt = input.createdAt 
    ? (input.createdAt instanceof Date ? input.createdAt.toISOString() : input.createdAt)
    : new Date().toISOString();

  const entity: NgsiLdEntity = {
    '@context': DEFAULT_CONTEXTS,
    id: createEntityId('CivicIssue', input.id),
    type: 'CivicIssue',
    title: createProperty(input.title),
    description: createProperty(input.description),
    location: createGeoProperty(input.location.lat, input.location.lon),
    category: createProperty(input.category),
    status: createProperty(input.status || 'pending'),
    priority: createProperty(input.priority || 'medium'),
    dateCreated: createProperty(createdAt),
  };

  if (input.reportedBy) {
    entity.reportedBy = createRelationship(createEntityId('User', input.reportedBy));
  }
  if (input.assignedTo) {
    entity.assignedTo = createRelationship(createEntityId('User', input.assignedTo));
  }
  if (input.imageUrl) {
    entity.image = createProperty(input.imageUrl);
  }

  return entity;
}

// ============================================================
// Entity Validation
// ============================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Kiá»ƒm tra NGSI-LD entity cÃ³ há»£p lá»‡ khÃ´ng
 */
export function validateEntity(entity: unknown): ValidationResult {
  const errors: string[] = [];
  
  if (!entity || typeof entity !== 'object') {
    return { valid: false, errors: ['Entity must be an object'] };
  }
  
  const e = entity as Record<string, unknown>;
  
  if (!e.id) {
    errors.push('Missing required field: id');
  } else if (typeof e.id !== 'string' || !isValidEntityId(e.id)) {
    errors.push('Invalid entity id format. Must be urn:ngsi-ld:{Type}:{id}');
  }
  
  if (!e.type) {
    errors.push('Missing required field: type');
  } else if (typeof e.type !== 'string') {
    errors.push('Field "type" must be a string');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================
// NGSI-LD Query Helpers
// ============================================================

export interface NgsiLdQueryParams {
  type?: string;
  q?: string;
  geoQ?: {
    geometry: 'Point';
    coordinates: [number, number];
    georel: 'near' | 'within' | 'contains' | 'intersects';
    maxDistance?: number;
  };
  limit?: number;
  offset?: number;
}

/**
 * XÃ¢y dá»±ng query string cho NGSI-LD API
 */
export function buildQueryString(params: NgsiLdQueryParams): string {
  const queryParts: string[] = [];
  
  if (params.type) {
    queryParts.push(`type=${encodeURIComponent(params.type)}`);
  }
  
  if (params.q) {
    queryParts.push(`q=${encodeURIComponent(params.q)}`);
  }
  
  if (params.geoQ) {
    const { geometry, coordinates, georel, maxDistance } = params.geoQ;
    let georelValue: string = georel;
    if (maxDistance !== undefined) {
      georelValue = `${georel};maxDistance==${maxDistance}`;
    }
    queryParts.push(`geometry=${geometry}`);
    queryParts.push(`coordinates=${JSON.stringify(coordinates)}`);
    queryParts.push(`georel=${georelValue}`);
  }
  
  if (params.limit !== undefined) {
    queryParts.push(`limit=${params.limit}`);
  }
  
  if (params.offset !== undefined) {
    queryParts.push(`offset=${params.offset}`);
  }
  
  return queryParts.join('&');
}

// ============================================================
// Export version
// ============================================================

export const VERSION = '1.0.0';

