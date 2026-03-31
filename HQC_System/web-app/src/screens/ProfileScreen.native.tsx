// Copyright (c) 2025 HQC System Contributors

// Licensed under the GNU General Public License v3.0 (GPL-3.0)

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Avatar from '../components/Avatar';
import { useAuth } from '../contexts/AuthContext';
import Constants from 'expo-constants';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const userName = user?.full_name || user?.username || 'NgÆ°á»i dÃ¹ng';
  const userEmail = user?.email || 'user@example.com';
  const appVersion =
    (Constants.expoConfig as any)?.version ||
    (Constants.expoConfig as any)?.extra?.appVersion ||
    '1.0.0';

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by RootNavigator based on auth state
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Lá»—i', 'KhÃ´ng thá»ƒ Ä‘Äƒng xuáº¥t. Vui lÃ²ng thá»­ láº¡i.');
    }
  };

  const renderItem = (
    label: string,
    icon: keyof typeof MaterialIcons.glyphMap,
    onPress: () => void
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <MaterialIcons name={icon} size={22} color="#111827" style={styles.menuIcon} />
      <Text style={styles.menuText}>{label}</Text>
      <MaterialIcons name="chevron-right" size={22} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const handleSupport = () => {
    navigation.navigate('Support' as never, {
      info: 'Náº¿u gáº·p sá»± cá»‘, vui lÃ²ng liÃªn há»‡:\nâ€¢ Email: support@HQC System.app\nâ€¢ Äiá»‡n thoáº¡i: 1900-1234\nâ€¢ Thá»i gian: 8:00 - 21:00 hÃ ng ngÃ y',
    } as never);
  };

  const handleTerms = () => {
    navigation.navigate('Terms' as never, {
      content:
        'Báº±ng viá»‡c sá»­ dá»¥ng á»©ng dá»¥ng, báº¡n Ä‘á»“ng Ã½ vá»›i cÃ¡c Ä‘iá»u khoáº£n vá» báº£o máº­t dá»¯ liá»‡u, giá»›i háº¡n trÃ¡ch nhiá»‡m, vÃ  tuÃ¢n thá»§ phÃ¡p luáº­t hiá»‡n hÃ nh.',
    } as never);
  };

  const handleInvite = () => {
    Alert.alert('Má»i báº¡n bÃ¨', 'TÃ­nh nÄƒng sáº½ sá»›m ra máº¯t.');
  };

  const handleCountry = () => {
    Alert.alert('Quá»‘c gia', 'TÃ­nh nÄƒng Ä‘ang Ä‘Æ°á»£c phÃ¡t triá»ƒn.');
  };

  const handleNotifications = () => {
    Alert.alert('CÃ i Ä‘áº·t thÃ´ng bÃ¡o', 'TÃ­nh nÄƒng Ä‘ang Ä‘Æ°á»£c phÃ¡t triá»ƒn.');
  };

  const handleEditProfile = () => {
    navigation.navigate('PersonalInfo' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Há»“ sÆ¡</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.avatarSection}>
          <Avatar size={80} name={userName} />
          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.email}>{userEmail}</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TÃ i khoáº£n</Text>
          <View style={styles.menuSection}>
            {renderItem('Quá»‘c gia', 'public', handleCountry)}
            {renderItem('CÃ i Ä‘áº·t thÃ´ng bÃ¡o', 'notifications-none', handleNotifications)}
            {renderItem('Chá»‰nh sá»­a há»“ sÆ¡', 'person-outline', handleEditProfile)}
            {renderItem('Äá»•i máº­t kháº©u', 'lock-outline', () => navigation.navigate('ChangePassword'))}
          </View>
        </View>

        {/* General Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chung</Text>
          <View style={styles.menuSection}>
            {renderItem('Há»— trá»£', 'help-outline', handleSupport)}
            {renderItem('Äiá»u khoáº£n sá»­ dá»¥ng', 'description', handleTerms)}
            {renderItem(`PhiÃªn báº£n á»©ng dá»¥ng ${appVersion}`, 'info-outline', () =>
              Alert.alert('PhiÃªn báº£n á»©ng dá»¥ng', appVersion)
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={22} color="#E74C3C" style={styles.menuIcon} />
          <Text style={[styles.menuText, styles.logoutText]}>ÄÄƒng xuáº¥t</Text>
          <MaterialIcons name="chevron-right" size={22} color="#E5E7EB" />
        </TouchableOpacity>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIcon: {
    width: 24,
    textAlign: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 8,
  },
  logoutText: {
    color: '#E74C3C',
  },
});

export default ProfileScreen;


