import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';

import { PrimaryButton, InfoCard, ChecklistItem } from '../../components';
import { useTheme } from '../../theme';
import { getLatestScan } from '../../services/firestore';
import type { AnalysisResult, RoutineItem, LifestyleItem } from '../../services/api';
import { scheduleRoutineReminders, cancelAllReminders } from '../../services/notificationService';

export default function PlanScreen() {
  const { colors, spacing, borderRadius, typography, isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [scanData, setScanData] = useState<AnalysisResult | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isRealData, setIsRealData] = useState(false);
  const [remindersOn, setRemindersOn] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadLatestScan();
    }, [])
  );

  const loadLatestScan = async () => {
    setIsLoading(true);
    try {
      const latest = await getLatestScan();
      if (latest) {
        setScanData(latest);
        const initial: Record<string, boolean> = {};
        latest.daily_routine?.forEach((_, i) => {
          initial[String(i)] = false;
        });
        setCheckedItems(initial);
        setIsRealData(true);
      } else {
        setIsRealData(false);
      }
    } catch (error) {
      console.error('Failed to load scan data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRoutine = (index: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const routine = scanData?.daily_routine ?? [];
  const lifestyle = scanData?.lifestyle_adjustments ?? [];
  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = routine.length > 0 ? (completedCount / routine.length) * 100 : 0;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: spacing.lg,
      paddingBottom: 100,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.md,
    },
    loadingText: {
      ...typography.body,
      color: colors.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl * 1.5,
      gap: spacing.md,
    },
    emptyTitle: {
      ...typography.h3,
      color: colors.text,
    },
    emptySubtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
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
    diagnosisCard: {
      backgroundColor: isDarkMode ? colors.primaryDark : '#E8F4F6',
      marginBottom: spacing.lg,
    },
    diagnosisRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    diagnosisLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 4,
    },
    diagnosisName: {
      ...typography.h3,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    severityBadge: {
      backgroundColor: isDarkMode ? '#1B5E20' : '#C8E6C9',
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
    },
    severityText: {
      fontSize: 10,
      fontWeight: '600',
      color: isDarkMode ? '#81C784' : '#2E7D32',
    },
    diagnosisIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.cardBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressSection: {
      marginBottom: spacing.lg,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    progressTitle: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text,
    },
    progressText: {
      ...typography.caption,
      color: colors.textLight,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    sectionTitle: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text,
    },
    lifestyleRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    lifestyleItem: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: spacing.md,
      alignItems: 'center',
    },
    lifestyleIconBg: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    lifestyleTitle: {
      ...typography.bodySmall,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    lifestyleSubtitle: {
      ...typography.caption,
      color: colors.textLight,
      marginTop: 2,
      textAlign: 'center',
    },
    sourceBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      marginLeft: 8,
    },
    sourceBadgeText: {
      fontSize: 9,
      fontWeight: '700',
      color: colors.white,
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading treatment plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!scanData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Icon name="clipboard-text-outline" size={64} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No Treatment Plan Yet</Text>
          <Text style={styles.emptySubtitle}>
            Take a skin scan to get a personalized treatment plan from our AI.
          </Text>
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
          <Text style={styles.title}>Treatment Plan</Text>
          <TouchableOpacity>
            <Icon name="dots-vertical" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Diagnosis Card */}
        <InfoCard style={styles.diagnosisCard}>
          <View style={styles.diagnosisRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.diagnosisLabel}>DIAGNOSIS</Text>
              <Text style={styles.diagnosisName}>{scanData.condition_name}</Text>
              <View style={styles.severityBadge}>
                <Text style={styles.severityText}>
                  {scanData.severity_label} ({scanData.severity}/10)
                </Text>
              </View>
            </View>
            <View style={styles.diagnosisIcon}>
              <Icon name="medical-bag" size={28} color={colors.primary} />
            </View>
          </View>
        </InfoCard>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's Progress</Text>
            <Text style={styles.progressText}>
              {completedCount} of {routine.length} Completed
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        {/* Daily Routine */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="format-list-bulleted" size={20} color={colors.text} />
            <Text style={styles.sectionTitle}>Daily Routine</Text>
            <View style={[
              styles.sourceBadge, 
              { backgroundColor: isRealData ? colors.success : colors.textLight }
            ]}>
              <Text style={styles.sourceBadgeText}>
                {isRealData ? 'LATEST AI SCAN' : 'DEMO DATA'}
              </Text>
            </View>
            {/* Reminder Toggle */}
            {routine.length > 0 && (
              <TouchableOpacity
                style={{
                  marginLeft: 'auto',
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: remindersOn
                    ? (isDarkMode ? '#1B5E20' : '#E8F5E9')
                    : (isDarkMode ? '#333' : '#F0F0F0'),
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 16,
                }}
                onPress={() => {
                  if (remindersOn) {
                    cancelAllReminders();
                    setRemindersOn(false);
                    Alert.alert('Reminders Off', 'Daily routine reminders have been turned off.');
                  } else {
                    scheduleRoutineReminders(routine);
                    setRemindersOn(true);
                    Alert.alert('Reminders Set! ⏰', `${routine.length} daily reminders have been scheduled.`);
                  }
                }}
              >
                <Icon
                  name={remindersOn ? 'bell-ring' : 'bell-outline'}
                  size={14}
                  color={remindersOn ? colors.success : colors.textLight}
                />
                <Text style={{
                  fontSize: 10, fontWeight: '600', marginLeft: 4,
                  color: remindersOn ? colors.success : colors.textLight,
                }}>
                  {remindersOn ? 'ON' : 'Remind'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <InfoCard>
            {routine.map((item: RoutineItem, index: number) => (
              <ChecklistItem
                key={String(index)}
                title={item.title}
                subtitle={item.subtitle}
                time={item.time}
                checked={checkedItems[String(index)] ?? false}
                onToggle={() => toggleRoutine(String(index))}
                icon={item.icon}
                iconColor={checkedItems[String(index)] ? colors.success : colors.primary}
              />
            ))}
          </InfoCard>
        </View>

        {/* Lifestyle Adjustments */}
        {lifestyle.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lifestyle Adjustments</Text>
            <View style={styles.lifestyleRow}>
              {lifestyle.map((item: LifestyleItem, index: number) => (
                <View key={index} style={styles.lifestyleItem}>
                  <View style={styles.lifestyleIconBg}>
                    <Icon name={item.icon || 'star'} size={24} color={colors.primary} />
                  </View>
                  <Text style={styles.lifestyleTitle}>{item.title}</Text>
                  <Text style={styles.lifestyleSubtitle}>{item.subtitle}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
