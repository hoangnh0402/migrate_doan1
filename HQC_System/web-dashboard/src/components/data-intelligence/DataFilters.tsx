// Copyright (c) 2025 HQC System Contributors
// Licensed under the GNU General Public License v3.0 (GPL-3.0)

'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown, X, Check, Calendar, MapPin, Filter } from 'lucide-react';

// 126 phÆ°á»ng/xÃ£ HÃ  Ná»™i
export const HANOI_WARDS = [
  // Ba ÄÃ¬nh
  "PhÆ°á»ng PhÃºc XÃ¡", "PhÆ°á»ng TrÃºc Báº¡ch", "PhÆ°á»ng VÄ©nh PhÃºc", "PhÆ°á»ng Cá»‘ng Vá»‹", 
  "PhÆ°á»ng Liá»…u Giai", "PhÆ°á»ng Nguyá»…n Trung Trá»±c", "PhÆ°á»ng QuÃ¡n ThÃ¡nh", "PhÆ°á»ng Ngá»c HÃ ",
  "PhÆ°á»ng Äiá»‡n BiÃªn", "PhÆ°á»ng Äá»™i Cáº¥n", "PhÆ°á»ng Ngá»c KhÃ¡nh", "PhÆ°á»ng Kim MÃ£",
  "PhÆ°á»ng Giáº£ng VÃµ", "PhÆ°á»ng ThÃ nh CÃ´ng",
  // HoÃ n Kiáº¿m
  "PhÆ°á»ng PhÃºc TÃ¢n", "PhÆ°á»ng Äá»“ng XuÃ¢n", "PhÆ°á»ng HÃ ng MÃ£", "PhÆ°á»ng HÃ ng Buá»“m",
  "PhÆ°á»ng HÃ ng ÄÃ o", "PhÆ°á»ng HÃ ng Bá»“", "PhÆ°á»ng Cá»­a ÄÃ´ng", "PhÆ°á»ng LÃ½ ThÃ¡i Tá»•",
  "PhÆ°á»ng HÃ ng Báº¡c", "PhÆ°á»ng HÃ ng Gai", "PhÆ°á»ng ChÆ°Æ¡ng DÆ°Æ¡ng", "PhÆ°á»ng HÃ ng Trá»‘ng",
  "PhÆ°á»ng Cá»­a Nam", "PhÆ°á»ng HÃ ng BÃ´ng", "PhÆ°á»ng TrÃ ng Tiá»n", "PhÆ°á»ng Tráº§n HÆ°ng Äáº¡o",
  "PhÆ°á»ng Phan Chu Trinh", "PhÆ°á»ng HÃ ng BÃ i",
  // Äá»‘ng Äa
  "PhÆ°á»ng VÄƒn Miáº¿u", "PhÆ°á»ng Quá»‘c Tá»­ GiÃ¡m", "PhÆ°á»ng HÃ ng Bá»™t", "PhÆ°á»ng LÃ¡ng Háº¡",
  "PhÆ°á»ng LÃ¡ng ThÆ°á»£ng", "PhÆ°á»ng Ã” Chá»£ Dá»«a", "PhÆ°á»ng VÄƒn ChÆ°Æ¡ng", "PhÆ°á»ng CÃ¡t Linh",
  "PhÆ°á»ng Quang Trung", "PhÆ°á»ng KhÆ°Æ¡ng ThÆ°á»£ng", "PhÆ°á»ng NgÃ£ TÆ° Sá»Ÿ", "PhÆ°á»ng KhÃ¢m ThiÃªn",
  "PhÆ°á»ng Trung Phá»¥ng", "PhÆ°á»ng Trung Liá»‡t", "PhÆ°á»ng PhÆ°Æ¡ng LiÃªn", "PhÆ°á»ng Thá»‹nh Quang",
  "PhÆ°á»ng Trung Tá»±", "PhÆ°á»ng Kim LiÃªn", "PhÆ°á»ng PhÆ°Æ¡ng Mai", "PhÆ°á»ng Nam Äá»“ng",
  "PhÆ°á»ng Thá»• Quan",
  // Hai BÃ  TrÆ°ng  
  "PhÆ°á»ng Nguyá»…n Du", "PhÆ°á»ng Báº¡ch Äáº±ng", "PhÆ°á»ng Pháº¡m ÄÃ¬nh Há»•", "PhÆ°á»ng LÃª Äáº¡i HÃ nh",
  "PhÆ°á»ng Äá»“ng NhÃ¢n", "PhÆ°á»ng Phá»‘ Huáº¿", "PhÆ°á»ng Äá»‘ng MÃ¡c", "PhÆ°á»ng Thanh LÆ°Æ¡ng",
  "PhÆ°á»ng BÃ¡ch Khoa", "PhÆ°á»ng Thanh NhÃ n", "PhÆ°á»ng Cáº§u Dá»n", "PhÆ°á»ng Báº¡ch Mai",
  "PhÆ°á»ng TrÆ°Æ¡ng Äá»‹nh", "PhÆ°á»ng Äá»“ng TÃ¢m", "PhÆ°á»ng VÄ©nh Tuy", "PhÆ°á»ng Minh Khai",
  "PhÆ°á»ng Quá»³nh LÃ´i", "PhÆ°á»ng Quá»³nh Mai",
  // Cáº§u Giáº¥y
  "PhÆ°á»ng NghÄ©a ÄÃ´", "PhÆ°á»ng NghÄ©a TÃ¢n", "PhÆ°á»ng Mai Dá»‹ch", "PhÆ°á»ng Dá»‹ch Vá»ng",
  "PhÆ°á»ng Dá»‹ch Vá»ng Háº­u", "PhÆ°á»ng Quan Hoa", "PhÆ°á»ng YÃªn HÃ²a", "PhÆ°á»ng Trung HÃ²a",
  // TÃ¢y Há»“
  "PhÆ°á»ng Quáº£ng An", "PhÆ°á»ng Nháº­t TÃ¢n", "PhÆ°á»ng Tá»© LiÃªn", "PhÆ°á»ng PhÃº ThÆ°á»£ng",
  "PhÆ°á»ng XuÃ¢n La", "PhÆ°á»ng Thá»¥y KhuÃª", "PhÆ°á»ng BÆ°á»Ÿi", "PhÆ°á»ng YÃªn Phá»¥",
  // Thanh XuÃ¢n
  "PhÆ°á»ng Thanh XuÃ¢n Báº¯c", "PhÆ°á»ng Thanh XuÃ¢n Nam", "PhÆ°á»ng Thanh XuÃ¢n Trung",
  "PhÆ°á»ng KhÆ°Æ¡ng ÄÃ¬nh", "PhÆ°á»ng KhÆ°Æ¡ng Trung", "PhÆ°á»ng KhÆ°Æ¡ng Mai", "PhÆ°á»ng Háº¡ ÄÃ¬nh",
  "PhÆ°á»ng NhÃ¢n ChÃ­nh", "PhÆ°á»ng PhÆ°Æ¡ng Liá»‡t", "PhÆ°á»ng Kim Giang",
  // Long BiÃªn
  "PhÆ°á»ng ThÆ°á»£ng Thanh", "PhÆ°á»ng Ngá»c Thá»¥y", "PhÆ°á»ng Giang BiÃªn", "PhÆ°á»ng Äá»©c Giang",
  "PhÆ°á»ng Viá»‡t HÆ°ng", "PhÆ°á»ng Gia Thá»¥y", "PhÆ°á»ng Ngá»c LÃ¢m", "PhÆ°á»ng PhÃºc Lá»£i",
  "PhÆ°á»ng Bá»“ Äá»", "PhÆ°á»ng SÃ i Äá»“ng", "PhÆ°á»ng Long BiÃªn", "PhÆ°á»ng Tháº¡ch BÃ n",
  "PhÆ°á»ng PhÃºc Äá»“ng", "PhÆ°á»ng Cá»± Khá»‘i",
  // HoÃ ng Mai
  "PhÆ°á»ng Mai Äá»™ng", "PhÆ°á»ng HoÃ ng VÄƒn Thá»¥", "PhÆ°á»ng GiÃ¡p BÃ¡t", "PhÆ°á»ng LÄ©nh Nam",
  "PhÆ°á»ng Thá»‹nh Liá»‡t", "PhÆ°á»ng Tráº§n PhÃº", "PhÆ°á»ng HoÃ ng Liá»‡t", "PhÆ°á»ng YÃªn Sá»Ÿ",
  "PhÆ°á»ng VÄ©nh HÆ°ng", "PhÆ°á»ng Äá»‹nh CÃ´ng", "PhÆ°á»ng Äáº¡i Kim", "PhÆ°á»ng TÃ¢n Mai",
  "PhÆ°á»ng Thanh TrÃ¬", "PhÆ°á»ng TÆ°Æ¡ng Mai",
  // Nam Tá»« LiÃªm
  "PhÆ°á»ng Cáº§u Diá»…n", "PhÆ°á»ng Má»¹ ÄÃ¬nh 1", "PhÆ°á»ng Má»¹ ÄÃ¬nh 2", "PhÆ°á»ng TÃ¢y Má»—",
  "PhÆ°á»ng Má»… TrÃ¬", "PhÆ°á»ng PhÃº ÄÃ´", "PhÆ°á»ng Äáº¡i Má»—", "PhÆ°á»ng Trung VÄƒn",
  "PhÆ°á»ng PhÆ°Æ¡ng Canh", "PhÆ°á»ng XuÃ¢n PhÆ°Æ¡ng",
  // Báº¯c Tá»« LiÃªm
  "PhÆ°á»ng ThÆ°á»£ng CÃ¡t", "PhÆ°á»ng LiÃªn Máº¡c", "PhÆ°á»ng ÄÃ´ng Ngáº¡c", "PhÆ°á»ng Äá»©c Tháº¯ng",
  "PhÆ°á»ng Thá»¥y PhÆ°Æ¡ng", "PhÆ°á»ng TÃ¢y Tá»±u", "PhÆ°á»ng XuÃ¢n Äá»‰nh", "PhÆ°á»ng XuÃ¢n Táº£o",
  "PhÆ°á»ng Minh Khai (Báº¯c Tá»« LiÃªm)", "PhÆ°á»ng Cá»• Nhuáº¿ 1", "PhÆ°á»ng Cá»• Nhuáº¿ 2", "PhÆ°á»ng PhÃº Diá»…n",
  "PhÆ°á»ng PhÃºc Diá»…n",
];

