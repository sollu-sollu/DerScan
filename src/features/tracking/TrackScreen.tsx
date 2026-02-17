import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { PrimaryButton, InfoCard } from '../../components';
import { useTheme } from '../../theme';

export default function TrackScreen() {
  const { colors, spacing, borderRadius, typography, isDarkMode, shadows } = useTheme();
  
  // Mock data
  const recoveryPercent = 46;
  const healingTrend = -2.5;

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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.h3,
      color: colors.text,
    },
    comparisonCard: {
      marginBottom: spacing.lg,
    },
    comparisonHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    comparisonTitle: {
      ...typography.caption,
      fontWeight: '600',
      color: colors.text,
      lineHeight: 18,
    },
    autoAlignBadge: {
      backgroundColor: isDarkMode ? '#1B5E20' : '#E8F5E9',
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 8,
    },
    autoAlignText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.success,
    },
    comparisonImages: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    imageContainer: {
      alignItems: 'center',
    },
    placeholderImage: {
      width: 100,
      height: 100,
      borderRadius: 12,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    todayImage: {
      borderWidth: 2,
      borderColor: colors.primary,
      position: 'relative',
    },
    checkOverlay: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
    },
    imageLabel: {
      ...typography.bodySmall,
      fontWeight: '600',
      color: colors.text,
    },
    imageDate: {
      ...typography.caption,
      color: colors.textLight,
      marginTop: 2,
    },
    recoveryContainer: {
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    recoveryPercent: {
      fontSize: 56,
      fontWeight: '700',
      color: colors.success,
    },
    recoveryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    recoveryLabel: {
      ...typography.caption,
      fontWeight: '600',
      color: colors.text,
    },
    recoverySubtext: {
      ...typography.caption,
      color: colors.textLight,
      marginTop: 4,
    },
    trendCard: {
      marginBottom: spacing.lg,
    },
    trendHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    trendTitle: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text,
    },
    trendBadge: {
      backgroundColor: isDarkMode ? '#1B5E20' : '#E8F5E9',
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 8,
    },
    trendValue: {
      ...typography.caption,
      fontWeight: '600',
      color: colors.success,
    },
    trendSubtitle: {
      ...typography.caption,
      color: colors.textLight,
      marginBottom: spacing.md,
    },
    chartPlaceholder: {
      height: 120,
      backgroundColor: colors.background,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chartPlaceholderText: {
      ...typography.caption,
      color: colors.textLight,
    },
    chartPlaceholderSubtext: {
      fontSize: 10,
      color: colors.textLight,
      marginTop: 4,
    },
    chartLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    chartLabel: {
      fontSize: 10,
      color: colors.textLight,
    },
    actionButtons: {
      flexDirection: 'row',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Icon name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Progress Hub</Text>
          <TouchableOpacity>
            <Icon name="share-variant" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Monthly Comparison */}
        <InfoCard style={styles.comparisonCard}>
          <View style={styles.comparisonHeader}>
            <Text style={styles.comparisonTitle}>MONTHLY SCAN{'\n'}COMPARISON</Text>
            <View style={styles.autoAlignBadge}>
              <Text style={styles.autoAlignText}>Auto-Aligned</Text>
            </View>
          </View>

          <View style={styles.comparisonImages}>
            <View style={styles.imageContainer}>
              <View style={styles.placeholderImage}>
                <Icon name="account" size={40} color={colors.textLight} />
              </View>
              <Text style={styles.imageLabel}>Baseline</Text>
              <Text style={styles.imageDate}>Oct 1, 2023</Text>
            </View>

            <View style={styles.imageContainer}>
              <View style={[styles.placeholderImage, styles.todayImage]}>
                <Icon name="check-circle" size={24} color={colors.success} style={styles.checkOverlay} />
                <Icon name="texture" size={40} color={colors.primary} />
              </View>
              <Text style={styles.imageLabel}>Today</Text>
              <Text style={styles.imageDate}>Nov 1, 2023</Text>
            </View>
          </View>
        </InfoCard>

        {/* Recovery Stats */}
        <View style={styles.recoveryContainer}>
          <Text style={styles.recoveryPercent}>{recoveryPercent}%</Text>
          <View style={styles.recoveryRow}>
            <Text style={styles.recoveryLabel}>TOTAL RECOVERY</Text>
            <Icon name="arrow-up" size={16} color={colors.success} />
          </View>
          <Text style={styles.recoverySubtext}>Based on redness and texture analysis</Text>
        </View>

        {/* Healing Trend */}
        <InfoCard style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <Text style={styles.trendTitle}>Healing Trend</Text>
            <View style={styles.trendBadge}>
              <Text style={styles.trendValue}>{healingTrend} pts</Text>
            </View>
          </View>
          <Text style={styles.trendSubtitle}>Severity Score (Last 30 days)</Text>

          {/* Chart Placeholder */}
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>📈 Line Chart Here</Text>
            <Text style={styles.chartPlaceholderSubtext}>(react-native-gifted-charts)</Text>
          </View>

          <View style={styles.chartLabels}>
            <Text style={styles.chartLabel}>Oct 1</Text>
            <Text style={styles.chartLabel}>Oct 7</Text>
            <Text style={styles.chartLabel}>Oct 14</Text>
            <Text style={styles.chartLabel}>Oct 21</Text>
            <Text style={styles.chartLabel}>Oct 28</Text>
            <Text style={styles.chartLabel}>Nov 1</Text>
          </View>
        </InfoCard>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <PrimaryButton
            title="Full History"
            onPress={() => {}}
            variant="outline"
            icon={<Icon name="history" size={18} color={colors.primary} />}
            style={{ flex: 1, marginRight: 8 }}
          />
          <PrimaryButton
            title="New Scan"
            onPress={() => {}}
            icon={<Icon name="camera" size={18} color={colors.white} />}
            style={{ flex: 1, marginLeft: 8 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
