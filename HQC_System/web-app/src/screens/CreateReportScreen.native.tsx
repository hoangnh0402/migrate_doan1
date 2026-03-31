// Copyright (c) 2025 HQC System Contributors

// Licensed under the GNU General Public License v3.0 (GPL-3.0)

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  Image,
  BackHandler,
  PermissionsAndroid,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import reportsService from '../services/reports';
import { useAuth } from '../contexts/AuthContext';
import { GEO_API_BASE_URL } from '../config/env';

// Sá»­ dá»¥ng GEO_API_BASE_URL tá»« env.ts (Ä‘Ã£ normalize vÃ  Ä‘áº£m báº£o HTTPS)
const API_BASE = GEO_API_BASE_URL;

const REPORT_TYPES = [
  'á»” gÃ ',
  'Ngáº­p',
  'RÃ¡c',
  'Ã™n táº¯c',
  'ÄÃ¨n giao thÃ´ng há»ng',
  'HÃ nh vi nguy hiá»ƒm',
  'KhÃ¡c',
];

// Danh sÃ¡ch quáº­n/phÆ°á»ng ná»™i thÃ nh HÃ  Ná»™i (tÄ©nh, khÃ´ng gá»i API)
const WARD_OPTIONS: string[] = [
  // Ba ÄÃ¬nh
  'Ba ÄÃ¬nh - PhÆ°á»ng Cá»‘ng Vá»‹',
  'Ba ÄÃ¬nh - PhÆ°á»ng Äiá»‡n BiÃªn',
  'Ba ÄÃ¬nh - PhÆ°á»ng Äá»™i Cáº¥n',
  'Ba ÄÃ¬nh - PhÆ°á»ng Giáº£ng VÃµ',
  'Ba ÄÃ¬nh - PhÆ°á»ng Kim MÃ£',
  'Ba ÄÃ¬nh - PhÆ°á»ng Liá»…u Giai',
  'Ba ÄÃ¬nh - PhÆ°á»ng Ngá»c HÃ ',
  'Ba ÄÃ¬nh - PhÆ°á»ng Ngá»c KhÃ¡nh',
  'Ba ÄÃ¬nh - PhÆ°á»ng Nguyá»…n Trung Trá»±c',
  'Ba ÄÃ¬nh - PhÆ°á»ng PhÃºc XÃ¡',
  'Ba ÄÃ¬nh - PhÆ°á»ng QuÃ¡n ThÃ¡nh',
  'Ba ÄÃ¬nh - PhÆ°á»ng ThÃ nh CÃ´ng',
  'Ba ÄÃ¬nh - PhÆ°á»ng TrÃºc Báº¡ch',
  'Ba ÄÃ¬nh - PhÆ°á»ng VÄ©nh PhÃºc',
  // HoÃ n Kiáº¿m
  'HoÃ n Kiáº¿m - PhÆ°á»ng ChÆ°Æ¡ng DÆ°Æ¡ng',
  'HoÃ n Kiáº¿m - PhÆ°á»ng Cá»­a ÄÃ´ng',
  'HoÃ n Kiáº¿m - PhÆ°á»ng Cá»­a Nam',
  'HoÃ n Kiáº¿m - PhÆ°á»ng Äá»“ng XuÃ¢n',
  'HoÃ n Kiáº¿m - PhÆ°á»ng HÃ ng Báº¡c',
  'HoÃ n Kiáº¿m - PhÆ°á»ng HÃ ng BÃ i',
  'HoÃ n Kiáº¿m - PhÆ°á»ng HÃ ng Bá»“',
  'HoÃ n Kiáº¿m - PhÆ°á»ng HÃ ng BÃ´ng',
  'HoÃ n Kiáº¿m - PhÆ°á»ng HÃ ng Buá»“m',
  'HoÃ n Kiáº¿m - PhÆ°á»ng HÃ ng ÄÃ o',
  'HoÃ n Kiáº¿m - PhÆ°á»ng HÃ ng Gai',
  'HoÃ n Kiáº¿m - PhÆ°á»ng HÃ ng MÃ£',
  'HoÃ n Kiáº¿m - PhÆ°á»ng HÃ ng Trá»‘ng',
  'HoÃ n Kiáº¿m - PhÆ°á»ng LÃ½ ThÃ¡i Tá»•',
  'HoÃ n Kiáº¿m - PhÆ°á»ng Phan Chu Trinh',
  'HoÃ n Kiáº¿m - PhÆ°á»ng PhÃºc TÃ¢n',
  'HoÃ n Kiáº¿m - PhÆ°á»ng TrÃ ng Tiá»n',
  'HoÃ n Kiáº¿m - PhÆ°á»ng Tráº§n HÆ°ng Äáº¡o',
  // Hai BÃ  TrÆ°ng
  'Hai BÃ  TrÆ°ng - PhÆ°á»ng Báº¡ch Äáº±ng',
  'Hai BÃ  TrÆ°ng - PhÆ°á»ng BÃ¡ch Khoa',
  'Hai BÃ  TrÆ°ng - PhÆ°á»ng Báº¡ch Mai',
  'Hai BÃ  TrÆ°ng - PhÆ°á»ng Cáº§u Dá»n',
  'Hai BÃ  TrÆ°ng - PhÆ°á»ng Äá»‘ng MÃ¡c',
  'Hai BÃ  TrÆ°ng - PhÆ°á»ng Äá»“ng NhÃ¢n',
  'Hai BÃ  TrÆ°ng - PhÆ°á»ng Äá»“ng TÃ¢m',
  'Hai BÃ  TrÆ°ng - PhÆ°á»ng LÃª Äáº¡i HÃ nh',
  'Hai BÃ  TrÆ°ng - PhÆ°á»ng Minh Khai',
  'Hai BÃ  TrÆ°ng - PhÆ°á»ng NgÃ´ ThÃ¬ Nháº­m',
  'Hai BÃ  TrÆ°ng - PhÆ°á»ng Nguyá»…n Du',
  'Hai BÃ  TrÆ°ng - PhÆ°á»ng Pháº¡m ÄÃ¬nh Há»•',
  'Hai BÃ  TrÆ°ng - PhÆ°á»ng Phá»‘ Huáº¿',
  'Hai BÃ  TrÆ°ng - PhÆ°á»ng Quá»³nh LÃ´i',
  'Hai BÃ  TrÆ°ng - PhÆ°á»ng Quá»³nh Mai',
  'Hai BÃ  TrÆ°ng - PhÆ°á»ng Thanh LÆ°Æ¡ng',
  'Hai BÃ  TrÆ°ng - PhÆ°á»ng Thanh NhÃ n',
  'Hai BÃ  TrÆ°ng - PhÆ°á»ng TrÆ°Æ¡ng Äá»‹nh',
  // Äá»‘ng Äa
  'Äá»‘ng Äa - PhÆ°á»ng CÃ¡t Linh',
  'Äá»‘ng Äa - PhÆ°á»ng HÃ ng Bá»™t',
  'Äá»‘ng Äa - PhÆ°á»ng KhÃ¢m ThiÃªn',
  'Äá»‘ng Äa - PhÆ°á»ng KhÆ°Æ¡ng ThÆ°á»£ng',
  'Äá»‘ng Äa - PhÆ°á»ng Kim LiÃªn',
  'Äá»‘ng Äa - PhÆ°á»ng LÃ¡ng Háº¡',
  'Äá»‘ng Äa - PhÆ°á»ng LÃ¡ng ThÆ°á»£ng',
  'Äá»‘ng Äa - PhÆ°á»ng Nam Äá»“ng',
  'Äá»‘ng Äa - PhÆ°á»ng NgÃ£ TÆ° Sá»Ÿ',
  'Äá»‘ng Äa - PhÆ°á»ng Ã” Chá»£ Dá»«a',
  'Äá»‘ng Äa - PhÆ°á»ng PhÆ°Æ¡ng LiÃªn',
  'Äá»‘ng Äa - PhÆ°á»ng PhÆ°Æ¡ng Mai',
  'Äá»‘ng Äa - PhÆ°á»ng Quang Trung',
  'Äá»‘ng Äa - PhÆ°á»ng Quá»‘c Tá»­ GiÃ¡m',
  'Äá»‘ng Äa - PhÆ°á»ng Thá»‹nh Quang',
  'Äá»‘ng Äa - PhÆ°á»ng Thá»• Quan',
  'Äá»‘ng Äa - PhÆ°á»ng Trung Liá»‡t',
  'Äá»‘ng Äa - PhÆ°á»ng Trung Phá»¥ng',
  'Äá»‘ng Äa - PhÆ°á»ng Trung Tá»±',
  'Äá»‘ng Äa - PhÆ°á»ng VÄƒn ChÆ°Æ¡ng',
  'Äá»‘ng Äa - PhÆ°á»ng VÄƒn Miáº¿u',
  // TÃ¢y Há»“
  'TÃ¢y Há»“ - PhÆ°á»ng BÆ°á»Ÿi',
  'TÃ¢y Há»“ - PhÆ°á»ng Nháº­t TÃ¢n',
  'TÃ¢y Há»“ - PhÆ°á»ng PhÃº ThÆ°á»£ng',
  'TÃ¢y Há»“ - PhÆ°á»ng Quáº£ng An',
  'TÃ¢y Há»“ - PhÆ°á»ng Thá»¥y KhuÃª',
  'TÃ¢y Há»“ - PhÆ°á»ng Tá»© LiÃªn',
  'TÃ¢y Há»“ - PhÆ°á»ng XuÃ¢n La',
  'TÃ¢y Há»“ - PhÆ°á»ng YÃªn Phá»¥',
  // Cáº§u Giáº¥y
  'Cáº§u Giáº¥y - PhÆ°á»ng Dá»‹ch Vá»ng',
  'Cáº§u Giáº¥y - PhÆ°á»ng Dá»‹ch Vá»ng Háº­u',
  'Cáº§u Giáº¥y - PhÆ°á»ng Mai Dá»‹ch',
  'Cáº§u Giáº¥y - PhÆ°á»ng NghÄ©a ÄÃ´',
  'Cáº§u Giáº¥y - PhÆ°á»ng NghÄ©a TÃ¢n',
  'Cáº§u Giáº¥y - PhÆ°á»ng Quan Hoa',
  'Cáº§u Giáº¥y - PhÆ°á»ng Trung HÃ²a',
  'Cáº§u Giáº¥y - PhÆ°á»ng YÃªn HÃ²a',
  // HoÃ ng Mai
  'HoÃ ng Mai - PhÆ°á»ng Äáº¡i Kim',
  'HoÃ ng Mai - PhÆ°á»ng Äá»‹nh CÃ´ng',
  'HoÃ ng Mai - PhÆ°á»ng GiÃ¡p BÃ¡t',
  'HoÃ ng Mai - PhÆ°á»ng HoÃ ng Liá»‡t',
  'HoÃ ng Mai - PhÆ°á»ng HoÃ ng VÄƒn Thá»¥',
  'HoÃ ng Mai - PhÆ°á»ng LÄ©nh Nam',
  'HoÃ ng Mai - PhÆ°á»ng Mai Äá»™ng',
  'HoÃ ng Mai - PhÆ°á»ng TÃ¢n Mai',
  'HoÃ ng Mai - PhÆ°á»ng Thanh TrÃ¬',
  'HoÃ ng Mai - PhÆ°á»ng Thá»‹nh Liá»‡t',
  'HoÃ ng Mai - PhÆ°á»ng Tráº§n PhÃº',
  'HoÃ ng Mai - PhÆ°á»ng TÆ°Æ¡ng Mai',
  'HoÃ ng Mai - PhÆ°á»ng VÄ©nh HÆ°ng',
  'HoÃ ng Mai - PhÆ°á»ng YÃªn Sá»Ÿ',
  // Long BiÃªn
  'Long BiÃªn - PhÆ°á»ng Bá»“ Äá»',
  'Long BiÃªn - PhÆ°á»ng Cá»± Khá»‘i',
  'Long BiÃªn - PhÆ°á»ng Äá»©c Giang',
  'Long BiÃªn - PhÆ°á»ng Gia Thá»¥y',
  'Long BiÃªn - PhÆ°á»ng Giang BiÃªn',
  'Long BiÃªn - PhÆ°á»ng Long BiÃªn',
  'Long BiÃªn - PhÆ°á»ng Ngá»c LÃ¢m',
  'Long BiÃªn - PhÆ°á»ng Ngá»c Thá»¥y',
  'Long BiÃªn - PhÆ°á»ng PhÃºc Äá»“ng',
  'Long BiÃªn - PhÆ°á»ng PhÃºc Lá»£i',
  'Long BiÃªn - PhÆ°á»ng SÃ i Äá»“ng',
  'Long BiÃªn - PhÆ°á»ng Tháº¡ch BÃ n',
  'Long BiÃªn - PhÆ°á»ng ThÆ°á»£ng Thanh',
  'Long BiÃªn - PhÆ°á»ng Viá»‡t HÆ°ng',
  // Báº¯c Tá»« LiÃªm
  'Báº¯c Tá»« LiÃªm - PhÆ°á»ng Cá»• Nhuáº¿ 1',
  'Báº¯c Tá»« LiÃªm - PhÆ°á»ng Cá»• Nhuáº¿ 2',
  'Báº¯c Tá»« LiÃªm - PhÆ°á»ng ÄÃ´ng Ngáº¡c',
  'Báº¯c Tá»« LiÃªm - PhÆ°á»ng Äá»©c Tháº¯ng',
  'Báº¯c Tá»« LiÃªm - PhÆ°á»ng LiÃªn Máº¡c',
  'Báº¯c Tá»« LiÃªm - PhÆ°á»ng Minh Khai',
  'Báº¯c Tá»« LiÃªm - PhÆ°á»ng PhÃº Diá»…n',
  'Báº¯c Tá»« LiÃªm - PhÆ°á»ng PhÃºc Diá»…n',
  'Báº¯c Tá»« LiÃªm - PhÆ°á»ng TÃ¢y Tá»±u',
  'Báº¯c Tá»« LiÃªm - PhÆ°á»ng ThÆ°á»£ng CÃ¡t',
  'Báº¯c Tá»« LiÃªm - PhÆ°á»ng Thá»¥y PhÆ°Æ¡ng',
  'Báº¯c Tá»« LiÃªm - PhÆ°á»ng XuÃ¢n Äá»‰nh',
  'Báº¯c Tá»« LiÃªm - PhÆ°á»ng XuÃ¢n Táº£o',
  // Nam Tá»« LiÃªm
  'Nam Tá»« LiÃªm - PhÆ°á»ng Cáº§u Diá»…n',
  'Nam Tá»« LiÃªm - PhÆ°á»ng Äáº¡i Má»—',
  'Nam Tá»« LiÃªm - PhÆ°á»ng Má»… TrÃ¬',
  'Nam Tá»« LiÃªm - PhÆ°á»ng Má»¹ ÄÃ¬nh 1',
  'Nam Tá»« LiÃªm - PhÆ°á»ng Má»¹ ÄÃ¬nh 2',
  'Nam Tá»« LiÃªm - PhÆ°á»ng PhÃº ÄÃ´',
  'Nam Tá»« LiÃªm - PhÆ°á»ng PhÆ°Æ¡ng Canh',
  'Nam Tá»« LiÃªm - PhÆ°á»ng TÃ¢y Má»—',
  'Nam Tá»« LiÃªm - PhÆ°á»ng Trung VÄƒn',
  'Nam Tá»« LiÃªm - PhÆ°á»ng XuÃ¢n PhÆ°Æ¡ng',
  // HÃ  ÄÃ´ng
  'HÃ  ÄÃ´ng - PhÆ°á»ng BiÃªn Giang',
  'HÃ  ÄÃ´ng - PhÆ°á»ng DÆ°Æ¡ng Ná»™i',
  'HÃ  ÄÃ´ng - PhÆ°á»ng Äá»“ng Mai',
  'HÃ  ÄÃ´ng - PhÆ°á»ng HÃ  Cáº§u',
  'HÃ  ÄÃ´ng - PhÆ°á»ng Kiáº¿n HÆ°ng',
  'HÃ  ÄÃ´ng - PhÆ°á»ng La KhÃª',
  'HÃ  ÄÃ´ng - PhÆ°á»ng Má»™ Lao',
  'HÃ  ÄÃ´ng - PhÆ°á»ng Nguyá»…n TrÃ£i',
  'HÃ  ÄÃ´ng - PhÆ°á»ng PhÃº La',
  'HÃ  ÄÃ´ng - PhÆ°á»ng PhÃº LÃ£m',
  'HÃ  ÄÃ´ng - PhÆ°á»ng PhÃº LÆ°Æ¡ng',
  'HÃ  ÄÃ´ng - PhÆ°á»ng Quang Trung',
  'HÃ  ÄÃ´ng - PhÆ°á»ng Váº¡n PhÃºc',
  'HÃ  ÄÃ´ng - PhÆ°á»ng VÄƒn QuÃ¡n',
  'HÃ  ÄÃ´ng - PhÆ°á»ng YÃªn NghÄ©a',
  'HÃ  ÄÃ´ng - PhÆ°á»ng Yáº¿t KiÃªu',
  'HÃ  ÄÃ´ng - PhÆ°á»ng An HÆ°ng',
  // Thanh XuÃ¢n
  'Thanh XuÃ¢n - PhÆ°á»ng Háº¡ ÄÃ¬nh',
  'Thanh XuÃ¢n - PhÆ°á»ng KhÆ°Æ¡ng ÄÃ¬nh',
  'Thanh XuÃ¢n - PhÆ°á»ng KhÆ°Æ¡ng Mai',
  'Thanh XuÃ¢n - PhÆ°á»ng KhÆ°Æ¡ng Trung',
  'Thanh XuÃ¢n - PhÆ°á»ng Kim Giang',
  'Thanh XuÃ¢n - PhÆ°á»ng NhÃ¢n ChÃ­nh',
  'Thanh XuÃ¢n - PhÆ°á»ng PhÆ°Æ¡ng Liá»‡t',
  'Thanh XuÃ¢n - PhÆ°á»ng Thanh XuÃ¢n Báº¯c',
  'Thanh XuÃ¢n - PhÆ°á»ng Thanh XuÃ¢n Nam',
  'Thanh XuÃ¢n - PhÆ°á»ng Thanh XuÃ¢n Trung',
  'Thanh XuÃ¢n - PhÆ°á»ng ThÆ°á»£ng ÄÃ¬nh',
];

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

