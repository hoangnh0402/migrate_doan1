// Copyright (c) 2025 hqcsystem Contributors
// Licensed under the GNU General Public License v3.0 (GPL-3.0)

'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { 
  RefreshCw, PanelRightOpen, PanelRightClose,
  Map as MapIcon, Satellite, Camera, AlertTriangle, MapPin, Clock
} from 'lucide-react';
import { CachedImage } from '@/components/CachedImage';
import { imageCacheService } from '@/lib/image-cache';
import { 
  geographicApi, 
  geographicStatsApi,
  type GeoJSONFeatureCollection,
  type GeographicStatistics,
  type BoundaryDetails
} from '@/lib/api';
import { appReportsApi, type AppReport, getReportTypeLabel } from '@/lib/app-reports-api';
import { cn } from '@/lib/utils';
import { BoundarySelector, IntegratedDataPanel } from '@/components/geographic';

// Dynamic imports for Leaflet (no SSR) - using BSD-2-Clause licensed Leaflet
const MapContainer = dynamic(
  () => import('@/components/map/LeafletReactWrapper').then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('@/components/map/LeafletReactWrapper').then(mod => mod.TileLayer),
  { ssr: false }
);
const GeoJSON = dynamic(
  () => import('@/components/map/LeafletReactWrapper').then(mod => mod.GeoJSON),
  { ssr: false }
);
const Popup = dynamic(
  () => import('@/components/map/LeafletReactWrapper').then(mod => mod.Popup),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('@/components/map/LeafletReactWrapper').then(mod => mod.CircleMarker),
  { ssr: false }
);

// Traffic Camera components
import { TRAFFIC_CAMERAS, TrafficCameraPopup, type TrafficCamera } from '@/components/map/TrafficCamera';

// Camera Marker component for use with leaflet compat layer
const CameraMarkerWithPopup = dynamic(
  () => Promise.resolve(({ camera }: { camera: TrafficCamera }) => {
    const L = typeof window !== 'undefined' ? require('leaflet') : null;
    const { Marker: LeafletMarker, Popup: LeafletPopup } = require('@/components/map/LeafletReactWrapper');
    
    if (!L) return null;
    
    const cameraIcon = L.divIcon({
      className: 'camera-marker',
      html: `
        <div class="relative flex flex-col items-center">
          <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
            camera.status === 'online' ? 'bg-green-600' : 
            camera.status === 'demo' ? 'bg-yellow-600' : 'bg-red-600'
          } border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          </div>
          <span class="absolute -top-1 -right-1 w-3 h-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -44],
    });
    
    return (
      <LeafletMarker 
        position={camera.location}
        icon={cameraIcon}
      >
        <LeafletPopup
          closeButton={true}
          maxWidth={350}
          minWidth={320}
          className="camera-popup"
        >
          <TrafficCameraPopup camera={camera} />
        </LeafletPopup>
      </LeafletMarker>
    );
  }),
  { ssr: false }
);

// Status colors for reports
const REPORT_STATUS_COLORS: Record<string, { bg: string; border: string }> = {
  pending: { bg: '#fbbf24', border: '#f59e0b' },
  processing: { bg: '#3b82f6', border: '#2563eb' },
  resolved: { bg: '#22c55e', border: '#16a34a' },
  rejected: { bg: '#ef4444', border: '#dc2626' },
};

// Report Marker component
const ReportMarkerWithPopup = dynamic(
  () => Promise.resolve(({ report }: { report: AppReport }) => {
    const L = typeof window !== 'undefined' ? require('leaflet') : null;
    const { Marker: LeafletMarker, Popup: LeafletPopup } = require('@/components/map/LeafletReactWrapper');
    
    if (!L || !report.location) return null;
    
    const statusColor = REPORT_STATUS_COLORS[report.status] || REPORT_STATUS_COLORS.pending;
    const typeLabel = getReportTypeLabel(report.reportType);
    
    const reportIcon = L.divIcon({
      className: 'report-marker',
      html: `
        <div class="relative flex flex-col items-center">
          <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
               style="background-color: ${statusColor.bg}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <path d="M12 9v4"/>
              <path d="M12 17h.01"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -44],
    });
    
    const formatDate = (dateStr: string) => {
      try {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return dateStr;
      }
    };
    
    const statusLabels: Record<string, string> = {
      pending: 'Chá» xá»­ lÃ½',
      processing: 'Äang xá»­ lÃ½',
      resolved: 'ÄÃ£ xá»­ lÃ½',
      rejected: 'Tá»« chá»‘i',
    };
    
    return (
      <LeafletMarker 
        position={[report.location.lat, report.location.lng]}
        icon={reportIcon}
      >
        <LeafletPopup
          closeButton={true}
          maxWidth={320}
          minWidth={280}
          className="report-popup"
        >
          <div className="min-w-[250px]">
            <div className="flex items-center gap-2 mb-2">
              <span 
                className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: statusColor.bg }}
              >
                {statusLabels[report.status] || report.status}
              </span>
              <span className="text-sm text-gray-600">{typeLabel}</span>
            </div>
            <h4 className="font-bold text-base text-gray-900 leading-tight mb-1">
              {report.title || 'Pháº£n Ã¡nh tá»« ngÆ°á»i dÃ¢n'}
            </h4>
            <p className="text-sm text-gray-700 mb-2 line-clamp-2">{report.content}</p>
            <div className="space-y-1 text-sm border-t border-gray-100 pt-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">{report.ward}{report.addressDetail ? `, ${report.addressDetail}` : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{formatDate(report.createdAt)}</span>
              </div>
            </div>
            {report.media && report.media.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-1">
                  HÃ¬nh áº£nh ({report.media.filter(m => m.type === 'image').length})
                </div>
                <div className={`grid gap-1 ${
                  report.media.length === 1 ? 'grid-cols-1' : 
                  report.media.length === 2 ? 'grid-cols-2' : 
                  'grid-cols-3'
                }`}>
                  {report.media.slice(0, 3).filter(m => m.type === 'image').map((media, idx) => (
                    <div key={idx} className="relative overflow-hidden rounded">
                      <CachedImage
                        src={media.uri}
                        alt={`Report ${idx + 1}`}
                        className="w-full h-20 object-cover hover:scale-110 transition-transform cursor-pointer"
                        fallbackClassName="w-full h-20 rounded"
                        fallbackIcon={<Camera className="h-6 w-6 text-gray-400" />}
                      />
                    </div>
                  ))}
                </div>
                {report.media.filter(m => m.type === 'image').length > 3 && (
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    +{report.media.filter(m => m.type === 'image').length - 3} áº£nh khÃ¡c
                  </div>
                )}
              </div>
            )}
          </div>
        </LeafletPopup>
      </LeafletMarker>
    );
  }),
  { ssr: false }
);

