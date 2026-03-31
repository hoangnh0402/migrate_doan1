// Copyright (c) 2025 hqcsystem Contributors
// Licensed under the GNU General Public License v3.0 (GPL-3.0)

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Cloud, Droplets, Wind, Thermometer, Activity, AlertTriangle, 
  Car, Gauge, Clock, RefreshCw, Download, FileText, Table,
  MapPin, Building, Route, ChevronDown, ChevronRight,
  Map, Database, Leaf, ExternalLink, Users, AreaChart, Hash
} from 'lucide-react';
import { 
  UrbanDataResponse, BoundaryDetails,
  geographicApi 
} from '@/lib/api';
import { cn } from '@/lib/utils';

interface IntegratedDataPanelProps {
  boundaryId: number | null;
  boundaryName?: string;
  boundaryDetails?: BoundaryDetails | null;
}

interface SectionState {
  osm: boolean;
  weather: boolean;
  aqi: boolean;
  traffic: boolean;
}

export default function IntegratedDataPanel({ 
  boundaryId, 
  boundaryName,
  boundaryDetails: externalDetails,
}: IntegratedDataPanelProps) {
  const [urbanData, setUrbanData] = useState<UrbanDataResponse | null>(null);
  const [boundaryDetails, setBoundaryDetails] = useState<BoundaryDetails | null>(externalDetails || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [expandedSections, setExpandedSections] = useState<SectionState>({
    osm: true,
    weather: true,
    aqi: true,
    traffic: true,
  });
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    if (externalDetails) {
      setBoundaryDetails(externalDetails);
    }
  }, [externalDetails]);

  const fetchData = useCallback(async () => {
    if (!boundaryId) return;
    setLoading(true);
    setError(null);
    
    try {
      const fetchPromises: Promise<unknown>[] = [geographicApi.getUrbanData(boundaryId)];
      if (!externalDetails) {
        fetchPromises.push(geographicApi.getBoundaryDetails(boundaryId, false));
      }
      
      const results = await Promise.all(fetchPromises);
      setUrbanData(results[0] as UrbanDataResponse);
      if (!externalDetails) {
        setBoundaryDetails(results[1] as BoundaryDetails);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u');
    } finally {
      setLoading(false);
    }
  }, [boundaryId, externalDetails]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleSection = (section: keyof SectionState) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const expandAll = () => setExpandedSections({ osm: true, weather: true, aqi: true, traffic: true });
  const collapseAll = () => setExpandedSections({ osm: false, weather: false, aqi: false, traffic: false });

  // Helper functions
  const getAQILevel = (aqi: number): { label: string; color: string; bgColor: string } => {
    if (aqi <= 50) return { label: 'Tá»‘t', color: 'text-green-600', bgColor: 'bg-green-500' };
    if (aqi <= 100) return { label: 'Trung bÃ¬nh', color: 'text-yellow-600', bgColor: 'bg-yellow-500' };
    if (aqi <= 150) return { label: 'KÃ©m', color: 'text-orange-600', bgColor: 'bg-orange-500' };
    if (aqi <= 200) return { label: 'Xáº¥u', color: 'text-red-600', bgColor: 'bg-red-500' };
    if (aqi <= 300) return { label: 'Ráº¥t xáº¥u', color: 'text-purple-600', bgColor: 'bg-purple-500' };
    return { label: 'Nguy háº¡i', color: 'text-rose-700', bgColor: 'bg-rose-700' };
  };

  const getTrafficLevel = (congestion: number): { label: string; color: string; bgColor: string } => {
    if (congestion < 20) return { label: 'ThÃ´ng thoÃ¡ng', color: 'text-green-600', bgColor: 'bg-green-500' };
    if (congestion < 40) return { label: 'BÃ¬nh thÆ°á»ng', color: 'text-emerald-600', bgColor: 'bg-emerald-500' };
    if (congestion < 60) return { label: 'ÄÃ´ng Ä‘Ãºc', color: 'text-yellow-600', bgColor: 'bg-yellow-500' };
    if (congestion < 80) return { label: 'Ã™n táº¯c', color: 'text-orange-600', bgColor: 'bg-orange-500' };
    return { label: 'Táº¯c ngháº½n', color: 'text-red-600', bgColor: 'bg-red-500' };
  };

  const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null) return '--';
    return num.toLocaleString('vi-VN');
  };

  // Category name translations
  const getCategoryName = (category: string): string => {
    const names: Record<string, string> = {
      amenity: 'Tiá»‡n Ã­ch',
      shop: 'Cá»­a hÃ ng',
      tourism: 'Du lá»‹ch',
      leisure: 'Giáº£i trÃ­',
      healthcare: 'Y táº¿',
      education: 'GiÃ¡o dá»¥c',
      finance: 'TÃ i chÃ­nh',
      food: 'áº¨m thá»±c',
      government: 'CÆ¡ quan',
      religion: 'TÃ´n giÃ¡o',
      transport: 'Giao thÃ´ng',
      office: 'VÄƒn phÃ²ng',
      building: 'CÃ´ng trÃ¬nh',
      other: 'KhÃ¡c',
    };
    return names[category] || category;
  };

  // Highway type translations
  const getHighwayTypeName = (type: string): string => {
    const names: Record<string, string> = {
      primary: 'ÄÆ°á»ng chÃ­nh',
      secondary: 'ÄÆ°á»ng phá»¥',
      tertiary: 'ÄÆ°á»ng nhÃ¡nh',
      residential: 'Khu dÃ¢n cÆ°',
      service: 'ÄÆ°á»ng dá»‹ch vá»¥',
      footway: 'ÄÆ°á»ng Ä‘i bá»™',
      path: 'ÄÆ°á»ng mÃ²n',
      cycleway: 'ÄÆ°á»ng xe Ä‘áº¡p',
      unclassified: 'ChÆ°a phÃ¢n loáº¡i',
      living_street: 'Phá»‘ Ä‘i bá»™',
      pedestrian: 'Khu Ä‘i bá»™',
      track: 'ÄÆ°á»ng Ä‘áº¥t',
      trunk: 'ÄÆ°á»ng cao tá»‘c',
      motorway: 'Xa lá»™',
    };
    return names[type] || type;
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!urbanData && !boundaryDetails) return;
    const name = boundaryName || boundaryDetails?.boundary.name || 'boundary';
    const rows: string[][] = [['Nguá»“n', 'Chá»‰ sá»‘', 'GiÃ¡ trá»‹', 'ÄÆ¡n vá»‹']];

    if (boundaryDetails) {
      const stats = boundaryDetails.statistics;
      rows.push(['OSM', 'TÃªn khu vá»±c', boundaryDetails.boundary.name, '']);
      rows.push(['OSM', 'Loáº¡i', boundaryDetails.boundary.admin_level === 6 ? 'Quáº­n/Huyá»‡n' : 'PhÆ°á»ng/XÃ£', '']);
      rows.push(['OSM', 'Diá»‡n tÃ­ch', (boundaryDetails.boundary.area_km2 || 0).toFixed(2), 'kmÂ²']);
      rows.push(['OSM', 'Sá»‘ POI', String(stats.pois.total || 0), '']);
      rows.push(['OSM', 'Sá»‘ Ä‘Æ°á»ng', String(stats.streets.total || 0), '']);
      rows.push(['OSM', 'Sá»‘ tÃ²a nhÃ ', String(stats.buildings.total || 0), '']);
    }

    if (urbanData?.weather) {
      rows.push(['OpenWeather', 'Nhiá»‡t Ä‘á»™', String(urbanData.weather.temperature?.toFixed(1) || '--'), 'Â°C']);
      rows.push(['OpenWeather', 'Cáº£m giÃ¡c nhÆ°', String(urbanData.weather.feels_like?.toFixed(1) || '--'), 'Â°C']);
      rows.push(['OpenWeather', 'Äá»™ áº©m', String(urbanData.weather.humidity || '--'), '%']);
      rows.push(['OpenWeather', 'Tá»‘c Ä‘á»™ giÃ³', String(urbanData.weather.wind_speed?.toFixed(1) || '--'), 'm/s']);
    }

    if (urbanData?.air_quality) {
      rows.push(['AQICN', 'Chá»‰ sá»‘ AQI', String(urbanData.air_quality.aqi || '--'), '']);
      rows.push(['AQICN', 'PM2.5', String(urbanData.air_quality.pm25?.toFixed(1) || '--'), 'Âµg/mÂ³']);
      rows.push(['AQICN', 'PM10', String(urbanData.air_quality.pm10?.toFixed(1) || '--'), 'Âµg/mÂ³']);
    }

    if (urbanData?.traffic) {
      rows.push(['TomTom', 'Tá»‘c Ä‘á»™ hiá»‡n táº¡i', String(urbanData.traffic.current_speed || '--'), 'km/h']);
      rows.push(['TomTom', 'Tá»‘c Ä‘á»™ thÃ´ng thÆ°á»ng', String(urbanData.traffic.free_flow_speed || '--'), 'km/h']);
      rows.push(['TomTom', 'Má»©c Ä‘á»™ Ã¹n táº¯c', String(urbanData.traffic.congestion_percent?.toFixed(0) || '--'), '%']);
    }

    const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hqcsystem_${name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Export JSON
  const handleExportJSON = () => {
    if (!urbanData && !boundaryDetails) return;
    const name = boundaryName || boundaryDetails?.boundary.name || 'boundary';
    const data = {
      metadata: {
        boundary_name: name,
        exported_at: new Date().toISOString(),
        data_sources: ['OSM', 'OpenWeather', 'AQICN', 'TomTom'],
      },
      osm: boundaryDetails ? {
        name: boundaryDetails.boundary.name,
        osm_id: boundaryDetails.boundary.osm_id,
        admin_level: boundaryDetails.boundary.admin_level,
        area_km2: boundaryDetails.boundary.area_km2,
        statistics: boundaryDetails.statistics,
      } : null,
      openweather: urbanData?.weather || null,
      aqicn: urbanData?.air_quality || null,
      tomtom: urbanData?.traffic || null,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hqcsystem_${name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const boundary = boundaryDetails?.boundary;
  const statistics = boundaryDetails?.statistics;

  if (!boundaryId) {
    return (
      <div className="bg-card rounded-lg border border-border p-6 text-center">
        <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">Chá»n má»™t khu vá»±c Ä‘á»ƒ xem dá»¯ liá»‡u</p>
      </div>
    );
  }

  // Section Header Component
  const SectionHeader = ({ 
    section, 
    icon: Icon, 
    title, 
    source, 
    sourceUrl,
    status 
  }: { 
    section: keyof SectionState; 
    icon: React.ComponentType<{ className?: string }>;
    title: string; 
    source: string;
    sourceUrl?: string;
    status?: { label: string; color: string; bgColor: string } | null;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-2.5 bg-accent/5 hover:bg-accent/10 rounded-t-lg transition-colors group"
    >
      <div className="flex items-center gap-2">
        <div className={cn(
          "p-1.5 rounded-md",
          section === 'osm' && "bg-blue-500/20 text-blue-600",
          section === 'weather' && "bg-sky-500/20 text-sky-600",
          section === 'aqi' && "bg-emerald-500/20 text-emerald-600",
          section === 'traffic' && "bg-orange-500/20 text-orange-600"
        )}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-foreground">{title}</div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Database className="w-2.5 h-2.5" />
            <span>{source}</span>
            {sourceUrl && (
              <a 
                href={sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {status && (
          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium text-white", status.bgColor)}>
            {status.label}
          </span>
        )}
        {expandedSections[section] ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
    </button>
  );

  // Data Row Component
  const DataRow = ({ icon: Icon, label, value, unit }: {
    icon?: React.ComponentType<{ className?: string }>;
    label: string;
    value: string | number | null | undefined;
    unit?: string;
  }) => (
    <div className="flex items-center justify-between py-1.5 px-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-xs font-medium text-foreground">
        {value ?? '--'}{unit && <span className="text-muted-foreground ml-0.5">{unit}</span>}
      </span>
    </div>
  );

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-accent/10 border-b border-border px-3 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
          <span className="text-sm font-semibold text-foreground truncate">
            {boundaryName || boundary?.name || 'Äang táº£i...'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-1.5 hover:bg-accent/20 rounded transition-colors"
            title="LÃ m má»›i dá»¯ liá»‡u"
          >
            <RefreshCw className={cn("w-4 h-4 text-muted-foreground", loading && "animate-spin")} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-1.5 hover:bg-accent/20 rounded transition-colors"
              title="Xuáº¥t dá»¯ liá»‡u"
            >
              <Download className="w-4 h-4 text-muted-foreground" />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 py-1 min-w-[140px]">
                <button onClick={handleExportCSV} className="w-full px-3 py-2 text-left text-sm hover:bg-accent/20 flex items-center gap-2">
                  <Table className="w-4 h-4 text-green-600" />
                  Xuáº¥t CSV
                </button>
                <button onClick={handleExportJSON} className="w-full px-3 py-2 text-left text-sm hover:bg-accent/20 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Xuáº¥t JSON
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-3 py-2 border-b border-border flex items-center justify-between bg-muted/30">
        <span className="text-[10px] text-muted-foreground">
          {lastUpdated ? `Cáº­p nháº­t: ${lastUpdated.toLocaleTimeString('vi-VN')}` : 'Äang táº£i...'}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={expandAll} className="px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent/20 rounded">
            Má»Ÿ táº¥t cáº£
          </button>
          <span className="text-muted-foreground">|</span>
          <button onClick={collapseAll} className="px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent/20 rounded">
            Thu gá»n
          </button>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-center">
            <AlertTriangle className="w-5 h-5 text-destructive mx-auto mb-1" />
            <p className="text-xs text-destructive">{error}</p>
            <button onClick={fetchData} className="text-xs text-accent underline mt-1">Thá»­ láº¡i</button>
          </div>
        )}

        {loading && !urbanData && !boundaryDetails && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 text-accent animate-spin" />
          </div>
        )}

        {/* OSM Section */}
        <div className="border border-blue-500/30 rounded-lg overflow-hidden">
          <SectionHeader section="osm" icon={Map} title="Dá»¯ liá»‡u Ä‘á»‹a lÃ½" source="OpenStreetMap" sourceUrl="https://www.openstreetmap.org/" />
          {expandedSections.osm && (
            <div className="border-t border-blue-500/20 bg-blue-500/5">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-3 gap-px bg-blue-500/20 p-px">
                <div className="bg-card p-2 text-center">
                  <AreaChart className="w-3.5 h-3.5 mx-auto mb-0.5 text-blue-600" />
                  <p className="text-sm font-bold text-foreground">{boundary?.area_km2?.toFixed(2) || '--'}</p>
                  <p className="text-[9px] text-muted-foreground">kmÂ²</p>
                </div>
                <div className="bg-card p-2 text-center">
                  <Users className="w-3.5 h-3.5 mx-auto mb-0.5 text-blue-600" />
                  <p className="text-sm font-bold text-foreground">
                    {boundary?.population ? boundary.population.toLocaleString('vi-VN') : 'â€”'}
                  </p>
                  <p className="text-[9px] text-muted-foreground">DÃ¢n sá»‘</p>
                </div>
                <div className="bg-card p-2 text-center">
                  <MapPin className="w-3.5 h-3.5 mx-auto mb-0.5 text-blue-600" />
                  <p className="text-sm font-bold text-foreground">{formatNumber(statistics?.pois.total)}</p>
                  <p className="text-[9px] text-muted-foreground">Äá»‹a Ä‘iá»ƒm</p>
                </div>
              </div>

              {/* Density Analysis */}
              {boundary?.area_km2 && statistics && (
                <div className="p-2 border-t border-blue-500/10">
                  <p className="text-[10px] font-medium text-muted-foreground mb-1.5">Máº­t Ä‘á»™ phÃ¢n bá»‘</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded text-center">
                      <p className="text-xs font-bold text-blue-700 dark:text-blue-400">
                        {(statistics.pois.total / boundary.area_km2).toFixed(1)}
                      </p>
                      <p className="text-[8px] text-blue-600 dark:text-blue-500">POI/kmÂ²</p>
                    </div>
                    <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded text-center">
                      <p className="text-xs font-bold text-green-700 dark:text-green-400">
                        {(statistics.streets.total / boundary.area_km2).toFixed(0)}
                      </p>
                      <p className="text-[8px] text-green-600 dark:text-green-500">ÄÆ°á»ng/kmÂ²</p>
                    </div>
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded text-center">
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                        {(statistics.buildings.total / boundary.area_km2).toFixed(0)}
                      </p>
                      <p className="text-[8px] text-amber-600 dark:text-amber-500">CT/kmÂ²</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Infrastructure Details */}
              <div className="divide-y divide-blue-500/10">
                <DataRow icon={Building} label="Tá»•ng sá»‘ tÃ²a nhÃ " value={formatNumber(statistics?.buildings.total)} />
                <DataRow icon={Hash} label="TÃ²a nhÃ  cÃ³ tÃªn" value={formatNumber(statistics?.buildings.named)} />
                <DataRow icon={Route} label="Tá»•ng sá»‘ Ä‘Æ°á»ng" value={formatNumber(statistics?.streets.total)} />
                <DataRow icon={Hash} label="ÄÆ°á»ng cÃ³ tÃªn" value={formatNumber(statistics?.streets.named)} />
                <DataRow icon={MapPin} label="Loáº¡i POI khÃ¡c nhau" value={statistics?.pois.category_types} unit="loáº¡i" />
              </div>

              {/* POI by Category */}
              {statistics?.pois.by_category && Object.keys(statistics.pois.by_category).length > 0 && (
                <div className="p-2 border-t border-blue-500/10">
                  <p className="text-[10px] font-medium text-muted-foreground mb-1.5">PhÃ¢n loáº¡i Ä‘á»‹a Ä‘iá»ƒm (POI)</p>
                  <div className="space-y-1">
                    {Object.entries(statistics.pois.by_category)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 6)
                      .map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground capitalize">{getCategoryName(category)}</span>
                          <div className="flex items-center gap-1">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: `${Math.min((count / statistics.pois.total) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="font-medium w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Street Types */}
              {statistics?.streets.by_highway_type && Object.keys(statistics.streets.by_highway_type).length > 0 && (
                <div className="p-2 border-t border-blue-500/10">
                  <p className="text-[10px] font-medium text-muted-foreground mb-1.5">Loáº¡i Ä‘Æ°á»ng</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(statistics.streets.by_highway_type)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([type, count]) => (
                        <span key={type} className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-[9px]">
                          {getHighwayTypeName(type)}: {count}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Weather Section - OpenWeather */}
        <div className="border border-sky-500/30 rounded-lg overflow-hidden">
          <SectionHeader
            section="weather"
            icon={Cloud}
            title="Thá»i tiáº¿t"
            source="OpenWeatherMap"
            sourceUrl="https://openweathermap.org/"
            status={urbanData?.weather ? { label: `${urbanData.weather.temperature?.toFixed(0)}Â°C`, color: 'text-sky-600', bgColor: 'bg-sky-500' } : null}
          />
          {expandedSections.weather && (
            <div className="border-t border-sky-500/20 bg-sky-500/5 divide-y divide-sky-500/10">
              {urbanData?.weather ? (
                <>
                  <DataRow icon={Thermometer} label="Nhiá»‡t Ä‘á»™" value={urbanData.weather.temperature?.toFixed(1)} unit="Â°C" />
                  <DataRow icon={Thermometer} label="Cáº£m giÃ¡c nhÆ°" value={urbanData.weather.feels_like?.toFixed(1)} unit="Â°C" />
                  <DataRow icon={Droplets} label="Äá»™ áº©m" value={urbanData.weather.humidity} unit="%" />
                  <DataRow icon={Wind} label="Tá»‘c Ä‘á»™ giÃ³" value={urbanData.weather.wind_speed?.toFixed(1)} unit="m/s" />
                  <DataRow icon={Cloud} label="MÃ¢y che phá»§" value={urbanData.weather.clouds} unit="%" />
                </>
              ) : (
                <div className="p-3 text-center text-xs text-muted-foreground">{loading ? 'Äang táº£i...' : 'KhÃ´ng cÃ³ dá»¯ liá»‡u'}</div>
              )}
            </div>
          )}
        </div>

        {/* AQI Section - AQICN */}
        <div className="border border-emerald-500/30 rounded-lg overflow-hidden">
          <SectionHeader
            section="aqi"
            icon={Leaf}
            title="Cháº¥t lÆ°á»£ng khÃ´ng khÃ­"
            source="AQICN / WAQI"
            sourceUrl="https://aqicn.org/"
            status={urbanData?.air_quality ? getAQILevel(urbanData.air_quality.aqi) : null}
          />
          {expandedSections.aqi && (
            <div className="border-t border-emerald-500/20 bg-emerald-500/5 divide-y divide-emerald-500/10">
              {urbanData?.air_quality ? (
                <>
                  <div className="p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Chá»‰ sá»‘ AQI</span>
                      <span className={cn("text-lg font-bold", getAQILevel(urbanData.air_quality.aqi).color)}>{urbanData.air_quality.aqi}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", getAQILevel(urbanData.air_quality.aqi).bgColor)} style={{ width: `${Math.min(urbanData.air_quality.aqi / 3, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                      <span>0 Tá»‘t</span>
                      <span>100 TB</span>
                      <span>200 Xáº¥u</span>
                      <span>300+</span>
                    </div>
                  </div>
                  <DataRow icon={Activity} label="PM2.5" value={urbanData.air_quality.pm25?.toFixed(1)} unit="Âµg/mÂ³" />
                  <DataRow icon={Activity} label="PM10" value={urbanData.air_quality.pm10?.toFixed(1)} unit="Âµg/mÂ³" />
                  <DataRow icon={Activity} label="Oâ‚ƒ (Ozone)" value={urbanData.air_quality.o3?.toFixed(1)} unit="Âµg/mÂ³" />
                  <DataRow icon={Activity} label="NOâ‚‚" value={urbanData.air_quality.no2?.toFixed(1)} unit="Âµg/mÂ³" />
                  <DataRow icon={Activity} label="SOâ‚‚" value={urbanData.air_quality.so2?.toFixed(1)} unit="Âµg/mÂ³" />
                  <DataRow icon={Activity} label="CO" value={urbanData.air_quality.co?.toFixed(1)} unit="Âµg/mÂ³" />
                </>
              ) : (
                <div className="p-3 text-center text-xs text-muted-foreground">{loading ? 'Äang táº£i...' : 'KhÃ´ng cÃ³ dá»¯ liá»‡u'}</div>
              )}
            </div>
          )}
        </div>

        {/* Traffic Section - TomTom */}
        <div className="border border-orange-500/30 rounded-lg overflow-hidden">
          <SectionHeader
            section="traffic"
            icon={Car}
            title="Giao thÃ´ng"
            source="TomTom Traffic"
            sourceUrl="https://www.tomtom.com/traffic-index/"
            status={urbanData?.traffic ? getTrafficLevel(urbanData.traffic.congestion_percent || 0) : null}
          />
          {expandedSections.traffic && (
            <div className="border-t border-orange-500/20 bg-orange-500/5 divide-y divide-orange-500/10">
              {urbanData?.traffic ? (
                <>
                  <div className="p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Má»©c Ä‘á»™ Ã¹n táº¯c</span>
                      <span className={cn("text-lg font-bold", getTrafficLevel(urbanData.traffic.congestion_percent || 0).color)}>
                        {urbanData.traffic.congestion_percent?.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", getTrafficLevel(urbanData.traffic.congestion_percent || 0).bgColor)} style={{ width: `${Math.min(urbanData.traffic.congestion_percent || 0, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                      <span>ThÃ´ng thoÃ¡ng</span>
                      <span>ÄÃ´ng Ä‘Ãºc</span>
                      <span>Táº¯c ngháº½n</span>
                    </div>
                  </div>
                  <DataRow icon={Gauge} label="Tá»‘c Ä‘á»™ hiá»‡n táº¡i" value={urbanData.traffic.current_speed} unit="km/h" />
                  <DataRow icon={Gauge} label="Tá»‘c Ä‘á»™ thÃ´ng thÆ°á»ng" value={urbanData.traffic.free_flow_speed} unit="km/h" />
                  {urbanData.traffic.travel_time && (
                    <DataRow icon={Clock} label="Thá»i gian di chuyá»ƒn" value={urbanData.traffic.travel_time} unit="giÃ¢y" />
                  )}
                  <div className="p-2 bg-orange-500/10">
                    <div className="text-[10px] text-muted-foreground mb-1">ChÃº thÃ­ch mÃ u Ä‘Æ°á»ng trÃªn báº£n Ä‘á»“:</div>
                    <div className="grid grid-cols-2 gap-1 text-[9px]">
                      <div className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-green-500"></span><span>ThÃ´ng thoÃ¡ng</span></div>
                      <div className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-yellow-500"></span><span>Cháº­m</span></div>
                      <div className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-orange-500"></span><span>ÄÃ´ng Ä‘Ãºc</span></div>
                      <div className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-red-600"></span><span>Ã™n táº¯c</span></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-3 text-center text-xs text-muted-foreground">{loading ? 'Äang táº£i...' : 'KhÃ´ng cÃ³ dá»¯ liá»‡u'}</div>
              )}
            </div>
          )}
        </div>

        {/* LOD Summary */}
        <div className="mt-3 p-2.5 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-3.5 h-3.5 text-accent" />
            <span className="text-[10px] font-medium text-foreground">Nguá»“n dá»¯ liá»‡u LOD</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[9px]">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-muted-foreground">OSM - Äá»‹a lÃ½</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-sky-500"></div>
              <span className="text-muted-foreground">OpenWeather - Thá»i tiáº¿t</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-muted-foreground">AQICN - KhÃ´ng khÃ­</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-muted-foreground">TomTom - Giao thÃ´ng</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