// Map quáº­n -> danh sÃ¡ch phÆ°á»ng
const DISTRICT_WARD_MAP: Record<string, string[]> = WARD_OPTIONS.reduce(
  (acc, entry) => {
    const [district, ward] = entry.split('-').map((s) => s.trim());
    if (!district || !ward) return acc;
    if (!acc[district]) acc[district] = [];
    acc[district].push(ward);
    return acc;
  },
  {} as Record<string, string[]>
);

const DISTRICTS = Object.keys(DISTRICT_WARD_MAP).sort((a, b) => a.localeCompare(b, 'vi'));
const WARD_TO_DISTRICT: Record<string, string> = Object.entries(DISTRICT_WARD_MAP).reduce(
  (acc, [district, wards]) => {
    wards.forEach((w) => {
      acc[normalizeText(w)] = district;
    });
    return acc;
  },
  {} as Record<string, string>
);

const findDistrictByAddress = (addr: Record<string, any>): string | null => {
  const districtNames = DISTRICTS;
  const candidates = [
    addr?.city_district,
    addr?.district,
    addr?.county,
    addr?.state_district,
    addr?.city,
  ]
    .filter(Boolean)
    .map((x) => String(x));

  for (const cand of candidates) {
    const candNorm = normalizeText(cand);
    const found = districtNames.find((d) => {
      const dn = normalizeText(d);
      return (
        candNorm.includes(dn) ||
        dn.includes(candNorm) ||
        candNorm.includes(normalizeText('quan ' + d)) ||
        candNorm.includes(normalizeText('quáº­n ' + d))
      );
    });
    if (found) return found;
  }
  return null;
};

