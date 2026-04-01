// Copyright (c) 2025 HQC System Contributors

// Licensed under the GNU General Public License v3.0 (GPL-3.0)

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { TOMTOM_API_KEY, isTomTomApiKeyConfigured, GEO_API_BASE_URL } from '../config/env';

// Sử dụng GEO_API_BASE_URL từ env.ts (đã normalize và đảm bảo HTTPS)
const API_BASE = GEO_API_BASE_URL;

// Ngã Tư Sở - Quận Thanh Xuân, Hà Nội
const NGA_TU_SO_COORDS: [number, number] = [21.003204, 105.819673];

// City configurations
const CITIES = {
  hanoi: {
    name: 'Hà Nội',
    center: NGA_TU_SO_COORDS,
    zoom: 13,
    locations: [
      { name: 'Cầu Chương Dương', coords: [21.0285, 105.8542] },
      { name: 'Ngã Tư Sở', coords: [21.003204, 105.819673] },
      { name: 'Kim Mã - Ba Đình', coords: [21.0323, 105.8193] },
      { name: 'Cầu Nhật Tân', coords: [21.0833, 105.8242] },
      { name: 'Láng Hạ', coords: [21.0170, 105.8103] },
      { name: 'Đại lộ Thăng Long', coords: [21.0523, 105.7843] },
      { name: 'Cầu Vĩnh Tuy', coords: [21.0094, 105.8750] },
      { name: 'Trần Duy Hưng', coords: [21.0084, 105.8156] },
    ],
    cameras: [
      // 3 camera gần Ngã Tư Sở (21.003204, 105.819673)
      { name: 'Nguyễn Xiển - Khuất Duy Tiến', coords: [21.003204, 105.819673] as [number, number] },
      { name: 'Khuất Duy Tiến - Nguyễn Xiển 1', coords: [21.0038, 105.8192] as [number, number] },
      { name: 'Khuất Duy Tiến - Nguyễn Xiển 2', coords: [21.0025, 105.8200] as [number, number] },
      { name: 'Phạm Văn Bạch - Viện Huyết Học', coords: [21.0833, 105.8242] as [number, number] },
    ],
  },
  hcm: {
    name: 'TP. Hồ Chí Minh',
    center: [10.7769, 106.7009] as [number, number],
    zoom: 13,
    locations: [
      { name: 'Cầu Sài Gòn', coords: [10.7769, 106.7009] },
      { name: 'Ngã Sáu Gò Vấp', coords: [10.8228, 106.6761] },
      { name: 'Cầu Phú Mỹ', coords: [10.7573, 106.7217] },
      { name: 'Ngã Ba Hòa Hưng', coords: [10.7922, 106.6825] },
      { name: 'Xa lộ Hà Nội', coords: [10.8447, 106.7703] },
      { name: 'Cầu Bình Triệu', coords: [10.8142, 106.7317] },
      { name: 'Võ Văn Kiệt', coords: [10.7507, 106.6794] },
      { name: 'Cộng Hòa - Hoàng Văn Thụ', coords: [10.7999, 106.6653] },
    ],
    cameras: [
      { name: 'Cầu Sài Gòn', coords: [10.7769, 106.7009] as [number, number] },
      { name: 'Ngã Sáu Gò Vấp', coords: [10.8228, 106.6761] as [number, number] },
      { name: 'Cầu Phú Mỹ', coords: [10.7573, 106.7217] as [number, number] },
      { name: 'Ngã Ba Hòa Hưng', coords: [10.7922, 106.6825] as [number, number] },
    ],
  },
};

const getBoundingBoxAroundPoint = (center: [number, number], radiusKm = 2) => {
  const [lat, lon] = center;
  const deltaLat = radiusKm / 111; // ≈ km per degree latitude
  const deltaLon = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  return {
    minLat: lat - deltaLat,
    maxLat: lat + deltaLat,
    minLon: lon - deltaLon,
    maxLon: lon + deltaLon,
  };
};

// Mapping camera names to video paths
// Video files đã được copy vào public/videos/ để Expo Web có thể serve
const CAMERA_VIDEO_MAP: Record<string, string> = {
  // Hà Nội cameras - mapping với tên file video thực tế
  'Nguyễn Xiển - Khuất Duy Tiến': '/videos/HNI_NT_KDT_Nguyễn Xiển-Khuất Duy Tiến.mp4',
  'Khuất Duy Tiến - Nguyễn Xiển 1': '/videos/HNI_NT_KDT_Khuất Duy Tiến - Nguyễn Xiển 1.mp4',
  'Khuất Duy Tiến - Nguyễn Xiển 2': '/videos/HNI_NT_KDT_Khuất Duy Tiến - Nguyễn Xiển 2.mp4',
  'Phạm Văn Bạch - Viện Huyết Học': '/videos/HNI_LLGT_Phạm Văn Bạch- Viện Huyết Học.mp4',
  // TP.HCM cameras (dùng chung video hoặc có thể thay bằng video riêng sau)
  'Cầu Sài Gòn': '/videos/HNI_NT_KDT_Khuất Duy Tiến - Nguyễn Xiển 1.mp4',
  'Ngã Sáu Gò Vấp': '/videos/HNI_LLGT_Phạm Văn Bạch- Viện Huyết Học.mp4',
  'Cầu Phú Mỹ': '/videos/HNI_NT_KDT_Nguyễn Xiển-Khuất Duy Tiến.mp4',
  'Ngã Ba Hòa Hưng': '/videos/HNI_NT_KDT_Khuất Duy Tiến - Nguyễn Xiển 2.mp4',
};

// Helper function to get video path for a camera
// Encode URL để xử lý tên file có dấu và khoảng trắng
const getCameraVideoPath = (cameraName: string): string => {
  const basePath = CAMERA_VIDEO_MAP[cameraName] || '/videos/HNI_NT_KDT_Khuất Duy Tiến - Nguyễn Xiển 1.mp4';
  // Encode từng phần của đường dẫn, đặc biệt là tên file
  const parts = basePath.split('/');
  const fileName = parts[parts.length - 1];
  const dirPath = parts.slice(0, -1).join('/');
  // Encode fileName để xử lý dấu và khoảng trắng
  const encodedFileName = encodeURIComponent(fileName);
  return `${dirPath}/${encodedFileName}`;
};

type TrafficFlow = {
  currentSpeed: number;
  freeFlowSpeed: number;
  currentTravelTime: number;
  freeFlowTravelTime: number;
  confidence: number;
  coordinates: Array<[number, number]>;
};

type Incident = {
  id: string;
  coordinate: [number, number];
  iconCategory: number;
  description: string;
  magnitudeOfDelay?: number;
};

type SelectedBuilding = {
  name: string;
  type: string;
  height?: number;
  address?: string;
  center?: [number, number];
};

const translateBuildingType = (raw?: string): string => {
  if (!raw) return 'Chưa rõ';
  const t = raw.toLowerCase();
  switch (t) {
    case 'university':
    case 'school':
    case 'college':
      return 'Trường học';
    case 'hospital':
    case 'clinic':
      return 'Bệnh viện / Phòng khám';
    case 'stadium':
      return 'Sân vận động';
    case 'sports_centre':
    case 'sport':
      return 'Trung tâm thể thao';
    case 'retail':
    case 'commercial':
    case 'shop':
    case 'supermarket':
    case 'mall':
      return 'Thương mại / Bán lẻ';
    case 'office':
    case 'public':
    case 'government':
    case 'civic':
      return 'Văn phòng / Cơ quan';
    case 'residential':
    case 'apartments':
    case 'house':
      return 'Khu dân cư';
    case 'hotel':
    case 'motel':
    case 'guest_house':
      return 'Lưu trú';
    case 'industrial':
    case 'factory':
    case 'warehouse':
      return 'Công nghiệp / Kho xưởng';
    case 'parking':
      return 'Bãi đỗ xe';
    case 'library':
      return 'Thư viện';
    case 'church':
    case 'temple':
    case 'mosque':
    case 'pagoda':
      return 'Cơ sở tôn giáo';
    case 'yes':
      return 'Tòa nhà';
    default:
      return raw;
  }
};

type Stats = {
  incidents: number;
  avgSpeed: number;
  congestionPoints: number;
  flowPoints: number;
  avgSpeedPercent: number;
  density: number;
};