// MapController component - controls map view programmatically
const MapController = dynamic(
  () => import('@/components/map/LeafletReactWrapper').then(mod => {
    const { useMap } = mod;
    const { useEffect } = require('react');
    
    // Return a component that uses useMap
    return {
      default: function MapControllerInner({ 
        bounds 
      }: { 
        center?: [number, number]; 
        zoom?: number; 
        bounds?: [[number, number], [number, number]] | null;
      }) {
        const map = useMap();
        
        useEffect(() => {
          // Fit to bounds when bounds change
          if (bounds) {
            map.fitBounds(bounds, {
              padding: [50, 50],
              maxZoom: 16,
              animate: true,
              duration: 0.5,
            });
          }
        }, [map, bounds]);
        
        return null;
      }
    };
  }),
  { ssr: false }
);

// Hanoi center coordinates
const HANOI_CENTER: [number, number] = [21.028511, 105.804817];
const DEFAULT_ZOOM = 11;
const SELECTED_ZOOM = 14;

// Map tile layers
const MAP_LAYERS = {
  satellite: {
    name: 'Vá»‡ tinh',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
  },
  osm: {
    name: 'Báº£n Ä‘á»“',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  hybrid: {
    name: 'Hybrid',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
  },
};

// Layer visibility state type
interface LayerVisibility {
  boundaries: boolean;
  districts: boolean;
  pois: boolean;
  traffic: boolean;
  cameras: boolean;
  reports: boolean;
}

// TomTom Traffic Flow layer (requires API key from environment)
const TOMTOM_TRAFFIC_LAYER = {
  // Traffic flow tiles - shows traffic speed as colors on roads
  url: `https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_TOMTOM_API_KEY || ''}`,
  attribution: '&copy; TomTom Traffic',
};

type MapLayerType = 'satellite' | 'osm' | 'hybrid';

// POI Configuration - colors, icons, Vietnamese names
const POI_CONFIG: Record<string, { 
  color: string; 
  name: string; 
  emoji: string;
  priority: number;
}> = {
  // Healthcare - Red
  hospital: { color: '#dc2626', name: 'Bá»‡nh viá»‡n', emoji: 'ðŸ¥', priority: 1 },
  clinic: { color: '#ef4444', name: 'PhÃ²ng khÃ¡m', emoji: 'ðŸ¥', priority: 2 },
  pharmacy: { color: '#f87171', name: 'NhÃ  thuá»‘c', emoji: 'ðŸ’Š', priority: 3 },
  doctors: { color: '#ef4444', name: 'PhÃ²ng khÃ¡m', emoji: 'ðŸ‘¨â€âš•ï¸', priority: 2 },
  dentist: { color: '#ef4444', name: 'Nha khoa', emoji: 'ðŸ¦·', priority: 3 },
  
  // Education - Indigo
  school: { color: '#4f46e5', name: 'TrÆ°á»ng há»c', emoji: 'ðŸ«', priority: 1 },
  kindergarten: { color: '#6366f1', name: 'Máº§m non', emoji: 'ðŸ‘¶', priority: 2 },
  university: { color: '#4338ca', name: 'Äáº¡i há»c', emoji: 'ðŸŽ“', priority: 1 },
  college: { color: '#4f46e5', name: 'Cao Ä‘áº³ng', emoji: 'ðŸŽ“', priority: 2 },
  library: { color: '#6366f1', name: 'ThÆ° viá»‡n', emoji: 'ðŸ“š', priority: 3 },
  
  // Finance - Emerald
  bank: { color: '#059669', name: 'NgÃ¢n hÃ ng', emoji: 'ðŸ¦', priority: 1 },
  atm: { color: '#10b981', name: 'CÃ¢y ATM', emoji: 'ðŸ’³', priority: 3 },
  
  // Shopping - Orange
  supermarket: { color: '#ea580c', name: 'SiÃªu thá»‹', emoji: 'ðŸ›’', priority: 1 },
  marketplace: { color: '#f97316', name: 'Chá»£', emoji: 'ðŸª', priority: 1 },
  mall: { color: '#ea580c', name: 'TTTM', emoji: 'ðŸ¬', priority: 1 },
  convenience: { color: '#fb923c', name: 'Tiá»‡n lá»£i', emoji: 'ðŸª', priority: 3 },
  department_store: { color: '#f97316', name: 'BÃ¡ch hÃ³a', emoji: 'ðŸ¬', priority: 2 },
  
  // Food & Drink - Amber
  restaurant: { color: '#d97706', name: 'NhÃ  hÃ ng', emoji: 'ðŸ½ï¸', priority: 2 },
  cafe: { color: '#f59e0b', name: 'CÃ  phÃª', emoji: 'â˜•', priority: 3 },
  fast_food: { color: '#fbbf24', name: 'Ä‚n nhanh', emoji: 'ðŸ”', priority: 3 },
  bar: { color: '#d97706', name: 'Bar', emoji: 'ðŸº', priority: 4 },
  
  // Government - Slate
  police: { color: '#475569', name: 'CÃ´ng an', emoji: 'ðŸ‘®', priority: 1 },
  fire_station: { color: '#dc2626', name: 'Cá»©u há»a', emoji: 'ðŸš’', priority: 1 },
  post_office: { color: '#64748b', name: 'BÆ°u Ä‘iá»‡n', emoji: 'ðŸ“®', priority: 2 },
  townhall: { color: '#475569', name: 'UBND', emoji: 'ðŸ›ï¸', priority: 1 },
  
  // Transport - Cyan
  fuel: { color: '#0891b2', name: 'Tráº¡m xÄƒng', emoji: 'â›½', priority: 2 },
  parking: { color: '#06b6d4', name: 'BÃ£i Ä‘á»— xe', emoji: 'ðŸ…¿ï¸', priority: 3 },
  bus_station: { color: '#0891b2', name: 'Báº¿n xe', emoji: 'ðŸšŒ', priority: 2 },
  charging_station: { color: '#22d3ee', name: 'Tráº¡m sáº¡c', emoji: 'ðŸ”Œ', priority: 3 },
  
  // Religion - Yellow
  place_of_worship: { color: '#ca8a04', name: 'TÃ´n giÃ¡o', emoji: 'â›ª', priority: 3 },
  
  // Tourism - Purple
  hotel: { color: '#7c3aed', name: 'KhÃ¡ch sáº¡n', emoji: 'ðŸ¨', priority: 2 },
  museum: { color: '#8b5cf6', name: 'Báº£o tÃ ng', emoji: 'ðŸ›ï¸', priority: 2 },
  attraction: { color: '#a78bfa', name: 'Äiá»ƒm tham quan', emoji: 'ðŸ“¸', priority: 2 },
  
  // Leisure - Green
  park: { color: '#16a34a', name: 'CÃ´ng viÃªn', emoji: 'ðŸŒ³', priority: 2 },
  sports_centre: { color: '#22c55e', name: 'Thá»ƒ thao', emoji: 'ðŸƒ', priority: 3 },
  cinema: { color: '#84cc16', name: 'Ráº¡p phim', emoji: 'ðŸŽ¬', priority: 3 },
  
  // Default
  default: { color: '#6b7280', name: 'Äá»‹a Ä‘iá»ƒm', emoji: 'ðŸ“', priority: 5 },
};

// Get POI config by subcategory or category
function getPOIConfig(subcategory: string | null, category: string): typeof POI_CONFIG[string] {
  if (subcategory && POI_CONFIG[subcategory]) {
    return POI_CONFIG[subcategory];
  }
  // Try category-based mapping
  if (category === 'healthcare') return POI_CONFIG.hospital;
  if (category === 'education') return POI_CONFIG.school;
  if (category === 'finance') return POI_CONFIG.bank;
  if (category === 'shop') return POI_CONFIG.convenience;
  if (category === 'tourism') return POI_CONFIG.hotel;
  if (category === 'leisure') return POI_CONFIG.park;
  return POI_CONFIG.default;
}

// Vietnamese subcategory names
const SUBCATEGORY_NAMES: Record<string, string> = {
  hospital: 'Bá»‡nh viá»‡n',
  clinic: 'PhÃ²ng khÃ¡m',
  pharmacy: 'NhÃ  thuá»‘c',
  doctors: 'PhÃ²ng khÃ¡m bÃ¡c sÄ©',
  dentist: 'Nha khoa',
  school: 'TrÆ°á»ng há»c',
  kindergarten: 'TrÆ°á»ng máº§m non',
  university: 'Äáº¡i há»c',
  college: 'Cao Ä‘áº³ng',
  library: 'ThÆ° viá»‡n',
  bank: 'NgÃ¢n hÃ ng',
  atm: 'CÃ¢y ATM',
  supermarket: 'SiÃªu thá»‹',
  marketplace: 'Chá»£',
  mall: 'Trung tÃ¢m thÆ°Æ¡ng máº¡i',
  convenience: 'Cá»­a hÃ ng tiá»‡n lá»£i',
  department_store: 'Cá»­a hÃ ng bÃ¡ch hÃ³a',
  restaurant: 'NhÃ  hÃ ng',
  cafe: 'QuÃ¡n cÃ  phÃª',
  fast_food: 'Äá»“ Äƒn nhanh',
  bar: 'QuÃ¡n bar',
  police: 'CÃ´ng an',
  fire_station: 'Tráº¡m cá»©u há»a',
  post_office: 'BÆ°u Ä‘iá»‡n',
  townhall: 'UBND',
  fuel: 'Tráº¡m xÄƒng',
  parking: 'BÃ£i Ä‘á»— xe',
  bus_station: 'Báº¿n xe buÃ½t',
  charging_station: 'Tráº¡m sáº¡c Ä‘iá»‡n',
  place_of_worship: 'NÆ¡i thá» cÃºng',
  hotel: 'KhÃ¡ch sáº¡n',
  museum: 'Báº£o tÃ ng',
  attraction: 'Äiá»ƒm tham quan',
  park: 'CÃ´ng viÃªn',
  sports_centre: 'Trung tÃ¢m thá»ƒ thao',
  cinema: 'Ráº¡p chiáº¿u phim',
  clothes: 'Quáº§n Ã¡o',
  mobile_phone: 'Äiá»‡n thoáº¡i',
  electronics: 'Äiá»‡n tá»­',
  furniture: 'Ná»™i tháº¥t',
  bakery: 'Tiá»‡m bÃ¡nh',
  hairdresser: 'LÃ m tÃ³c',
  beauty: 'Má»¹ pháº©m',
};

export default function GeographicPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Data states
  const [statistics, setStatistics] = useState<GeographicStatistics | null>(null);
  const [hanoiBoundary, setHanoiBoundary] = useState<any | null>(null);
  const [hanoiInfo, setHanoiInfo] = useState<{ num_wards: number; area_km2: number } | null>(null);
  const [districtsGeoJSON, setDistrictsGeoJSON] = useState<GeoJSONFeatureCollection | null>(null);
  const [citizenReports, setCitizenReports] = useState<AppReport[]>([]);
  
  // Selection states
  const [selectedBoundaryIds, setSelectedBoundaryIds] = useState<number[]>([]);
  const [activeBoundaryId, setActiveBoundaryId] = useState<number | null>(null);
  const [activeDetails, setActiveDetails] = useState<BoundaryDetails | null>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(true);
  
  // Map states
  const [mapCenter, setMapCenter] = useState<[number, number]>(HANOI_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [mapBounds, setMapBounds] = useState<[[number, number], [number, number]] | null>(null);
  const [activeMapLayer, setActiveMapLayer] = useState<MapLayerType>('satellite');
  
  // Layer visibility
  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>({
    boundaries: true,
    districts: true,
    pois: true,
    traffic: false,
    cameras: true,
    reports: true,
  });
  
  // Refs
  const mapRef = useRef<any>(null);

  // Client-side only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch data
  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsResult, boundariesResult, districtsResult, reportsResult] = await Promise.allSettled([
        geographicStatsApi.getStatistics(),
        geographicApi.getHanoiUnionBoundary({ simplify_tolerance: 0.0005 }),
        geographicApi.getBoundariesGeoJSON({ admin_level: 6 }),
        // Use regular endpoint with media but limited items for map markers
        appReportsApi.getReports({ limit: 50, include_media: true })
      ]);

      if (statsResult.status === 'fulfilled') {
        setStatistics(statsResult.value);
      }
      if (boundariesResult.status === 'fulfilled') {
        const unionData = boundariesResult.value;
        setHanoiBoundary({
          type: 'FeatureCollection',
          features: [unionData]
        });
        setHanoiInfo({
          num_wards: unionData.properties.num_wards,
          area_km2: unionData.properties.area_km2
        });
      }
      if (districtsResult.status === 'fulfilled') {
        setDistrictsGeoJSON(districtsResult.value);
      }
      if (reportsResult.status === 'fulfilled' && reportsResult.value.success) {
        // Filter reports with valid location data
        const reportsWithLocation = reportsResult.value.data.filter(
          (report: AppReport) => report.location && report.location.lat && report.location.lng
        );
        setCitizenReports(reportsWithLocation);
        
        // Preload report images in background
        const imageUrls = reportsWithLocation
          .filter(r => r.media && r.media.length > 0)
          .flatMap(r => r.media.slice(0, 3).filter(m => m.type === 'image').map(m => m.uri));
        
        if (imageUrls.length > 0) {
          imageCacheService.preloadImages(imageUrls);
        }
      }
    } catch (error) {
      console.error('Error fetching geographic data:', error);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update active boundary when selection changes
  useEffect(() => {
    if (selectedBoundaryIds.length > 0) {
      setActiveBoundaryId(selectedBoundaryIds[selectedBoundaryIds.length - 1]);
    } else {
      setActiveBoundaryId(null);
      setActiveDetails(null);
    }
  }, [selectedBoundaryIds]);

  // Fetch details and zoom to boundary when active changes
  useEffect(() => {
    if (!activeBoundaryId) {
      setActiveDetails(null);
      return;
    }

    const fetchDetailsAndZoom = async () => {
      try {
        const details = await geographicApi.getBoundaryDetails(activeBoundaryId, true);
        setActiveDetails(details);
        
        // Zoom to boundary
        if (details.boundary.geometry) {
          const geometry = details.boundary.geometry;
          let bounds: [[number, number], [number, number]] | null = null;
          
          if (geometry.type === 'Polygon') {
            const coords = (geometry as any).coordinates[0];
            let minLat = Infinity, maxLat = -Infinity;
            let minLng = Infinity, maxLng = -Infinity;
            
            coords.forEach((coord: [number, number]) => {
              const [lng, lat] = coord;
              minLat = Math.min(minLat, lat);
              maxLat = Math.max(maxLat, lat);
              minLng = Math.min(minLng, lng);
              maxLng = Math.max(maxLng, lng);
            });
            
            bounds = [[minLat, minLng], [maxLat, maxLng]];
          } else if (geometry.type === 'MultiPolygon') {
            let minLat = Infinity, maxLat = -Infinity;
            let minLng = Infinity, maxLng = -Infinity;
            
            (geometry as any).coordinates.forEach((polygon: any) => {
              polygon[0].forEach((coord: [number, number]) => {
                const [lng, lat] = coord;
                minLat = Math.min(minLat, lat);
                maxLat = Math.max(maxLat, lat);
                minLng = Math.min(minLng, lng);
                maxLng = Math.max(maxLng, lng);
              });
            });
            
            bounds = [[minLat, minLng], [maxLat, maxLng]];
          }
          
          if (bounds) {
            setMapBounds(bounds);
          }
        } else {
          // Fallback to center point
          setMapCenter([details.boundary.center.lat, details.boundary.center.lng]);
          setMapZoom(SELECTED_ZOOM);
        }
      } catch (error) {
        console.error('Error fetching boundary details:', error);
      }
    };

    fetchDetailsAndZoom();
  }, [activeBoundaryId]);

  // GeoJSON styles
  const boundaryStyle = useMemo(() => ({
    color: '#dc2626',
    weight: 3,
    opacity: 1,
    fillColor: '#dc2626',
    fillOpacity: 0.02
  }), []);

  // Dynamic style based on selection
  const getDistrictStyle = useCallback((feature: any) => {
    const isSelected = selectedBoundaryIds.includes(feature.id);
    const isActive = feature.id === activeBoundaryId;
    
    if (isActive) {
      return {
        color: '#16a34a',
        weight: 4,
        opacity: 1,
        fillColor: '#22c55e',
        fillOpacity: 0.35
      };
    }
    
    if (isSelected) {
      return {
        color: '#f59e0b',
        weight: 3,
        opacity: 1,
        fillColor: '#fbbf24',
        fillOpacity: 0.25
      };
    }
    
    return {
      color: '#ffffff',
      weight: 1.5,
      opacity: 0.7,
      fillColor: '#3b82f6',
      fillOpacity: 0.15
    };
  }, [selectedBoundaryIds, activeBoundaryId]);

  // GeoJSON feature handlers
  const onEachBoundary = useCallback((feature: any, layer: any) => {
    if (feature.properties) {
      const name = feature.properties.name || feature.properties.name_en || 'KhÃ´ng xÃ¡c Ä‘á»‹nh';
      layer.bindPopup(`
        <div class="p-2">
          <h3 class="font-semibold text-foreground">${name}</h3>
          <p class="text-sm text-muted-foreground">Ranh giá»›i thÃ nh phá»‘ HÃ  Ná»™i</p>
          <p class="text-sm">${hanoiInfo?.area_km2.toLocaleString('vi-VN')} kmÂ² â€¢ ${hanoiInfo?.num_wards} phÆ°á»ng/xÃ£</p>
        </div>
      `);
    }
  }, [hanoiInfo]);

  const onEachDistrict = useCallback((feature: any, layer: any) => {
    if (feature.properties) {
      const name = feature.properties.name || feature.properties.name_en || 'KhÃ´ng xÃ¡c Ä‘á»‹nh';
      const id = feature.id;
      const isSelected = selectedBoundaryIds.includes(id);
      
      layer.bindPopup(`
        <div class="p-2 min-w-[180px]">
          <h3 class="font-bold text-base">${name}</h3>
          <p class="text-sm text-gray-600 mt-1">Click Ä‘á»ƒ ${isSelected ? 'bá» chá»n' : 'chá»n vÃ  xem chi tiáº¿t'}</p>
        </div>
      `);
      
      layer.on('click', () => {
        if (selectedBoundaryIds.includes(id)) {
          setSelectedBoundaryIds(prev => prev.filter(i => i !== id));
        } else {
          setSelectedBoundaryIds(prev => [...prev, id]);
        }
      });
      
      layer.on('mouseover', () => {
        if (!selectedBoundaryIds.includes(id)) {
          layer.setStyle({ weight: 2.5, fillOpacity: 0.25 });
        }
      });
      
      layer.on('mouseout', () => {
        if (!selectedBoundaryIds.includes(id)) {
          layer.setStyle(getDistrictStyle(feature));
        }
      });
    }
  }, [selectedBoundaryIds, getDistrictStyle]);

  const toggleLayer = (layer: keyof LayerVisibility) => {
    setLayerVisibility(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const geoJsonKey = useMemo(
    () => `wards-${selectedBoundaryIds.join('-')}-${activeBoundaryId}`,
    [selectedBoundaryIds, activeBoundaryId]
  );

  // Reset map view
  const resetMapView = useCallback(() => {
    setMapCenter(HANOI_CENTER);
    setMapZoom(DEFAULT_ZOOM);
    setMapBounds(null);
  }, []);

  // POI markers from active details
  const poiMarkers = useMemo(() => {
    if (!activeDetails || !layerVisibility.pois) return [];
    return activeDetails.statistics.top_pois.filter(poi => poi.location);
  }, [activeDetails, layerVisibility.pois]);

  return (
    <>
      <style jsx global>{`
        .report-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .report-popup .leaflet-popup-content {
          margin: 12px;
          min-width: 250px;
        }
        .report-popup img {
          transition: transform 0.2s ease-in-out;
        }
        .report-popup img:hover {
          transform: scale(1.05);
        }
      `}</style>
      <div className="space-y-4 h-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dá»¯ liá»‡u Ä‘á»‹a lÃ½</h1>
          <p className="text-muted-foreground mt-1">
            Báº£n Ä‘á»“ ranh giá»›i hÃ nh chÃ­nh HÃ  Ná»™i â€¢ {hanoiInfo?.num_wards || 126} phÆ°á»ng/xÃ£
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Details Panel */}
          <button
            onClick={() => setShowDetailsPanel(!showDetailsPanel)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
              "bg-card border border-border hover:bg-green-50 dark:hover:bg-green-950/20",
              showDetailsPanel ? "bg-green-50 dark:bg-green-950/30 border-green-500" : ""
            )}
            title={showDetailsPanel ? "áº¨n panel chi tiáº¿t" : "Hiá»‡n panel chi tiáº¿t"}
          >
            {showDetailsPanel ? 
              <PanelRightClose className="w-4 h-4 text-green-600 dark:text-green-500" /> : 
              <PanelRightOpen className="w-4 h-4 hover:text-green-600 dark:hover:text-green-500" />
            }
          </button>
          
          {/* Refresh Button */}
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              "bg-green-600 text-white hover:bg-green-700 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            <span className="hidden sm:inline">LÃ m má»›i</span>
          </button>
        </div>
      </div>

      {/* Statistics Bar */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">PhÆ°á»ng/XÃ£</p>
            <p className="text-xl font-bold text-foreground">{(statistics.administrative_boundaries?.total || 0).toLocaleString('vi-VN')}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {statistics.administrative_boundaries?.phuong || 0} phÆ°á»ng, {statistics.administrative_boundaries?.xa || 0} xÃ£
            </p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">ÄÆ°á»ng phá»‘</p>
            <p className="text-xl font-bold text-foreground">{(statistics.streets?.total || 0).toLocaleString('vi-VN')}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">CÃ´ng trÃ¬nh</p>
            <p className="text-xl font-bold text-foreground">{(statistics.buildings?.total || 0).toLocaleString('vi-VN')}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">POI</p>
            <p className="text-xl font-bold text-foreground">{(statistics.pois?.total || 0).toLocaleString('vi-VN')}</p>
          </div>
        </div>
      )}

      {/* Main Content: Controls + Map + Details Panel */}
      <div className="flex gap-4" style={{ height: 'calc(100vh - 340px)', minHeight: '500px' }}>
        
        {/* Left Sidebar - Selector & Controls */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-4 overflow-visible">
          {/* Boundary Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border-2 border-green-200 dark:border-green-800 p-4 relative z-50 shadow-md">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="text-green-600">ðŸ“</span>
              Chá»n phÆ°á»ng/xÃ£
            </h3>
            <BoundarySelector
              selectedIds={selectedBoundaryIds}
              onSelectionChange={setSelectedBoundaryIds}
              maxSelection={10}
            />
            
            {selectedBoundaryIds.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <button
                  onClick={() => {
                    setSelectedBoundaryIds([]);
                    resetMapView();
                  }}
                  className="w-full text-sm text-muted-foreground hover:text-destructive transition-colors"
                >
                  XÃ³a táº¥t cáº£ lá»±a chá»n
                </button>
              </div>
            )}
          </div>

          {/* Map Type Selector */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Loáº¡i báº£n Ä‘á»“</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveMapLayer('satellite')}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all",
                  activeMapLayer === 'satellite' 
                    ? "border-green-500 bg-green-50 dark:bg-green-950/30 shadow-sm" 
                    : "border-border hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-400"
                )}
              >
                <Satellite className={cn("w-5 h-5", activeMapLayer === 'satellite' ? "text-green-600" : "")} />
                <span className={cn("text-xs", activeMapLayer === 'satellite' ? "text-green-600 font-medium" : "")}>Vá»‡ tinh</span>
              </button>
              <button
                onClick={() => setActiveMapLayer('osm')}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all",
                  activeMapLayer === 'osm' 
                    ? "border-green-500 bg-green-50 dark:bg-green-950/30 shadow-sm" 
                    : "border-border hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-400"
                )}
              >
                <MapIcon className={cn("w-5 h-5", activeMapLayer === 'osm' ? "text-green-600" : "")} />
                <span className={cn("text-xs", activeMapLayer === 'osm' ? "text-green-600 font-medium" : "")}>ÄÆ°á»ng phá»‘</span>
              </button>
            </div>
          </div>

          {/* Layer Control */}
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Lá»›p hiá»ƒn thá»‹</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={layerVisibility.boundaries}
                  onChange={() => toggleLayer('boundaries')}
                  className="w-4 h-4 rounded border-border text-green-600 focus:ring-green-500"
                />
                <div>
                  <p className={`text-sm ${layerVisibility.boundaries ? 'text-green-600 font-medium' : 'text-foreground'}`}>Ranh giá»›i HÃ  Ná»™i</p>
                  <p className="text-xs text-muted-foreground">Viá»n Ä‘á»</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={layerVisibility.districts}
                  onChange={() => toggleLayer('districts')}
                  className="w-4 h-4 rounded border-border text-green-600 focus:ring-green-500"
                />
                <div>
                  <p className={`text-sm ${layerVisibility.districts ? 'text-green-600 font-medium' : 'text-foreground'}`}>PhÆ°á»ng/XÃ£</p>
                  <p className="text-xs text-muted-foreground">{hanoiInfo?.num_wards || 126} Ä‘Æ¡n vá»‹</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={layerVisibility.pois}
                  onChange={() => toggleLayer('pois')}
                  className="w-4 h-4 rounded border-border text-green-600 focus:ring-green-500"
                />
                <div>
                  <p className={`text-sm ${layerVisibility.pois ? 'text-green-600 font-medium' : 'text-foreground'}`}>Äiá»ƒm POI</p>
                  <p className="text-xs text-muted-foreground">Äá»‹a Ä‘iá»ƒm quan trá»ng</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={layerVisibility.traffic}
                  onChange={() => toggleLayer('traffic')}
                  className="w-4 h-4 rounded border-border text-green-600 focus:ring-green-500"
                />
                <div>
                  <p className={`text-sm ${layerVisibility.traffic ? 'text-green-600 font-medium' : 'text-foreground'}`}>Giao thÃ´ng</p>
                  <p className="text-xs text-muted-foreground">TÃ¬nh tráº¡ng Ä‘Æ°á»ng (TomTom)</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={layerVisibility.cameras}
                  onChange={() => toggleLayer('cameras')}
                  className="w-4 h-4 rounded border-border text-green-600 focus:ring-green-500"
                />
                <div>
                  <p className="text-sm text-foreground flex items-center gap-1">
                    <Camera className="w-3 h-3 text-green-500" />
                    <span className={layerVisibility.cameras ? 'text-green-600 font-medium' : ''}>Camera giao thÃ´ng</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Xem video thá»±c táº¿</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={layerVisibility.reports}
                  onChange={() => toggleLayer('reports')}
                  className="w-4 h-4 rounded border-border text-green-600 focus:ring-green-500"
                />
                <div>
                  <p className="text-sm text-foreground flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    <span className={layerVisibility.reports ? 'text-green-600 font-medium' : ''}>Pháº£n Ã¡nh tá»« dÃ¢n</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{citizenReports.length} bÃ¡o cÃ¡o</p>
                </div>
              </label>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-card rounded-lg border border-border p-4 flex-1 overflow-y-auto">
            <h3 className="text-sm font-semibold text-foreground mb-3">ChÃº thÃ­ch</h3>
            
            {/* Map layers */}
            <div className="space-y-1.5 text-xs mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-red-600 rounded"></div>
                <span className="text-muted-foreground">Ranh giá»›i HN</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2.5 bg-blue-500/30 border border-white rounded"></div>
                <span className="text-muted-foreground">PhÆ°á»ng/XÃ£</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2.5 bg-amber-400/40 border-2 border-amber-500 rounded"></div>
                <span className="text-muted-foreground">ÄÃ£ chá»n</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2.5 bg-green-500/40 border-2 border-green-600 rounded"></div>
                <span className="text-muted-foreground">Äang xem</span>
              </div>
            </div>
            
            {/* POI types */}
            <div className="border-t border-border pt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Loáº¡i Ä‘á»‹a Ä‘iá»ƒm (POI)</p>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#dc2626' }}></div>
                  <span>Y táº¿</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#4f46e5' }}></div>
                  <span>GiÃ¡o dá»¥c</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#059669' }}></div>
                  <span>NgÃ¢n hÃ ng</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ea580c' }}></div>
                  <span>Mua sáº¯m</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#d97706' }}></div>
                  <span>áº¨m thá»±c</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#475569' }}></div>
                  <span>CÆ¡ quan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#0891b2' }}></div>
                  <span>Váº­n táº£i</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#7c3aed' }}></div>
                  <span>Du lá»‹ch</span>
                </div>
              </div>
            </div>
            
            {/* Traffic Legend */}
            {layerVisibility.traffic && (
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">TÃ¬nh tráº¡ng giao thÃ´ng</p>
                <div className="space-y-1 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-1.5 rounded" style={{ backgroundColor: '#00E400' }}></div>
                    <span>ThÃ´ng thoÃ¡ng</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-1.5 rounded" style={{ backgroundColor: '#FFFF00' }}></div>
                    <span>Nháº¹</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-1.5 rounded" style={{ backgroundColor: '#FF7E00' }}></div>
                    <span>Trung bÃ¬nh</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-1.5 rounded" style={{ backgroundColor: '#FF0000' }}></div>
                    <span>ÄÃ´ng Ä‘Ãºc</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-1.5 rounded" style={{ backgroundColor: '#7E0023' }}></div>
                    <span>Táº¯c ngháº½n</span>
                  </div>
                </div>
              </div>
            )}

            {/* Camera Legend */}
            {layerVisibility.cameras && (
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
                  <Camera className="w-3 h-3 text-green-500" />
                  <span className="text-green-600">Camera giao thÃ´ng ({TRAFFIC_CAMERAS.length})</span>
                </p>
                <div className="space-y-1 text-[10px]">
                  {TRAFFIC_CAMERAS.map((cam) => (
                    <div key={cam.id} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                      <span className="truncate">{cam.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-muted-foreground mt-2 italic">
                  Click vÃ o marker Ä‘á»ƒ xem video
                </p>
              </div>
            )}

            {/* Reports Legend */}
            {layerVisibility.reports && citizenReports.length > 0 && (
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  <span className="text-amber-600">Pháº£n Ã¡nh tá»« dÃ¢n ({citizenReports.length})</span>
                </p>
                <div className="space-y-1 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#fbbf24' }}></div>
                    <span>Chá» xá»­ lÃ½</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
                    <span>Äang xá»­ lÃ½</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#22c55e' }}></div>
                    <span>ÄÃ£ xá»­ lÃ½</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
                    <span>Tá»« chá»‘i</span>
                  </div>
                </div>
                <p className="text-[9px] text-muted-foreground mt-2 italic">
                  Click vÃ o marker Ä‘á»ƒ xem chi tiáº¿t
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden relative">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
                <p className="text-muted-foreground">Äang táº£i báº£n Ä‘á»“...</p>
              </div>
            </div>
          ) : mounted ? (
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
              ref={mapRef}
            >
              {/* Map Controller for programmatic view changes */}
              <MapController 
                center={mapCenter} 
                zoom={mapZoom} 
                bounds={mapBounds}
              />
              
              {/* Base Map Layer */}
              <TileLayer
                attribution={MAP_LAYERS[activeMapLayer].attribution}
                url={MAP_LAYERS[activeMapLayer].url}
              />
              
              {/* Labels layer for satellite view */}
              {activeMapLayer === 'satellite' && (
                <TileLayer
                  url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://stamen.com">Stamen Design</a>'
                  opacity={0.8}
                />
              )}
              
              {/* Traffic Flow Layer from TomTom */}
              {layerVisibility.traffic && TOMTOM_TRAFFIC_LAYER.url && (
                <TileLayer
                  url={TOMTOM_TRAFFIC_LAYER.url}
                  attribution={TOMTOM_TRAFFIC_LAYER.attribution}
                  opacity={0.7}
                  zIndex={100}
                />
              )}
              
              {/* Hanoi Boundary */}
              {layerVisibility.boundaries && hanoiBoundary && (
                <GeoJSON
                  key="hanoi-boundary"
                  data={hanoiBoundary as any}
                  style={boundaryStyle}
                  onEachFeature={onEachBoundary}
                />
              )}
              
              {/* District Boundaries */}
              {layerVisibility.districts && districtsGeoJSON && (
                <GeoJSON
                  key={geoJsonKey}
                  data={districtsGeoJSON as any}
                  style={getDistrictStyle}
                  onEachFeature={onEachDistrict}
                />
              )}
              
              {/* POI Markers */}
              {layerVisibility.pois && poiMarkers.map((poi) => {
                const config = getPOIConfig(poi.subcategory, poi.category);
                const subcategoryName = poi.subcategory ? (SUBCATEGORY_NAMES[poi.subcategory] || poi.subcategory) : poi.category;
                
                return (
                  <CircleMarker
                    key={poi.id}
                    center={[poi.location.lat, poi.location.lng]}
                    radius={8}
                    pathOptions={{
                      color: '#ffffff',
                      weight: 2,
                      fillColor: config.color,
                      fillOpacity: 0.95,
                    }}
                  >
                    <Popup>
                      <div className="min-w-[220px] max-w-[280px]">
                        {/* Header with emoji and name */}
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-2xl">{config.emoji}</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-base text-gray-900 leading-tight">{poi.name}</h4>
                            <p className="text-sm text-gray-600 mt-0.5">{subcategoryName}</p>
                          </div>
                        </div>
                        
                        {/* Details */}
                        <div className="space-y-1.5 text-sm border-t border-gray-100 pt-2 mt-2">
                          {poi.address && (
                            <div className="flex items-start gap-2">
                              <span className="text-gray-400 flex-shrink-0">ðŸ“</span>
                              <span className="text-gray-700">{poi.address}</span>
                            </div>
                          )}
                          {poi.phone && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">ðŸ“ž</span>
                              <a href={`tel:${poi.phone}`} className="text-blue-600 hover:underline">{poi.phone}</a>
                            </div>
                          )}
                          {poi.website && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">ðŸŒ</span>
                              <a 
                                href={poi.website.startsWith('http') ? poi.website : `https://${poi.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline truncate max-w-[180px]"
                              >
                                {poi.website.replace(/^https?:\/\//, '').split('/')[0]}
                              </a>
                            </div>
                          )}
                          {poi.opening_hours && (
                            <div className="flex items-start gap-2">
                              <span className="text-gray-400">ðŸ•</span>
                              <span className="text-gray-700">{poi.opening_hours}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Category badge */}
                        <div className="mt-3 pt-2 border-t border-gray-100">
                          <span 
                            className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: config.color }}
                          >
                            {config.name}
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              {/* Traffic Camera Markers */}
              {layerVisibility.cameras && TRAFFIC_CAMERAS.map((camera) => (
                <CameraMarkerWithPopup key={camera.id} camera={camera} />
              ))}

              {/* Citizen Report Markers */}
              {layerVisibility.reports && citizenReports.map((report) => (
                <ReportMarkerWithPopup key={report._id} report={report} />
              ))}
            </MapContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Äang khá»Ÿi táº¡o báº£n Ä‘á»“...</p>
            </div>
          )}

          {/* Map overlay info */}
          {activeBoundaryId && activeDetails && (
            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm z-[1000]">
              <p className="font-semibold">{activeDetails.boundary.name}</p>
              <p className="text-xs opacity-80">
                {activeDetails.boundary.area_km2.toFixed(2)} kmÂ² â€¢ {activeDetails.statistics.pois.total} POI
              </p>
            </div>
          )}

          {/* Reset View Button */}
          {(mapBounds || mapZoom !== DEFAULT_ZOOM) && (
            <button
              onClick={resetMapView}
              className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 shadow-lg px-3 py-2 rounded-lg text-sm font-medium z-[1000] hover:bg-green-50 dark:hover:bg-green-950/30 hover:text-green-600 hover:border-green-500 border border-transparent transition-all"
            >
              Xem toÃ n bá»™ HÃ  Ná»™i
            </button>
          )}
        </div>

        {/* Details Panel */}
        {showDetailsPanel && selectedBoundaryIds.length > 0 && (
          <div className="hidden lg:flex lg:flex-col w-96 flex-shrink-0 gap-4 overflow-y-auto">
            {/* Integrated Data Panel - Weather, AQI, Traffic + Infrastructure */}
            <IntegratedDataPanel 
              boundaryId={activeBoundaryId} 
              boundaryName={activeDetails?.boundary.name || ''} 
              boundaryDetails={activeDetails}
            />
          </div>
        )}
      </div>
    </div>
    </>
  );
}

