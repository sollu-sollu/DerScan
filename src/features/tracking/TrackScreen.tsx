import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { PrimaryButton, InfoCard } from '../../components';
import { theme } from '../../theme';

export default function TrackScreen() {
  // Mock data
  const recoveryPercent = 46;
  const healingTrend = -2.5;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Icon name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Progress Hub</Text>
          <TouchableOpacity>
            <Icon name="share-variant" size={24} color={theme.colors.text} />
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
                <Icon name="account" size={40} color={theme.colors.textLight} />
              </View>
              <Text style={styles.imageLabel}>Baseline</Text>
              <Text style={styles.imageDate}>Oct 1, 2023</Text>
            </View>

            <View style={styles.imageContainer}>
              <View style={[styles.placeholderImage, styles.todayImage]}>
                <Icon name="check-circle" size={24} color={theme.colors.success} style={styles.checkOverlay} />
                <Icon name="texture" size={40} color={theme.colors.primary} />
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
            <Icon name="arrow-up" size={16} color={theme.colors.success} />
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
            icon={<Icon name="history" size={18} color={theme.colors.primary} />}
            style={{ flex: 1, marginRight: 8 }}
          />
          <PrimaryButton
            title="New Scan"
            onPress={() => {}}
            icon={<Icon name="camera" size={18} color={theme.colors.white} />}
            style={{ flex: 1, marginLeft: 8 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  comparisonCard: {
    marginBottom: 20,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    lineHeight: 18,
  },
  autoAlignBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  autoAlignText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.success,
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
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  todayImage: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    position: 'relative',
  },
  checkOverlay: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  imageDate: {
    fontSize: 11,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  recoveryContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recoveryPercent: {
    fontSize: 56,
    fontWeight: '700',
    color: theme.colors.success,
  },
  recoveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recoveryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  recoverySubtext: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 4,
  },
  trendCard: {
    marginBottom: 20,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  trendBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.success,
  },
  trendSubtitle: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 120,
    backgroundColor: '#F5F7F8',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  chartPlaceholderSubtext: {
    fontSize: 10,
    color: theme.colors.textLight,
    marginTop: 4,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  chartLabel: {
    fontSize: 10,
    color: theme.colors.textLight,
  },
  actionButtons: {
    flexDirection: 'row',
  },
});