// NhÃ³m phÆ°á»ng theo quáº­n
export const DISTRICTS = {
  "Ba ÄÃ¬nh": HANOI_WARDS.slice(0, 14),
  "HoÃ n Kiáº¿m": HANOI_WARDS.slice(14, 32),
  "Äá»‘ng Äa": HANOI_WARDS.slice(32, 53),
  "Hai BÃ  TrÆ°ng": HANOI_WARDS.slice(53, 64),
  "Cáº§u Giáº¥y": [] as string[],
  "TÃ¢y Há»“": [] as string[],
  "Thanh XuÃ¢n": [] as string[],
  "Long BiÃªn": [] as string[],
  "HoÃ ng Mai": [] as string[],
  "Nam Tá»« LiÃªm": [] as string[],
  "Báº¯c Tá»« LiÃªm": [] as string[],
};

// Time range options
export const TIME_RANGES = [
  { value: 'today', label: 'HÃ´m nay' },
  { value: '7days', label: '7 ngÃ y qua' },
  { value: '30days', label: '30 ngÃ y qua' },
  { value: '90days', label: '90 ngÃ y qua' },
  { value: 'custom', label: 'TÃ¹y chá»n' },
];

// Metric types
export const METRIC_TYPES = [
  { value: 'all', label: 'Táº¥t cáº£ chá»‰ sá»‘' },
  { value: 'environment', label: 'MÃ´i trÆ°á»ng' },
  { value: 'traffic', label: 'Giao thÃ´ng' },
  { value: 'civic', label: 'Pháº£n há»“i dÃ¢n sá»±' },
  { value: 'parking', label: 'BÃ£i Ä‘á»— xe' },
];