const MapScreen: React.FC = () => {
  const [currentCity, setCurrentCity] = useState<'hanoi' | 'hcm'>('hanoi');
  const [showTrafficLayer, setShowTrafficLayer] = useState(false);
  const [showIncidentsLayer, setShowIncidentsLayer] = useState(false);
  const [showCameraLayer, setShowCameraLayer] = useState(false);
  const [showBuildingLayer, setShowBuildingLayer] = useState(false);
  const [showPoiLayer, setShowPoiLayer] = useState(false);
  const [buildingGeojson, setBuildingGeojson] = useState<any | null>(null);
  const [poiGeojson, setPoiGeojson] = useState<any | null>(null);
  const POI_FILTERS: Array<{ key: string; label: string }> = [
    { key: 'atm', label: 'ATM' },
    { key: 'bank', label: 'Ngân hàng' },
    { key: 'restaurant', label: 'Nhà hàng/Quán ăn' },
    { key: 'cafe', label: 'Quán cafe' },
    { key: 'pharmacy', label: 'Hiệu thuốc' },
    { key: 'hospital', label: 'Bệnh viện/Phòng khám' },
    { key: 'supermarket', label: 'Siêu thị' },
    { key: 'mall', label: 'Trung tâm thương mại' },
    { key: 'shop', label: 'Cửa hàng' },
    { key: 'hotel', label: 'Khách sạn' },
    { key: 'attraction', label: 'Điểm tham quan' },
    { key: 'park', label: 'Công viên' },
  ];
  const [poiCategoryFilter, setPoiCategoryFilter] = useState<string | null>(null);
  const [showLayerDropdown, setShowLayerDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<{
    name: string;
    coordinate: [number, number];
    stats: { avgSpeed: number; density: number };
  } | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<SelectedBuilding | null>(null);
  const isChangingCameraRef = useRef(false); // Flag để track khi đang chuyển camera

  const [trafficFlows, setTrafficFlows] = useState<TrafficFlow[]>([]); // Flows từ layer giao thông (bán kính 2km)
  const [routeFlows, setRouteFlows] = useState<TrafficFlow[]>([]); // Flows từ route (chọn điểm đến)
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [clickMarkers, setClickMarkers] = useState<
    Array<{ id: string; coordinate: [number, number] }>
  >([]);
  const [stats, setStats] = useState<Stats>({
    incidents: 0,
    avgSpeed: 0,
    congestionPoints: 0,
    flowPoints: 0,
    avgSpeedPercent: 0,
    density: 0,
  });

  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isFetchingRef = useRef(false); // Để tránh fetch liên tục
  const layerDropdownButtonRef = useRef<any>(null);
  const layerDropdownMenuRef = useRef<any>(null);
  const cityDropdownButtonRef = useRef<any>(null);
  const cityDropdownMenuRef = useRef<any>(null);
  const buildingCacheRef = useRef<Record<string, any>>({});
  const poiCacheRef = useRef<Record<string, any>>({});
  const [layerDropdownPosition, setLayerDropdownPosition] = useState({ top: 82, left: 150 });
  const [cityDropdownPosition, setCityDropdownPosition] = useState({ top: 82, left: 12 });
  // Set default location ngay từ đầu để icon hiển thị luôn
  // Ngã Tư Sở - Quận Thanh Xuân, Hà Nội
  const defaultLocation: [number, number] = NGA_TU_SO_COORDS;
  const [userLocation, setUserLocation] = useState<[number, number] | null>(defaultLocation);
  const [destination, setDestination] = useState<[number, number] | null>(null); // Điểm đến được chọn
  const [isSelectingDestination, setIsSelectingDestination] = useState(false); // Đang ở chế độ chọn điểm đến
  const [routeCoordinates, setRouteCoordinates] = useState<Array<[number, number]>>([]); // Tọa độ route từ userLocation đến destination
  const [quotaExhausted, setQuotaExhausted] = useState(false); // Track API quota exhaustion

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;

      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        if (mapContainerRef.current && (window as any).L) {
          const L = (window as any).L;
          const city = CITIES[currentCity];

          // Initialize map
          mapRef.current = L.map(mapContainerRef.current, {
            center: city.center,
            zoom: city.zoom,
            zoomControl: false, // We'll add custom controls
          });

          // Add CartoDB Positron tiles (minimalist, beautiful)
          L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            {
              maxZoom: 19,
              attribution:
                '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
            }
          ).addTo(mapRef.current);

          // Add custom zoom controls
          const zoomControl = L.control.zoom({
            position: 'topright',
          });
          zoomControl.addTo(mapRef.current);
          
          // Trigger initial render after map is ready
          // Đợi một chút để đảm bảo userLocation đã được set
          setTimeout(() => {
            if (mapRef.current && (window as any).L) {
              console.log('Map initialized, triggering initial render');
              renderLayers();
            }
          }, 300);
        }
      };
      document.body.appendChild(script);
    };

    loadLeaflet();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  // Location is now fixed to default location - no geolocation needed
  // userLocation is already set to defaultLocation in useState initialization

  // Update map when city changes
  useEffect(() => {
    if (mapRef.current) {
      const city = CITIES[currentCity];
      mapRef.current.setView(city.center, city.zoom);
    }
  }, [currentCity]);

  // Add map click handler and moveend handler after map is initialized
  useEffect(() => {
    if (mapRef.current && (window as any).L) {
      // Remove existing handlers if any
      mapRef.current.off('click');
      mapRef.current.off('moveend');
      mapRef.current.off('mousedown');
      mapRef.current.off('mousemove');
      
      // Track mouse down để phân biệt click và drag
      let mouseDownTime = 0;
      let hasMoved = false;
      
      mapRef.current.on('mousedown', () => {
        mouseDownTime = Date.now();
        hasMoved = false;
      });
      
      mapRef.current.on('mousemove', () => {
        if (mouseDownTime > 0) {
          hasMoved = true;
        }
      });
      
      // Add click handler - chỉ xử lý nếu không phải drag
      mapRef.current.on('click', (e: any) => {
        const timeDiff = Date.now() - mouseDownTime;
        // Nếu đã di chuyển hoặc thời gian quá lâu (>500ms) thì coi là drag
        if (hasMoved || timeDiff > 500) {
          mouseDownTime = 0;
          hasMoved = false;
          return;
        }
        
        mouseDownTime = 0;
        hasMoved = false;
        handleMapClick(e);
      });
      
      // Không dùng moveend nữa, dùng click để chọn điểm đến chính xác hơn
      
      console.log('Map handlers registered');
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
        mapRef.current.off('moveend');
        mapRef.current.off('mousedown');
        mapRef.current.off('mousemove');
      }
    };
  }, [userLocation, isSelectingDestination]); // Re-add handler when states change

  // Xóa auto-refresh - không cần nữa

  // Đóng city dropdown khi click ra ngoài
  useEffect(() => {
    if (!showCityDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      const hasDropdownAttr = target.hasAttribute('data-city-dropdown') || 
                              target.hasAttribute('data-city-dropdown-item');
      
      if (hasDropdownAttr) return;

      const clickedDropdown = target.closest && target.closest('[data-city-dropdown="true"]');
      const clickedItem = target.closest && target.closest('[data-city-dropdown-item="true"]');
      
      if (clickedDropdown || clickedItem) return;

      let menuElement: HTMLElement | null = null;
      let buttonElement: HTMLElement | null = null;

      if (cityDropdownMenuRef.current) {
        const node = (cityDropdownMenuRef.current as any)._nativeNode || 
                     (cityDropdownMenuRef.current as any).base;
        if (node && node.contains) {
          menuElement = node;
        }
      }

      if (cityDropdownButtonRef.current) {
        const node = (cityDropdownButtonRef.current as any)._nativeNode || 
                     (cityDropdownButtonRef.current as any).base;
        if (node && node.contains) {
          buttonElement = node;
        }
      }

      const isInsideMenu = menuElement && menuElement.contains(target);
      const isInsideButton = buttonElement && buttonElement.contains(target);
      
      if (isInsideMenu || isInsideButton) return;
      
      setShowCityDropdown(false);
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 150);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showCityDropdown]);

  // Đóng layer dropdown khi click ra ngoài (nhưng không đóng khi click vào item bên trong)
  useEffect(() => {
    if (!showLayerDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      // Kiểm tra bằng data attributes trước (nhanh hơn)
      const hasDropdownAttr = target.hasAttribute('data-layer-dropdown') || 
                              target.hasAttribute('data-layer-dropdown-item') ||
                              target.hasAttribute('data-layer-dropdown-button');
      
      if (hasDropdownAttr) {
        console.log('Click inside dropdown (by attr), keeping open');
        return;
      }

      // Kiểm tra bằng closest (cho các element con như Text, Icon)
      const clickedDropdown = target.closest && target.closest('[data-layer-dropdown="true"]');
      const clickedItem = target.closest && target.closest('[data-layer-dropdown-item="true"]');
      const clickedButton = target.closest && target.closest('[data-layer-dropdown-button="true"]');
      
      if (clickedDropdown || clickedItem || clickedButton) {
        console.log('Click inside dropdown (by closest), keeping open');
        return;
      }

      // Kiểm tra bằng ref (fallback)
      let menuElement: HTMLElement | null = null;
      let buttonElement: HTMLElement | null = null;

      if (layerDropdownMenuRef.current) {
        // @ts-ignore - React Native Web exposes _nativeNode or base
        const node = (layerDropdownMenuRef.current as any)._nativeNode || 
                     (layerDropdownMenuRef.current as any).base;
        if (node && node.contains) {
          menuElement = node;
        }
      }

      if (layerDropdownButtonRef.current) {
        // @ts-ignore - React Native Web exposes _nativeNode or base
        const node = (layerDropdownButtonRef.current as any)._nativeNode || 
                     (layerDropdownButtonRef.current as any).base;
        if (node && node.contains) {
          buttonElement = node;
        }
      }

      const isInsideMenu = menuElement && menuElement.contains(target);
      const isInsideButton = buttonElement && buttonElement.contains(target);
      
      if (isInsideMenu || isInsideButton) {
        console.log('Click inside dropdown (by ref), keeping open');
        return;
      }
      
      console.log('Click outside dropdown, closing', { 
        target: target.tagName, 
        targetClass: target.className?.substring(0, 50),
        hasAttr: hasDropdownAttr,
        hasClosest: !!(clickedDropdown || clickedItem || clickedButton)
      });
      // Nếu click ra ngoài, đóng dropdown
      setShowLayerDropdown(false);
    };

    // Dùng click event với bubble phase (sau khi onPress/onClick đã xử lý)
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 150);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showLayerDropdown]);

  const showStatus = (message: string, duration = 2000) => {
    // Chỉ hiện thông báo khi không đang fetch
    if (!isFetchingRef.current || message.includes('✅') || message.includes('❌')) {
      setStatusMessage(message);
      if (duration > 0) {
        setTimeout(() => setStatusMessage(''), duration);
      }
    }
  };

  const handleBack = () => {
    navigation.navigate('Explore');
  };

  const handleCityChange = (city: 'hanoi' | 'hcm') => {
    setCurrentCity(city);
    if (mapRef.current) {
      const cityData = CITIES[city];
      mapRef.current.setView(cityData.center, cityData.zoom);
    }
    // Nếu incidents layer đang bật, fetch lại data
    if (showIncidentsLayer) {
      fetchAllData();
    }
  };

  const getTrafficColor = (current: number, freeFlow: number): string => {
    const ratio = current / freeFlow;
    if (ratio > 0.8) return '#2ecc71'; // Green
    if (ratio > 0.6) return '#f1c40f'; // Yellow
    if (ratio > 0.4) return '#e67e22'; // Orange
    return '#e74c3c'; // Red
  };

  const getIncidentIcon = (category: number): string => {
    const icons: Record<number, string> = {
      0: '⚠️',
      1: '🚗',
      2: '🌫️',
      3: '⚠️',
      4: '🌧️',
      5: '🧊',
      6: '🚧',
      7: '🚦',
      8: '🚫',
      9: '🚧',
      10: '🌪️',
      11: '🚗💥',
      14: '⛔',
    };
    return icons[category] || '⚠️';
  };

