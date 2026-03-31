// Copyright (c) 2025 HQC System Contributors
// Licensed under the GNU General Public License v3.0 (GPL-3.0)

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

type RouteParams = {
  content?: string;
};

const DEFAULT_CONTENT =
  'Báº±ng viá»‡c sá»­ dá»¥ng á»©ng dá»¥ng, báº¡n Ä‘á»“ng Ã½:\n' +
  '1) Báº£o máº­t dá»¯ liá»‡u cÃ¡ nhÃ¢n; \n' +
  '2) TuÃ¢n thá»§ quy Ä‘á»‹nh phÃ¡p luáº­t; \n' +
  '3) á»¨ng dá»¥ng khÃ´ng chá»‹u trÃ¡ch nhiá»‡m cho giÃ¡n Ä‘oáº¡n dá»‹ch vá»¥ do nguyÃªn nhÃ¢n khÃ¡ch quan.';

const TermsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as RouteParams | undefined;
  const content = params?.content || DEFAULT_CONTENT;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={22} color="#20A957" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Äiá»u khoáº£n sá»­ dá»¥ng</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Äiá»u khoáº£n & Quy Ä‘á»‹nh</Text>
          <Text style={styles.cardText}>{content}</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#20A957',
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

export default TermsScreen;


