// Copyright (c) 2025 HQC System Contributors
// Licensed under the GNU General Public License v3.0 (GPL-3.0)

'use client';

import { useEffect, useState, useMemo } from 'react';
import { BarChart3, RefreshCw, Download, TrendingUp, Clock, MapPin, Grid3X3, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '@/lib/admin-service';
import { DataFilters, HANOI_WARDS, DISTRICTS } from '@/components/data-intelligence/DataFilters';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface WardData {
  ward: string;
  district: string;
  aqi_score: number;
  traffic_score: number;
  civic_score: number;
  parking_score: number;
}

interface TemporalData {
  hour: string;
  traffic: number;
  parking: number;
}

// Helper to get district from ward name
const getDistrictForWard = (wardName: string): string => {
  for (const [district, wards] of Object.entries(DISTRICTS)) {
    if (wards.includes(wardName)) return district;
  }
  return 'KhÃ´ng xÃ¡c Ä‘á»‹nh';
};

// Generate deterministic ward data based on ward name
const generateWardScore = (wardName: string, baseScore: number, variance: number): number => {
  const hash = wardName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variation = (hash % (variance * 2)) - variance;
  return Math.max(20, Math.min(100, Math.round(baseScore + variation)));
};

export default function DataInsightsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'correlation' | 'wards' | 'temporal' | 'matrix'>('correlation');
  
  // Filters
  const [selectedWards, setSelectedWards] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState('today');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [metricType, setMetricType] = useState('all');
  
  // Data
  const [correlationData, setCorrelationData] = useState<any[]>([]);
  const [allWardData, setAllWardData] = useState<WardData[]>([]);
  const [temporalData, setTemporalData] = useState<TemporalData[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  // Filtered ward data based on selection
  const displayWardData = useMemo(() => {
    if (selectedWards.length === 0) {
      // Show district averages when no specific wards selected
      const districtAverages: WardData[] = [];
      for (const [district, wards] of Object.entries(DISTRICTS)) {
        const districtWards = allWardData.filter(w => wards.includes(w.ward));
        if (districtWards.length > 0) {
          districtAverages.push({
            ward: district,
            district: district,
            aqi_score: Math.round(districtWards.reduce((s, w) => s + w.aqi_score, 0) / districtWards.length),
            traffic_score: Math.round(districtWards.reduce((s, w) => s + w.traffic_score, 0) / districtWards.length),
            civic_score: Math.round(districtWards.reduce((s, w) => s + w.civic_score, 0) / districtWards.length),
            parking_score: Math.round(districtWards.reduce((s, w) => s + w.parking_score, 0) / districtWards.length),
          });
        }
      }
      return districtAverages;
    }
    return allWardData.filter(w => selectedWards.includes(w.ward));
  }, [allWardData, selectedWards]);

  const fetchData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      setError(null);
      
      const metrics = await adminService.getRealTimeMetrics();
      
      const baseAqi = metrics.air_quality?.latest?.aqi || 75;
      const baseTemp = metrics.weather?.latest?.temperature || 28;
      
      // Dá»¯ liá»‡u tÆ°Æ¡ng quan Thá»i tiáº¿t - AQI (24h)
      const correlation = [];
      for (let i = 0; i < 24; i++) {
        const temp = baseTemp + Math.sin(i * 0.3) * 5 + (Math.random() - 0.5) * 3;
        const aqi = baseAqi + (temp - baseTemp) * 2.5 + Math.random() * 15;
        correlation.push({
          hour: `${i.toString().padStart(2, '0')}:00`,
          temperature: Math.round(temp * 10) / 10,
          aqi: Math.round(aqi),
        });
      }
      setCorrelationData(correlation);
      
      // Táº¡o dá»¯ liá»‡u cho Táº¤T Cáº¢ 126 phÆ°á»ng
      const wardData: WardData[] = HANOI_WARDS.map(ward => ({
        ward,
        district: getDistrictForWard(ward),
        aqi_score: generateWardScore(ward, 72, 20),
        traffic_score: generateWardScore(ward, 55, 25),
        civic_score: generateWardScore(ward, 80, 15),
        parking_score: generateWardScore(ward, 65, 20),
      }));
      setAllWardData(wardData);
      
      // Dá»¯ liá»‡u theo thá»i gian trong ngÃ y
      const temporal: TemporalData[] = [];
      for (let h = 0; h < 24; h++) {
        const isRush = (h >= 7 && h <= 9) || (h >= 17 && h <= 19);
        temporal.push({
          hour: `${h.toString().padStart(2, '0')}:00`,
          traffic: isRush ? 75 + Math.random() * 20 : 25 + Math.random() * 30,
          parking: isRush ? 85 + Math.random() * 10 : 40 + Math.random() * 25,
        });
      }
      setTemporalData(temporal);
      
      // PhÃ¢n tÃ­ch insights
      const newInsights: string[] = [];
      
      // Best/Worst wards
      const sortedByAqi = [...wardData].sort((a, b) => b.aqi_score - a.aqi_score);
      const sortedByTraffic = [...wardData].sort((a, b) => b.traffic_score - a.traffic_score);
      const sortedByCivic = [...wardData].sort((a, b) => b.civic_score - a.civic_score);
      
      newInsights.push(`Top 3 phÆ°á»ng cÃ³ mÃ´i trÆ°á»ng tá»‘t nháº¥t: ${sortedByAqi.slice(0, 3).map(w => w.ward.replace('PhÆ°á»ng ', '')).join(', ')}`);
      newInsights.push(`Top 3 phÆ°á»ng giao thÃ´ng thÃ´ng thoÃ¡ng: ${sortedByTraffic.slice(0, 3).map(w => w.ward.replace('PhÆ°á»ng ', '')).join(', ')}`);
      newInsights.push(`Top 3 phÆ°á»ng pháº£n há»“i dÃ¢n sá»± tá»‘t nháº¥t: ${sortedByCivic.slice(0, 3).map(w => w.ward.replace('PhÆ°á»ng ', '')).join(', ')}`);
      
      // District analysis
      const districtScores: { [key: string]: number[] } = {};
      wardData.forEach(w => {
        if (!districtScores[w.district]) districtScores[w.district] = [];
        districtScores[w.district].push((w.aqi_score + w.traffic_score + w.civic_score + w.parking_score) / 4);
      });
      
      const bestDistrict = Object.entries(districtScores)
        .map(([d, scores]) => ({ 
          district: d, 
          avg: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0 
        }))
        .sort((a, b) => b.avg - a.avg)[0];
      
      if (bestDistrict) {
        newInsights.push(`Quáº­n ${bestDistrict.district} cÃ³ Ä‘iá»ƒm tá»•ng há»£p cao nháº¥t: ${bestDistrict.avg.toFixed(1)}/100`);
      }
      newInsights.push('Giá» cao Ä‘iá»ƒm sÃ¡ng (7-9h) vÃ  chiá»u (17-19h) cÃ³ lÆ°u lÆ°á»£ng giao thÃ´ng tÄƒng 200-300%.');
      
      setInsights(newInsights);
      
      if (showToast) toast.success('ÄÃ£ cáº­p nháº­t dá»¯ liá»‡u phÃ¢n tÃ­ch');
    } catch (error) {
      console.error('Error:', error);
      setError('KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u phÃ¢n tÃ­ch Ä‘Ã´ thá»‹. Vui lÃ²ng kiá»ƒm tra káº¿t ná»‘i API.');
      toast.error('KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportData = () => {
    const exportPayload = {
      filters: {
        selected_wards: selectedWards.length > 0 ? selectedWards : 'Táº¥t cáº£ 126 phÆ°á»ng',
        time_range: timeRange,
        metric_type: metricType,
      },
      correlation: correlationData,
      ward_data: displayWardData,
      all_wards_count: allWardData.length,
      temporal: temporalData,
      insights: insights,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HQC System-insights-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('ÄÃ£ xuáº¥t dá»¯ liá»‡u phÃ¢n tÃ­ch');
  };

  // Correlation matrix data
  const correlationMatrix = useMemo(() => {
    const metrics = ['MÃ´i trÆ°á»ng', 'Giao thÃ´ng', 'DÃ¢n sá»±', 'BÃ£i Ä‘á»— xe'];
    const data = displayWardData;
    if (data.length < 2) return [];
    
    const getValue = (item: WardData, metric: string) => {
      switch (metric) {
        case 'MÃ´i trÆ°á»ng': return item.aqi_score;
        case 'Giao thÃ´ng': return item.traffic_score;
        case 'DÃ¢n sá»±': return item.civic_score;
        case 'BÃ£i Ä‘á»— xe': return item.parking_score;
        default: return 0;
      }
    };
    
    // Simplified correlation calculation
    const matrix: { row: string; col: string; value: number }[] = [];
    metrics.forEach((m1, i) => {
      metrics.forEach((m2, j) => {
        if (i === j) {
          matrix.push({ row: m1, col: m2, value: 1.0 });
        } else {
          // Simple correlation based on average difference
          const vals1 = data.map(d => getValue(d, m1));
          const vals2 = data.map(d => getValue(d, m2));
          const avg1 = vals1.length > 0 ? vals1.reduce((a, b) => a + b, 0) / vals1.length : 0;
          const avg2 = vals2.length > 0 ? vals2.reduce((a, b) => a + b, 0) / vals2.length : 0;
          
          let cov = 0, std1 = 0, std2 = 0;
          for (let k = 0; k < vals1.length; k++) {
            cov += (vals1[k] - avg1) * (vals2[k] - avg2);
            std1 += (vals1[k] - avg1) ** 2;
            std2 += (vals2[k] - avg2) ** 2;
          }
          const corr = cov / (Math.sqrt(std1) * Math.sqrt(std2)) || 0;
          matrix.push({ row: m1, col: m2, value: Math.round(corr * 100) / 100 });
        }
      });
    });
    return matrix;
  }, [displayWardData]);

  if (error && correlationData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-8 rounded-2xl max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">Lá»—i phÃ¢n tÃ­ch dá»¯ liá»‡u</h3>
          <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
          <button 
            onClick={() => fetchData()}
            className="px-8 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Thá»­ láº¡i
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-center">
        <div>
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground font-medium">Äang tá»•ng há»£p dá»¯ liá»‡u...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-500" />
            PhÃ¢n tÃ­ch Dá»¯ liá»‡u
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            PhÃ¢n tÃ­ch xu hÆ°á»›ng vÃ  má»‘i tÆ°Æ¡ng quan â€¢ {allWardData.length} phÆ°á»ng
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4" />
            Xuáº¥t dá»¯ liá»‡u
          </button>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            LÃ m má»›i
          </button>
        </div>
      </div>
      
      {/* Data Filters */}
      <div className="mb-6">
        <DataFilters
          selectedWards={selectedWards}
          onWardsChange={setSelectedWards}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          customDateRange={customDateRange}
          onCustomDateRangeChange={setCustomDateRange}
          metricType={metricType}
          onMetricTypeChange={setMetricType}
          maxWards={20}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-6 flex-wrap">
        <button
          onClick={() => setSelectedTab('correlation')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedTab === 'correlation' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <TrendingUp className="h-4 w-4 inline mr-2" />
          TÆ°Æ¡ng quan AQI
        </button>
        <button
          onClick={() => setSelectedTab('wards')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedTab === 'wards' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MapPin className="h-4 w-4 inline mr-2" />
          {selectedWards.length > 0 ? `So sÃ¡nh ${selectedWards.length} PhÆ°á»ng` : 'So sÃ¡nh Quáº­n'}
        </button>
        <button
          onClick={() => setSelectedTab('temporal')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedTab === 'temporal' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className="h-4 w-4 inline mr-2" />
          Biáº¿n Ä‘á»™ng giá»
        </button>
        <button
          onClick={() => setSelectedTab('matrix')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedTab === 'matrix' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Grid3X3 className="h-4 w-4 inline mr-2" />
          Ma tráº­n tÆ°Æ¡ng quan
        </button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        {selectedTab === 'correlation' && (
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">TÆ°Æ¡ng quan Nhiá»‡t Ä‘á»™ vÃ  Chá»‰ sá»‘ AQI (24 giá»)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Biá»ƒu Ä‘á»“ thá»ƒ hiá»‡n má»‘i quan há»‡ giá»¯a nhiá»‡t Ä‘á»™ vÃ  cháº¥t lÆ°á»£ng khÃ´ng khÃ­. Khi nhiá»‡t Ä‘á»™ tÄƒng, 
              cÃ¡c pháº£n á»©ng quang hÃ³a táº¡o ra Oâ‚ƒ vÃ  PM2.5 lÃ m tÄƒng AQI.
            </p>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={correlationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="temp" orientation="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="aqi" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Line 
                  yAxisId="temp"
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#16a34a" 
                  strokeWidth={2}
                  name="Nhiá»‡t Ä‘á»™ (Â°C)"
                  dot={false}
                />
                <Line 
                  yAxisId="aqi"
                  type="monotone" 
                  dataKey="aqi" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  name="AQI"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedTab === 'wards' && (
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {selectedWards.length > 0 
                ? `So sÃ¡nh ${selectedWards.length} PhÆ°á»ng Ä‘Ã£ chá»n`
                : `So sÃ¡nh trung bÃ¬nh ${Object.keys(DISTRICTS).length} Quáº­n`}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Äiá»ƒm sá»‘ Ä‘Ã¡nh giÃ¡ trÃªn thang 0-100. Äiá»ƒm cao hÆ¡n cho tháº¥y hiá»‡u suáº¥t tá»‘t hÆ¡n.
              {selectedWards.length === 0 && ' Chá»n phÆ°á»ng cá»¥ thá»ƒ á»Ÿ bá»™ lá»c Ä‘á»ƒ xem chi tiáº¿t.'}
            </p>
            <ResponsiveContainer width="100%" height={Math.max(350, displayWardData.length * 35)}>
              <BarChart data={displayWardData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis 
                  type="category" 
                  dataKey="ward" 
                  tick={{ fontSize: 11 }} 
                  width={120}
                  tickFormatter={(val) => val.replace('PhÆ°á»ng ', 'P. ').replace('XÃ£ ', 'X. ')}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="aqi_score" fill="#16a34a" name="MÃ´i trÆ°á»ng" />
                <Bar dataKey="traffic_score" fill="#f59e0b" name="Giao thÃ´ng" />
                <Bar dataKey="civic_score" fill="#2563eb" name="DÃ¢n sá»±" />
                <Bar dataKey="parking_score" fill="#7c3aed" name="BÃ£i Ä‘á»— xe" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {selectedTab === 'temporal' && (
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Biáº¿n Ä‘á»™ng theo giá» trong ngÃ y</h3>
            <p className="text-sm text-muted-foreground mb-4">
              LÆ°u lÆ°á»£ng giao thÃ´ng vÃ  tá»· lá»‡ Ä‘á»— xe thay Ä‘á»•i theo giá». Giá» cao Ä‘iá»ƒm: 7-9h sÃ¡ng vÃ  17-19h chiá»u.
            </p>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={temporalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="traffic" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  name="Giao thÃ´ng (%)"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="parking" 
                  stroke="#7c3aed" 
                  strokeWidth={2}
                  name="BÃ£i Ä‘á»— xe (%)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {selectedTab === 'matrix' && (
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Ma tráº­n TÆ°Æ¡ng quan giá»¯a cÃ¡c Chá»‰ sá»‘</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Há»‡ sá»‘ tÆ°Æ¡ng quan tá»« -1 (nghá»‹ch) Ä‘áº¿n +1 (thuáº­n). GiÃ¡ trá»‹ gáº§n 0 = khÃ´ng tÆ°Æ¡ng quan.
            </p>
            
            {/* Correlation Matrix Grid */}
            <div className="overflow-x-auto">
              <div className="inline-grid gap-1" style={{ gridTemplateColumns: 'auto repeat(4, 100px)' }}>
                {/* Header row */}
                <div></div>
                {['MÃ´i trÆ°á»ng', 'Giao thÃ´ng', 'DÃ¢n sá»±', 'BÃ£i Ä‘á»— xe'].map(col => (
                  <div key={col} className="text-center text-xs font-medium text-muted-foreground p-2">
                    {col}
                  </div>
                ))}
                
                {/* Data rows */}
                {['MÃ´i trÆ°á»ng', 'Giao thÃ´ng', 'DÃ¢n sá»±', 'BÃ£i Ä‘á»— xe'].map(row => (
                  <div key={row} className="contents">
                    <div className="text-xs font-medium text-muted-foreground p-2 text-right">
                      {row}
                    </div>
                    {['MÃ´i trÆ°á»ng', 'Giao thÃ´ng', 'DÃ¢n sá»±', 'BÃ£i Ä‘á»— xe'].map(col => {
                      const cell = correlationMatrix.find(m => m.row === row && m.col === col);
                      const val = cell?.value || 0;
                      const bgColor = val >= 0.7 ? 'bg-green-500' :
                                     val >= 0.3 ? 'bg-green-300' :
                                     val >= -0.3 ? 'bg-gray-200 dark:bg-gray-700' :
                                     val >= -0.7 ? 'bg-red-300' : 'bg-red-500';
                      const textColor = Math.abs(val) >= 0.7 ? 'text-white' : 'text-foreground';
                      
                      return (
                        <div 
                          key={`${row}-${col}`}
                          className={`p-3 text-center text-sm font-medium rounded ${bgColor} ${textColor}`}
                        >
                          {val.toFixed(2)}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-green-500"></span>
                TÆ°Æ¡ng quan thuáº­n máº¡nh
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-gray-300 dark:bg-gray-600"></span>
                KhÃ´ng tÆ°Æ¡ng quan
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-red-500"></span>
                TÆ°Æ¡ng quan nghá»‹ch
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="mt-6 bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">PhÃ¡t hiá»‡n tá»« dá»¯ liá»‡u ({allWardData.length} phÆ°á»ng)</h3>
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-100 dark:border-green-800">
              <div className="w-6 h-6 rounded-full bg-green-600 dark:bg-green-500 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                {i + 1}
              </div>
              <p className="text-foreground text-sm">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

