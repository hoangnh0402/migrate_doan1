// Copyright (c) 2025 HQC System Contributors

// Licensed under the GNU General Public License v3.0 (GPL-3.0)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

interface AirQualityData {
  aqi: number;
  level: string;
  levelColor: string;
  description: string;
  pollutants: {
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    co: number;
    so2: number;
  };
  healthAdvice: string;
  recommendations: string[];
}

const AirQualityDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const [loading, setLoading] = useState(true);
  const [aqiData, setAqiData] = useState<AirQualityData | null>(null);

  useEffect(() => {
    loadAQIData();
  }, []);

  const getAQILevel = (aqi: number): { level: string; color: string; description: string } => {
    if (aqi <= 50) {
      return { level: 'Tá»‘t', color: '#10B981', description: 'Cháº¥t lÆ°á»£ng khÃ´ng khÃ­ tá»‘t, phÃ¹ há»£p cho má»i hoáº¡t Ä‘á»™ng ngoÃ i trá»i.' };
    } else if (aqi <= 100) {
      return { level: 'Trung bÃ¬nh', color: '#F59E0B', description: 'Cháº¥t lÆ°á»£ng khÃ´ng khÃ­ á»Ÿ má»©c cháº¥p nháº­n Ä‘Æ°á»£c.' };
    } else if (aqi <= 150) {
      return { level: 'KÃ©m', color: '#F97316', description: 'NhÃ³m nháº¡y cáº£m cÃ³ thá»ƒ gáº·p váº¥n Ä‘á» vá» sá»©c khá»e.' };
    } else if (aqi <= 200) {
      return { level: 'Xáº¥u', color: '#EF4444', description: 'Má»i ngÆ°á»i cÃ³ thá»ƒ báº¯t Ä‘áº§u gáº·p váº¥n Ä‘á» vá» sá»©c khá»e.' };
    } else if (aqi <= 300) {
      return { level: 'Ráº¥t xáº¥u', color: '#991B1B', description: 'Cáº£nh bÃ¡o sá»©c khá»e: má»i ngÆ°á»i cÃ³ thá»ƒ gáº·p váº¥n Ä‘á» nghiÃªm trá»ng.' };
    } else {
      return { level: 'Nguy hiá»ƒm', color: '#7C2D12', description: 'Cáº£nh bÃ¡o kháº©n cáº¥p: toÃ n bá»™ dÃ¢n sá»‘ cÃ³ thá»ƒ bá»‹ áº£nh hÆ°á»Ÿng.' };
    }
  };

  const loadAQIData = async () => {
    // TODO: Implement actual API call
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const aqi = 85;
      const levelInfo = getAQILevel(aqi);
      
      setAqiData({
        aqi,
        level: levelInfo.level,
        levelColor: levelInfo.color,
        description: levelInfo.description,
        pollutants: {
          pm25: 35,
          pm10: 55,
          o3: 120,
          no2: 45,
          co: 1.2,
          so2: 15,
        },
        healthAdvice: 'Cháº¥t lÆ°á»£ng khÃ´ng khÃ­ á»Ÿ má»©c cháº¥p nháº­n Ä‘Æ°á»£c. NhÃ³m nháº¡y cáº£m nÃªn háº¡n cháº¿ hoáº¡t Ä‘á»™ng ngoÃ i trá»i kÃ©o dÃ i.',
        recommendations: [
          'ÄÃ³ng cá»­a sá»• khi khÃ´ng khÃ­ bÃªn ngoÃ i Ã´ nhiá»…m',
          'Sá»­ dá»¥ng mÃ¡y lá»c khÃ´ng khÃ­ trong nhÃ ',
          'Háº¡n cháº¿ táº­p thá»ƒ dá»¥c ngoÃ i trá»i vÃ o giá» cao Ä‘iá»ƒm',
          'Äeo kháº©u trang khi ra ngoÃ i',
        ],
      });
    } catch (error) {
      console.error('Error loading AQI data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#20A957" />
        </View>
      </SafeAreaView>
    );
  }

  if (!aqiData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u cháº¥t lÆ°á»£ng khÃ´ng khÃ­</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#20A957', '#7BE882']}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cháº¥t lÆ°á»£ng khÃ´ng khÃ­</Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Main AQI Card */}
        <View style={styles.mainCard}>
          <View style={styles.aqiRow}>
            <View style={styles.aqiCircle}>
              <Text style={styles.aqiValue}>{aqiData.aqi}</Text>
              <Text style={styles.aqiLabel}>AQI</Text>
            </View>
            <View style={styles.aqiInfo}>
              <View style={[styles.levelBadge, { backgroundColor: aqiData.levelColor }]}>
                <Text style={styles.levelText}>{aqiData.level}</Text>
              </View>
              <Text style={styles.descriptionText}>{aqiData.description}</Text>
            </View>
          </View>
        </View>

        {/* Pollutants Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chá»‰ sá»‘ cÃ¡c cháº¥t Ã´ nhiá»…m</Text>
          <View style={styles.pollutantsGrid}>
            <View style={styles.pollutantCard}>
              <MaterialIcons name="cloud" size={24} color="#20A957" />
              <Text style={styles.pollutantValue}>{aqiData.pollutants.pm25}</Text>
              <Text style={styles.pollutantLabel}>PM2.5 (Î¼g/mÂ³)</Text>
            </View>
            <View style={styles.pollutantCard}>
              <MaterialIcons name="cloud-queue" size={24} color="#20A957" />
              <Text style={styles.pollutantValue}>{aqiData.pollutants.pm10}</Text>
              <Text style={styles.pollutantLabel}>PM10 (Î¼g/mÂ³)</Text>
            </View>
            <View style={styles.pollutantCard}>
              <MaterialIcons name="wb-sunny" size={24} color="#20A957" />
              <Text style={styles.pollutantValue}>{aqiData.pollutants.o3}</Text>
              <Text style={styles.pollutantLabel}>Oâ‚ƒ (ppb)</Text>
            </View>
            <View style={styles.pollutantCard}>
              <MaterialIcons name="air" size={24} color="#20A957" />
              <Text style={styles.pollutantValue}>{aqiData.pollutants.no2}</Text>
              <Text style={styles.pollutantLabel}>NOâ‚‚ (ppb)</Text>
            </View>
            <View style={styles.pollutantCard}>
              <MaterialIcons name="local-fire-department" size={24} color="#20A957" />
              <Text style={styles.pollutantValue}>{aqiData.pollutants.co}</Text>
              <Text style={styles.pollutantLabel}>CO (ppm)</Text>
            </View>
            <View style={styles.pollutantCard}>
              <MaterialIcons name="factory" size={24} color="#20A957" />
              <Text style={styles.pollutantValue}>{aqiData.pollutants.so2}</Text>
              <Text style={styles.pollutantLabel}>SOâ‚‚ (ppb)</Text>
            </View>
          </View>
        </View>

        {/* Health Advice */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lá»i khuyÃªn sá»©c khá»e</Text>
          <View style={styles.adviceCard}>
            <MaterialIcons name="health-and-safety" size={24} color="#20A957" />
            <Text style={styles.adviceText}>{aqiData.healthAdvice}</Text>
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khuyáº¿n nghá»‹</Text>
          {aqiData.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <MaterialIcons name="check-circle" size={20} color="#20A957" />
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aqiRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aqiCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  aqiValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  aqiLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  aqiInfo: {
    flex: 1,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  pollutantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pollutantCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pollutantValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  pollutantLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  adviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  adviceText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginLeft: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginLeft: 12,
  },
});

export default AirQualityDetailScreen;



