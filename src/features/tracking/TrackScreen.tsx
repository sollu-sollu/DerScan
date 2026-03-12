import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-gifted-charts';

import { PrimaryButton, InfoCard } from '../../components';
import { useTheme } from '../../theme';
import { getScanHistory } from '../../services/firestore';
import type { AnalysisResult } from '../../services/api';

type ScanItem = AnalysisResult & { id: string };

export default function TrackScreen() {
  const navigation = useNavigation<any>();
  const { colors, spacing, borderRadius, typography, isDarkMode, shadows } = useTheme();

  const [history, setHistory] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      const load = async () => {
        setLoading(true);
        try {
          const data = await getScanHistory();
          if (mounted) setHistory(data);
        } catch (e) {
          console.error('Failed to load history:', e);
        } finally {
          if (mounted) setLoading(false);
        }
      };
      load();
      return () => { mounted = false; };
    }, [])
  );

  // Derived data
  const baseline = history.length > 0 ? history[history.length - 1] : null;
  const latest = history.length > 0 ? history[0] : null;
  const hasTwoScans = history.length >= 2;

  // Recovery calculation
  const baselineSeverity = baseline?.severity ?? 0;
  const latestSeverity = latest?.severity ?? 0;
  const recoveryPercent = baselineSeverity > 0
    ? Math.round(Math.max(0, ((baselineSeverity - latestSeverity) / baselineSeverity) * 100))
    : 0;
  const severityDiff = hasTwoScans ? (latestSeverity - baselineSeverity).toFixed(1) : '0.0';

  // Chart data (severity over time, reversed for chronological order)
  const chartData = [...history].reverse().map((scan, idx) => ({
    value: scan.severity ?? 5,
    label: new Date(scan.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    dataPointText: String(scan.severity ?? ''),
  }));

  const formatDate = (ts: string | undefined) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: spacing.lg, paddingBottom: 100 },
    header: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: spacing.lg,
    },
    title: { ...typography.h3, color: colors.text },
    loadingContainer: {
      flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md,
    },
    loadingText: { ...typography.body, color: colors.textSecondary },
    emptyContainer: {
      flex: 1, justifyContent: 'center', alignItems: 'center',
      padding: spacing.xl * 1.5, gap: spacing.md,
    },
    emptyTitle: { ...typography.h3, color: colors.text },
    emptySubtitle: {
      ...typography.bodySmall, color: colors.textSecondary,
      textAlign: 'center', lineHeight: 20,
    },
    comparisonCard: { marginBottom: spacing.lg },
    comparisonHeader: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'flex-start', marginBottom: spacing.md,
    },
    comparisonTitle: {
      ...typography.caption, fontWeight: '600',
      color: colors.text, lineHeight: 18,
    },
    autoAlignBadge: {
      backgroundColor: isDarkMode ? '#1B5E20' : '#E8F5E9',
      paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 8,
    },
    autoAlignText: { fontSize: 10, fontWeight: '600', color: colors.success },
    comparisonImages: {
      flexDirection: 'row', justifyContent: 'space-around',
    },
    imageContainer: { alignItems: 'center' },
    scanImage: {
      width: 110, height: 110, borderRadius: 12,
      marginBottom: spacing.sm, backgroundColor: colors.background,
    },
    placeholderImage: {
      width: 110, height: 110, borderRadius: 12,
      backgroundColor: colors.background, alignItems: 'center',
      justifyContent: 'center', marginBottom: spacing.sm,
    },
    todayBorder: { borderWidth: 2, borderColor: colors.primary },
    imageLabel: { ...typography.bodySmall, fontWeight: '600', color: colors.text },
    imageDate: { ...typography.caption, color: colors.textLight, marginTop: 2 },
    recoveryContainer: { alignItems: 'center', marginBottom: spacing.lg },
    recoveryPercent: { fontSize: 56, fontWeight: '700', color: colors.success },
    recoveryRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    recoveryLabel: { ...typography.caption, fontWeight: '600', color: colors.text },
    recoverySubtext: { ...typography.caption, color: colors.textLight, marginTop: 4 },
    trendCard: { marginBottom: spacing.lg },
    trendHeader: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 4,
    },
    trendTitle: { ...typography.body, fontWeight: '600', color: colors.text },
    trendBadge: {
      backgroundColor: Number(severityDiff) <= 0
        ? (isDarkMode ? '#1B5E20' : '#E8F5E9')
        : (isDarkMode ? '#5D1212' : '#FFEBEE'),
      paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 8,
    },
    trendValue: {
      ...typography.caption, fontWeight: '600',
      color: Number(severityDiff) <= 0 ? colors.success : '#C53030',
    },
    trendSubtitle: { ...typography.caption, color: colors.textLight, marginBottom: spacing.md },
    chartContainer: {
      backgroundColor: colors.cardBackground, borderRadius: 12,
      padding: spacing.sm, overflow: 'hidden',
    },
    noChartText: {
      ...typography.bodySmall, color: colors.textLight,
      textAlign: 'center', paddingVertical: spacing.xl,
    },
    actionButtons: { flexDirection: 'row' },
    scanCountBadge: {
      backgroundColor: colors.primary, paddingHorizontal: 10,
      paddingVertical: 4, borderRadius: 12, marginBottom: spacing.lg, alignSelf: 'center',
    },
    scanCountText: { ...typography.caption, fontWeight: '600', color: colors.white },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (history.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Icon name="chart-line" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No Progress Yet</Text>
          <Text style={styles.emptySubtitle}>
            Take your first skin scan to start tracking your healing progress over time.
          </Text>
          <PrimaryButton
            title="Start First Scan"
            onPress={() => navigation.navigate('Camera')}
            icon={<Icon name="camera" size={18} color={colors.white} />}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 24 }} />
          <Text style={styles.title}>Progress Hub</Text>
          <TouchableOpacity>
            <Icon name="share-variant" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Scans count */}
        <View style={styles.scanCountBadge}>
          <Text style={styles.scanCountText}>{history.length} Scan{history.length !== 1 ? 's' : ''} Recorded</Text>
        </View>

        {/* Monthly Comparison */}
        {hasTwoScans && (
          <InfoCard style={styles.comparisonCard}>
            <View style={styles.comparisonHeader}>
              <Text style={styles.comparisonTitle}>SCAN{'\n'}COMPARISON</Text>
              <View style={styles.autoAlignBadge}>
                <Text style={styles.autoAlignText}>Live Data</Text>
              </View>
            </View>

            <View style={styles.comparisonImages}>
              {/* Baseline (First Scan) */}
              <View style={styles.imageContainer}>
                {baseline?.image_uri ? (
                  <Image source={{ uri: baseline.image_uri }} style={styles.scanImage} />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Icon name="account" size={40} color={colors.textLight} />
                  </View>
                )}
                <Text style={styles.imageLabel}>Baseline</Text>
                <Text style={styles.imageDate}>{formatDate(baseline?.timestamp)}</Text>
              </View>

              {/* Latest Scan */}
              <View style={styles.imageContainer}>
                {latest?.image_uri ? (
                  <Image source={{ uri: latest.image_uri }} style={[styles.scanImage, styles.todayBorder]} />
                ) : (
                  <View style={[styles.placeholderImage, styles.todayBorder]}>
                    <Icon name="texture" size={40} color={colors.primary} />
                  </View>
                )}
                <Text style={styles.imageLabel}>Latest</Text>
                <Text style={styles.imageDate}>{formatDate(latest?.timestamp)}</Text>
              </View>
            </View>
          </InfoCard>
        )}

        {/* Recovery Stats */}
        <View style={styles.recoveryContainer}>
          <Text style={styles.recoveryPercent}>{recoveryPercent}%</Text>
          <View style={styles.recoveryRow}>
            <Text style={styles.recoveryLabel}>TOTAL RECOVERY</Text>
            <Icon
              name={recoveryPercent > 0 ? 'arrow-up' : 'minus'}
              size={16}
              color={recoveryPercent > 0 ? colors.success : colors.textLight}
            />
          </View>
          <Text style={styles.recoverySubtext}>
            {hasTwoScans
              ? `Severity: ${baselineSeverity}/10 → ${latestSeverity}/10`
              : 'Take more scans to track recovery'}
          </Text>
        </View>

        {/* Healing Trend Chart */}
        {chartData.length >= 2 && (
          <InfoCard style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Text style={styles.trendTitle}>Healing Trend</Text>
              <View style={styles.trendBadge}>
                <Text style={styles.trendValue}>{severityDiff} pts</Text>
              </View>
            </View>
            <Text style={styles.trendSubtitle}>Severity Score Over Time</Text>

            <View style={styles.chartContainer}>
              <LineChart
                data={chartData}
                width={280}
                height={140}
                spacing={chartData.length > 5 ? 50 : 70}
                color={colors.primary}
                dataPointsColor={colors.primary}
                startFillColor={colors.primary}
                endFillColor={colors.background}
                startOpacity={0.3}
                endOpacity={0.05}
                areaChart
                curved
                thickness={2}
                yAxisTextStyle={{ color: colors.textLight, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: colors.textLight, fontSize: 9 }}
                hideRules
                yAxisColor="transparent"
                xAxisColor={colors.border}
                maxValue={10}
                noOfSections={5}
                isAnimated
              />
            </View>
          </InfoCard>
        )}

        {chartData.length < 2 && (
          <InfoCard style={styles.trendCard}>
            <Text style={styles.trendTitle}>Healing Trend</Text>
            <Text style={styles.noChartText}>
              Take at least 2 scans to see your severity trend over time.
            </Text>
          </InfoCard>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <PrimaryButton
            title="Full History"
            onPress={() => navigation.navigate('Scan')}
            variant="outline"
            icon={<Icon name="history" size={18} color={colors.primary} />}
            style={{ flex: 1, marginRight: 8 }}
          />
          <PrimaryButton
            title="New Scan"
            onPress={() => navigation.navigate('Camera')}
            icon={<Icon name="camera" size={18} color={colors.white} />}
            style={{ flex: 1, marginLeft: 8 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