const getPoiIcon = (category?: string, subcategory?: string): string => {
    const key = `${category || ''}:${subcategory || ''}`.toLowerCase();
    const map: Record<string, string> = {
      'amenity:restaurant': '🍽️',
      'amenity:cafe': '☕',
      'amenity:bank': '🏦',
      'amenity:school': '🏫',
      'amenity:hospital': '🏥',
      'amenity:pharmacy': '💊',
      'shop:supermarket': '🛒',
      'shop:mall': '🏬',
      'tourism:hotel': '🏨',
      'tourism:attraction': '📍',
      'leisure:park': '🌳',
    };
    return map[key] || map[`${category || ''}:`] || '📍';
  };

  const translatePoiType = (category?: string, subcategory?: string): string => {
    const c = category?.toLowerCase();
    const s = subcategory?.toLowerCase();
    if (c === 'amenity') {
      if (s === 'atm') return 'ATM';
      if (s === 'bank') return 'Ngân hàng';
      if (s === 'restaurant') return 'Nhà hàng / Quán ăn';
      if (s === 'cafe') return 'Quán cafe';
      if (s === 'pharmacy') return 'Hiệu thuốc';
      if (s === 'hospital') return 'Bệnh viện';
      if (s === 'clinic') return 'Phòng khám';
      return 'Tiện ích';
    }
    if (c === 'shop') {
      if (s === 'supermarket') return 'Siêu thị';
      if (s === 'mall') return 'Trung tâm thương mại';
      return 'Cửa hàng';
    }
    if (c === 'tourism') {
      if (s === 'hotel') return 'Khách sạn';
      if (s === 'attraction') return 'Điểm tham quan';
      return 'Du lịch';
    }
    if (c === 'leisure') {
      if (s === 'park') return 'Công viên';
      return 'Giải trí';
    }
    return s || c || 'POI';
  };

  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  // No search bar -> resolvePoiFilter not used

  const translateCategory = (category: number): string => {
    const translations: Record<number, string> = {
      0: 'Không xác định',
      1: 'Tai nạn giao thông',
      2: 'Sương mù',
      3: 'Điều kiện nguy hiểm',
      4: 'Mưa',
      5: 'Băng giá',
      6: 'Sự cố',
      7: 'Làn đường đóng',
      8: 'Đường đóng',
      9: 'Sửa chữa đường',
      10: 'Gió mạnh',
      11: 'Kẹt xe',
      14: 'Xe hỏng',
    };
    return translations[category] || `Loại ${category}`;
  };

  const fetchTrafficFlow = async (
    lat: number,
    lon: number
  ): Promise<TrafficFlow | null> => {
    try {
      const url = new URL(
        'https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json'
      );
      url.searchParams.set('point', `${lat},${lon}`);
      url.searchParams.set('unit', 'KMPH');
      url.searchParams.set('key', TOMTOM_API_KEY);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Traffic API error ${res.status}`);

      const data = await res.json();
      const flow = data.flowSegmentData;
      const coords = flow.coordinates?.coordinate ?? [];

      if (Array.isArray(coords) && coords.length > 1) {
        const coordinates = coords
          .filter(
            (c: any) =>
              typeof c.latitude === 'number' &&
              typeof c.longitude === 'number'
          )
          .map((c: any) => [c.latitude, c.longitude] as [number, number]);

        return {
          currentSpeed: flow.currentSpeed,
          freeFlowSpeed: flow.freeFlowSpeed,
          currentTravelTime: flow.currentTravelTime,
          freeFlowTravelTime: flow.freeFlowTravelTime,
          confidence: flow.confidence,
          coordinates,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching traffic flow:', error);
      return null;
    }
  };

  // Tạo grid các điểm trong bán kính 1km
  const generatePointsInRadius = (centerLat: number, centerLon: number, radiusKm: number = 1): Array<[number, number]> => {
    const points: Array<[number, number]> = [];
    // Khoảng cách giữa các điểm (mét)
    const gridSpacing = 250; // 250m giữa các điểm
    const radiusM = radiusKm * 1000;
    
    // Tính số điểm theo grid
    const numPoints = Math.ceil((radiusM * 2) / gridSpacing);
    const startOffset = -(numPoints * gridSpacing) / 2;
    
    // Chuyển đổi mét sang độ (xấp xỉ)
    // 1 độ latitude ≈ 111km
    // 1 độ longitude ≈ 111km * cos(latitude)
    const latOffset = gridSpacing / 111000;
    const lonOffset = gridSpacing / (111000 * Math.cos(centerLat * Math.PI / 180));
    
    for (let i = 0; i < numPoints; i++) {
      for (let j = 0; j < numPoints; j++) {
        const lat = centerLat + (startOffset + i * gridSpacing) / 111000;
        const lon = centerLon + (startOffset + j * gridSpacing) / (111000 * Math.cos(centerLat * Math.PI / 180));
        
        // Kiểm tra xem điểm có trong bán kính không
        const distance = Math.sqrt(
          Math.pow((lat - centerLat) * 111000, 2) +
          Math.pow((lon - centerLon) * 111000 * Math.cos(centerLat * Math.PI / 180), 2)
        );
        
        if (distance <= radiusM) {
          points.push([lat, lon]);
        }
      }
    }
    
    return points;
  };

  // Fetch traffic flows trong bán kính 2km
  const fetchTrafficFlowsInRadius = async (centerLat: number, centerLon: number): Promise<TrafficFlow[]> => {
    console.log('🔄 [TRAFFIC] Fetching traffic flows in 2km radius around:', { centerLat, centerLon });
    
    const points = generatePointsInRadius(centerLat, centerLon, 2);
    console.log(`🔄 [TRAFFIC] Generated ${points.length} points to fetch`);
    
    // Fetch tất cả các điểm song song, nhưng giới hạn số lượng để tránh quá tải
    const maxConcurrent = 10; // Giới hạn 10 request đồng thời
    const flows: TrafficFlow[] = [];
    
    for (let i = 0; i < points.length; i += maxConcurrent) {
      const batch = points.slice(i, i + maxConcurrent);
      const batchPromises = batch.map(point => fetchTrafficFlow(point[0], point[1]));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        const validFlows = batchResults.filter((flow): flow is TrafficFlow => flow !== null);
        flows.push(...validFlows);
        console.log(`🔄 [TRAFFIC] Fetched batch ${Math.floor(i / maxConcurrent) + 1}, got ${validFlows.length} valid flows`);
      } catch (error) {
        console.error(`❌ [TRAFFIC] Error fetching batch ${Math.floor(i / maxConcurrent) + 1}:`, error);
      }
      
      // Thêm delay nhỏ giữa các batch để tránh rate limit
      if (i + maxConcurrent < points.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`✅ [TRAFFIC] Total flows fetched: ${flows.length}`);
    return flows;
  };

  const fetchIncidents = async (): Promise<Incident[]> => {
    try {
      const city = CITIES[currentCity];
      const [lat, lon] = city.center;
      const delta = 0.1;
      const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;

      const url = new URL(
        'https://api.tomtom.com/traffic/services/5/incidentDetails'
      );
      url.searchParams.set('key', TOMTOM_API_KEY);
      url.searchParams.set('bbox', bbox);
      url.searchParams.set(
        'fields',
        '{incidents{type,geometry{type,coordinates},properties{id,iconCategory,magnitudeOfDelay,events{description,code,iconCategory},startTime,endTime}}}'
      );
      url.searchParams.set('categoryFilter', '0,1,2,3,4,5,6,7,8,9,10,11,14');
      url.searchParams.set('timeValidityFilter', 'present');
      url.searchParams.set('language', 'en-GB');

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Incidents API error ${res.status}`);

      const data = await res.json();
      if (!data.incidents) return [];

      return data.incidents.map((incident: any) => {
        const props = incident.properties;
        const geom = incident.geometry;
        let coords: [number, number] = [0, 0];

        if (geom.type === 'Point') {
          coords = [geom.coordinates[1], geom.coordinates[0]];
        } else if (
          geom.type === 'LineString' ||
          geom.type === 'MultiLineString'
        ) {
          const allCoords =
            geom.type === 'LineString'
              ? geom.coordinates
              : geom.coordinates[0];
          coords = [allCoords[0][1], allCoords[0][0]];
        }

        const event = props.events && props.events[0];
        const description = event
          ? event.description || 'Sự cố giao thông'
          : 'Sự cố giao thông';

        return {
          id: props.id,
          coordinate: coords,
          iconCategory: props.iconCategory,
          description,
          magnitudeOfDelay: props.magnitudeOfDelay,
        };
      });
    } catch (error) {
      console.error('Error fetching incidents:', error);
      return [];
    }
  };

  const fetchBuildingsGeojson = async (cityKey: string) => {
    const cached = buildingCacheRef.current[cityKey];
    if (cached) {
      setBuildingGeojson(cached);
      return;
    }

    setLoading(true);
    showStatus('🔄 Đang tải bản đồ tòa nhà...');

    try {
      const url = `${API_BASE}/geographic/buildings/geojson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Buildings API error ${res.status}`);
      const data = await res.json();
      buildingCacheRef.current[cityKey] = data;
      setBuildingGeojson(data);
      const count = Array.isArray(data?.features) ? data.features.length : 0;
      showStatus(`✅ Đã tải ${count} tòa nhà`, 2000);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      showStatus('❌ Lỗi khi tải tòa nhà', 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchPoisGeojson = async (cityKey: string) => {
    const cached = poiCacheRef.current[cityKey];
    if (cached) {
      setPoiGeojson(cached);
      return;
    }

    setLoading(true);
    showStatus('🔄 Đang tải POI (điểm quan tâm)...');

    try {
      // Lấy POI trong bán kính ~2km quanh userLocation (hoặc center city nếu chưa có)
      const center = userLocation || (CITIES as any)[cityKey].center;
      const bbox = getBoundingBoxAroundPoint(center, 2);
      const bboxParam = `${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}`;
      const params = new URLSearchParams();
      params.set('limit', '300');
      params.set('bbox', bboxParam);
      // Map filter term to category/subcategory when có
      const filterMap: Record<string, { category: string; subcategory?: string }> = {
        atm: { category: 'amenity', subcategory: 'atm' },
        bank: { category: 'amenity', subcategory: 'bank' },
        restaurant: { category: 'amenity', subcategory: 'restaurant' },
        cafe: { category: 'amenity', subcategory: 'cafe' },
        pharmacy: { category: 'amenity', subcategory: 'pharmacy' },
        hospital: { category: 'amenity', subcategory: 'hospital' },
        clinic: { category: 'amenity', subcategory: 'clinic' },
        supermarket: { category: 'shop', subcategory: 'supermarket' },
        mall: { category: 'shop', subcategory: 'mall' },
        shop: { category: 'shop' },
        hotel: { category: 'tourism', subcategory: 'hotel' },
        attraction: { category: 'tourism', subcategory: 'attraction' },
        park: { category: 'leisure', subcategory: 'park' },
      };
      if (poiCategoryFilter && filterMap[poiCategoryFilter]) {
        const f = filterMap[poiCategoryFilter];
        params.set('category', f.category);
        if (f.subcategory) params.set('subcategory', f.subcategory);
      }

      const url = `${API_BASE}/geographic/pois/geojson?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`POIs API error ${res.status}`);
      const data = await res.json();
      poiCacheRef.current[cityKey] = data;
      setPoiGeojson(data);
      const count = Array.isArray(data?.features) ? data.features.length : 0;
      showStatus(`Đã tải ${count} điểm POI`, 2000);
    } catch (error) {
      console.error('Error fetching POIs:', error);
      showStatus('Lỗi khi tải POI', 2000);
    } finally {
      setLoading(false);
    }
  };

  const renderLayers = () => {
    if (!mapRef.current || !(window as any).L) {
      console.log('Cannot render layers: map not ready', { 
        hasMapRef: !!mapRef.current, 
        hasL: !!(window as any).L 
      });
      return;
    }

    const L = (window as any).L;
    console.log('Rendering layers, userLocation:', userLocation);

    // Clear existing layers
    if ((mapRef.current as any)._trafficLayers) {
      (mapRef.current as any)._trafficLayers.forEach((layer: any) => {
        if (mapRef.current && mapRef.current.hasLayer(layer)) {
          mapRef.current.removeLayer(layer);
        }
      });
      (mapRef.current as any)._trafficLayers = [];
    }
    if ((mapRef.current as any)._routeLayer) {
      if (mapRef.current && mapRef.current.hasLayer((mapRef.current as any)._routeLayer)) {
        mapRef.current.removeLayer((mapRef.current as any)._routeLayer);
      }
      (mapRef.current as any)._routeLayer = null;
    }
    if ((mapRef.current as any)._incidentLayers) {
      (mapRef.current as any)._incidentLayers.forEach((layer: any) => {
        if (mapRef.current && mapRef.current.hasLayer(layer)) {
          mapRef.current.removeLayer(layer);
        }
      });
      (mapRef.current as any)._incidentLayers = [];
    }
    // KHÔNG clear user location marker - nó luôn hiển thị
    if ((mapRef.current as any)._clickLayers) {
      (mapRef.current as any)._clickLayers.forEach((layer: any) => {
        // Bỏ qua user location marker khi clear
        if (layer !== (mapRef.current as any)._userLocationMarker) {
        if (mapRef.current && mapRef.current.hasLayer(layer)) {
          mapRef.current.removeLayer(layer);
          }
        }
      });
      (mapRef.current as any)._clickLayers = [];
    }
    if ((mapRef.current as any)._cameraLayers) {
      (mapRef.current as any)._cameraLayers.forEach((layer: any) => {
        if (mapRef.current && mapRef.current.hasLayer(layer)) {
          mapRef.current.removeLayer(layer);
        }
      });
      (mapRef.current as any)._cameraLayers = [];
    }
    if ((mapRef.current as any)._buildingLayers) {
      (mapRef.current as any)._buildingLayers.forEach((layer: any) => {
        if (mapRef.current && mapRef.current.hasLayer(layer)) {
          mapRef.current.removeLayer(layer);
        }
      });
      (mapRef.current as any)._buildingLayers = [];
    }
    if ((mapRef.current as any)._boundaryLayers) {
      (mapRef.current as any)._boundaryLayers.forEach((layer: any) => {
        if (mapRef.current && mapRef.current.hasLayer(layer)) {
          mapRef.current.removeLayer(layer);
        }
      });
      (mapRef.current as any)._boundaryLayers = [];
    }
    if ((mapRef.current as any)._poiLayers) {
      (mapRef.current as any)._poiLayers.forEach((layer: any) => {
        if (mapRef.current && mapRef.current.hasLayer(layer)) {
          mapRef.current.removeLayer(layer);
        }
      });
      (mapRef.current as any)._poiLayers = [];
    }

    const trafficLayers: any[] = [];
    const incidentLayers: any[] = [];
    const clickLayers: any[] = [];
    const cameraLayers: any[] = [];
    const buildingLayers: any[] = [];
    const poiLayers: any[] = [];

    // Vẽ route line trước để người dùng thấy route chính xác
    if (routeCoordinates.length >= 2) {
      const routeLine = L.polyline(routeCoordinates, {
        color: '#6366f1',
        weight: 4,
        opacity: 0.6,
        dashArray: '8, 4',
      }).addTo(mapRef.current);
      routeLine.bindPopup('🛣️ Tuyến đường');
      (mapRef.current as any)._routeLayer = routeLine;
    }

    // Render route flows (từ chọn điểm đến) - luôn hiển thị nếu có route
    if (routeFlows.length > 0) {
      routeFlows.forEach((flow, index) => {
        if (!flow.coordinates || flow.coordinates.length < 2) {
          return;
        }
        
        const color = getTrafficColor(flow.currentSpeed, flow.freeFlowSpeed);
        const polyline = L.polyline(flow.coordinates, {
          color,
          weight: 6,
          opacity: 0.9,
        }).addTo(mapRef.current);

        const ratio = flow.freeFlowSpeed > 0 ? flow.currentSpeed / flow.freeFlowSpeed : 0;
        const status = ratio > 0.8 ? '🟢 Thông thoáng' : 
                      ratio > 0.6 ? '🟡 Trung bình' : 
                      ratio > 0.4 ? '🟠 Chậm' : '🔴 Tắc nghẽn';
        
        const popupContent = `
          <div style="font-size: 0.9rem; min-width: 250px;">
            <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: #111827;">
              📊 Tuyến đường
            </div>
            <div style="margin-top: 0.5rem; color: #4a5e71;">
              <div style="margin: 0.3rem 0;"><strong>🚗 Tốc độ hiện tại:</strong> ${flow.currentSpeed} km/h</div>
              <div style="margin: 0.3rem 0;"><strong>⚡ Tốc độ tự do:</strong> ${flow.freeFlowSpeed} km/h</div>
              <div style="margin: 0.3rem 0;"><strong>⏱️ Thời gian:</strong> ${Math.round(flow.currentTravelTime / 60)} phút</div>
              <div style="margin: 0.3rem 0;"><strong>📈 Trạng thái:</strong> ${status}</div>
            </div>
          </div>
        `;
        
        polyline.bindPopup(popupContent);
        trafficLayers.push(polyline);
      });
    }

    // Render traffic flows từ layer (bán kính 2km) nếu layer đang bật
    if (showTrafficLayer && trafficFlows.length > 0) {
      trafficFlows.forEach((flow, index) => {
        if (!flow.coordinates || flow.coordinates.length < 2) {
          return;
        }
        
        // Flow đầu tiên (background flow) có opacity thấp hơn và weight nhỏ hơn
        const isBackgroundFlow = index === 0 && flow.confidence < 0.3;
        const color = getTrafficColor(flow.currentSpeed, flow.freeFlowSpeed);
        const polyline = L.polyline(flow.coordinates, {
          color,
          weight: isBackgroundFlow ? 4 : 6,
          opacity: isBackgroundFlow ? 0.5 : 0.9, // Background flow mờ hơn
        }).addTo(mapRef.current);

        const ratio = flow.freeFlowSpeed > 0 ? flow.currentSpeed / flow.freeFlowSpeed : 0;
        const status = ratio > 0.8 ? '🟢 Thông thoáng' : 
                      ratio > 0.6 ? '🟡 Trung bình' : 
                      ratio > 0.4 ? '🟠 Chậm' : '🔴 Tắc nghẽn';
        
        const popupContent = `
          <div style="font-size: 0.9rem; min-width: 250px;">
            <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: #111827;">
              📊 Đoạn đường
            </div>
            <div style="margin-top: 0.5rem; color: #4a5e71;">
              <div style="margin: 0.3rem 0;"><strong>🚗 Tốc độ hiện tại:</strong> ${flow.currentSpeed} km/h</div>
              <div style="margin: 0.3rem 0;"><strong>✨ Tốc độ tự do:</strong> ${flow.freeFlowSpeed} km/h</div>
              <div style="margin: 0.3rem 0;"><strong>⏱️ Thời gian đi qua:</strong> ${flow.currentTravelTime}s (lý tưởng: ${flow.freeFlowTravelTime}s)</div>
              <div style="margin: 0.3rem 0;"><strong>📊 Mức tin cậy:</strong> ${Math.round(flow.confidence * 100)}%</div>
              <div style="margin: 0.3rem 0;"><strong>🚦 Trạng thái:</strong> ${status}</div>
            </div>
          </div>
        `;
        polyline.bindPopup(popupContent);
        polyline.on('click', () => {
          polyline.openPopup();
        });
        trafficLayers.push(polyline);
      });
    }

    // Render incidents
    if (showIncidentsLayer) {
      incidents.forEach((incident) => {
        const icon = getIncidentIcon(incident.iconCategory);
        const marker = L.marker(incident.coordinate, {
          icon: L.divIcon({
            className: 'incident-marker',
            html: `<div style="background: white; border: 3px solid #e74c3c; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${icon}</div>`,
            iconSize: [32, 32],
          }),
        }).addTo(mapRef.current);

        // Xác định loại incident để hiển thị thông tin delay phù hợp
        const isRoadClosure = incident.iconCategory === 7 || incident.iconCategory === 8; // Làn đường đóng hoặc Đường đóng
        let delayText = '';
        
        if (incident.magnitudeOfDelay) {
          if (isRoadClosure) {
            // Đối với đường đóng/cấm: magnitudeOfDelay là thời gian đường bị cấm (không được đi)
            delayText = `<div style="margin-top: 0.5rem; padding: 0.5rem; background: #f8d7da; border-left: 3px solid #dc3545; border-radius: 4px;">
                          <strong>🚫 Đường bị cấm:</strong> ${incident.magnitudeOfDelay} phút<br>
                          <small style="color: #721c24;">Đường này bị cấm trong ${incident.magnitudeOfDelay} phút. Vui lòng chọn tuyến đường khác.</small>
                        </div>`;
          } else {
            // Đối với các loại khác (tai nạn, kẹt xe, v.v.): delay là thời gian chậm thêm khi đi qua
            delayText = `<div style="margin-top: 0.5rem; padding: 0.5rem; background: #fff3cd; border-left: 3px solid #ffc107; border-radius: 4px;">
                          <strong>⏱️ Thời gian chậm thêm:</strong> ${incident.magnitudeOfDelay} phút<br>
                          <small style="color: #856404;">Khi đi qua đoạn đường này, bạn sẽ bị chậm thêm ${incident.magnitudeOfDelay} phút so với bình thường</small>
                        </div>`;
          }
        }

        const popupContent = `
          <div style="font-size: 0.9rem; min-width: 280px;">
            <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: #111827;">
              ${icon} ${translateCategory(incident.iconCategory)}
            </div>
            <div style="margin-top: 0.5rem; color: #4a5e71;">
              <div style="margin-bottom: 0.5rem;">${incident.description}</div>
              ${delayText}
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);
        incidentLayers.push(marker);
      });
    }

    // Render user location marker (vị trí thực tế từ geolocation) - LUÔN HIỂN THỊ
    // Không phụ thuộc vào việc chọn điểm đến
    if (userLocation) {
      console.log('Rendering user location marker at:', userLocation);
      try {
        // Kiểm tra xem marker đã tồn tại chưa để tránh duplicate
        if (!(mapRef.current as any)._userLocationMarker) {
          // Dùng icon giống icon ở giữa màn hình khi chọn điểm đến (MaterialIcons "place" màu đỏ)
          const userMarker = L.marker(userLocation, {
            icon: L.divIcon({
              className: 'user-location-marker',
              html: `<div style="display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; z-index: 1000;">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#E74C3C">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>`,
              iconSize: [48, 48],
              iconAnchor: [24, 48], // Anchor ở điểm dưới cùng của icon
            }),
      }).addTo(mapRef.current);
          userMarker.bindPopup('📍 Vị trí của bạn');
          (mapRef.current as any)._userLocationMarker = userMarker;
          console.log('User location marker added successfully');
        } else {
          // Nếu đã có marker, chỉ cập nhật vị trí nếu cần
          const existingMarker = (mapRef.current as any)._userLocationMarker;
          if (existingMarker && existingMarker.getLatLng) {
            const currentPos = existingMarker.getLatLng();
            if (currentPos.lat !== userLocation[0] || currentPos.lng !== userLocation[1]) {
              existingMarker.setLatLng(userLocation);
              console.log('User location marker position updated');
            }
          }
        }
        clickLayers.push((mapRef.current as any)._userLocationMarker);
      } catch (error) {
        console.error('Error adding user location marker:', error);
      }
    } else {
      console.log('No userLocation to render');
    }

    // Render destination marker (điểm đến)
    if (destination) {
      const destMarker = L.marker(destination, {
        icon: L.divIcon({
          className: 'destination-marker',
          html: `<div style="background: #20A957; border: 3px solid #FFFFFF; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.4); z-index: 1000;">🎯</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
      }).addTo(mapRef.current);
      destMarker.bindPopup('🎯 Điểm đến');
      clickLayers.push(destMarker);
    }

    // Render camera markers - chỉ render khi showCameraLayer = true
    if (showCameraLayer) {
      const city = CITIES[currentCity];
      city.cameras.forEach((camera) => {
        const marker = L.marker(camera.coords, {
          icon: L.divIcon({
            className: 'camera-marker',
            html: `<div style="background: white; border: 3px solid #E74C3C; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer;">📹</div>`,
            iconSize: [40, 40],
          }),
        }).addTo(mapRef.current);

        marker.on('click', () => {
          // Chỉ hiển thị camera video, không cần fetch traffic data
          // Stats có thể là mock data hoặc optional
          setSelectedCamera({
            name: camera.name,
            coordinate: camera.coords,
            stats: {
              avgSpeed: 0, // Sẽ được cập nhật nếu cần (optional)
              density: 0,
            },
          });
          setShowNotificationPanel(true);
          // Load video when camera is selected
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.load();
            }
          }, 100);
        });

        cameraLayers.push(marker);
      });
    }
    // Nếu showCameraLayer = false hoặc showTrafficLayer = false, cameraLayers sẽ là mảng rỗng và đã được clear ở đầu hàm

    // Render building polygons (GeoJSON)
    if (showBuildingLayer && buildingGeojson) {
      const geoJsonLayer = L.geoJSON(buildingGeojson, {
        style: () => ({
          color: '#00000000', // no stroke
          weight: 0,
          fillColor: '#00000000', // transparent fill
          fillOpacity: 0,
        }),
        onEachFeature: (feature: any, layer: any) => {
          const name = feature?.properties?.name || 'Tòa nhà';
          const typeRaw =
            feature?.properties?.type ||
            feature?.properties?.building_type ||
            feature?.properties?.category ||
            'Chưa rõ';
          const type = translateBuildingType(typeRaw);
          const height = feature?.properties?.height;
          const rawAddress = feature?.properties?.address || feature?.properties?.location;
          const address =
            typeof rawAddress === 'object' && rawAddress !== null
              ? [
                  rawAddress.housenumber,
                  rawAddress.street,
                  rawAddress.district,
                  rawAddress.city,
                  rawAddress.country,
                ]
                  .filter(Boolean)
                  .join(', ')
              : rawAddress;
          const center = layer.getBounds?.().getCenter?.();

          const popup = `
            <div style="min-width:220px;color:#111827;">
              <div style="font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:6px;">
                <span>🏢</span><span>${name}</span>
              </div>
              <div style="margin:2px 0;"><strong>Loại:</strong> ${type}</div>
              ${
                height
                  ? `<div style="margin:2px 0;"><strong>Chiều cao:</strong> ${height} m</div>`
                  : ''
              }
              ${
                address
                  ? `<div style="margin:2px 0;"><strong>Địa chỉ:</strong> ${address}</div>`
                  : ''
              }
              <div style="margin-top:6px;color:#4F46E5;font-weight:600;">Nhấn để xem chi tiết</div>
            </div>
          `;
          layer.bindPopup(popup);

          layer.on('click', () => {
            setSelectedBuilding({
              name,
              type,
              height,
              address,
              center: center ? [center.lat, center.lng] : undefined,
            });
          });

          // Thêm icon nhỏ ở tâm để dễ click
          if (center) {
            const marker = L.marker(center, {
              icon: L.divIcon({
                className: 'building-marker',
                html: `<div style="background:rgba(255,255,255,0.0);border:none;border-radius:12px;padding:8px 10px;font-size:18px;color:#1F2937;box-shadow:none;white-space:nowrap;cursor:pointer;display:flex;align-items:center;gap:6px;">🏢</div>`,
              }),
            }).addTo(mapRef.current);

            marker.on('click', () => {
              setSelectedBuilding({
                name,
                type,
                height,
                address,
                center: center ? [center.lat, center.lng] : undefined,
              });
            });

            buildingLayers.push(marker);
          }
        },
      }).addTo(mapRef.current);
      buildingLayers.push(geoJsonLayer);
    }

    // Render POIs
    if (showPoiLayer && poiGeojson) {
      const poiLayer = L.geoJSON(poiGeojson, {
        pointToLayer: (feature: any, latlng: any) => {
          const cat = feature?.properties?.category;
          const sub = feature?.properties?.subcategory;
          const icon = getPoiIcon(cat, sub);
          return L.marker(latlng, {
            icon: L.divIcon({
              className: 'poi-marker',
              html: `<div style="background: white; border: 2px solid #0EA5E9; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">${icon}</div>`,
              iconSize: [32, 32],
            }),
          });
        },
        onEachFeature: (feature: any, layer: any) => {
          const name = feature?.properties?.name || 'Điểm quan tâm';
          const cat = feature?.properties?.category;
          const sub = feature?.properties?.subcategory;
          const address = feature?.properties?.address;
          const typeLabel = translatePoiType(cat, sub);
          const popup = `
            <div style="min-width:220px;color:#111827;">
              <div style="font-weight:700;margin-bottom:4px;">${getPoiIcon(cat, sub)} ${name}</div>
              ${cat ? `<div>Loại: ${typeLabel}</div>` : ''}
              ${address ? `<div>Địa chỉ: ${address}</div>` : ''}
            </div>
          `;
          layer.bindPopup(popup);
        },
      }).addTo(mapRef.current);
      poiLayers.push(poiLayer);
    }

    // Store layers for next clear cycle
    (mapRef.current as any)._trafficLayers = trafficLayers;
    (mapRef.current as any)._incidentLayers = incidentLayers;
    (mapRef.current as any)._clickLayers = clickLayers;
    (mapRef.current as any)._cameraLayers = cameraLayers;
    (mapRef.current as any)._buildingLayers = buildingLayers;
    (mapRef.current as any)._poiLayers = poiLayers;
  };

  useEffect(() => {
    if (mapRef.current && (window as any).L) {
      console.log('useEffect renderLayers triggered, userLocation:', userLocation);
      renderLayers();
    }
  }, [
    trafficFlows,
    routeFlows,
    incidents,
    showTrafficLayer,
    showIncidentsLayer,
    showCameraLayer,
    showBuildingLayer,
    showPoiLayer,
    buildingGeojson,
    poiGeojson,
    currentCity,
    userLocation,
    destination,
    routeCoordinates,
  ]);

  // Fetch building geojson when layer is turned on
  useEffect(() => {
    if (showBuildingLayer) {
      const cached = buildingCacheRef.current[currentCity];
      if (cached) {
        setBuildingGeojson(cached);
      }
      fetchBuildingsGeojson(currentCity);
    } else {
      setBuildingGeojson(null);
    }
  }, [showBuildingLayer, currentCity]);

  // Fetch POIs when layer toggled
  useEffect(() => {
    if (showPoiLayer) {
      const cached = poiCacheRef.current[currentCity];
      if (cached) {
        setPoiGeojson(cached);
      }
      fetchPoisGeojson(currentCity);
    } else {
      setPoiGeojson(null);
    }
  }, [showPoiLayer, currentCity, poiCategoryFilter, userLocation]);

  // Apply filter from navigation params (e.g., navigate('Map', { poiCategory: 'hospital' }))
  useEffect(() => {
    const paramFilter = (route.params as any)?.poiCategory as string | undefined;
    if (paramFilter) {
      setPoiCategoryFilter(paramFilter);
      poiCacheRef.current[currentCity] = null as any; // clear cache to refetch with new filter
      setShowPoiLayer(true);
    }
  }, [route.params, currentCity]);

  const fetchAllData = async () => {
    if (!isTomTomApiKeyConfigured() || isFetchingRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);
    showStatus('🔄 Đang tải dữ liệu sự cố...');

    try {
      // Chỉ fetch incidents, không fetch traffic flows
      // Traffic flows chỉ hiện khi user chọn điểm đến
      const incidentData = await fetchIncidents();

      setIncidents(incidentData);

      // Update stats - chỉ dựa trên incidents
      const newStats: Stats = {
        incidents: incidentData.length,
        avgSpeed: 0,
        congestionPoints: 0,
        flowPoints: 0,
        avgSpeedPercent: 0,
        density: 0,
      };
      setStats(newStats);

      showStatus('✅ Đã tải dữ liệu sự cố. Bấm "Vị trí hiện tại" và chọn điểm đến để xem traffic flow.', 4000);
    } catch (error) {
      console.error('Error fetching data:', error);
      showStatus('❌ Lỗi: ' + (error as Error).message, 3000);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const clearLayers = () => {
    setTrafficFlows([]);
    setRouteFlows([]);
    setIncidents([]);
    setRouteCoordinates([]);
    setDestination(null);
    setStats({
      incidents: 0,
      avgSpeed: 0,
      congestionPoints: 0,
      flowPoints: 0,
      avgSpeedPercent: 0,
      density: 0,
    });
  };

  const handleMapClick = (e: any) => {
    if (!mapRef.current) {
      console.log('Map ref not available');
      return;
    }

    // Kiểm tra nếu đây là drag event (không phải click thực sự)
    if (e.originalEvent && (e.originalEvent.type === 'mousemove' || e.originalEvent.detail === 0)) {
      return;
    }

    const latlng = e.latlng;
    if (!latlng) {
      console.log('No latlng in event');
      return;
    }
    
    const { lat, lng } = latlng;
    console.log('Map clicked:', { lat, lng, isSelectingDestination, hasUserLocation: !!userLocation });

    // Kiểm tra xem có click vào camera marker hoặc notification panel không
    const target = e.originalEvent?.target;
    if (target) {
      if (
        target.closest('.camera-marker') ||
        target.closest('.notification-panel') ||
        target.closest('[data-camera-button="true"]') ||
        target.closest('.user-location-marker')
      ) {
        console.log('Clicked on marker/panel, ignoring');
        return;
      }
    }

    // Chỉ xử lý khi đang ở chế độ chọn điểm đến
    if (isSelectingDestination && userLocation) {
      const dest: [number, number] = [lat, lng];
      console.log('Setting destination:', dest);
      setDestination(dest);
      showStatus('📍 Đã chọn điểm đến. Bấm "Xác nhận" để xem route.', 2000);
    } else {
      console.log('Not in destination selection mode or no userLocation');
    }
  };

  // Di chuyển map về vị trí người dùng khi có userLocation
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView(userLocation, 15);
    }
  }, [userLocation]);

  const fetchRoute = async (from: [number, number], to: [number, number]): Promise<Array<[number, number]> | null> => {
    try {
      // TomTom Routing API - cải thiện để tính toán route chính xác hơn
      const waypoints = `${from[0]},${from[1]}:${to[0]},${to[1]}`;
      const url = new URL(`https://api.tomtom.com/routing/1/calculateRoute/${waypoints}/json`);
      url.searchParams.set('key', TOMTOM_API_KEY);
      url.searchParams.set('instructionsType', 'text');
      url.searchParams.set('language', 'vi-VN');
      url.searchParams.set('routeType', 'fastest'); // fastest: ưu tiên tốc độ
      url.searchParams.set('traffic', 'true'); // Xem xét tình trạng giao thông
      url.searchParams.set('travelMode', 'car');
      url.searchParams.set('maxAlternatives', '3'); // Lấy 3 route alternatives để chọn route tốt nhất
      url.searchParams.set('computeBestOrder', 'false');
      url.searchParams.set('routeRepresentation', 'polyline'); // Lấy polyline để có nhiều điểm hơn

      const res = await fetch(url.toString());
      if (!res.ok) {
        console.error('Route API error:', res.status);
        return null;
      }

      const data = await res.json();
      const routes = data.routes;
      if (!routes || routes.length === 0) {
        console.error('No routes found');
        return null;
      }

      // Chọn route tốt nhất dựa trên summary (travelTimeInSeconds + delayInSeconds)
      // Route có travelTime + delay nhỏ nhất là route tốt nhất
      let bestRoute = routes[0];
      let bestTime = Infinity;
      
      routes.forEach((route: any) => {
        const summary = route.summary;
        if (summary) {
          const totalTime = (summary.travelTimeInSeconds || 0) + (summary.delayInSeconds || 0);
          if (totalTime < bestTime) {
            bestTime = totalTime;
            bestRoute = route;
          }
        }
      });

      console.log('Selected best route with total time:', bestTime, 'seconds');
      console.log('Route structure:', {
        hasSections: !!bestRoute.sections,
        sectionsCount: bestRoute.sections?.length || 0,
        hasLegs: !!bestRoute.legs,
        legsCount: bestRoute.legs?.length || 0,
        firstSection: bestRoute.sections?.[0] ? {
          hasPolyline: !!bestRoute.sections[0].polyline,
          polylineType: typeof bestRoute.sections[0].polyline,
          hasPoints: !!bestRoute.sections[0].polyline?.points,
          pointsType: Array.isArray(bestRoute.sections[0].polyline?.points) ? 'array' : typeof bestRoute.sections[0].polyline?.points,
          hasStartPoint: !!bestRoute.sections[0].startPoint,
          hasEndPoint: !!bestRoute.sections[0].endPoint
        } : null
      });

      // Lấy tất cả points từ route - đảm bảo thứ tự đúng và không duplicate
      const coordinates: Array<[number, number]> = [];
      let hasPolylinePoints = false;
      
      // Ưu tiên lấy từ sections (theo thứ tự)
      if (bestRoute.sections && bestRoute.sections.length > 0) {
        bestRoute.sections.forEach((section: any, sectionIndex: number) => {
          let sectionPoints: Array<[number, number]> = [];
          
          // Kiểm tra polyline format - ưu tiên lấy từ polyline
          if (section.polyline) {
            // Nếu polyline là string (encoded), bỏ qua
            if (typeof section.polyline === 'string') {
              console.warn('Section', sectionIndex, ': Polyline is encoded string, using start/end points instead');
            }
            // Nếu polyline.points là array
            else if (section.polyline.points && Array.isArray(section.polyline.points)) {
              section.polyline.points.forEach((point: any) => {
                if (point.latitude !== undefined && point.longitude !== undefined) {
                  sectionPoints.push([point.latitude, point.longitude]);
                }
              });
              hasPolylinePoints = true;
            }
          }
          
          // Nếu không có points từ polyline, lấy từ startPoint và endPoint
          if (sectionPoints.length === 0) {
            // Section đầu tiên: thêm startPoint
            if (sectionIndex === 0 && section.startPoint) {
              sectionPoints.push([section.startPoint.latitude, section.startPoint.longitude]);
            }
            // Tất cả sections: thêm endPoint
            if (section.endPoint) {
              sectionPoints.push([section.endPoint.latitude, section.endPoint.longitude]);
            }
          }
          
          // Thêm points của section này vào coordinates
          // Loại bỏ điểm đầu nếu trùng với điểm cuối của section trước
          sectionPoints.forEach((point, pointIndex) => {
            if (coordinates.length === 0) {
              coordinates.push(point);
        } else {
              const lastPoint = coordinates[coordinates.length - 1];
              const distance = Math.sqrt(
                Math.pow(point[0] - lastPoint[0], 2) + Math.pow(point[1] - lastPoint[1], 2)
              );
              // Chỉ thêm nếu khác điểm cuối (trừ điểm đầu của section đầu tiên)
              if (distance > 0.00001 || (sectionIndex === 0 && pointIndex === 0)) {
                coordinates.push(point);
              }
            }
          });
        });
      }

      // Nếu không có từ sections, lấy từ legs
      if (coordinates.length === 0 && bestRoute.legs) {
        bestRoute.legs.forEach((leg: any) => {
          if (leg.points && Array.isArray(leg.points)) {
            leg.points.forEach((point: any) => {
              if (point.latitude !== undefined && point.longitude !== undefined) {
                coordinates.push([point.latitude, point.longitude]);
              }
            });
          }
        });
      }

      // Loại bỏ duplicate points liên tiếp (giữ lại điểm đầu và cuối)
      const cleanedCoordinates: Array<[number, number]> = [];
      const tolerance = 0.00001; // Khoảng cách tối thiểu để coi là khác nhau
      
      for (let i = 0; i < coordinates.length; i++) {
        const current = coordinates[i];
        if (cleanedCoordinates.length === 0) {
          cleanedCoordinates.push(current);
        } else {
          const last = cleanedCoordinates[cleanedCoordinates.length - 1];
          const distance = Math.sqrt(
            Math.pow(current[0] - last[0], 2) + Math.pow(current[1] - last[1], 2)
          );
          // Chỉ thêm nếu khác điểm trước đó đáng kể, hoặc là điểm cuối
          if (distance > tolerance || i === coordinates.length - 1) {
            cleanedCoordinates.push(current);
          }
        }
      }

      console.log('Route coordinates:', {
        original: coordinates.length,
        cleaned: cleanedCoordinates.length,
        first: cleanedCoordinates[0],
        last: cleanedCoordinates[cleanedCoordinates.length - 1]
      });

      return cleanedCoordinates.length >= 2 ? cleanedCoordinates : null;
    } catch (error) {
      console.error('Error fetching route:', error);
      return null;
    }
  };


  const fetchRouteData = async (from: [number, number], to: [number, number]) => {
    if (!isTomTomApiKeyConfigured() || isFetchingRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);
    showStatus('🔍 Đang lấy route và dữ liệu giao thông...');

    try {
      // Fetch route thực tế từ TomTom Routing API
      const routeCoords = await fetchRoute(from, to);
      
      if (routeCoords && routeCoords.length > 0) {
        // Lưu route coordinates để vẽ route line
        setRouteCoordinates(routeCoords);

        // Fetch traffic flow cho các điểm dọc route - lấy nhiều điểm hơn để cover toàn bộ route
        // Tính toán khoảng cách giữa các điểm để sample đều (mỗi ~200-300m)
        const calculateDistance = (p1: [number, number], p2: [number, number]): number => {
          const R = 6371e3; // Earth radius in meters
          const φ1 = p1[0] * Math.PI / 180;
          const φ2 = p2[0] * Math.PI / 180;
          const Δφ = (p2[0] - p1[0]) * Math.PI / 180;
          const Δλ = (p2[1] - p1[1]) * Math.PI / 180;
          const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ/2) * Math.sin(Δλ/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c;
        };

        // Tính tổng chiều dài route
        let totalDistance = 0;
        for (let i = 1; i < routeCoords.length; i++) {
          totalDistance += calculateDistance(routeCoords[i-1], routeCoords[i]);
        }

        // Sample points cách đều nhau ~250m (hoặc tối đa 30 điểm)
        const sampleInterval = 250; // meters
        const maxPoints = Math.min(30, Math.ceil(totalDistance / sampleInterval));
        const step = Math.max(1, Math.floor(routeCoords.length / maxPoints));
        
        const samplePoints: Array<[number, number]> = [];
        let accumulatedDistance = 0;
        let lastSampledIndex = 0;

        // Luôn thêm điểm đầu
        samplePoints.push(routeCoords[0]);

        // Sample các điểm cách đều nhau theo khoảng cách thực tế
        for (let i = 1; i < routeCoords.length; i++) {
          accumulatedDistance += calculateDistance(routeCoords[i-1], routeCoords[i]);
          
          if (accumulatedDistance >= sampleInterval && i - lastSampledIndex >= step) {
            samplePoints.push(routeCoords[i]);
            accumulatedDistance = 0;
            lastSampledIndex = i;
          }
        }

        // Luôn thêm điểm cuối nếu chưa có
        const lastPoint = routeCoords[routeCoords.length - 1];
        const lastSampled = samplePoints[samplePoints.length - 1];
        if (lastSampled[0] !== lastPoint[0] || lastSampled[1] !== lastPoint[1]) {
          samplePoints.push(lastPoint);
        }

        console.log(`Sampling ${samplePoints.length} points along route (${Math.round(totalDistance)}m total)`);
        
        // Hàm cắt flow chỉ giữ lại phần trùng với route
        const clipFlowToRoute = (flow: TrafficFlow, routeCoords: Array<[number, number]>): TrafficFlow | null => {
          if (!flow.coordinates || flow.coordinates.length < 2) return null;
          
          const clippedPoints: Array<[number, number]> = [];
          const ROUTE_TOLERANCE = 30; // 30m tolerance
          
          // Kiểm tra từng điểm của flow
          for (const flowPoint of flow.coordinates) {
            let isOnRoute = false;
            // Kiểm tra xem điểm này có nằm trên route không
            for (const routePoint of routeCoords) {
              const dist = calculateDistance(flowPoint, routePoint);
              if (dist < ROUTE_TOLERANCE) {
                isOnRoute = true;
                break;
              }
            }
            
            // Chỉ thêm điểm nếu nằm trên route
            if (isOnRoute) {
              clippedPoints.push(flowPoint);
            } else if (clippedPoints.length > 0) {
              // Nếu đã có điểm trên route và điểm này không nằm trên route
              // Có thể là đoạn flow rời khỏi route, dừng lại
              break;
            }
          }
          
          // Chỉ trả về flow nếu có ít nhất 2 điểm trên route
          if (clippedPoints.length >= 2) {
            return {
              ...flow,
              coordinates: clippedPoints
            };
          }
          
          return null;
        };
        
        const flows: TrafficFlow[] = [];
        const flowMap = new Map<string, TrafficFlow>(); // Để tránh duplicate flows
        
        // Fetch flow tại các điểm trên route
        for (let i = 0; i < samplePoints.length; i++) {
          const point = samplePoints[i];
          try {
            const flow = await fetchTrafficFlow(point[0], point[1]);
            if (flow && flow.coordinates && flow.coordinates.length >= 2) {
              // Cắt flow chỉ giữ lại phần trùng với route
              const clippedFlow = clipFlowToRoute(flow, routeCoords);
              if (clippedFlow && clippedFlow.coordinates.length >= 2) {
                // Tạo key từ điểm đầu và cuối của flow đã cắt để tránh duplicate
                const flowKey = `${clippedFlow.coordinates[0][0]},${clippedFlow.coordinates[0][1]}-${clippedFlow.coordinates[clippedFlow.coordinates.length-1][0]},${clippedFlow.coordinates[clippedFlow.coordinates.length-1][1]}`;
                if (!flowMap.has(flowKey)) {
                  flowMap.set(flowKey, clippedFlow);
                  flows.push(clippedFlow);
                }
              }
            }
            // Delay nhỏ để tránh rate limit
            await new Promise(resolve => setTimeout(resolve, 150));
          } catch (error) {
            console.warn('Error fetching flow for point:', point, error);
          }
        }
        
        console.log(`Found ${flows.length} flows clipped to route`);
        
        // Hàm để lấp các khoảng trống trên route bằng flow từ điểm gần nhất
        const fillRouteGaps = (
          routeCoords: Array<[number, number]>,
          existingFlows: TrafficFlow[]
        ): TrafficFlow[] => {
          const GAP_TOLERANCE = 50; // 50m - nếu một điểm route cách flow > 50m thì coi là gap (tăng để cover tốt hơn)
          const filledFlows: TrafficFlow[] = [...existingFlows];
          const coveredIndices = new Set<number>(); // Các index của route coordinates đã được cover
          
          // Nếu không có flow nào, tạo flow mặc định cho toàn bộ route
          if (existingFlows.length === 0) {
            console.log('No existing flows, creating default flow for entire route');
            const defaultFlow: TrafficFlow = {
              currentSpeed: 50, // Tốc độ mặc định 50 km/h
              freeFlowSpeed: 60,
              currentTravelTime: 0,
              freeFlowTravelTime: 0,
              confidence: 0.5, // Confidence thấp vì không có data
              coordinates: routeCoords
            };
            return [defaultFlow];
          }
          
          // Đánh dấu các điểm route đã được cover bởi flows hiện có
          // Cải thiện: kiểm tra cả segment của flow, không chỉ điểm
          routeCoords.forEach((routePoint, routeIdx) => {
            for (const flow of existingFlows) {
              if (!flow.coordinates || flow.coordinates.length < 2) continue;
              
              // Kiểm tra xem routePoint có gần bất kỳ điểm nào của flow không
              for (const flowPoint of flow.coordinates) {
                const dist = calculateDistance(routePoint, flowPoint);
                if (dist < GAP_TOLERANCE) {
                  coveredIndices.add(routeIdx);
                  break;
                }
              }
              
              // Nếu chưa cover, kiểm tra xem có gần segment nào của flow không
              if (!coveredIndices.has(routeIdx)) {
                for (let i = 0; i < flow.coordinates.length - 1; i++) {
                  const segStart = flow.coordinates[i];
                  const segEnd = flow.coordinates[i + 1];
                  
                  // Tính khoảng cách từ routePoint đến segment
                  const A = routePoint[0] - segStart[0];
                  const B = routePoint[1] - segStart[1];
                  const C = segEnd[0] - segStart[0];
                  const D = segEnd[1] - segStart[1];
                  
                  const dot = A * C + B * D;
                  const lenSq = C * C + D * D;
                  let param = -1;
                  
                  if (lenSq !== 0) param = dot / lenSq;
                  
                  let closestPoint: [number, number];
                  if (param < 0) {
                    closestPoint = segStart;
                  } else if (param > 1) {
                    closestPoint = segEnd;
                  } else {
                    closestPoint = [
                      segStart[0] + param * C,
                      segStart[1] + param * D
                    ];
                  }
                  
                  const dist = calculateDistance(routePoint, closestPoint);
                  if (dist < GAP_TOLERANCE) {
                    coveredIndices.add(routeIdx);
                    break;
                  }
                }
              }
              
              if (coveredIndices.has(routeIdx)) break;
            }
          });
          
          // Tìm các đoạn gap (các đoạn route liên tiếp không được cover)
          // XỬ LÝ CẢ GAP 1 ĐIỂM để đảm bảo không còn route tím
          const gaps: Array<{ startIdx: number; endIdx: number }> = [];
          let gapStart: number | null = null;
          
          for (let i = 0; i < routeCoords.length; i++) {
            if (!coveredIndices.has(i)) {
              if (gapStart === null) {
                gapStart = i;
              }
            } else {
              if (gapStart !== null) {
                // Xử lý cả gap 1 điểm (bỏ điều kiện >= 2)
                gaps.push({ startIdx: gapStart, endIdx: i - 1 });
              }
              gapStart = null;
            }
          }
          
          // Xử lý gap ở cuối route (kể cả 1 điểm)
          if (gapStart !== null) {
            gaps.push({ startIdx: gapStart, endIdx: routeCoords.length - 1 });
          }
          
          // Nếu gap chỉ có 1 điểm, mở rộng thêm 1 điểm ở mỗi bên để tạo segment
          const expandedGaps = gaps.map(gap => {
            if (gap.endIdx === gap.startIdx) {
              // Gap chỉ có 1 điểm, mở rộng nếu có thể
              return {
                startIdx: Math.max(0, gap.startIdx - 1),
                endIdx: Math.min(routeCoords.length - 1, gap.endIdx + 1)
              };
            }
            return gap;
          });
          
          console.log(`Found ${gaps.length} gaps in route (${routeCoords.length - coveredIndices.size} uncovered points)`);
          
          // Tính data trung bình từ tất cả flows để dùng làm fallback
          let avgCurrentSpeed = 0;
          let avgFreeFlowSpeed = 0;
          let avgConfidence = 0;
          if (existingFlows.length > 0) {
            let totalCurrentSpeed = 0;
            let totalFreeFlowSpeed = 0;
            let totalConfidence = 0;
            for (const flow of existingFlows) {
              totalCurrentSpeed += flow.currentSpeed;
              totalFreeFlowSpeed += flow.freeFlowSpeed;
              totalConfidence += flow.confidence;
            }
            avgCurrentSpeed = totalCurrentSpeed / existingFlows.length;
            avgFreeFlowSpeed = totalFreeFlowSpeed / existingFlows.length;
            avgConfidence = totalConfidence / existingFlows.length;
          } else {
            // Default values nếu không có flow
            avgCurrentSpeed = 50;
            avgFreeFlowSpeed = 60;
            avgConfidence = 0.5;
          }
          
          // Hàm tính khoảng cách từ một điểm đến một đoạn thẳng (flow segment) - trả về meters
          const distanceToSegment = (
            point: [number, number],
            segStart: [number, number],
            segEnd: [number, number]
          ): number => {
            // Tìm điểm gần nhất trên segment
            const A = point[0] - segStart[0];
            const B = point[1] - segStart[1];
            const C = segEnd[0] - segStart[0];
            const D = segEnd[1] - segStart[1];
            
            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            let param = -1;
            
            if (lenSq !== 0) param = dot / lenSq;
            
            let closestPoint: [number, number];
            
            if (param < 0) {
              closestPoint = segStart;
            } else if (param > 1) {
              closestPoint = segEnd;
            } else {
              closestPoint = [
                segStart[0] + param * C,
                segStart[1] + param * D
              ];
            }
            
            // Sử dụng hàm calculateDistance có sẵn để tính khoảng cách bằng meters
            return calculateDistance(point, closestPoint);
          };
          
          // Với mỗi gap, tìm flow gần nhất và tạo synthetic flow
          for (const gap of expandedGaps) {
            const gapStartPoint = routeCoords[gap.startIdx];
            const gapEndPoint = routeCoords[gap.endIdx];
            const gapMidPoint: [number, number] = [
              (gapStartPoint[0] + gapEndPoint[0]) / 2,
              (gapStartPoint[1] + gapEndPoint[1]) / 2
            ];
            
            // Lấy đoạn route coordinates trong gap
            const gapRouteCoords = routeCoords.slice(gap.startIdx, gap.endIdx + 1);
            
            // Tìm flow gần nhất với gap (tính khoảng cách đến toàn bộ flow segment)
            let nearestFlow: TrafficFlow | null = null;
            let minDistance = Infinity;
            
            for (const flow of existingFlows) {
              if (!flow.coordinates || flow.coordinates.length < 2) continue;
              
              // Tính khoảng cách từ điểm giữa gap đến flow segment gần nhất
              for (let i = 0; i < flow.coordinates.length - 1; i++) {
                const segStart = flow.coordinates[i];
                const segEnd = flow.coordinates[i + 1];
                const dist = distanceToSegment(gapMidPoint, segStart, segEnd);
                if (dist < minDistance) {
                  minDistance = dist;
                  nearestFlow = flow;
                }
              }
              
              // Cũng kiểm tra khoảng cách đến các điểm của flow (fallback)
              for (const flowPoint of flow.coordinates) {
                const dist = calculateDistance(gapMidPoint, flowPoint);
                if (dist < minDistance) {
                  minDistance = dist;
                  nearestFlow = flow;
                }
              }
            }
            
            // LUÔN tạo synthetic flow cho gap, sử dụng flow gần nhất hoặc data trung bình
            let syntheticFlow: TrafficFlow;
            
            if (nearestFlow && minDistance < 2000) { // Nếu có flow trong vòng 2km, dùng data từ flow đó
              syntheticFlow = {
                currentSpeed: nearestFlow.currentSpeed,
                freeFlowSpeed: nearestFlow.freeFlowSpeed,
                currentTravelTime: nearestFlow.currentTravelTime,
                freeFlowTravelTime: nearestFlow.freeFlowTravelTime,
                confidence: Math.max(0.3, nearestFlow.confidence * 0.7), // Giảm confidence vì là synthetic
                coordinates: gapRouteCoords
              };
              console.log(`Filled gap from index ${gap.startIdx} to ${gap.endIdx} using nearest flow (${Math.round(minDistance)}m away)`);
            } else {
              // Nếu không có flow gần đó, dùng data trung bình
              syntheticFlow = {
                currentSpeed: avgCurrentSpeed,
                freeFlowSpeed: avgFreeFlowSpeed,
                currentTravelTime: 0,
                freeFlowTravelTime: 0,
                confidence: Math.max(0.2, avgConfidence * 0.5), // Confidence thấp hơn vì không có data gần đó
                coordinates: gapRouteCoords
              };
              console.log(`Filled gap from index ${gap.startIdx} to ${gap.endIdx} using average data (no nearby flow)`);
            }
            
            filledFlows.push(syntheticFlow);
          }
          
          // Kiểm tra lại coverage sau khi fill gap - kiểm tra cả segment
          const finalCoveredIndices = new Set<number>();
          filledFlows.forEach((flow) => {
            if (!flow.coordinates || flow.coordinates.length < 2) return;
            
            routeCoords.forEach((routePoint, routeIdx) => {
              // Kiểm tra khoảng cách đến các điểm của flow
              for (const flowPoint of flow.coordinates) {
                const dist = calculateDistance(routePoint, flowPoint);
                if (dist < GAP_TOLERANCE) {
                  finalCoveredIndices.add(routeIdx);
                  return;
                }
              }
              
              // Kiểm tra khoảng cách đến các segment của flow
              for (let i = 0; i < flow.coordinates.length - 1; i++) {
                const segStart = flow.coordinates[i];
                const segEnd = flow.coordinates[i + 1];
                
                const A = routePoint[0] - segStart[0];
                const B = routePoint[1] - segStart[1];
                const C = segEnd[0] - segStart[0];
                const D = segEnd[1] - segStart[1];
                
                const dot = A * C + B * D;
                const lenSq = C * C + D * D;
                let param = -1;
                
                if (lenSq !== 0) param = dot / lenSq;
                
                let closestPoint: [number, number];
                if (param < 0) {
                  closestPoint = segStart;
                } else if (param > 1) {
                  closestPoint = segEnd;
                } else {
                  closestPoint = [
                    segStart[0] + param * C,
                    segStart[1] + param * D
                  ];
                }
                
                const dist = calculateDistance(routePoint, closestPoint);
                if (dist < GAP_TOLERANCE) {
                  finalCoveredIndices.add(routeIdx);
                  return;
                }
              }
            });
          });
          
          // Tìm các điểm route còn sót và tạo flow cho chúng
          const remainingUncovered: number[] = [];
          for (let i = 0; i < routeCoords.length; i++) {
            if (!finalCoveredIndices.has(i)) {
              remainingUncovered.push(i);
            }
          }
          
          if (remainingUncovered.length > 0) {
            console.log(`Found ${remainingUncovered.length} remaining uncovered points, creating flows for them`);
            
            // Nhóm các điểm liên tiếp thành các đoạn
            const remainingGaps: Array<{ startIdx: number; endIdx: number }> = [];
            let remainingGapStart: number | null = null;
            
            for (let i = 0; i < remainingUncovered.length; i++) {
              const idx = remainingUncovered[i];
              if (remainingGapStart === null) {
                remainingGapStart = idx;
              }
              
              // Nếu điểm tiếp theo không liên tiếp, kết thúc gap hiện tại
              if (i === remainingUncovered.length - 1 || remainingUncovered[i + 1] !== idx + 1) {
                const endIdx = idx;
                // Mở rộng gap để tạo segment (ít nhất 2 điểm)
                const expandedStart = Math.max(0, remainingGapStart - 1);
                const expandedEnd = Math.min(routeCoords.length - 1, endIdx + 1);
                remainingGaps.push({ startIdx: expandedStart, endIdx: expandedEnd });
                remainingGapStart = null;
              }
            }
            
            // Tạo flow cho các gap còn sót
            for (const gap of remainingGaps) {
              const gapCoords = routeCoords.slice(gap.startIdx, gap.endIdx + 1);
              const remainingFlow: TrafficFlow = {
                currentSpeed: avgCurrentSpeed,
                freeFlowSpeed: avgFreeFlowSpeed,
                currentTravelTime: 0,
                freeFlowTravelTime: 0,
                confidence: 0.25, // Confidence thấp vì là fallback
                coordinates: gapCoords
              };
              filledFlows.push(remainingFlow);
              console.log(`Created fallback flow for remaining gap from index ${gap.startIdx} to ${gap.endIdx}`);
            }
          }
          
          console.log(`Final: ${filledFlows.length} flows, coverage should be 100%`);
          
          return filledFlows;
        };
        
        // Lấp các khoảng trống trên route
        let filledFlows = fillRouteGaps(routeCoords, flows);
        
        // Đảm bảo 100% coverage: tạo flow background cho toàn bộ route
        // Flow này sẽ được vẽ đầu tiên (background) với opacity thấp
        // Các flow thực tế sẽ overlay lên trên, đảm bảo không có khoảng trống
        if (filledFlows.length > 0) {
          // Tính data trung bình từ các flows thực tế
          let avgCurrentSpeed = 0;
          let avgFreeFlowSpeed = 0;
          let avgConfidence = 0;
          let realFlowCount = 0;
          for (const flow of filledFlows) {
            // Chỉ tính từ flows có confidence > 0.3 (flows thực tế)
            if (flow.confidence > 0.3) {
              avgCurrentSpeed += flow.currentSpeed;
              avgFreeFlowSpeed += flow.freeFlowSpeed;
              avgConfidence += flow.confidence;
              realFlowCount++;
            }
          }
          
          if (realFlowCount > 0) {
            avgCurrentSpeed = avgCurrentSpeed / realFlowCount;
            avgFreeFlowSpeed = avgFreeFlowSpeed / realFlowCount;
            avgConfidence = avgConfidence / realFlowCount;
          } else {
            // Fallback nếu không có flow thực tế
            avgCurrentSpeed = 50;
            avgFreeFlowSpeed = 60;
            avgConfidence = 0.5;
          }
          
          // Tạo flow background cho toàn bộ route
          const backgroundFlow: TrafficFlow = {
            currentSpeed: avgCurrentSpeed,
            freeFlowSpeed: avgFreeFlowSpeed,
            currentTravelTime: 0,
            freeFlowTravelTime: 0,
            confidence: 0.15, // Confidence rất thấp để nhận biết là background
            coordinates: routeCoords
          };
          
          // Thêm vào đầu để vẽ trước (background layer)
          filledFlows.unshift(backgroundFlow);
          console.log(`Added background flow for entire route (${routeCoords.length} points) to ensure 100% coverage`);
        } else {
          // Nếu không có flow nào, tạo flow mặc định
          const defaultFlow: TrafficFlow = {
            currentSpeed: 50,
            freeFlowSpeed: 60,
            currentTravelTime: 0,
            freeFlowTravelTime: 0,
            confidence: 0.5,
            coordinates: routeCoords
          };
          filledFlows = [defaultFlow];
        }
        
        // Lưu flows cho route riêng, không ảnh hưởng đến layer giao thông
        setRouteFlows(filledFlows);
        // Không tự động bật layer giao thông - route và layer độc lập
        showStatus(`✅ Đã tải route và ${filledFlows.length} đoạn đường giao thông (${filledFlows.length - flows.length} đoạn được lấp)`, 2000);
      } else {
        showStatus('⚠️ Không tìm thấy route', 2000);
      }
    } catch (error) {
      console.error('Error fetching route data:', error);
      showStatus('❌ Lỗi: ' + (error as Error).message, 3000);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Add click handler to map - chỉ khi đang chọn điểm đến
  useEffect(() => {
    if (mapRef.current && (window as any).L) {
      mapRef.current.off('click', handleMapClick);
      if (isSelectingDestination) {
        mapRef.current.on('click', handleMapClick);
      }
    }
  }, [isSelectingDestination]);

  // Reload video khi camera thay đổi
  useEffect(() => {
    if (selectedCamera && videoRef.current && showNotificationPanel) {
      const video = videoRef.current;
      const newSrc = getCameraVideoPath(selectedCamera.name);
      
      // Kiểm tra xem source có thay đổi không
      if (video.src !== newSrc && !video.src.includes(encodeURIComponent(selectedCamera.name.split(' ')[0]))) {
        // Cập nhật source và reload
        video.src = newSrc;
        video.load();
        
        // Tự động play video mới
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play().catch((error) => {
              console.log('Auto-play prevented:', error);
            });
          }
        }, 200);
      } else {
        // Nếu source giống, chỉ cần reload
        video.load();
        video.play().catch((error) => {
          console.log('Auto-play prevented:', error);
        });
      }
    }
  }, [selectedCamera?.name, showNotificationPanel]); // Reload khi tên camera hoặc panel visibility thay đổi

  // Handler để ẩn panel khi click ra ngoài
  useEffect(() => {
    if (!showNotificationPanel) return;

    const handleClickOutside = (e: MouseEvent) => {
      // Nếu đang trong quá trình chuyển camera, không đóng modal
      if (isChangingCameraRef.current) {
        return;
      }
      
      const target = e.target as HTMLElement;
      
      // Kiểm tra xem click có phải vào panel, camera marker, hoặc button không
      const isInPanel = target && target.closest('.notification-panel');
      const isInMarker = target && target.closest('.camera-marker');
      const isInCameraButton = target && (
        target.hasAttribute('data-camera-button') ||
        target.closest('[data-camera-button]') !== null ||
        target.closest('[data-camera-button="true"]') !== null
      );
      
      if (!isInPanel && !isInMarker && !isInCameraButton) {
        setShowNotificationPanel(false);
        setSelectedCamera(null);
      }
    };

    // Sử dụng click với bubble phase để không chặn button click
    // Delay một chút để button click được xử lý trước
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showNotificationPanel]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={handleBack}
          >
            <MaterialIcons name="arrow-back" size={24} color="#20A957" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bản đồ chi tiết</Text>
        </View>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          <div
            ref={mapContainerRef}
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
            }}
          />
          
          {/* Bỏ icon ở giữa màn hình - chỉ cần click vào bản đồ để chọn điểm */}

          {/* Top-left Menu Button */}
          <TouchableOpacity style={styles.menuButton}>
            <MaterialIcons name="menu" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Top-right Notification Panel - chỉ hiện khi click vào camera */}
          {showNotificationPanel && selectedCamera && (
            <View
              style={{
                position: 'absolute',
                top: 80,
                right: 16,
                width: 280,
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                overflow: 'hidden',
                zIndex: 1000,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
              }}
              // @ts-ignore - className is valid for web
              className="notification-panel"
            >
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationHeaderText}>Camera giao thông</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowNotificationPanel(false);
                    setSelectedCamera(null);
                  }}
                  style={{ padding: 4 }}
                >
                  <MaterialIcons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.notificationContent}>
                {/* Video player */}
                <View style={styles.videoContainer}>
                  {/* @ts-ignore - HTML video element, not React Native */}
                  <video
                    ref={videoRef}
                    key={`video-${selectedCamera.name}`} // Force re-render when camera changes
                    style={{
                      width: '100%',
                      height: 'auto',
                      minHeight: 140,
                      maxHeight: 180,
                      display: 'block',
                      objectFit: 'cover' as any,
                    }}
                    controls
                    autoPlay
                    loop
                    playsInline
                    muted
                    src={getCameraVideoPath(selectedCamera.name)}
                  >
                    Trình duyệt của bạn không hỗ trợ video.
                  </video>
                </View>
                {/* Stats - hiển thị ngang */}
                <View style={styles.notificationStats}>
                  <Text style={styles.notificationStatText}>
                    Tốc độ TB: {selectedCamera.stats.avgSpeed}%
                  </Text>
                  <Text style={[styles.notificationStatText, { marginLeft: 16 }]}>
                    Mật độ: {selectedCamera.stats.density}
                  </Text>
                </View>
                {/* Camera buttons - hiện các camera khác */}
                <View style={styles.notificationButtons}>
                  {CITIES[currentCity].cameras.map((camera, index) => {
                    const handleCameraClick = (e?: any) => {
                      // Set flag TRƯỚC để tránh handleClickOutside đóng panel
                      isChangingCameraRef.current = true;
                      
                      if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation?.(); // Stop all event listeners
                      }
                      
                      // Nếu đang chọn cùng camera, không làm gì
                      if (selectedCamera?.name === camera.name) {
                        isChangingCameraRef.current = false;
                        return;
                      }
                      
                      const newVideoPath = getCameraVideoPath(camera.name);
                      
                      // Cập nhật camera ngay lập tức để video chuyển nhanh
                      setSelectedCamera({
                        name: camera.name,
                        coordinate: camera.coords,
                        stats: {
                          avgSpeed: selectedCamera?.stats.avgSpeed || 0,
                          density: selectedCamera?.stats.density || 0,
                        },
                      });
                      
                      // Force update video source ngay lập tức
                      if (videoRef.current) {
                        videoRef.current.src = newVideoPath;
                        videoRef.current.load();
                        videoRef.current.play().catch(() => {
                          // Auto-play prevented, ignore
                        });
                      }
                      
                      // Reset flag sau khi hoàn thành
                      setTimeout(() => {
                        isChangingCameraRef.current = false;
                      }, 200);
                    };
                    
                    return (
                      <TouchableOpacity
                        key={camera.name}
                        data-camera-button="true"
                        style={[
                          styles.notificationButton,
                          selectedCamera?.name === camera.name &&
                            styles.notificationButtonActive,
                        ]}
                        onPress={(e) => {
                          handleCameraClick(e);
                        }}
                        // @ts-ignore - onClick for web
                        onClick={(e: any) => {
                          handleCameraClick(e);
                        }}
                        onMouseDown={(e: any) => {
                          // Set flag sớm để tránh handleClickOutside đóng panel
                          isChangingCameraRef.current = true;
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        activeOpacity={0.7}
                      >
                        <Text 
                          style={[
                            styles.notificationButtonText,
                            selectedCamera?.name === camera.name &&
                              styles.notificationButtonTextActive,
                          ]}
                          // @ts-ignore - web only
                          onPress={undefined}
                          // @ts-ignore - web only
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCameraClick(e);
                          }}
                          // @ts-ignore - web only
                          onMouseDown={(e: any) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          {camera.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {/* Bottom-right Zoom Controls */}
          <View style={styles.zoomControlsWrapper}>
            {/* My Location Button */}
            {userLocation && (
              <TouchableOpacity
                style={styles.zoomButton}
                onPress={() => {
                  if (mapRef.current && userLocation) {
                    mapRef.current.setView(userLocation, 15, {
                      animate: true,
                      duration: 0.5,
                    } as any);
                  }
                }}
              >
                <MaterialIcons name="my-location" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => {
                if (mapRef.current) mapRef.current.zoomIn();
              }}
            >
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => {
                if (mapRef.current) mapRef.current.zoomOut();
              }}
            >
              <MaterialIcons name="remove" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

        </View>

        {/* Controls Panel */}
        <View style={styles.controlsPanel}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.controlsContent}
          >
            {/* City Dropdown */}
            <View 
              ref={cityDropdownButtonRef}
              style={styles.cityDropdownContainer}
              onLayout={(event) => {
                const { x, y, width, height } = event.nativeEvent.layout;
                const controlsPanelTop = 64;
                const controlsPanelPadding = 12;
                setCityDropdownPosition({
                  top: controlsPanelTop + y + height - 30,
                  left: controlsPanelPadding + x,
                });
              }}
            >
                <TouchableOpacity
                style={styles.cityDropdownButton}
                onPress={() => {
                  setShowCityDropdown(!showCityDropdown);
                  setShowLayerDropdown(false); // Đóng layer dropdown nếu đang mở
                }}
            >
              <MaterialIcons
                  name="location-city"
                size={18}
                  color="#20A957"
              />
                <Text style={styles.cityDropdownButtonText}>
                  {currentCity === 'hanoi' ? 'Hà Nội' : 'TP.HCM'}
              </Text>
                <MaterialIcons
                  name={showCityDropdown ? 'expand-less' : 'expand-more'}
                  size={18}
                  color="#757575"
                />
            </TouchableOpacity>
            </View>

            {/* Chọn điểm đến Button - chỉ hiện khi có userLocation và chưa chọn điểm đến */}
            {userLocation && !isSelectingDestination && !destination && (
              <TouchableOpacity
                style={styles.selectDestinationButton}
                onPress={() => {
                  setIsSelectingDestination(true);
                  showStatus('📍 Click vào bản đồ để chọn điểm đến. Bấm "Xác nhận" để xem route.', 4000);
                }}
              >
                <MaterialIcons
                  name="place"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.selectDestinationButtonText}>
                  Chọn điểm đến
                </Text>
              </TouchableOpacity>
            )}

            {/* Xác nhận điểm đến Button - chỉ hiện khi đang chọn điểm đến */}
            {isSelectingDestination && userLocation && (
              <TouchableOpacity
                style={[
                  styles.confirmDestinationButton,
                  !destination && styles.confirmDestinationButtonDisabled
                ]}
                onPress={async () => {
                  if (destination && userLocation) {
                    setIsSelectingDestination(false);
                    showStatus('✅ Đã chọn điểm đến. Đang fetch dữ liệu...', 2000);
                    fetchRouteData(userLocation, destination);
                  } else {
                    showStatus('⚠️ Vui lòng click vào bản đồ để chọn điểm đến.', 3000);
                  }
                }}
                disabled={!destination}
              >
                <MaterialIcons
                  name="check"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.confirmDestinationButtonText}>
                  Xác nhận
                </Text>
              </TouchableOpacity>
            )}

            {/* Hủy chọn điểm đến Button */}
            {isSelectingDestination && (
              <TouchableOpacity
                style={styles.cancelDestinationButton}
                onPress={() => {
                  setIsSelectingDestination(false);
                  setDestination(null);
                  setRouteCoordinates([]);
                  setRouteFlows([]);
                  showStatus('Đã hủy chọn điểm đến', 2000);
                }}
              >
                <MaterialIcons
                  name="close"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.cancelDestinationButtonText}>
                  Hủy
                </Text>
              </TouchableOpacity>
            )}

            {/* Nút "Xong" - clear route flows */}
            {destination && routeFlows.length > 0 && (
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => {
                  setDestination(null);
                  setRouteCoordinates([]);
                  setRouteFlows([]);
                  setIsSelectingDestination(false);
                  showStatus('Đã xóa tuyến đường', 2000);
                }}
              >
                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.doneButtonText}>
                  Xong
                </Text>
              </TouchableOpacity>
            )}

            {/* Layer Dropdown Button */}
            <View 
              ref={layerDropdownButtonRef}
              style={styles.layerDropdownContainer} 
              data-layer-dropdown="true"
              onLayout={(event) => {
                // Tính toán vị trí dropdown dựa trên vị trí button
                const { x, y, width, height } = event.nativeEvent.layout;
                // Tính từ controlsPanel (top: 64) + button position
                const controlsPanelTop = 64;
                const controlsPanelPadding = 12;
                // Dịch sang trái 30px để không bị che mất
                setLayerDropdownPosition({
                  top: controlsPanelTop + y + height - 30,
                  left: Math.max(12, controlsPanelPadding + x - 30), // Đảm bảo không ra ngoài màn hình bên trái
                });
              }}
            >
              <TouchableOpacity
                style={styles.layerDropdownButton}
                // @ts-ignore - web only
                data-layer-dropdown-button="true"
                onPress={() => setShowLayerDropdown(!showLayerDropdown)}
              >
                <MaterialIcons
                  name="layers"
                  size={20}
                  color="#20A957"
                />
                <Text style={styles.layerDropdownButtonText}>Lớp</Text>
                <MaterialIcons
                  name={showLayerDropdown ? 'expand-less' : 'expand-more'}
                  size={20}
                  color="#757575"
                />
              </TouchableOpacity>

            </View>

            {/* POI filter chips (hiển thị khi bật POI layer) */}
            {showPoiLayer && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                {POI_FILTERS.map((f) => (
                  <TouchableOpacity
                    key={f.key}
                    style={[
                      styles.layerToggle,
                      poiCategoryFilter === f.key && styles.clickModeActive,
                    ]}
                    onPress={() => {
                      const next = poiCategoryFilter === f.key ? null : f.key;
                      setPoiCategoryFilter(next);
                      // Clear cache to refetch with new filter
                      poiCacheRef.current[currentCity] = null as any;
                    }}
                  >
                    <Text
                      style={[
                        styles.layerDropdownItemText,
                        { fontSize: 12 },
                        poiCategoryFilter === f.key && styles.clickModeTextActive,
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </ScrollView>

          {/* City Dropdown Menu */}
          {showCityDropdown && (
            <View 
              ref={cityDropdownMenuRef}
              style={[styles.layerDropdownMenuOutside, { top: cityDropdownPosition.top, left: cityDropdownPosition.left }]}
              // @ts-ignore - web only
              data-city-dropdown="true"
              // @ts-ignore - web only
              onClick={(e: any) => {
                e.stopPropagation();
              }}
            >
              <TouchableOpacity
                style={styles.layerDropdownItem}
                data-city-dropdown-item="true"
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation();
                  handleCityChange('hanoi');
                  setShowCityDropdown(false);
                }}
              >
                <MaterialIcons
                  name={currentCity === 'hanoi' ? 'check' : 'radio-button-unchecked'}
                  size={20}
                  color={currentCity === 'hanoi' ? '#20A957' : '#757575'}
                />
                <Text style={styles.layerDropdownItemText}>Hà Nội</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.layerDropdownItem}
                data-city-dropdown-item="true"
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation();
                  handleCityChange('hcm');
                  setShowCityDropdown(false);
                }}
              >
                <MaterialIcons
                  name={currentCity === 'hcm' ? 'check' : 'radio-button-unchecked'}
                  size={20}
                  color={currentCity === 'hcm' ? '#20A957' : '#757575'}
                />
                <Text style={styles.layerDropdownItemText}>TP.HCM</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Layer Dropdown Menu - đặt bên ngoài ScrollView để tránh bị cắt */}
          {showLayerDropdown && (
            <View 
              ref={layerDropdownMenuRef}
              style={[styles.layerDropdownMenuOutside, { top: layerDropdownPosition.top, left: layerDropdownPosition.left }]}
              // @ts-ignore - web only
              data-layer-dropdown="true"
              // @ts-ignore - web only
              onClick={(e: any) => {
                e.stopPropagation(); // Ngăn event bubble
              }}
            >
              <TouchableOpacity
                style={styles.layerDropdownItem}
                data-layer-dropdown-item="true"
                activeOpacity={0.7}
                onPress={async (e) => {
                  e.stopPropagation(); // Ngăn event bubble
                  console.log('Giao thông clicked, current:', showTrafficLayer);
                  const newValue = !showTrafficLayer;
                  console.log('Setting to:', newValue);
                  setShowTrafficLayer(newValue);
                  if (!newValue) {
                    // Tắt layer: chỉ clear traffic flows, giữ nguyên route và destination
                    setTrafficFlows([]);
                  } else {
                    // Bật layer: fetch traffic flows trong bán kính 2km
                    if (mapRef.current) {
                      const center = mapRef.current.getCenter();
                      if (center) {
                        setLoading(true);
                        showStatus('🔄 Đang tải dữ liệu giao thông...');
                        try {
                          const flows = await fetchTrafficFlowsInRadius(center.lat, center.lng);
                          setTrafficFlows(flows);
                          showStatus(`✅ Đã tải ${flows.length} tuyến đường`, 2000);
                        } catch (error) {
                          console.error('Error fetching traffic flows:', error);
                          showStatus('❌ Lỗi khi tải dữ liệu giao thông', 2000);
                        } finally {
                          setLoading(false);
                        }
                      }
                    }
                  }
                  // Không đóng dropdown - giữ mở để có thể chọn nhiều layer
                }}
                // @ts-ignore - web only
                onClick={async (e: any) => {
                  e.stopPropagation(); // Ngăn event bubble
                  console.log('Giao thông onClick, current:', showTrafficLayer);
                  const newValue = !showTrafficLayer;
                  console.log('Setting to:', newValue);
                  setShowTrafficLayer(newValue);
                  if (!newValue) {
                    // Tắt layer: chỉ clear traffic flows, giữ nguyên route và destination
                    setTrafficFlows([]);
                  } else {
                    // Bật layer: fetch traffic flows trong bán kính 2km
                    if (mapRef.current) {
                      const center = mapRef.current.getCenter();
                      if (center) {
                        setLoading(true);
                        showStatus('🔄 Đang tải dữ liệu giao thông...');
                        try {
                          const flows = await fetchTrafficFlowsInRadius(center.lat, center.lng);
                          setTrafficFlows(flows);
                          showStatus(`✅ Đã tải ${flows.length} tuyến đường`, 2000);
                        } catch (error) {
                          console.error('Error fetching traffic flows:', error);
                          showStatus('❌ Lỗi khi tải dữ liệu giao thông', 2000);
                        } finally {
                          setLoading(false);
                        }
                      }
                    }
                  }
                }}
              >
                <MaterialIcons
                  name={showTrafficLayer ? 'check-box' : 'check-box-outline-blank'}
                  size={20}
                  color={showTrafficLayer ? '#20A957' : '#757575'}
                />
                <Text style={styles.layerDropdownItemText}>Giao thông</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.layerDropdownItem}
                data-layer-dropdown-item="true"
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation();
                  const newValue = !showBuildingLayer;
                  setShowBuildingLayer(newValue);
                }}
                // @ts-ignore - web only
                onClick={(e: any) => {
                  e.stopPropagation();
                  const newValue = !showBuildingLayer;
                  setShowBuildingLayer(newValue);
                }}
              >
                <MaterialIcons
                  name={showBuildingLayer ? 'check-box' : 'check-box-outline-blank'}
                  size={20}
                  color={showBuildingLayer ? '#20A957' : '#757575'}
                />
                <Text style={styles.layerDropdownItemText}>Tòa nhà</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.layerDropdownItem}
                data-layer-dropdown-item="true"
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation();
                  const newValue = !showPoiLayer;
                  setShowPoiLayer(newValue);
                }}
                // @ts-ignore - web only
                onClick={(e: any) => {
                  e.stopPropagation();
                  const newValue = !showPoiLayer;
                  setShowPoiLayer(newValue);
                }}
              >
                <MaterialIcons
                  name={showPoiLayer ? 'check-box' : 'check-box-outline-blank'}
                  size={20}
                  color={showPoiLayer ? '#20A957' : '#757575'}
                />
                <Text style={styles.layerDropdownItemText}>Điểm POI (nhà hàng, ngân hàng...)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.layerDropdownItem}
                data-layer-dropdown-item="true"
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation(); // Ngăn event bubble
                  console.log('Sự cố clicked, current:', showIncidentsLayer);
                  const newValue = !showIncidentsLayer;
                  console.log('Setting to:', newValue);
                  setShowIncidentsLayer(newValue);
                  // Nếu bật lại và chưa có incidents, fetch lại
                  if (newValue && incidents.length === 0) {
                    fetchIncidents().then((data) => {
                      setIncidents(data);
                    }).catch((err) => {
                      console.error('Error fetching incidents:', err);
                    });
                  }
                  // Không đóng dropdown - giữ mở để có thể chọn nhiều layer
                }}
                // @ts-ignore - web only
                onClick={(e: any) => {
                  e.stopPropagation(); // Ngăn event bubble
                  console.log('Sự cố onClick, current:', showIncidentsLayer);
                  const newValue = !showIncidentsLayer;
                  console.log('Setting to:', newValue);
                  setShowIncidentsLayer(newValue);
                  // Nếu bật lại và chưa có incidents, fetch lại
                  if (newValue && incidents.length === 0) {
                    fetchIncidents().then((data) => {
                      setIncidents(data);
                    }).catch((err) => {
                      console.error('Error fetching incidents:', err);
                    });
                  }
                }}
              >
                <MaterialIcons
                  name={showIncidentsLayer ? 'check-box' : 'check-box-outline-blank'}
                  size={20}
                  color={showIncidentsLayer ? '#20A957' : '#757575'}
                />
                <Text style={styles.layerDropdownItemText}>Sự cố</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.layerDropdownItem}
                data-layer-dropdown-item="true"
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation(); // Ngăn event bubble
                  const newValue = !showCameraLayer;
                  console.log('Setting to:', newValue);
                  setShowCameraLayer(newValue);
                  // Không đóng dropdown - giữ mở để có thể chọn nhiều layer
                }}
                // @ts-ignore - web only
                onClick={(e: any) => {
                  e.stopPropagation(); // Ngăn event bubble
                  const newValue = !showCameraLayer;
                  console.log('Setting to:', newValue);
                  setShowCameraLayer(newValue);
                }}
              >
                <MaterialIcons
                  name={showCameraLayer ? 'check-box' : 'check-box-outline-blank'}
                  size={20}
                  color={showCameraLayer ? '#20A957' : '#757575'}
                />
                <Text style={styles.layerDropdownItemText}>Camera</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Status Message */}
        {statusMessage !== '' && (
          <View style={styles.statusBar}>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        )}

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#20A957" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        )}

        {/* Building detail panel */}
        {selectedBuilding && (
          <View style={styles.buildingPanel}>
            <View style={styles.buildingPanelHeader}>
              <Text style={styles.buildingPanelTitle}>🏢 {selectedBuilding.name}</Text>
              <TouchableOpacity onPress={() => setSelectedBuilding(null)}>
                <MaterialIcons name="close" size={22} color="#4B5563" />
              </TouchableOpacity>
            </View>
            <View style={styles.buildingPanelRow}>
              <Text style={styles.buildingPanelLabel}>Loại:</Text>
              <Text style={styles.buildingPanelValue}>{selectedBuilding.type}</Text>
            </View>
            {selectedBuilding.height ? (
              <View style={styles.buildingPanelRow}>
                <Text style={styles.buildingPanelLabel}>Chiều cao:</Text>
                <Text style={styles.buildingPanelValue}>{selectedBuilding.height} m</Text>
              </View>
            ) : null}
            {selectedBuilding.address ? (
              <View style={styles.buildingPanelRow}>
                <Text style={styles.buildingPanelLabel}>Địa chỉ:</Text>
                <Text style={styles.buildingPanelValue}>{selectedBuilding.address}</Text>
              </View>
            ) : null}
            {selectedBuilding.center ? (
              <View style={styles.buildingPanelRow}>
                <Text style={styles.buildingPanelLabel}>Tọa độ:</Text>
                <Text style={styles.buildingPanelValue}>
                  {selectedBuilding.center[0].toFixed(6)}, {selectedBuilding.center[1].toFixed(6)}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    zIndex: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  headerBackButton: {
    position: 'absolute',
    left: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#20A957',
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
    marginTop: 56,
    position: 'relative',
  },
  menuButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  notificationPanel: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#20A957',
  },
  notificationHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notificationContent: {
    padding: 12,
  },
  videoContainer: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  videoPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#1A202C',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  videoPlaceholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#9CA3AF',
  },
  notificationStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  notificationStatText: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 0,
  },
  notificationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  notificationButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#20A957',
    alignItems: 'center',
    // @ts-ignore - web only
    cursor: 'pointer',
    // @ts-ignore - web only
    userSelect: 'none',
    // @ts-ignore - web only
    WebkitUserSelect: 'none',
  },
  notificationButtonActive: {
    backgroundColor: '#20A957',
    borderColor: '#20A957',
  },
  notificationButtonText: {
    fontSize: 12,
    color: '#20A957',
    fontWeight: '600',
  },
  notificationButtonTextActive: {
    color: '#FFFFFF',
  },
  zoomControlsWrapper: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    alignItems: 'center',
    gap: 4,
    zIndex: 1000,
  },
  zoomButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 16,
    zIndex: 1000,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendDotGreen: {
    backgroundColor: '#2ECC71',
  },
  legendDotOrange: {
    backgroundColor: '#F39C12',
  },
  legendDotBlue: {
    backgroundColor: '#3498DB',
  },
  legendText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  controlsPanel: {
    minHeight: 80,
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    overflow: 'visible', // Cho phép dropdown hiện ra ngoài
  },
  controlsContent: {
    alignItems: 'center',
    gap: 8,
    overflow: 'visible', // Cho phép dropdown hiện ra ngoài
    paddingRight: 12, // Thêm padding bên phải để scroll được
    flexWrap: 'nowrap', // Không wrap, giữ horizontal scroll
  },
  controlGroup: {
    marginRight: 8,
    flexShrink: 0, // Không cho phép co lại
  },
  controlLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '600',
  },
  cityDropdownContainer: {
    position: 'relative',
    marginRight: 8,
    zIndex: 1001,
    overflow: 'visible',
    flexShrink: 0,
    minWidth: 80,
  },
  cityDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cityDropdownButtonText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
    marginRight: 2,
  },
  monitorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#20A957',
    marginRight: 8,
    flexShrink: 0, // Không cho phép co lại
  },
  monitorButtonActive: {
    backgroundColor: '#E74C3C',
  },
  monitorButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3498DB',
    marginRight: 8,
    flexShrink: 0, // Không cho phép co lại
  },
  currentLocationButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  locationStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#20A957',
    marginRight: 8,
  },
  locationStatusText: {
    fontSize: 11,
    color: '#20A957',
    fontWeight: '600',
  },
  selectDestinationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#20A957',
    marginRight: 8,
    flexShrink: 0, // Không cho phép co lại
    minWidth: 120, // Đảm bảo có đủ không gian
  },
  selectDestinationButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  confirmDestinationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#27AE60',
    marginRight: 8,
    flexShrink: 0,
  },
  confirmDestinationButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  confirmDestinationButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cancelDestinationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E74C3C',
    marginRight: 8,
  },
  cancelDestinationButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -48 }],
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  centerMarkerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E74C3C',
    marginTop: -8,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999, // Thấp hơn dropdown menu (1002)
    backgroundColor: 'transparent',
  },
  layerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    marginRight: 8,
  },
  clickModeActive: {
    backgroundColor: '#20A957',
  },
  layerToggleText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
  clickModeTextActive: {
    color: '#FFFFFF',
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#20A957',
    marginRight: 8,
    flexShrink: 0,
    // @ts-ignore - web only
    cursor: 'pointer',
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  layerDropdownContainer: {
    position: 'relative',
    marginRight: 8,
    zIndex: 1001, // Đảm bảo dropdown hiện trên các element khác
    overflow: 'visible', // Cho phép dropdown menu hiện ra ngoài
    flexShrink: 0, // Không cho phép co lại
    minWidth: 130, // Đảm bảo có đủ không gian
  },
  layerDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  layerDropdownButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    marginRight: 4,
  },
  layerDropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1002, // Cao hơn container
    minWidth: 200,
    paddingVertical: 4,
    // @ts-ignore - web only
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  layerDropdownMenuOutside: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 12,
    zIndex: 9999, // Rất cao để hiện trên mọi thứ
    minWidth: 200,
    paddingVertical: 4,
    // @ts-ignore - web only
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
  },
  layerDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
    // @ts-ignore - web only
    cursor: 'pointer',
    // @ts-ignore - web only
    userSelect: 'none',
    // @ts-ignore - web only
    WebkitUserSelect: 'none',
  },
  layerDropdownItemText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  statusBar: {
    position: 'absolute',
    bottom: 80,
    left: '50%',
    transform: [{ translateX: -100 }],
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
    maxWidth: 200,
  },
  statusText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  buildingPanel: {
    position: 'absolute',
    right: 12,
    left: 12,
    bottom: 90,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  },
  buildingPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  buildingPanelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  buildingPanelRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  buildingPanelLabel: {
    width: 80,
    color: '#6B7280',
    fontWeight: '600',
  },
  buildingPanelValue: {
    flex: 1,
    color: '#111827',
  },
});

export default MapScreen;