const findDistrictByWardName = (wardName: string | null): string | null => {
  if (!wardName) return null;
  const norm = normalizeText(wardName.replace(/^phÆ°á»ng\s+/i, '').trim());
  return WARD_TO_DISTRICT[norm] || null;
};

const CreateReportScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [reportType, setReportType] = useState<string | null>(null);
  const [ward, setWard] = useState<string | null>(null);
  const [addressDetail, setAddressDetail] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<Array<{ uri: string; type: 'image' | 'video' }>>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  // NgÃ£ TÆ° Sá»Ÿ - Quáº­n Thanh XuÃ¢n, HÃ  Ná»™i
  const DEFAULT_LOCATION = { lat: 21.003204, lng: 105.819673 };
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(DEFAULT_LOCATION);
  const mapModalRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<any>(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [district, setDistrict] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    reportType?: string;
    ward?: string;
    content?: string;
    images?: string;
  }>({});
  const [touched, setTouched] = useState<{
    reportType?: boolean;
    ward?: boolean;
    content?: boolean;
    images?: boolean;
  }>({});

  // Validation functions
  const validateContent = (content: string): boolean => {
    const trimmed = content.trim();
    return trimmed.length >= 10 && trimmed.length <= 2000;
  };

  const validateImages = (mediaList: Array<{ uri: string; type: 'image' | 'video' }>): boolean => {
    return mediaList.length >= 1 && mediaList.length <= 5;
  };

  const recognitionRef = useRef<any | null>(null);

  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };

    if (field === 'reportType') {
      if (!value) {
        newErrors.reportType = 'Vui lÃ²ng chá»n loáº¡i pháº£n Ã¡nh';
      } else {
        delete newErrors.reportType;
      }
    } else if (field === 'ward') {
      if (!value) {
        newErrors.ward = 'Vui lÃ²ng chá»n Ä‘á»‹a Ä‘iá»ƒm';
      } else {
        delete newErrors.ward;
      }
    } else if (field === 'content') {
      if (!value.trim()) {
        newErrors.content = 'Vui lÃ²ng nháº­p ná»™i dung pháº£n Ã¡nh';
      } else if (value.trim().length < 10) {
        newErrors.content = 'Ná»™i dung pháº£i cÃ³ Ã­t nháº¥t 10 kÃ½ tá»±';
      } else if (value.trim().length > 2000) {
        newErrors.content = 'Ná»™i dung khÃ´ng Ä‘Æ°á»£c vÆ°á»£t quÃ¡ 2000 kÃ½ tá»±';
      } else {
        delete newErrors.content;
      }
    } else if (field === 'images') {
      if (!validateImages(value)) {
        if (value.length === 0) {
          newErrors.images = 'Vui lÃ²ng thÃªm Ã­t nháº¥t má»™t áº£nh/video';
        } else if (value.length > 5) {
          newErrors.images = 'Chá»‰ Ä‘Æ°á»£c thÃªm tá»‘i Ä‘a 5 áº£nh/video';
        }
      } else {
        delete newErrors.images;
      }
    }

    setErrors(newErrors);
  };

  const isFormValid = (): boolean => {
    return (
      !!reportType &&
      !!ward &&
      validateContent(content) &&
      validateImages(images)
    );
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lá»—i', 'Cáº§n quyá»n truy cáº­p thÆ° viá»‡n áº£nh/video');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newMedia = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' as const : 'image' as const,
      }));
      const updatedImages = [...images, ...newMedia].slice(0, 5); // Tá»‘i Ä‘a 5 áº£nh/video
      setImages(updatedImages);
      if (touched.images) {
        validateField('images', updatedImages);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    if (touched.images) {
      validateField('images', updatedImages);
    }
  };

  const handleSave = () => {
    // TODO: LÆ°u báº£n nhÃ¡p
    Alert.alert('ThÃ nh cÃ´ng', 'ÄÃ£ lÆ°u báº£n nhÃ¡p', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore stop errors
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const handleBack = () => {
    // Quay vá» trang danh sÃ¡ch hiá»‡n trÆ°á»ng/ReportHome; fallback Explore náº¿u khÃ´ng cÃ³ route
    try {
      navigation.reset({
        index: 0,
        routes: [{ name: 'ReportHome' as never }],
      });
    } catch (err) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Explore' as never }],
      });
    }
  };

  // Cháº·n nÃºt back cá»©ng Android Ä‘á»ƒ vá» tháº³ng Explore
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
  }, []);

  const handleVoiceInput = async () => {
    // Toggle off if already recording
    if (isRecording) {
      stopVoiceInput();
      return;
    }

    // Native platforms: best-effort permission prompt, but speech recognition is web-only in this mock.
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Cáº¥p quyá»n micro',
          message: 'á»¨ng dá»¥ng cáº§n quyá»n micro Ä‘á»ƒ ghi Ã¢m vÃ  chuyá»ƒn thÃ nh vÄƒn báº£n.',
          buttonPositive: 'Äá»“ng Ã½',
          buttonNegative: 'Tá»« chá»‘i',
        }
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('ThÃ´ng bÃ¡o', 'Báº¡n cáº§n cáº¥p quyá»n micro Ä‘á»ƒ sá»­ dá»¥ng tÃ­nh nÄƒng nÃ y.');
        return;
      }
    }

    // Web speech recognition
    if (typeof window === 'undefined') {
      Alert.alert('ThÃ´ng bÃ¡o', 'TrÃ¬nh duyá»‡t khÃ´ng há»— trá»£ nháº­p giá»ng nÃ³i.');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      Alert.alert('ThÃ´ng bÃ¡o', 'TrÃ¬nh duyá»‡t khÃ´ng há»— trá»£ Web Speech API.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }

      if (transcript) {
        const nextText = content ? `${content.trim()} ${transcript.trim()}` : transcript.trim();
        setContent(nextText);
        if (!touched.content) {
          setTouched({ ...touched, content: true });
        }
        validateField('content', nextText);
      }
    };

    recognition.onerror = () => {
      stopVoiceInput();
      Alert.alert('Lá»—i', 'KhÃ´ng thá»ƒ nháº­n dáº¡ng giá»ng nÃ³i. Vui lÃ²ng thá»­ láº¡i.');
    };

    recognition.onend = () => {
      stopVoiceInput();
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsRecording(true);
    } catch (err) {
      recognitionRef.current = null;
      Alert.alert('Lá»—i', 'KhÃ´ng thá»ƒ khá»Ÿi Ä‘á»™ng thu Ã¢m. Vui lÃ²ng thá»­ láº¡i.');
    }
  };

  useEffect(() => {
    return () => {
      stopVoiceInput();
    };
  }, []);

  // Location is now fixed to default location - no geolocation needed
  // userLocation is already set to DEFAULT_LOCATION in useState initialization

  // Initialize map when modal opens
  useEffect(() => {
    if (showMapModal && typeof window !== 'undefined') {
      const loadLeaflet = async () => {
        // Load CSS if not already loaded
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Load JS if not already loaded
        if (!(window as any).L) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => {
            initializeMap();
          };
          document.body.appendChild(script);
        } else {
          // Clean up existing map if any
          if (mapModalRef.current) {
            mapModalRef.current.remove();
            mapModalRef.current = null;
          }
          initializeMap();
        }
      };

      loadLeaflet();
    }

    return () => {
      // Cleanup map when modal closes
      if (!showMapModal && mapModalRef.current) {
        mapModalRef.current.remove();
        mapModalRef.current = null;
        markerRef.current = null;
      }
    };
  }, [showMapModal, userLocation]);

  // KhÃ´ng gá»i API láº¥y phÆ°á»ng/xÃ£ â€“ dÃ¹ng danh sÃ¡ch tÄ©nh WARD_OPTIONS

  const initializeMap = () => {
    if (!mapContainerRef.current || !(window as any).L) return;

    const L = (window as any).L;
    
    // Priority: selectedLocation > userLocation (NgÃ£ TÆ° Sá»Ÿ)
    const defaultCenter: [number, number] = selectedLocation 
      ? [selectedLocation.lat, selectedLocation.lng]
      : [userLocation.lat, userLocation.lng]; // NgÃ£ TÆ° Sá»Ÿ - Quáº­n Thanh XuÃ¢n, HÃ  Ná»™i

    // Initialize map
    mapModalRef.current = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 15,
      zoomControl: true,
    });

    // Add satellite tile layer (Esri World Imagery)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution:
          'Tiles Â© Esri â€” Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      }
    ).addTo(mapModalRef.current);

    // Update location when map is moved (marker is fixed at center visually)
    const updateLocationFromCenter = () => {
      const center = mapModalRef.current.getCenter();
      setSelectedLocation({ lat: center.lat, lng: center.lng });
    };

    mapModalRef.current.on('moveend', updateLocationFromCenter);
    mapModalRef.current.on('dragend', updateLocationFromCenter);

    // Set initial location
    setSelectedLocation({ lat: defaultCenter[0], lng: defaultCenter[1] });
  };

  const reverseGeocodeLocation = async (lat: number, lon: number) => {
    try {
      setIsReverseGeocoding(true);
      const url = new URL('https://nominatim.openstreetmap.org/reverse');
      url.searchParams.set('format', 'json');
      url.searchParams.set('lat', String(lat));
      url.searchParams.set('lon', String(lon));
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('zoom', '18');
      url.searchParams.set('accept-language', 'vi');

      const res = await fetch(url.toString(), {
        headers: {
          // Friendly UA per Nominatim requirements
          'User-Agent': 'HQC System/1.0 (contact@HQC System.local)',
        },
      });
      if (!res.ok) throw new Error(`Reverse geocode error ${res.status}`);
      const data = await res.json();
      const address = data?.address || {};
      console.log('[REVERSE] address', address);

      // Æ¯u tiÃªn cÃ¡c trÆ°á»ng phÆ°á»ng/xÃ£/thá»‹ tráº¥n
      const wardCandidate =
        address.suburb ||
        address.village ||
        address.town ||
        address.hamlet ||
        address.quarter ||
        address.neighbourhood ||
        address.city_district ||
        address.county ||
        address.state_district ||
        null;

      const houseNumber = address.house_number;
      const road = address.road || address.footway || address.residential || '';
      const hamlet = address.hamlet || address.quarter || '';
      const neighbourhood = address.neighbourhood || '';

      const detailParts = [
        [houseNumber, road].filter(Boolean).join(' '),
        hamlet,
        neighbourhood,
      ]
        .filter(Boolean)
        .join(', ');

      let districtName = findDistrictByAddress(address);
      if (!districtName) {
        districtName = findDistrictByWardName(wardCandidate);
      }
      if (!districtName) {
        console.log('[REVERSE] district not found from address fields or ward');
      } else {
        console.log('[REVERSE] matched district', districtName);
      }

      if (districtName) {
        setDistrict(districtName);
      }

      if (wardCandidate) {
      const wardValue = districtName ? `${districtName} - ${wardCandidate}` : wardCandidate;
        setWard(wardValue);
        validateField('ward', wardValue);
      }
      if (detailParts) {
        setAddressDetail(detailParts);
      }
    } catch (err) {
      console.error('Reverse geocode failed', err);
      Alert.alert('Lá»—i', 'KhÃ´ng láº¥y Ä‘Æ°á»£c Ä‘á»‹a chá»‰ tá»« báº£n Ä‘á»“. Báº¡n cÃ³ thá»ƒ nháº­p tay.');
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!selectedLocation) return;
    await reverseGeocodeLocation(selectedLocation.lat, selectedLocation.lng);
    setShowMapModal(false);
  };

  const handleCancelMap = () => {
    setShowMapModal(false);
    // Optionally reset location if user cancels
    // setSelectedLocation(null);
  };

  const handleReportTypeSelect = (item: string) => {
    setReportType(item);
    setTouched({ ...touched, reportType: true });
    validateField('reportType', item);
  };

  const handleWardSelect = (item: string) => {
    const value = district ? `${district} - ${item}` : item;
    setWard(value);
    setTouched({ ...touched, ward: true });
    validateField('ward', value);
  };

  const wardList = district ? DISTRICT_WARD_MAP[district] || [] : [];
  const selectedWardName = ward ? ward.split('-').pop()?.trim() || null : null;

  const handleContentChange = (text: string) => {
    setContent(text);
    if (touched.content) {
      validateField('content', text);
    }
  };

  const handleContentBlur = () => {
    setTouched({ ...touched, content: true });
    validateField('content', content);
  };

  const handleSubmit = async () => {
    // Mark all fields as touched
    setTouched({
      reportType: true,
      ward: true,
      content: true,
      images: true,
    });

    // Validate all fields
    validateField('reportType', reportType);
    validateField('ward', ward);
    validateField('content', content);
    validateField('images', images);

    if (!isFormValid()) {
      return;
    }

    // Prevent double submission
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare media files
      const preparedMedia = await reportsService.prepareMediaFiles(images);

      // Get userId from auth context
      const userId = user?._id || user?.id;

      // Create report data
      const reportData = {
        reportType: reportType!,
        ward: ward!,
        addressDetail: addressDetail || undefined,
        location: selectedLocation || undefined,
        title: title || undefined,
        content: content,
        media: preparedMedia,
        userId: userId || undefined,
      };

      // Submit report
      const response = await reportsService.createReport(reportData);

      if (response.success && response.data) {
        // Reset form
        setReportType(null);
        setWard(null);
        setAddressDetail('');
        setTitle('');
        setContent('');
        setImages([]);
        setSelectedLocation(null);
        setTouched({});
        setIsSubmitting(false);
        
        // Navigate to ReportHome and show success message
        navigation.navigate('ReportHome', {
          showSuccessMessage: true,
          message: 'Táº¡o pháº£n Ã¡nh thÃ nh cÃ´ng'
        });
      } else {
        throw new Error(response.error || 'Failed to create report');
      }
    } catch (error: any) {
      
      let errorMessage = 'KhÃ´ng thá»ƒ gá»­i bÃ¡o cÃ¡o. Vui lÃ²ng thá»­ láº¡i sau.';
      
      if (error.message) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'KhÃ´ng thá»ƒ káº¿t ná»‘i Ä‘áº¿n server. Vui lÃ²ng kiá»ƒm tra káº¿t ná»‘i máº¡ng vÃ  Ä‘áº£m báº£o backend server Ä‘ang cháº¡y.';
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert('Lá»—i', errorMessage, [{ text: 'OK' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDropdownModal = (
    visible: boolean,
    onClose: () => void,
    items: string[],
    selected: string | null,
    onSelect: (item: string) => void,
    title: string
  ) => (
    <Modal 
      visible={visible} 
      transparent 
      animationType="slide"
      accessibilityViewIsModal={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={items}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.modalItemText}>{item}</Text>
                {selected === item && (
                  <MaterialIcons name="check" size={20} color="#20A957" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#20A957" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gá»­i pháº£n Ã¡nh</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.form}>
          <Text style={styles.label}>
            Loáº¡i pháº£n Ã¡nh <Text style={styles.requiredStar}>*</Text>
          </Text>
              <TouchableOpacity
                style={[styles.dropdown, errors.reportType && styles.inputError]}
                onPress={() => setShowTypeModal(true)}
              >
                <Text style={[styles.dropdownText, !reportType && styles.dropdownPlaceholder]}>
                  {reportType || 'Chá»n loáº¡i pháº£n Ã¡nh '}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="#9CA3AF" />
              </TouchableOpacity>
              {errors.reportType && touched.reportType && (
                <Text style={styles.errorText}>{errors.reportType}</Text>
              )}

          <Text style={styles.label}>
            Quáº­n <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.dropdown, errors.ward && styles.inputError]}
            onPress={() => setShowDistrictModal(true)}
          >
            <Text style={[styles.dropdownText, !district && styles.dropdownPlaceholder]}>
              {district || 'Chá»n quáº­n'}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <Text style={styles.label}>
            PhÆ°á»ng/XÃ£ <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.dropdown, errors.ward && styles.inputError]}
            onPress={() => setShowWardModal(true)}
            disabled={!district}
          >
            <Text style={[styles.dropdownText, !ward && styles.dropdownPlaceholder]}>
              {ward || (district ? 'Chá»n phÆ°á»ng' : 'Chá»n quáº­n trÆ°á»›c')}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          {errors.ward && touched.ward && (
            <Text style={styles.errorText}>{errors.ward}</Text>
          )}

          <TextInput
            style={styles.input}
            placeholder="Sá»‘ nhÃ , thÃ´n/xÃ³m, khu vá»±c "
            value={addressDetail}
            onChangeText={setAddressDetail}
          />

          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => setShowMapModal(true)}
          >
            <MaterialIcons name="place" size={20} color="#20A957" />
            <Text style={styles.mapButtonText}>Chá»n Ä‘á»‹a Ä‘iá»ƒm tá»« báº£n Ä‘á»“</Text>
          </TouchableOpacity>
          {selectedLocation && (
            <Text style={styles.selectedLocationText}>
              ÄÃ£ chá»n: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </Text>
          )}

          <Text style={styles.label}>TiÃªu Ä‘á»</Text>
          <TextInput
            style={styles.input}
            placeholder="Nháº­p tiÃªu Ä‘á» pháº£n Ã¡nh"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>
            Ná»™i dung <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.content && styles.inputError]}
            placeholder="MÃ´ táº£ chi tiáº¿t ná»™i dung pháº£n Ã¡nh (tá»‘i thiá»ƒu 10 kÃ½ tá»±)"
            value={content}
            onChangeText={handleContentChange}
            onBlur={handleContentBlur}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={2000}
          />
          <Text style={styles.helperText}>
            {content.length}/2000 kÃ½ tá»± {content.length < 10 && touched.content && (
              <Text style={styles.errorText}> - Tá»‘i thiá»ƒu 10 kÃ½ tá»±</Text>
            )}
          </Text>
          {errors.content && touched.content && (
            <Text style={styles.errorText}>{errors.content}</Text>
          )}

          <TouchableOpacity
            style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
            onPress={handleVoiceInput}
          >
            <MaterialIcons
              name={isRecording ? 'stop' : 'mic'}
              size={20}
              color={isRecording ? '#DC2626' : '#20A957'}
            />
            <Text style={styles.voiceButtonText}>
              {isRecording ? 'Dá»«ng nháº­p giá»ng nÃ³i' : 'áº¤n Ä‘á»ƒ nháº­p ná»™i dung báº±ng giá»ng nÃ³i'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>
            áº¢nh/Video <Text style={styles.requiredStar}>*</Text>
          </Text>
          <Text style={styles.helperText}>
            Cho phÃ©p tá»•ng dung lÆ°á»£ng tá»‘i Ä‘a 30MB (tá»‘i thiá»ƒu 1, tá»‘i Ä‘a 5 áº£nh/video)
          </Text>
          {errors.images && touched.images && (
            <Text style={styles.errorText}>{errors.images}</Text>
          )}
          <View style={styles.imageContainer}>
            {images.map((media, index) => (
              <View key={index} style={styles.imageWrapper}>
                {media.type === 'video' ? (
                  <View style={styles.videoPreview}>
                    <MaterialIcons name="videocam" size={32} color="#FFFFFF" />
                    <View style={styles.videoBadge}>
                      <MaterialIcons name="play-circle-filled" size={20} color="#FFFFFF" />
                    </View>
                  </View>
                ) : (
                  <Image source={{ uri: media.uri }} style={styles.imagePreview} />
                )}
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <MaterialIcons name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={() => {
                  handlePickImage();
                  setTouched({ ...touched, images: true });
                }}
              >
                <MaterialIcons name="camera-alt" size={28} color="#9CA3AF" />
                <Text style={styles.addImageText}>ThÃªm{'\n'}áº¢nh/Video</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>LÆ°u láº¡i</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!isFormValid() || isSubmitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              {isSubmitting ? (
                <View style={styles.submitButtonLoading}>
                  <ActivityIndicator size="small" color="#20A957" style={{ marginRight: 8 }} />
                  <Text style={styles.submitButtonText}>Äang gá»­i...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>
                  {!isFormValid() ? 'Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin' : 'Gá»­i pháº£n Ã¡nh'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {renderDropdownModal(
        showTypeModal,
        () => setShowTypeModal(false),
        REPORT_TYPES,
        reportType,
        handleReportTypeSelect,
        'Chá»n loáº¡i pháº£n Ã¡nh'
      )}

      {renderDropdownModal(
        showDistrictModal,
        () => setShowDistrictModal(false),
        DISTRICTS,
        district,
        (item) => {
          setDistrict(item);
          setWard(null);
          setTouched({ ...touched, ward: true });
        },
        'Chá»n quáº­n'
      )}

      {renderDropdownModal(
        showWardModal,
        () => setShowWardModal(false),
        wardList.length > 0 ? wardList : [],
        selectedWardName,
        handleWardSelect,
        'Chá»n xÃ£/phÆ°á»ng'
      )}

      {/* Map Selection Modal */}
      <Modal 
        visible={showMapModal} 
        transparent 
        animationType="slide"
        accessibilityViewIsModal={true}
        onRequestClose={handleCancelMap}
      >
        <View style={styles.mapModalOverlay}>
          <View style={styles.mapModalContent}>
            <View style={styles.mapModalHeader}>
              <Text style={styles.mapModalTitle}>Chá»n Ä‘á»‹a Ä‘iá»ƒm trÃªn báº£n Ä‘á»“</Text>
              <TouchableOpacity onPress={handleCancelMap}>
                <MaterialIcons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>
            <View style={styles.mapContainer}>
              <div
                ref={mapContainerRef}
                style={{
                  width: '100%',
                  height: '100%',
                  zIndex: 1,
                }}
              />
              {/* Fixed marker icon at center */}
              <View style={styles.centerMarker}>
                <View style={styles.markerIcon}>
                  <MaterialIcons name="place" size={32} color="#20A957" />
                </View>
              </View>
            </View>
            <View style={styles.mapModalFooter}>
              <TouchableOpacity
                style={styles.mapCancelButton}
                onPress={handleCancelMap}
              >
                <Text style={styles.mapCancelButtonText}>Há»§y</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.mapSaveButton, !selectedLocation && styles.mapSaveButtonDisabled]}
                onPress={handleSaveLocation}
                disabled={!selectedLocation || isReverseGeocoding}
              >
                {isReverseGeocoding ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.mapSaveButtonText}>Äang láº¥y Ä‘á»‹a chá»‰...</Text>
                  </View>
                ) : (
                  <Text style={styles.mapSaveButtonText}>LÆ°u</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#20A957',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  requiredStar: {
    color: '#EF4444',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  mapButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#20A957',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  voiceButtonActive: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  voiceButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  imageWrapper: {
    width: 120,
    height: 120,
    marginRight: 8,
    marginBottom: 8,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  videoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  addImageText: {
    marginTop: 8,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  saveButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#20A957',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#20A957',
    fontSize: 16,
    fontWeight: '700',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemText: {
    fontSize: 16,
    color: '#111827',
  },
  mapModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  mapModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: Dimensions.get('window').height * 0.67, // 2/3 of screen
    maxHeight: '67%',
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  mapModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
    width: 40,
    height: 40,
    zIndex: 1000,
    pointerEvents: 'none',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#20A957',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  mapModalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  mapCancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  mapCancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  mapSaveButton: {
    flex: 1,
    backgroundColor: '#20A957',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  mapSaveButtonDisabled: {
    opacity: 0.5,
  },
  mapSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  selectedLocationText: {
    fontSize: 12,
    color: '#20A957',
    marginTop: 8,
    marginBottom: 8,
  },
});

export default CreateReportScreen;

