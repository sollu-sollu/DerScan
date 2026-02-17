import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../theme';
import { useSettingsStore } from '../../store/settingsStore';
import { getLatestScan } from '../../services/firestore';
import type { RoutineItem } from '../../services/api';

interface ChecklistItemData {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  icon: string;
  completed: boolean;
}

// Default routine shown when no scan data exists
const DEFAULT_CHECKLIST: ChecklistItemData[] = [
  { id: '1', title: 'Morning Moisturizer', subtitle: 'Apply after cleansing', time: '8:00 AM', icon: 'water-outline', completed: false },
  { id: '2', title: 'Sunscreen Application', subtitle: 'SPF 50+ recommended', time: '9:00 AM', icon: 'white-balance-sunny', completed: false },
  { id: '3', title: 'Hydration Check', subtitle: 'Drink 8 glasses of water', time: '12:00 PM', icon: 'cup-water', completed: false },
  { id: '4', title: 'Evening Treatment', subtitle: 'Apply prescribed cream', time: '9:00 PM', icon: 'medical-bag', completed: false },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors, spacing, borderRadius, shadows, isDarkMode } = useTheme();
  const { userName } = useSettingsStore();
  
  const [checklist, setChecklist] = useState<ChecklistItemData[]>(DEFAULT_CHECKLIST);
  const [latestCondition, setLatestCondition] = useState<string | null>(null);
  const [isRealData, setIsRealData] = useState(false);

  // Load AI-generated routine from Firestore
  useFocusEffect(
    useCallback(() => {
      loadRoutine();
    }, [])
  );

  const loadRoutine = async () => {
    try {
      const latest = await getLatestScan();
      if (latest && latest.daily_routine && latest.daily_routine.length > 0) {
        setLatestCondition(latest.condition_name);
        const aiRoutine: ChecklistItemData[] = latest.daily_routine.map(
          (item: RoutineItem, index: number) => ({
            id: String(index + 1),
            title: item.title,
            subtitle: item.subtitle,
            time: item.time,
            icon: item.icon || 'medical-bag',
            completed: false,
          })
        );
        setChecklist(aiRoutine);
        setIsRealData(true);
      } else {
        setIsRealData(false);
      }
    } catch (error) {
      console.log('Using default checklist (Firestore unavailable)');
    }
  };

  const toggleChecklist = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = checklist.filter(item => item.completed).length;

  // Dynamic greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? colors.background : colors.primary,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
    },
    greeting: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.white,
    },
    date: {
      fontSize: 14,
      color: colors.white,
      opacity: 0.8,
      marginTop: 4,
    },
    notificationBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
    },
    scrollContent: {
      padding: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    conditionBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#1E292B' : '#E8F4F6',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
      gap: 12,
    },
    conditionInfo: {
      flex: 1,
    },
    conditionLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    conditionName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginTop: 2,
    },
    weatherCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      ...shadows.md,
    },
    weatherLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    weatherInfo: {
      marginLeft: spacing.md,
    },
    temperature: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
    },
    weatherDesc: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    uvContainer: {
      alignItems: 'flex-end',
    },
    uvLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    uvBadge: {
      backgroundColor: colors.warning,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
      marginVertical: 4,
    },
    uvValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.white,
    },
    uvAdvice: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    section: {
      marginTop: spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
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
    progress: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '600',
    },
    checklistItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
      ...shadows.sm,
    },
    checklistLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxCompleted: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    checklistInfo: {
      marginLeft: spacing.md,
      flex: 1,
    },
    checklistTitle: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
    },
    checklistTitleCompleted: {
      textDecorationLine: 'line-through',
      color: colors.textSecondary,
    },
    checklistSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    checklistTime: {
      fontSize: 12,
      color: colors.textLight,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.cardBackground,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      marginHorizontal: 4,
      ...shadows.sm,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginTop: spacing.sm,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    scanButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.primary,
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      marginTop: spacing.lg,
      ...shadows.lg,
    },
    scanButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    scanButtonText: {
      marginLeft: spacing.md,
    },
    scanButtonTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDarkMode ? colors.primaryDark : colors.white,
    },
    scanButtonSubtitle: {
      fontSize: 13,
      color: isDarkMode ? colors.primaryDark : colors.white,
      opacity: 0.8,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "light-content"} 
        backgroundColor={isDarkMode ? colors.background : colors.primary} 
      />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}, {userName.split(' ')[0]}! 👋</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Icon name="bell-outline" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Latest Diagnosis Badge */}
        {latestCondition && (
          <View style={styles.conditionBanner}>
            <Icon name="stethoscope" size={20} color={colors.primary} />
            <View style={styles.conditionInfo}>
              <Text style={styles.conditionLabel}>Latest Diagnosis</Text>
              <Text style={styles.conditionName}>{latestCondition}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Plan' as never)}>
              <Icon name="chevron-right" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Weather/UV Card */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherLeft}>
            <Icon name="weather-sunny" size={40} color="#FFD700" />
            <View style={styles.weatherInfo}>
              <Text style={styles.temperature}>28°C</Text>
              <Text style={styles.weatherDesc}>Sunny Day</Text>
            </View>
          </View>
          <View style={styles.uvContainer}>
            <Text style={styles.uvLabel}>UV Index</Text>
            <View style={styles.uvBadge}>
              <Text style={styles.uvValue}>High</Text>
            </View>
            <Text style={styles.uvAdvice}>Use SPF 50+</Text>
          </View>
        </View>

        {/* Daily Checklist */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.sectionTitle}>Daily Routine</Text>
              <View style={[
                styles.sourceBadge, 
                { backgroundColor: isRealData ? colors.success : colors.textLight }
              ]}>
                <Text style={styles.sourceBadgeText}>
                  {isRealData ? 'LATEST AI SCAN' : 'DEMO DATA'}
                </Text>
              </View>
            </View>
            <Text style={styles.progress}>{completedCount}/{checklist.length}</Text>
          </View>
          
          {checklist.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.checklistItem}
              onPress={() => toggleChecklist(item.id)}
            >
              <View style={styles.checklistLeft}>
                <View style={[
                  styles.checkbox,
                  item.completed && styles.checkboxCompleted
                ]}>
                  {item.completed && (
                    <Icon name="check" size={16} color={colors.white} />
                  )}
                </View>
                <View style={styles.checklistInfo}>
                  <Text style={[
                    styles.checklistTitle,
                    item.completed && styles.checklistTitleCompleted
                  ]}>
                    {item.title}
                  </Text>
                  <Text style={styles.checklistSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Text style={styles.checklistTime}>{item.time}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Icon name="water" size={28} color={colors.secondary} />
              <Text style={styles.statValue}>6/8</Text>
              <Text style={styles.statLabel}>Glasses</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="fire" size={28} color={colors.warning} />
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="chart-line" size={28} color={colors.success} />
              <Text style={styles.statValue}>85%</Text>
              <Text style={styles.statLabel}>Recovery</Text>
            </View>
          </View>
        </View>

        {/* Scan CTA */}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('Camera' as never)}
        >
          <View style={styles.scanButtonContent}>
            <Icon name="camera-iris" size={32} color={isDarkMode ? colors.primaryDark : colors.white} />
            <View style={styles.scanButtonText}>
              <Text style={styles.scanButtonTitle}>New Skin Scan</Text>
              <Text style={styles.scanButtonSubtitle}>Check your skin health</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color={isDarkMode ? colors.primaryDark : colors.white} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
