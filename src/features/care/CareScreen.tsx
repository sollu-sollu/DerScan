import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { InfoCard } from '../../components';
import { useTheme } from '../../theme';

const CLINICS = [
  {
    id: '1',
    name: 'DermaCare Institute',
    distance: '1.2 km',
    rating: 4.8,
    address: '123 Health Ave, Medical District',
    phone: '+1 234 567 890',
  },
  {
    id: '2',
    name: 'Skin Health Center',
    distance: '2.5 km',
    rating: 4.6,
    address: '456 Wellness Blvd, Downtown',
    phone: '+1 987 654 321',
  },
];

export default function CareScreen() {
  const { colors, spacing, borderRadius, typography, isDarkMode, shadows } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: spacing.lg,
      paddingBottom: 100,
    },
    header: {
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.h3,
      color: colors.text,
    },
    subtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: 4,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.xl,
      height: 50,
      ...shadows.sm,
    },
    searchInput: {
      flex: 1,
      marginLeft: spacing.sm,
      color: colors.text,
      ...typography.body,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
    },
    helpCard: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      ...shadows.lg,
    },
    helpContent: {
      flex: 1,
    },
    helpTitle: {
      ...typography.body,
      fontWeight: '700',
      color: isDarkMode ? colors.primaryDark : colors.white,
    },
    helpSubtitle: {
      ...typography.caption,
      color: isDarkMode ? colors.primaryDark : colors.white,
      opacity: 0.8,
      marginTop: 2,
    },
    helpIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: spacing.md,
    },
    clinicCard: {
      marginBottom: spacing.md,
    },
    clinicHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    clinicName: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#2A2000' : '#FFF9C4',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    ratingText: {
      fontSize: 12,
      fontWeight: '600',
      color: isDarkMode ? '#FFD700' : '#F57F17',
      marginLeft: 2,
    },
    clinicInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    clinicInfoText: {
      ...typography.caption,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    clinicActions: {
      flexDirection: 'row',
      marginTop: spacing.md,
      gap: spacing.md,
    },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      paddingVertical: 10,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionBtnText: {
      ...typography.caption,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 6,
    },
    primaryActionBtn: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    primaryActionText: {
      color: isDarkMode ? colors.primaryDark : colors.white,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Professional Care</Text>
          <Text style={styles.subtitle}>Find help and connect with specialists</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={24} color={colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search dermatologists, clinics..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Emergency/Telehealth CTA */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.helpCard}>
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>Skin Telehealth</Text>
              <Text style={styles.helpSubtitle}>Consult with a doctor in 15 mins</Text>
            </View>
            <View style={styles.helpIcon}>
              <Icon name="video" size={24} color={colors.white} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Nearby Clinics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Specialists</Text>
          {CLINICS.map(clinic => (
            <InfoCard key={clinic.id} style={styles.clinicCard}>
              <View style={styles.clinicHeader}>
                <Text style={styles.clinicName}>{clinic.name}</Text>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={12} color={isDarkMode ? '#FFD700' : '#F57F17'} />
                  <Text style={styles.ratingText}>{clinic.rating}</Text>
                </View>
              </View>

              <View style={styles.clinicInfo}>
                <Icon name="map-marker" size={14} color={colors.textLight} />
                <Text style={styles.clinicInfoText}>{clinic.distance} • {clinic.address}</Text>
              </View>

              <View style={styles.clinicActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleCall(clinic.phone)}>
                  <Icon name="phone" size={16} color={colors.text} />
                  <Text style={styles.actionBtnText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.primaryActionBtn]}>
                  <Icon name="calendar-check" size={16} color={isDarkMode ? colors.primaryDark : colors.white} />
                  <Text style={[styles.actionBtnText, styles.primaryActionText]}>Book</Text>
                </TouchableOpacity>
              </View>
            </InfoCard>
          ))}
        </View>

        {/* Emergency Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When to seek urgent care?</Text>
          <InfoCard style={{ backgroundColor: isDarkMode ? '#2B1212' : '#FFF5F5' }}>
            <Text style={[typography.bodySmall, { color: isDarkMode ? '#FF9A9A' : '#C53030', lineHeight: 20 }]}>
              • Sudden spreading of rash{'\n'}
              • High fever accompanied by skin issues{'\n'}
              • Signs of infection (pus, warmth, swelling){'\n'}
              • Severe pain or blistering
            </Text>
          </InfoCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
