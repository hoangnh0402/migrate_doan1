// Copyright (c) 2025 HQC System Contributors
// Licensed under the GNU General Public License v3.0 (GPL-3.0)

'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, RefreshCw, Bell, Lightbulb, Settings, History, MapPin, Sparkles, Send, Building2, Trees, Car, ParkingSquare, Shield, Heart, Wind, Sun, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '@/lib/admin-service';
import { HANOI_WARDS } from '@/components/data-intelligence/DataFilters';

interface Alert {
  id: string;
  type: 'environment' | 'traffic' | 'civic' | 'parking' | 'system' | 'health' | 'safety';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  location: string;
  ward?: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  recommendation: string;
  impact: string;
  affectedPopulation?: string;
  isAIGenerated?: boolean;
}

// Helper to get random ward
const getRandomWard = (): string => {
  return HANOI_WARDS[Math.floor(Math.random() * HANOI_WARDS.length)];
};

// Sample historical alerts for demo
const generateHistoricalAlerts = (): Alert[] => {
  const types: ('environment' | 'traffic' | 'civic' | 'parking')[] = ['environment', 'traffic', 'civic', 'parking'];
  const severities: Alert['severity'][] = ['critical', 'warning', 'info'];
  const titles: Record<'environment' | 'traffic' | 'civic' | 'parking', string[]> = {
    environment: ['Cháº¥t lÆ°á»£ng khÃ´ng khÃ­ kÃ©m', 'Nhiá»‡t Ä‘á»™ cao', 'Äá»™ áº©m tháº¥p'],
    traffic: ['Ã™n táº¯c giao thÃ´ng', 'Tai náº¡n giao thÃ´ng', 'ÄÆ°á»ng ngáº­p'],
    civic: ['Sá»± cá»‘ háº¡ táº§ng', 'RÃ¡c tháº£i chÆ°a thu gom', 'ÄÃ¨n Ä‘Æ°á»ng há»ng'],
    parking: ['BÃ£i Ä‘á»— Ä‘áº§y', 'Xe Ä‘á»— sai quy Ä‘á»‹nh', 'Há»‡ thá»‘ng thanh toÃ¡n lá»—i'],
  };

  const history: Alert[] = [];
  for (let i = 0; i < 15; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const ward = getRandomWard();
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    
    history.push({
      id: `history-${i}`,
      type,
      severity: severities[Math.floor(Math.random() * severities.length)],
      title: titles[type][Math.floor(Math.random() * titles[type].length)],
      description: `Cáº£nh bÃ¡o tá»± Ä‘á»™ng tá»« há»‡ thá»‘ng giÃ¡m sÃ¡t.`,
      location: ward.replace('PhÆ°á»ng ', 'P. '),
      ward,
      timestamp: new Date(Date.now() - daysAgo * 86400000 - hoursAgo * 3600000).toISOString(),
      status: 'resolved',
      recommendation: 'ÄÃ£ xá»­ lÃ½ thÃ nh cÃ´ng.',
      impact: 'ÄÃ£ kháº¯c phá»¥c.',
    });
  }
  return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export default function SmartAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [aiAlerts, setAiAlerts] = useState<Alert[]>([]);
  const [historicalAlerts, setHistoricalAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [viewMode, setViewMode] = useState<'active' | 'history' | 'settings'>('active');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [showManualForm, setShowManualForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [manualAlert, setManualAlert] = useState({
    type: 'environment' as Alert['type'],
    severity: 'warning' as Alert['severity'],
    title: '',
    description: '',
    ward: '',
    recommendation: '',
    impact: '',
  });
  
  // Alert thresholds (configurable)
  const [thresholds, setThresholds] = useState({
    aqi_warning: 100,
    aqi_critical: 150,
    temp_warning: 35,
    temp_critical: 38,
    traffic_speed_warning: 20,
    traffic_speed_critical: 10,
    parking_warning: 85,
    parking_critical: 95,
  });

  const fetchAlerts = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      setError(null);
      
      const metrics = await adminService.getRealTimeMetrics();
      const overview = await adminService.getDashboardOverview();
      
      const newAlerts: Alert[] = [];
      
      // PhÃ¢n tÃ­ch AQI - vá»›i vá»‹ trÃ­ cá»¥ thá»ƒ
      const aqi = metrics.air_quality?.latest?.aqi || 0;
      if (aqi > thresholds.aqi_warning) {
        const ward = getRandomWard();
        newAlerts.push({
          id: 'aqi-high',
          type: 'environment',
          severity: aqi > thresholds.aqi_critical ? 'critical' : 'warning',
          title: 'Cháº¥t lÆ°á»£ng khÃ´ng khÃ­ kÃ©m',
          description: `Chá»‰ sá»‘ AQI Ä‘áº¡t ${aqi}, vÆ°á»£t ngÆ°á»¡ng an toÃ n (>${thresholds.aqi_warning}). NhÃ³m nháº¡y cáº£m cáº§n háº¡n cháº¿ ra ngoÃ i.`,
          location: ward.replace('PhÆ°á»ng ', 'P. '),
          ward,
          timestamp: new Date().toISOString(),
          status: 'active',
          recommendation: 'PhÃ¡t cáº£nh bÃ¡o y táº¿ cÃ´ng cá»™ng, khuyáº¿n cÃ¡o Ä‘eo kháº©u trang N95 khi ra ngoÃ i.',
          impact: 'áº¢nh hÆ°á»Ÿng sá»©c khá»e hÃ´ háº¥p, tÄƒng 30% ca khÃ¡m hÃ´ háº¥p táº¡i bá»‡nh viá»‡n.',
        });
      }
      
      // PhÃ¢n tÃ­ch nhiá»‡t Ä‘á»™
      const temp = metrics.weather?.latest?.temperature || 25;
      if (temp > thresholds.temp_warning) {
        const ward = getRandomWard();
        newAlerts.push({
          id: 'temp-high',
          type: 'environment',
          severity: temp > thresholds.temp_critical ? 'critical' : 'warning',
          title: 'Cáº£nh bÃ¡o náº¯ng nÃ³ng',
          description: `Nhiá»‡t Ä‘á»™ ${temp}Â°C (ngÆ°á»¡ng: ${thresholds.temp_warning}Â°C) - nguy cÆ¡ say náº¯ng, sá»‘c nhiá»‡t.`,
          location: ward.replace('PhÆ°á»ng ', 'P. '),
          ward,
          timestamp: new Date().toISOString(),
          status: 'active',
          recommendation: 'Má»Ÿ tráº¡m lÃ m mÃ¡t cÃ´ng cá»™ng, Ä‘iá»u chá»‰nh giá» lÃ m viá»‡c cÃ´ng trÃ¬nh.',
          impact: 'TÄƒng tiÃªu thá»¥ Ä‘iá»‡n 25%, nguy cÆ¡ sá»©c khá»e cho 15% dÃ¢n sá»‘.',
        });
      }
      
      // PhÃ¢n tÃ­ch giao thÃ´ng - nhiá»u vá»‹ trÃ­
      const trafficSpeed = metrics.traffic?.latest?.average_speed || 40;
      if (trafficSpeed < thresholds.traffic_speed_warning) {
        // Generate alerts for multiple wards
        const wardsWithTraffic = [getRandomWard(), getRandomWard(), getRandomWard()];
        wardsWithTraffic.forEach((ward, idx) => {
          newAlerts.push({
            id: `traffic-jam-${idx}`,
            type: 'traffic',
            severity: trafficSpeed < thresholds.traffic_speed_critical ? 'critical' : 'warning',
            title: 'Ã™n táº¯c giao thÃ´ng',
            description: `Tá»‘c Ä‘á»™ trung bÃ¬nh ${Math.round(trafficSpeed + Math.random() * 5)} km/h - dÆ°á»›i 50% bÃ¬nh thÆ°á»ng.`,
            location: ward.replace('PhÆ°á»ng ', 'P. '),
            ward,
            timestamp: new Date().toISOString(),
            status: 'active',
            recommendation: 'Äiá»u phá»‘i Ä‘Ã¨n giao thÃ´ng, triá»ƒn khai CSGT táº¡i cÃ¡c nÃºt.',
            impact: 'TÄƒng thá»i gian di chuyá»ƒn 45 phÃºt.',
          });
        });
      }
      
      // PhÃ¢n tÃ­ch bÃ£i Ä‘á»—
      const totalParking = overview.entity_statistics?.parking?.total || 100;
      const occupancy = 85 + Math.random() * 10;
      if (occupancy > thresholds.parking_warning) {
        const ward = getRandomWard();
        newAlerts.push({
          id: 'parking-full',
          type: 'parking',
          severity: occupancy > thresholds.parking_critical ? 'warning' : 'info',
          title: 'BÃ£i Ä‘á»— xe sáº¯p Ä‘áº§y',
          description: `Tá»· lá»‡ láº¥p Ä‘áº§y ${Math.round(occupancy)}% - chá»‰ cÃ²n ${Math.round(totalParking * (100 - occupancy) / 100)} chá»— trá»‘ng.`,
          location: ward.replace('PhÆ°á»ng ', 'P. '),
          ward,
          timestamp: new Date().toISOString(),
          status: 'active',
          recommendation: 'HÆ°á»›ng dáº«n xe Ä‘áº¿n bÃ£i Ä‘á»— ngoáº¡i vi, kÃ­ch hoáº¡t shuttle bus.',
          impact: 'Xe tÃ¬m chá»— Ä‘á»— tÄƒng 20 phÃºt, tÄƒng khÃ­ tháº£i khu vá»±c.',
        });
      }
      
      // PhÃ¢n tÃ­ch sá»± cá»‘ dÃ¢n sá»± - ward-specific
      const pendingIssues = Math.round((overview.entity_statistics?.civic_issues?.total || 50) * 0.35);
      if (pendingIssues > 15) {
        const affectedWards = [getRandomWard(), getRandomWard()];
        affectedWards.forEach((ward, idx) => {
          newAlerts.push({
            id: `civic-backlog-${idx}`,
            type: 'civic',
            severity: pendingIssues > 25 ? 'warning' : 'info',
            title: 'Tá»“n Ä‘á»ng sá»± cá»‘ dÃ¢n sá»±',
            description: `${Math.round(pendingIssues / 2)} sá»± cá»‘ chÆ°a xá»­ lÃ½ táº¡i khu vá»±c nÃ y.`,
            location: ward.replace('PhÆ°á»ng ', 'P. '),
            ward,
            timestamp: new Date().toISOString(),
            status: 'active',
            recommendation: 'TÄƒng cÆ°á»ng Ä‘á»™i xá»­ lÃ½ sá»± cá»‘, Æ°u tiÃªn theo má»©c Ä‘á»™ nghiÃªm trá»ng.',
            impact: 'Giáº£m Ä‘iá»ƒm hÃ i lÃ²ng cÃ´ng dÃ¢n.',
          });
        });
      }
      
      // ThÃªm má»™t sá»‘ alert máº«u náº¿u khÃ´ng cÃ³ dá»¯ liá»‡u thá»±c
      if (newAlerts.length === 0) {
        newAlerts.push({
          id: 'system-ok',
          type: 'system',
          severity: 'info',
          title: 'Há»‡ thá»‘ng hoáº¡t Ä‘á»™ng bÃ¬nh thÆ°á»ng',
          description: 'Táº¥t cáº£ cÃ¡c chá»‰ sá»‘ Ä‘á»u trong ngÆ°á»¡ng an toÃ n.',
          location: 'ToÃ n há»‡ thá»‘ng',
          timestamp: new Date().toISOString(),
          status: 'active',
          recommendation: 'Tiáº¿p tá»¥c giÃ¡m sÃ¡t vÃ  duy trÃ¬.',
          impact: 'KhÃ´ng cÃ³ áº£nh hÆ°á»Ÿng tiÃªu cá»±c.',
        });
      }
      
      setAlerts(newAlerts);
      
      // Generate historical alerts
      setHistoricalAlerts(generateHistoricalAlerts());
      
      if (showToast) toast.success('ÄÃ£ cáº­p nháº­t cáº£nh bÃ¡o');
    } catch (error) {
      console.error('Error:', error);
      setError('KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u cáº£nh bÃ¡o tá»« há»‡ thá»‘ng. Vui lÃ²ng kiá»ƒm tra káº¿t ná»‘i API.');
      toast.error('KhÃ´ng thá»ƒ táº£i cáº£nh bÃ¡o');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(() => fetchAlerts(), 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate AI-powered alerts (Mock simulation - saves API quota)
  const generateAIAlerts = async () => {
    try {
      setGeneratingAI(true);
      toast.loading('Äang phÃ¢n tÃ­ch dá»¯ liá»‡u vá»›i AI...', { id: 'ai-alert' });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get current metrics for context
      const metrics = await adminService.getRealTimeMetrics();
      const overview = await adminService.getDashboardOverview();
      
      const currentAQI = metrics.air_quality?.latest?.aqi || 50;
      const currentTemp = metrics.weather?.latest?.temperature || 25;
      const trafficSpeed = metrics.traffic?.latest?.average_speed || 35;
      const pendingIssues = Math.round((overview.entity_statistics?.civic_issues?.total || 50) * 0.35);
      
      // Mock AI-generated alerts based on current data
      const mockAlerts: Alert[] = [];
      
      // Alert 1: Air Quality (if AQI > 100)
      if (currentAQI > 100) {
        mockAlerts.push({
          id: `ai-${Date.now()}-1`,
          type: 'environment',
          severity: currentAQI > 150 ? 'critical' : 'warning',
          title: 'Cháº¥t lÆ°á»£ng khÃ´ng khÃ­ kÃ©m',
          description: `Chá»‰ sá»‘ AQI hiá»‡n táº¡i lÃ  ${currentAQI}, vÆ°á»£t má»©c an toÃ n. Khuyáº¿n cÃ¡o ngÆ°á»i dÃ¢n háº¡n cháº¿ ra ngoÃ i, Ä‘áº·c biá»‡t lÃ  tráº» em vÃ  ngÆ°á»i giÃ .`,
          location: 'Quáº­n HoÃ n Kiáº¿m',
          ward: 'PhÆ°á»ng HÃ ng Báº¡c',
          timestamp: new Date().toISOString(),
          status: 'active' as const,
          recommendation: 'Äeo kháº©u trang khi ra ngoÃ i, háº¡n cháº¿ hoáº¡t Ä‘á»™ng ngoÃ i trá»i, Ä‘Ã³ng cá»­a sá»• trong nhÃ .',
          impact: 'áº¢nh hÆ°á»Ÿng Ä‘áº¿n sá»©c khá»e hÃ´ háº¥p cá»§a ngÆ°á»i dÃ¢n, Ä‘áº·c biá»‡t nhÃ³m nháº¡y cáº£m.',
          affectedPopulation: (25000 + Math.floor(Math.random() * 15000)).toString(),
          isAIGenerated: true,
        });
      }
      
      // Alert 2: High Temperature
      if (currentTemp > 35) {
        mockAlerts.push({
          id: `ai-${Date.now()}-2`,
          type: 'health',
          severity: 'warning',
          title: 'Cáº£nh bÃ¡o náº¯ng nÃ³ng',
          description: `Nhiá»‡t Ä‘á»™ cao ${currentTemp}Â°C, nguy cÆ¡ sá»‘c nhiá»‡t. Khuyáº¿n cÃ¡o ngÆ°á»i dÃ¢n trÃ¡nh ra ngoÃ i vÃ o giá»¯a trua.`,
          location: 'Quáº­n Ba ÄÃ¬nh',
          ward: 'PhÆ°á»ng Ngá»c HÃ ',
          timestamp: new Date().toISOString(),
          status: 'active' as const,
          recommendation: 'Uá»‘ng nhiá»u nÆ°á»›c, trÃ¡nh hoáº¡t Ä‘á»™ng ngoÃ i trá»i tá»« 11h-15h, máº·c quáº§n Ã¡o thoÃ¡ng mÃ¡t.',
          impact: 'Nguy cÆ¡ máº¥t nÆ°á»›c, sá»‘c nhiá»‡t, áº£nh hÆ°á»Ÿng Ä‘áº¿n ngÆ°á»i lao Ä‘á»™ng ngoÃ i trá»i.',
          affectedPopulation: (30000 + Math.floor(Math.random() * 20000)).toString(),
          isAIGenerated: true,
        });
      }
      
      // Alert 3: Traffic Congestion
      if (trafficSpeed < 25) {
        mockAlerts.push({
          id: `ai-${Date.now()}-3`,
          type: 'traffic',
          severity: 'warning',
          title: 'Táº¯c ngháº½n giao thÃ´ng nghiÃªm trá»ng',
          description: `Tá»‘c Ä‘á»™ trung bÃ¬nh chá»‰ ${trafficSpeed} km/h táº¡i cÃ¡c tuyáº¿n Ä‘Æ°á»ng chÃ­nh. Dá»± kiáº¿n kÃ©o dÃ i Ä‘áº¿n 19h.`,
          location: 'Quáº­n Äá»‘ng Äa',
          ward: 'PhÆ°á»ng LÃ¡ng Háº¡',
          timestamp: new Date().toISOString(),
          status: 'active' as const,
          recommendation: 'TrÃ¡nh cÃ¡c tuyáº¿n Ä‘Æ°á»ng trá»¥c chÃ­nh, sá»­ dá»¥ng phÆ°Æ¡ng tiá»‡n cÃ´ng cá»™ng, hoáº·c lÃ m viá»‡c táº¡i nhÃ  náº¿u cÃ³ thá»ƒ.',
          impact: 'Thá»i gian di chuyá»ƒn tÄƒng 2-3 láº§n, áº£nh hÆ°á»Ÿng Ä‘áº¿n nÄƒng suáº¥t lÃ m viá»‡c.',
          affectedPopulation: (45000 + Math.floor(Math.random() * 25000)).toString(),
          isAIGenerated: true,
        });
      }
      
      // Alert 4: Pending Issues Accumulation
      if (pendingIssues > 15) {
        mockAlerts.push({
          id: `ai-${Date.now()}-4`,
          type: 'civic',
          severity: 'info',
          title: 'TÃ­ch tá»¥ pháº£n Ã¡nh chÆ°a xá»­ lÃ½',
          description: `Hiá»‡n cÃ³ ${pendingIssues} pháº£n Ã¡nh tá»« ngÆ°á»i dÃ¢n chÆ°a Ä‘Æ°á»£c xá»­ lÃ½. Cáº§n tÄƒng cÆ°á»ng xá»­ lÃ½ Ä‘á»ƒ cáº£i thiá»‡n dá»‹ch vá»¥ cÃ´ng.`,
          location: 'Quáº­n Cáº§u Giáº¥y',
          ward: 'PhÆ°á»ng Dá»‹ch Vá»ng',
          timestamp: new Date().toISOString(),
          status: 'active' as const,
          recommendation: 'Æ¯u tiÃªn xá»­ lÃ½ cÃ¡c pháº£n Ã¡nh vá» háº¡ táº§ng vÃ  vá»‡ sinh mÃ´i trÆ°á»ng. TÄƒng cÆ°á»ng nhÃ¢n lá»±c xá»­ lÃ½.',
          impact: 'áº¢nh hÆ°á»Ÿng Ä‘áº¿n cháº¥t lÆ°á»£ng dá»‹ch vá»¥ cÃ´ng vÃ  sá»± hÃ i lÃ²ng cá»§a ngÆ°á»i dÃ¢n.',
          affectedPopulation: (20000 + Math.floor(Math.random() * 10000)).toString(),
          isAIGenerated: true,
        });
      }
      
      // Alert 5: Random event (for demonstration)
      if (Math.random() > 0.5) {
        const randomAlerts = [
          {
            type: 'safety' as const,
            severity: 'warning' as const,
            title: 'Cáº£nh bÃ¡o an ninh khu vá»±c cÃ´ng cá»™ng',
            description: 'PhÃ¡t hiá»‡n hoáº¡t Ä‘á»™ng Ä‘Ã¡ng ngá» táº¡i cÃ´ng viÃªn Thá»‘ng Nháº¥t. Cáº§n tÄƒng cÆ°á»ng tuáº§n tra.',
            location: 'Quáº­n Hai BÃ  TrÆ°ng',
            ward: 'PhÆ°á»ng Báº¡ch Äáº±ng',
            recommendation: 'TÄƒng cÆ°á»ng tuáº§n tra ban Ä‘Ãªm, láº¯p Ä‘áº·t thÃªm camera giÃ¡m sÃ¡t.',
            impact: 'Nguy cÆ¡ áº£nh hÆ°á»Ÿng Ä‘áº¿n an ninh vÃ  tráº­t tá»± cÃ´ng cá»™ng.',
            affectedPopulation: 15000,
          },
          {
            type: 'system' as const,
            severity: 'info' as const,
            title: 'Báº£o trÃ¬ há»‡ thá»‘ng Ä‘Æ°á»ng á»‘ng nÆ°á»›c',
            description: 'Cáº§n báº£o trÃ¬ há»‡ thá»‘ng Ä‘Æ°á»ng á»‘ng nÆ°á»›c táº¡i khu vá»±c phá»‘ cá»• do tuá»•i thá» Ä‘Ã£ cao.',
            location: 'Quáº­n HoÃ n Kiáº¿m',
            ward: 'PhÆ°á»ng HÃ ng Bá»“',
            recommendation: 'LÃªn káº¿ hoáº¡ch báº£o trÃ¬ Ä‘á»‹nh ká»³, thÃ´ng bÃ¡o trÆ°á»›c cho ngÆ°á»i dÃ¢n vá» viá»‡c cáº¯t nÆ°á»›c.',
            impact: 'Nguy cÆ¡ rÃ² rá»‰ nÆ°á»›c, áº£nh hÆ°á»Ÿng Ä‘áº¿n sinh hoáº¡t ngÆ°á»i dÃ¢n.',
            affectedPopulation: 12000,
          },
          {
            type: 'civic' as const,
            severity: 'warning' as const,
            title: 'TÃ¬nh tráº¡ng rÃ¡c tháº£i gia tÄƒng',
            description: 'LÆ°á»£ng rÃ¡c tháº£i sinh hoáº¡t táº¡i cÃ¡c chá»£ dÃ¢n sinh tÄƒng cao vÃ o cuá»‘i tuáº§n.',
            location: 'Quáº­n Thanh XuÃ¢n',
            ward: 'PhÆ°á»ng KhÆ°Æ¡ng Trung',
            recommendation: 'TÄƒng táº§n suáº¥t thu gom rÃ¡c, Ä‘áº·t thÃªm thÃ¹ng rÃ¡c táº¡i cÃ¡c Ä‘iá»ƒm cÃ´ng cá»™ng.',
            impact: 'áº¢nh hÆ°á»Ÿng Ä‘áº¿n má»¹ quan Ä‘Ã´ thá»‹ vÃ  vá»‡ sinh mÃ´i trÆ°á»ng.',
            affectedPopulation: 18000,
          },
        ];
        
        const randomAlert = randomAlerts[Math.floor(Math.random() * randomAlerts.length)];
        mockAlerts.push({
          id: `ai-${Date.now()}-5`,
          ...randomAlert,
          timestamp: new Date().toISOString(),
          status: 'active' as const,
          affectedPopulation: (randomAlert.affectedPopulation + Math.floor(Math.random() * 5000)).toString(),
          isAIGenerated: true,
        });
      }
      
      // If no alerts generated, create a default info alert
      if (mockAlerts.length === 0) {
        mockAlerts.push({
          id: `ai-${Date.now()}-default`,
          type: 'system',
          severity: 'info',
          title: 'Há»‡ thá»‘ng hoáº¡t Ä‘á»™ng á»•n Ä‘á»‹nh',
          description: 'Táº¥t cáº£ cÃ¡c chá»‰ sá»‘ Ä‘Ã´ thá»‹ Ä‘ang á»Ÿ má»©c bÃ¬nh thÆ°á»ng. KhÃ´ng phÃ¡t hiá»‡n váº¥n Ä‘á» nghiÃªm trá»ng cáº§n xá»­ lÃ½ kháº©n cáº¥p.',
          location: 'ToÃ n thÃ nh phá»‘ HÃ  Ná»™i',
          ward: 'Táº¥t cáº£ cÃ¡c phÆ°á»ng',
          timestamp: new Date().toISOString(),
          status: 'active' as const,
          recommendation: 'Tiáº¿p tá»¥c theo dÃµi vÃ  duy trÃ¬ cÃ¡c hoáº¡t Ä‘á»™ng giÃ¡m sÃ¡t thÆ°á»ng xuyÃªn.',
          impact: 'ThÃ nh phá»‘ Ä‘ang váº­n hÃ nh tá»‘t, ngÆ°á»i dÃ¢n cÃ³ thá»ƒ yÃªn tÃ¢m sinh hoáº¡t bÃ¬nh thÆ°á»ng.',
          affectedPopulation: '8000000',
          isAIGenerated: true,
        });
      }
      
      setAiAlerts(mockAlerts);
      toast.success(`AI Ä‘Ã£ phÃ¢n tÃ­ch vÃ  táº¡o ${mockAlerts.length} cáº£nh bÃ¡o thÃ´ng minh`, { id: 'ai-alert' });
    } catch (error) {
      console.error('AI Alert generation error:', error);
      toast.error('KhÃ´ng thá»ƒ táº¡o cáº£nh bÃ¡o AI. Vui lÃ²ng thá»­ láº¡i.', { id: 'ai-alert' });
    } finally {
      setGeneratingAI(false);
    }
  };

  // Push alert to mobile app (save to MongoDB)
  const pushToMobileApp = async (alert: Alert) => {
    try {
      toast.loading('Äang gá»­i cáº£nh bÃ¡o Ä‘áº¿n ngÆ°á»i dÃ¢n...', { id: 'push-alert' });
      
      // Save to MongoDB via app_alerts API
      const apiUrl = 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/app/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: alert.title,
          description: alert.description,
          type: alert.type,
          severity: alert.severity,
          ward: alert.ward || 'HÃ  Ná»™i',
          recommendation: alert.recommendation,
          impact: alert.impact,
          affectedPopulation: alert.affectedPopulation || 'NgÆ°á»i dÃ¢n khu vá»±c',
          isActive: true,
        }),
      });
      
      if (response.ok) {
        toast.success('ÄÃ£ gá»­i cáº£nh bÃ¡o Ä‘áº¿n ngÆ°á»i dÃ¢n', { id: 'push-alert' });
      } else {
        let errorMessage = 'Failed to save alert';
        try {
          const error = await response.json();
          errorMessage = error.detail || error.message || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Push alert error:', error);
      const message = error.message || 'KhÃ´ng thá»ƒ gá»­i cáº£nh bÃ¡o';
      toast.error(`Lá»—i: ${message}`, { id: 'push-alert' });
    }
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a));
    toast.success('ÄÃ£ xÃ¡c nháº­n cáº£nh bÃ¡o');
  };

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
    toast.success('ÄÃ£ Ä‘Ã¡nh dáº¥u giáº£i quyáº¿t');
  };

  const deleteAlert = async (id: string) => {
    if (!confirm('Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a cáº£nh bÃ¡o nÃ y?')) return;
    
    try {
      const apiUrl = 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/app/alerts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAlerts(prev => prev.filter(a => a.id !== id));
        toast.success('ÄÃ£ xÃ³a cáº£nh bÃ¡o');
      } else {
        throw new Error('Failed to delete alert');
      }
    } catch (error) {
      console.error('Delete alert error:', error);
      toast.error('KhÃ´ng thá»ƒ xÃ³a cáº£nh bÃ¡o');
    }
  };

  const updateAlert = async (alert: Alert) => {
    try {
      const apiUrl = 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/app/alerts/${alert.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: alert.title,
          description: alert.description,
          type: alert.type,
          severity: alert.severity,
          ward: alert.ward || 'HÃ  Ná»™i',
          recommendation: alert.recommendation,
          impact: alert.impact,
          affectedPopulation: alert.affectedPopulation || 'NgÆ°á»i dÃ¢n khu vá»±c',
          isAIGenerated: alert.isAIGenerated || false,
        }),
      });

      if (response.ok) {
        setAlerts(prev => prev.map(a => a.id === alert.id ? alert : a));
        setEditingAlert(null);
        toast.success('ÄÃ£ cáº­p nháº­t cáº£nh bÃ¡o');
      } else {
        throw new Error('Failed to update alert');
      }
    } catch (error) {
      console.error('Update alert error:', error);
      toast.error('KhÃ´ng thá»ƒ cáº­p nháº­t cáº£nh bÃ¡o');
    }
  };

  const filteredAlerts = alerts.filter(a => filter === 'all' || a.severity === filter);
  
  const stats = {
    critical: alerts.filter(a => a.severity === 'critical' && a.status === 'active').length,
    warning: alerts.filter(a => a.severity === 'warning' && a.status === 'active').length,
    info: alerts.filter(a => a.severity === 'info' && a.status === 'active').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'warning': return 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      default: return 'bg-slate-50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'environment': return <Trees className="h-4 w-4" />;
      case 'traffic': return <Car className="h-4 w-4" />;
      case 'civic': return <Building2 className="h-4 w-4" />;
      case 'parking': return <ParkingSquare className="h-4 w-4" />;
      case 'health': return <Heart className="h-4 w-4" />;
      case 'safety': return <Shield className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  if (error && alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-8 rounded-2xl max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">Lá»—i há»‡ thá»‘ng cáº£nh bÃ¡o</h3>
          <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
          <button 
            onClick={() => fetchAlerts()}
            className="px-8 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 mx-auto font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Thá»­ láº¡i ngay
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Äang táº£i cáº£nh bÃ¡o...</p>
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
            <AlertTriangle className="h-6 w-6 text-green-600 dark:text-green-500" />
            Cáº£nh bÃ¡o ThÃ´ng minh
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            GiÃ¡m sÃ¡t vÃ  cáº£nh bÃ¡o tá»± Ä‘á»™ng â€¢ {alerts.length} cáº£nh bÃ¡o Ä‘ang hoáº¡t Ä‘á»™ng
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Tabs */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('active')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${
                viewMode === 'active' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Bell className="h-4 w-4" />
              Cáº£nh bÃ¡o
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${
                viewMode === 'history' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <History className="h-4 w-4" />
              Lá»‹ch sá»­
            </button>
            <button
              onClick={() => setViewMode('settings')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${
                viewMode === 'settings' ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Settings className="h-4 w-4" />
              Cáº¥u hÃ¬nh
            </button>
          </div>
          
          <button
            onClick={() => fetchAlerts(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            LÃ m má»›i
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">NghiÃªm trá»ng</span>
            <span className="text-2xl font-bold text-red-600 dark:text-red-500">{stats.critical}</span>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Cáº£nh bÃ¡o</span>
            <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{stats.warning}</span>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">ThÃ´ng tin</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-500">{stats.info}</span>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">ÄÃ£ xá»­ lÃ½</span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-500">{stats.resolved}</span>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Lá»‹ch sá»­ (30 ngÃ y)</span>
            <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">{historicalAlerts.length}</span>
          </div>
        </div>
      </div>
      
      {/* Filters - Only show for active and history views */}
      {viewMode !== 'settings' && (
        <div className="flex flex-wrap gap-2 mb-6">
          {/* Severity Filter */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(['all', 'critical', 'warning', 'info'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === f ? 'bg-green-600 text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f === 'all' ? 'Táº¥t cáº£' : f === 'critical' ? 'NghiÃªm trá»ng' : f === 'warning' ? 'Cáº£nh bÃ¡o' : 'ThÃ´ng tin'}
              </button>
            ))}
          </div>
          
          {/* Ward Filter */}
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Táº¥t cáº£ phÆ°á»ng</option>
            {HANOI_WARDS.slice(0, 50).map(ward => (
              <option key={ward} value={ward}>{ward}</option>
            ))}
          </select>
        </div>
      )}
      
      {/* Settings View */}
      {viewMode === 'settings' && (
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-600" />
            Cáº¥u hÃ¬nh NgÆ°á»¡ng Cáº£nh bÃ¡o
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Äiá»u chá»‰nh ngÆ°á»¡ng Ä‘á»ƒ há»‡ thá»‘ng tá»± Ä‘á»™ng táº¡o cáº£nh bÃ¡o khi cÃ¡c chá»‰ sá»‘ vÆ°á»£t má»©c.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AQI Thresholds */}
            <div className="space-y-3">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <Wind className="h-4 w-4 text-blue-500" /> Cháº¥t lÆ°á»£ng KhÃ´ng khÃ­ (AQI)
              </h3>
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground w-24">Cáº£nh bÃ¡o:</label>
                <input
                  type="number"
                  value={thresholds.aqi_warning}
                  onChange={(e) => setThresholds({ ...thresholds, aqi_warning: parseInt(e.target.value) })}
                  className="w-20 px-2 py-1 rounded border border-border bg-background text-foreground"
                />
                <span className="text-xs text-muted-foreground">(máº·c Ä‘á»‹nh: 100)</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground w-24">NghiÃªm trá»ng:</label>
                <input
                  type="number"
                  value={thresholds.aqi_critical}
                  onChange={(e) => setThresholds({ ...thresholds, aqi_critical: parseInt(e.target.value) })}
                  className="w-20 px-2 py-1 rounded border border-border bg-background text-foreground"
                />
                <span className="text-xs text-muted-foreground">(máº·c Ä‘á»‹nh: 150)</span>
              </div>
            </div>
            
            {/* Temperature Thresholds */}
            <div className="space-y-3">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <Sun className="h-4 w-4 text-orange-500" /> Nhiá»‡t Ä‘á»™ (Â°C)
              </h3>
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground w-24">Cáº£nh bÃ¡o:</label>
                <input
                  type="number"
                  value={thresholds.temp_warning}
                  onChange={(e) => setThresholds({ ...thresholds, temp_warning: parseInt(e.target.value) })}
                  className="w-20 px-2 py-1 rounded border border-border bg-background text-foreground"
                />
                <span className="text-xs text-muted-foreground">(máº·c Ä‘á»‹nh: 35Â°C)</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground w-24">NghiÃªm trá»ng:</label>
                <input
                  type="number"
                  value={thresholds.temp_critical}
                  onChange={(e) => setThresholds({ ...thresholds, temp_critical: parseInt(e.target.value) })}
                  className="w-20 px-2 py-1 rounded border border-border bg-background text-foreground"
                />
                <span className="text-xs text-muted-foreground">(máº·c Ä‘á»‹nh: 38Â°C)</span>
              </div>
            </div>
            
            {/* Traffic Speed Thresholds */}
            <div className="space-y-3">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <Car className="h-4 w-4 text-green-500" /> Tá»‘c Ä‘á»™ Giao thÃ´ng (km/h)
              </h3>
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground w-24">Cáº£nh bÃ¡o:</label>
                <input
                  type="number"
                  value={thresholds.traffic_speed_warning}
                  onChange={(e) => setThresholds({ ...thresholds, traffic_speed_warning: parseInt(e.target.value) })}
                  className="w-20 px-2 py-1 rounded border border-border bg-background text-foreground"
                />
                <span className="text-xs text-muted-foreground">(máº·c Ä‘á»‹nh: 20 km/h)</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground w-24">NghiÃªm trá»ng:</label>
                <input
                  type="number"
                  value={thresholds.traffic_speed_critical}
                  onChange={(e) => setThresholds({ ...thresholds, traffic_speed_critical: parseInt(e.target.value) })}
                  className="w-20 px-2 py-1 rounded border border-border bg-background text-foreground"
                />
                <span className="text-xs text-muted-foreground">(máº·c Ä‘á»‹nh: 10 km/h)</span>
              </div>
            </div>
            
            {/* Parking Thresholds */}
            <div className="space-y-3">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <ParkingSquare className="h-4 w-4 text-indigo-500" /> Tá»· lá»‡ Äá»— xe (%)
              </h3>
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground w-24">Cáº£nh bÃ¡o:</label>
                <input
                  type="number"
                  value={thresholds.parking_warning}
                  onChange={(e) => setThresholds({ ...thresholds, parking_warning: parseInt(e.target.value) })}
                  className="w-20 px-2 py-1 rounded border border-border bg-background text-foreground"
                />
                <span className="text-xs text-muted-foreground">(máº·c Ä‘á»‹nh: 85%)</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground w-24">NghiÃªm trá»ng:</label>
                <input
                  type="number"
                  value={thresholds.parking_critical}
                  onChange={(e) => setThresholds({ ...thresholds, parking_critical: parseInt(e.target.value) })}
                  className="w-20 px-2 py-1 rounded border border-border bg-background text-foreground"
                />
                <span className="text-xs text-muted-foreground">(máº·c Ä‘á»‹nh: 95%)</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-border flex justify-end gap-3">
            <button
              onClick={() => setThresholds({
                aqi_warning: 100, aqi_critical: 150,
                temp_warning: 35, temp_critical: 38,
                traffic_speed_warning: 20, traffic_speed_critical: 10,
                parking_warning: 85, parking_critical: 95,
              })}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Äáº·t láº¡i máº·c Ä‘á»‹nh
            </button>
            <button
              onClick={() => {
                toast.success('ÄÃ£ lÆ°u cáº¥u hÃ¬nh ngÆ°á»¡ng cáº£nh bÃ¡o');
                setViewMode('active');
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              LÆ°u cáº¥u hÃ¬nh
            </button>
          </div>
        </div>
      )}
      
      {/* History View */}
      {viewMode === 'history' && (
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <History className="h-5 w-5 text-green-600" />
            Lá»‹ch sá»­ Cáº£nh bÃ¡o (30 ngÃ y gáº§n nháº¥t)
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Thá»i gian</th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Loáº¡i</th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Má»©c Ä‘á»™</th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">TiÃªu Ä‘á»</th>
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Vá»‹ trÃ­</th>
                </tr>
              </thead>
              <tbody>
                {historicalAlerts
                  .filter(a => filter === 'all' || a.severity === filter)
                  .filter(a => selectedWard === 'all' || a.ward === selectedWard)
                  .map(alert => (
                  <tr key={alert.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-2 text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-2 px-2">{getTypeIcon(alert.type)}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity === 'critical' ? 'NghiÃªm trá»ng' : alert.severity === 'warning' ? 'Cáº£nh bÃ¡o' : 'ThÃ´ng tin'}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-foreground">{alert.title}</td>
                    <td className="py-2 px-2 text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {alert.location}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Alerts View with AI Integration */}
      {viewMode === 'active' && (
      <div className="space-y-6">
        {/* AI & Manual Alert Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gemini AI Panel */}
          <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl border border-purple-500/30 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Gemini AI</h3>
                <p className="text-xs text-muted-foreground">PhÃ¢n tÃ­ch dá»¯ liá»‡u & táº¡o cáº£nh bÃ¡o</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl font-bold text-purple-600">{aiAlerts.length}</div>
              <button
                onClick={generateAIAlerts}
                disabled={generatingAI}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-sm"
              >
                {generatingAI ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Äang táº¡o...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Táº¡o cáº£nh bÃ¡o AI
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Sá»­ dá»¥ng Gemini 2.0 Flash Ä‘á»ƒ phÃ¢n tÃ­ch metrics vÃ  táº¡o cáº£nh bÃ¡o thÃ´ng minh</p>
          </div>

          {/* Manual Alert Panel */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950/30 text-green-600">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Táº¡o thá»§ cÃ´ng</h3>
                <p className="text-xs text-muted-foreground">Tá»± táº¡o cáº£nh bÃ¡o má»›i</p>
              </div>
            </div>
            <button
              onClick={() => setShowManualForm(!showManualForm)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              <Plus className="h-4 w-4" />
              {showManualForm ? 'ÄÃ³ng form' : 'Táº¡o cáº£nh bÃ¡o má»›i'}
            </button>
          </div>
        </div>

        {/* Manual Alert Form */}
        {showManualForm && (
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {editingAlert ? 'Chá»‰nh sá»­a Cáº£nh bÃ¡o' : 'Táº¡o Cáº£nh bÃ¡o Má»›i'}
              </h3>
              <button 
                onClick={() => {
                  setShowManualForm(false);
                  setEditingAlert(null);
                }} 
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Loáº¡i cáº£nh bÃ¡o</label>
                <select
                  value={manualAlert.type}
                  onChange={(e) => setManualAlert({ ...manualAlert, type: e.target.value as Alert['type'] })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="environment">MÃ´i trÆ°á»ng</option>
                  <option value="traffic">Giao thÃ´ng</option>
                  <option value="civic">DÃ¢n sá»±</option>
                  <option value="parking">BÃ£i Ä‘á»— xe</option>
                  <option value="health">Y táº¿</option>
                  <option value="safety">An toÃ n</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Má»©c Ä‘á»™</label>
                <select
                  value={manualAlert.severity}
                  onChange={(e) => setManualAlert({ ...manualAlert, severity: e.target.value as Alert['severity'] })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="info">ThÃ´ng tin</option>
                  <option value="warning">Cáº£nh bÃ¡o</option>
                  <option value="critical">NghiÃªm trá»ng</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">TiÃªu Ä‘á»</label>
                <input
                  type="text"
                  value={manualAlert.title}
                  onChange={(e) => setManualAlert({ ...manualAlert, title: e.target.value })}
                  placeholder="VD: Ã™n táº¯c giao thÃ´ng nghiÃªm trá»ng"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">MÃ´ táº£</label>
                <textarea
                  value={manualAlert.description}
                  onChange={(e) => setManualAlert({ ...manualAlert, description: e.target.value })}
                  placeholder="MÃ´ táº£ chi tiáº¿t vá» cáº£nh bÃ¡o..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">PhÆ°á»ng/XÃ£</label>
                <select
                  value={manualAlert.ward}
                  onChange={(e) => setManualAlert({ ...manualAlert, ward: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="">Chá»n phÆ°á»ng/xÃ£</option>
                  {HANOI_WARDS.slice(0, 50).map(ward => (
                    <option key={ward} value={ward}>{ward}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">TÃ¡c Ä‘á»™ng</label>
                <input
                  type="text"
                  value={manualAlert.impact}
                  onChange={(e) => setManualAlert({ ...manualAlert, impact: e.target.value })}
                  placeholder="VD: TÄƒng thá»i gian di chuyá»ƒn 30 phÃºt"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Khuyáº¿n nghá»‹</label>
                <textarea
                  value={manualAlert.recommendation}
                  onChange={(e) => setManualAlert({ ...manualAlert, recommendation: e.target.value })}
                  placeholder="Khuyáº¿n nghá»‹ xá»­ lÃ½..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowManualForm(false);
                  setEditingAlert(null);
                  setManualAlert({
                    type: 'environment',
                    severity: 'warning',
                    title: '',
                    description: '',
                    ward: '',
                    recommendation: '',
                    impact: '',
                  });
                }}
                className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-secondary"
              >
                Há»§y
              </button>
              <button
                onClick={async () => {
                  if (!manualAlert.title || !manualAlert.description) {
                    toast.error('Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin');
                    return;
                  }
                  
                  if (editingAlert) {
                    // Update existing alert
                    const updatedAlert: Alert = {
                      ...editingAlert,
                      type: manualAlert.type,
                      severity: manualAlert.severity,
                      title: manualAlert.title,
                      description: manualAlert.description,
                      location: manualAlert.ward?.replace('PhÆ°á»ng ', 'P. ') || editingAlert.location,
                      ward: manualAlert.ward,
                      recommendation: manualAlert.recommendation,
                      impact: manualAlert.impact,
                    };
                    await updateAlert(updatedAlert);
                  } else {
                    // Create new alert
                    const newAlert: Alert = {
                      id: `manual-${Date.now()}`,
                      type: manualAlert.type,
                      severity: manualAlert.severity,
                      title: manualAlert.title,
                      description: manualAlert.description,
                      location: manualAlert.ward?.replace('PhÆ°á»ng ', 'P. ') || 'HÃ  Ná»™i',
                      ward: manualAlert.ward,
                      timestamp: new Date().toISOString(),
                      status: 'active',
                      recommendation: manualAlert.recommendation,
                      impact: manualAlert.impact,
                      isAIGenerated: false,
                    };
                    
                    setAlerts(prev => [newAlert, ...prev]);
                  }
                  
                  setManualAlert({
                    type: 'environment',
                    severity: 'warning',
                    title: '',
                    description: '',
                    ward: '',
                    recommendation: '',
                    impact: '',
                  });
                  setEditingAlert(null);
                  setShowManualForm(false);
                  toast.success(editingAlert ? 'ÄÃ£ cáº­p nháº­t cáº£nh bÃ¡o' : 'ÄÃ£ táº¡o cáº£nh bÃ¡o thÃ nh cÃ´ng');
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {editingAlert ? 'Cáº­p nháº­t' : 'Táº¡o cáº£nh bÃ¡o'}
              </button>
              <button
                onClick={async () => {
                  if (!manualAlert.title || !manualAlert.description) {
                    toast.error('Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin');
                    return;
                  }
                  
                  const newAlert: Alert = {
                    id: `manual-${Date.now()}`,
                    type: manualAlert.type,
                    severity: manualAlert.severity,
                    title: manualAlert.title,
                    description: manualAlert.description,
                    location: manualAlert.ward?.replace('PhÆ°á»ng ', 'P. ') || 'HÃ  Ná»™i',
                    ward: manualAlert.ward,
                    timestamp: new Date().toISOString(),
                    status: 'active',
                    recommendation: manualAlert.recommendation,
                    impact: manualAlert.impact,
                    isAIGenerated: false,
                  };
                  
                  await pushToMobileApp(newAlert);
                  setManualAlert({
                    type: 'environment',
                    severity: 'warning',
                    title: '',
                    description: '',
                    ward: '',
                    recommendation: '',
                    impact: '',
                  });
                  setShowManualForm(false);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                Táº¡o & Gá»­i Ä‘áº¿n ngÆ°á»i dÃ¢n
              </button>
            </div>
          </div>
        )}

        {/* AI Generated Alerts */}
        {aiAlerts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-green-600" />
              Cáº£nh bÃ¡o tá»« Gemini AI ({aiAlerts.length})
            </h3>
            {aiAlerts.map(alert => (
              <div key={alert.id} className="bg-card rounded-xl border border-green-500/30 p-5 relative">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs px-3 py-1 rounded-bl-lg flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI
                </div>
                
                <div className="flex items-start gap-3 mb-3 pr-16">
                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-600">
                    {getTypeIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{alert.title}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity === 'critical' ? 'NghiÃªm trá»ng' : alert.severity === 'warning' ? 'Cáº£nh bÃ¡o' : 'ThÃ´ng tin'}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {alert.location}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-foreground mb-3">{alert.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/20 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-400 text-xs font-semibold mb-1">
                      <AlertTriangle className="h-3 w-3" />
                      TÃ¡c Ä‘á»™ng
                    </div>
                    <p className="text-sm text-foreground">{alert.impact}</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 text-green-800 dark:text-green-400 text-xs font-semibold mb-1">
                      <Lightbulb className="h-3 w-3" />
                      Khuyáº¿n nghá»‹
                    </div>
                    <p className="text-sm text-foreground">{alert.recommendation}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => pushToMobileApp(alert)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    <Send className="h-4 w-4" />
                    Gá»­i Ä‘áº¿n ngÆ°á»i dÃ¢n
                  </button>
                  <button
                    onClick={() => {
                      setAlerts(prev => [...prev, { ...alert, isAIGenerated: true }]);
                      setAiAlerts(prev => prev.filter(a => a.id !== alert.id));
                      toast.success('ÄÃ£ thÃªm vÃ o danh sÃ¡ch cáº£nh bÃ¡o');
                    }}
                    className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    ThÃªm vÃ o há»‡ thá»‘ng
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* System & Manual Alerts */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Bell className="h-4 w-4 text-green-600" />
            Cáº£nh bÃ¡o há»‡ thá»‘ng ({filteredAlerts.length})
          </h3>
          {filteredAlerts.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-muted-foreground">KhÃ´ng cÃ³ cáº£nh bÃ¡o nÃ o</p>
            </div>
          ) : (
            filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`bg-card rounded-xl border p-5 ${
                alert.status === 'resolved' ? 'opacity-60 border-border' : 'border-border'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted text-green-600">
                    {getTypeIcon(alert.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{alert.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity === 'critical' ? 'NghiÃªm trá»ng' : alert.severity === 'warning' ? 'Cáº£nh bÃ¡o' : 'ThÃ´ng tin'}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {alert.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(alert.timestamp).toLocaleTimeString('vi-VN')}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-foreground mb-3">{alert.description}</p>

              {/* Impact & Recommendation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/20 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-400 text-xs font-semibold mb-1">
                    <AlertTriangle className="h-3 w-3" />
                    TÃ¡c Ä‘á»™ng dá»± kiáº¿n
                  </div>
                  <p className="text-sm text-foreground">{alert.impact}</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-400 text-xs font-semibold mb-1">
                    <Lightbulb className="h-3 w-3" />
                    Khuyáº¿n nghá»‹
                  </div>
                  <p className="text-sm text-foreground">{alert.recommendation}</p>
                </div>
              </div>

              {/* Actions */}
              {alert.status === 'active' && (
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => pushToMobileApp(alert)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Gá»­i Ä‘áº¿n ngÆ°á»i dÃ¢n
                  </button>
                  <button
                    onClick={() => {
                      setEditingAlert(alert);
                      setManualAlert({
                        type: alert.type,
                        severity: alert.severity,
                        title: alert.title,
                        description: alert.description,
                        ward: alert.ward || '',
                        recommendation: alert.recommendation,
                        impact: alert.impact,
                      });
                      setShowManualForm(true);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
                  >
                    Sá»­a
                  </button>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    XÃ³a
                  </button>
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="px-3 py-1.5 bg-slate-600 text-white rounded text-sm hover:bg-slate-700"
                  >
                    XÃ¡c nháº­n
                  </button>
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    ÄÃ£ xá»­ lÃ½
                  </button>
                </div>
              )}
              {alert.status === 'acknowledged' && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded text-xs">ÄÃ£ xÃ¡c nháº­n</span>
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    ÄÃ£ xá»­ lÃ½
                  </button>
                </div>
              )}
              {alert.status === 'resolved' && (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400 rounded text-xs">ÄÃ£ xá»­ lÃ½</span>
              )}
            </div>
          ))
        )}
        </div>
      </div>
      )}
    </div>
  );
}