interface DataFiltersProps {
  selectedWards: string[];
  onWardsChange: (wards: string[]) => void;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  customDateRange?: { start: string; end: string };
  onCustomDateRangeChange?: (range: { start: string; end: string }) => void;
  metricType: string;
  onMetricTypeChange: (type: string) => void;
  maxWards?: number;
}

export function DataFilters({
  selectedWards,
  onWardsChange,
  timeRange,
  onTimeRangeChange,
  customDateRange,
  onCustomDateRangeChange,
  metricType,
  onMetricTypeChange,
  maxWards = 10,
}: DataFiltersProps) {
  const [isWardDropdownOpen, setIsWardDropdownOpen] = useState(false);
  const [wardSearch, setWardSearch] = useState('');
  const [, setSelectedDistrict] = useState<string | null>(null);

  // Filter wards by search
  const filteredWards = useMemo(() => {
    if (!wardSearch.trim()) return HANOI_WARDS;
    const query = wardSearch.toLowerCase();
    return HANOI_WARDS.filter(ward => ward.toLowerCase().includes(query));
  }, [wardSearch]);

  // Toggle ward selection
  const toggleWard = (ward: string) => {
    if (selectedWards.includes(ward)) {
      onWardsChange(selectedWards.filter(w => w !== ward));
    } else if (selectedWards.length < maxWards) {
      onWardsChange([...selectedWards, ward]);
    }
  };

  // Select all wards in a district
  const selectDistrict = (districtName: string) => {
    const districtWards = DISTRICTS[districtName as keyof typeof DISTRICTS] || [];
    const newWards = [...new Set([...selectedWards, ...districtWards])].slice(0, maxWards);
    onWardsChange(newWards);
    setSelectedDistrict(districtName);
  };

  // Clear all selections
  const clearWards = () => {
    onWardsChange([]);
    setSelectedDistrict(null);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Filter className="h-4 w-4 text-green-600" />
        Bá»™ lá»c dá»¯ liá»‡u
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ward Selector */}
        <div className="relative">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            <MapPin className="h-3 w-3 inline mr-1" />
            PhÆ°á»ng/XÃ£ ({selectedWards.length}/{maxWards})
          </label>
          
          <button
            onClick={() => setIsWardDropdownOpen(!isWardDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground hover:bg-muted transition-colors"
          >
            <span className="truncate">
              {selectedWards.length === 0 
                ? 'Táº¥t cáº£ (126 phÆ°á»ng)' 
                : selectedWards.length === 1 
                  ? selectedWards[0]
                  : `${selectedWards.length} phÆ°á»ng Ä‘Ã£ chá»n`}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isWardDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {isWardDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-card rounded-lg border border-border shadow-lg max-h-80 overflow-hidden">
              {/* Search */}
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="TÃ¬m phÆ°á»ng/xÃ£..."
                    value={wardSearch}
                    onChange={(e) => setWardSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-2 border-b border-border flex gap-2 flex-wrap">
                <button
                  onClick={clearWards}
                  className="px-2 py-1 text-xs rounded bg-muted hover:bg-muted/80 transition-colors"
                >
                  Bá» chá»n táº¥t cáº£
                </button>
                {Object.keys(DISTRICTS).slice(0, 4).map(district => (
                  <button
                    key={district}
                    onClick={() => selectDistrict(district)}
                    className="px-2 py-1 text-xs rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  >
                    {district}
                  </button>
                ))}
              </div>

              {/* Ward List */}
              <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                {filteredWards.map(ward => (
                  <button
                    key={ward}
                    onClick={() => toggleWard(ward)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${
                      selectedWards.includes(ward)
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span className="truncate">{ward}</span>
                    {selectedWards.includes(ward) && <Check className="h-4 w-4 flex-shrink-0" />}
                  </button>
                ))}
              </div>

              {/* Close */}
              <div className="p-2 border-t border-border">
                <button
                  onClick={() => setIsWardDropdownOpen(false)}
                  className="w-full py-1.5 text-sm font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Xong
                </button>
              </div>
            </div>
          )}

          {/* Selected tags */}
          {selectedWards.length > 0 && selectedWards.length <= 3 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {selectedWards.map(ward => (
                <span
                  key={ward}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                >
                  {ward.replace('PhÆ°á»ng ', 'P.').replace('XÃ£ ', 'X.')}
                  <button onClick={() => toggleWard(ward)} className="hover:text-red-600">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Time Range */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            <Calendar className="h-3 w-3 inline mr-1" />
            Khoáº£ng thá»i gian
          </label>
          
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {TIME_RANGES.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>

          {/* Custom Date Range */}
          {timeRange === 'custom' && onCustomDateRangeChange && (
            <div className="flex gap-2 mt-2">
              <input
                type="date"
                value={customDateRange?.start || ''}
                onChange={(e) => onCustomDateRangeChange({ ...customDateRange!, start: e.target.value })}
                className="flex-1 px-2 py-1 text-xs rounded border border-border bg-background"
              />
              <span className="text-muted-foreground self-center">â†’</span>
              <input
                type="date"
                value={customDateRange?.end || ''}
                onChange={(e) => onCustomDateRangeChange({ ...customDateRange!, end: e.target.value })}
                className="flex-1 px-2 py-1 text-xs rounded border border-border bg-background"
              />
            </div>
          )}
        </div>

        {/* Metric Type */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Loáº¡i chá»‰ sá»‘
          </label>
          
          <select
            value={metricType}
            onChange={(e) => onMetricTypeChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {METRIC_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(selectedWards.length > 0 || timeRange !== 'today' || metricType !== 'all') && (
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">Äang lá»c:</span>
          {selectedWards.length > 0 && (
            <span className="px-2 py-0.5 text-xs rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
              {selectedWards.length} phÆ°á»ng
            </span>
          )}
          {timeRange !== 'today' && (
            <span className="px-2 py-0.5 text-xs rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
              {TIME_RANGES.find(r => r.value === timeRange)?.label}
            </span>
          )}
          {metricType !== 'all' && (
            <span className="px-2 py-0.5 text-xs rounded bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400">
              {METRIC_TYPES.find(t => t.value === metricType)?.label}
            </span>
          )}
          <button
            onClick={() => {
              clearWards();
              onTimeRangeChange('today');
              onMetricTypeChange('all');
            }}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            XÃ³a bá»™ lá»c
          </button>
        </div>
      )}
    </div>
  );
}

// Export Report Modal Component
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: string, options: ExportOptions) => void;
  selectedWards: string[];
  timeRange: string;
}

export interface ExportOptions {
  includeSummary: boolean;
  includeDetails: boolean;
  includeCharts: boolean;
  includeRecommendations: boolean;
  includeRawData: boolean;
}

export function ExportModal({ isOpen, onClose, onExport, selectedWards, timeRange }: ExportModalProps) {
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv' | 'json'>('pdf');
  const [options, setOptions] = useState<ExportOptions>({
    includeSummary: true,
    includeDetails: true,
    includeCharts: true,
    includeRecommendations: true,
    includeRawData: false,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Xuáº¥t bÃ¡o cÃ¡o</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Report Info */}
          <div className="p-3 bg-muted/50 rounded-lg text-sm">
            <p className="text-muted-foreground">
              <strong>Pháº¡m vi:</strong> {selectedWards.length === 0 ? 'ToÃ n TP. HÃ  Ná»™i (126 phÆ°á»ng)' : `${selectedWards.length} phÆ°á»ng Ä‘Ã£ chá»n`}
            </p>
            <p className="text-muted-foreground">
              <strong>Thá»i gian:</strong> {TIME_RANGES.find(r => r.value === timeRange)?.label}
            </p>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Äá»‹nh dáº¡ng</label>
            <div className="grid grid-cols-4 gap-2">
              {(['pdf', 'excel', 'csv', 'json'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    format === f
                      ? 'bg-green-600 text-white'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Content Options */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Ná»™i dung bÃ¡o cÃ¡o</label>
            <div className="space-y-2">
              {[
                { key: 'includeSummary', label: 'TÃ³m táº¯t Ä‘iá»u hÃ nh' },
                { key: 'includeDetails', label: 'Chi tiáº¿t theo phÆ°á»ng' },
                { key: 'includeCharts', label: 'Biá»ƒu Ä‘á»“ xu hÆ°á»›ng' },
                { key: 'includeRecommendations', label: 'Khuyáº¿n nghá»‹ hÃ nh Ä‘á»™ng' },
                { key: 'includeRawData', label: 'Dá»¯ liá»‡u raw Ä‘áº§y Ä‘á»§' },
              ].map(opt => (
                <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options[opt.key as keyof ExportOptions]}
                    onChange={(e) => setOptions({ ...options, [opt.key]: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-foreground">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Há»§y
          </button>
          <button
            onClick={() => onExport(format, options)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Xuáº¥t bÃ¡o cÃ¡o
          </button>
        </div>
      </div>
    </div>
  );
}

