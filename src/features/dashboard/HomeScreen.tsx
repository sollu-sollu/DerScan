import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import { useTheme } from '../../theme';
import { useSettingsStore } from '../../store/settingsStore';
import { useProgressStore } from '../../store/progressStore';
import { useAuthStore } from '../../store/authStore';
import { getLatestScan, getScansBySeries } from '../../services/firestore';
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
  const { apiUrl } = useSettingsStore();
  const { activeSeriesId } = useProgressStore();
  const { user } = useAuthStore();
  
  const [checklist, setChecklist] = useState<ChecklistItemData[]>(DEFAULT_CHECKLIST);
  const [latestCondition, setLatestCondition] = useState<string | null>(null);
  const [isRealData, setIsRealData] = useState(false);
  const [totalScansInSeries, setTotalScansInSeries] = useState<number>(0);
  const [recoveryPercent, setRecoveryPercent] = useState<number>(0);
  const [weather, setWeather] = useState({
    temp: 28,
    condition: 'Loading...',
    uvIndex: 0,
    uvAdvice: 'Fetching data...',
    icon: 'weather-partly-cloudy' as string,
    loading: true
  });

  // Load data on focus
  useFocusEffect(
    useCallback(() => {
      loadRoutine();
      loadWeather();
    }, [activeSeriesId])
  );

  const loadWeather = async () => {
    Geolocation.getCurrentPosition(
      (position) => {
        fetchWeatherData(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('Weather Geolocation Error:', error);
        // Fallback to default location (Chennai)
        fetchWeatherData(13.0827, 80.2707);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const fetchWeatherData = async (lat: number, lng: number) => {
    try {
      // Using Open-Meteo (Free, No Key required, Very reliable)
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code&daily=uv_index_max&timezone=auto`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.current) {
        const temp = Math.round(data.current.temperature_2m);
        const code = data.current.weather_code;
        const uv = data.daily.uv_index_max[0];
        
        let condition = 'Clear';
        let icon = 'weather-sunny';
        
        // Simple WMO Code mapping
        if (code === 0) { condition = 'Clear Sky'; icon = 'weather-sunny'; }
        else if (code <= 3) { condition = 'Partly Cloudy'; icon = 'weather-partly-cloudy'; }
        else if (code <= 48) { condition = 'Foggy'; icon = 'weather-fog'; }
        else if (code <= 67) { condition = 'Rainy'; icon = 'weather-rainy'; }
        else if (code <= 77) { condition = 'Snowy'; icon = 'weather-snowy'; }
        else { condition = 'Stormy'; icon = 'weather-lightning'; }

        let advice = 'Safe for now';
        if (uv >= 8) advice = 'SPF 50+ Required';
        else if (uv >= 5) advice = 'Use Sunscreen';
        else if (uv >= 3) advice = 'Wear Sunglasses';

        setWeather({
          temp,
          condition,
          uvIndex: uv,
          uvAdvice: advice,
          icon,
          loading: false
        });
      }
    } catch (error) {
      console.error('Weather Fetch Error:', error);
      setWeather(prev => ({ ...prev, loading: false, condition: 'Weather unavailable' }));
    }
  };

  const loadRoutine = async () => {
    try {
      const latest = await getLatestScan(activeSeriesId || undefined);
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

        // Fetch full active series length for Tracking Stats
        if (latest.seriesId) {
          const seriesScans = await getScansBySeries(latest.seriesId);
          setTotalScansInSeries(seriesScans.length);

          if (seriesScans.length > 1) {
            // Calculate true recovery: (baseline_severity - latest_severity) / baseline_severity * 100
            // Note: seriesScans is sorted descending (newest first).
            const latestScan = seriesScans[0];
            const baselineScan = seriesScans[seriesScans.length - 1];
            
            if (baselineScan.severity && latestScan.severity) {
              const baseSev = Number(baselineScan.severity);
              const curSev = Number(latestScan.severity);
              
              if (baseSev > 0) {
                // If it improved (current < base), that's a positive recovery.
                // If it worsened, floor at 0%.
                const improvement = Math.max(0, baseSev - curSev);
                const percent = Math.round((improvement / baseSev) * 100);
                setRecoveryPercent(percent);
              } else {
                setRecoveryPercent(100); // was already 0 severity? Fully recovered.
              }
            }
          } else {
            // Just one scan, no recovery yet
            setRecoveryPercent(0);
          }
        } else {
          setTotalScansInSeries(1); // just the current one
          setRecoveryPercent(0);
        }

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
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{greeting}, {(user?.displayName || 'User').split(' ')[0]}! 👋</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
        <TouchableOpacity 
          style={{ marginRight: spacing.md }}
          onPress={() => navigation.navigate('Profile' as never)}
        >
          {user?.photoURL ? (
            <Image 
              source={{ uri: user.photoURL }} 
              style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' }} 
            />
          ) : (
            <View style={styles.notificationBtn}>
              <Icon name="account" size={24} color={colors.white} />
            </View>
          )}
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.notificationBtn}>
          <Icon name="bell-outline" size={24} color={colors.white} />
        </TouchableOpacity> */}
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
            {weather.loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Icon name={weather.icon} size={40} color="#FFD700" />
            )}
            <View style={styles.weatherInfo}>
              <Text style={styles.temperature}>
                {weather.loading ? '--' : `${weather.temp}°C`}
              </Text>
              <Text style={styles.weatherDesc}>{weather.condition}</Text>
            </View>
          </View>
          <View style={styles.uvContainer}>
            <Text style={styles.uvLabel}>UV Index</Text>
            <View style={[
              styles.uvBadge, 
              { backgroundColor: weather.uvIndex >= 8 ? colors.error : weather.uvIndex >= 5 ? colors.warning : colors.success }
            ]}>
              <Text style={styles.uvValue}>
                {weather.loading ? '--' : weather.uvIndex >= 8 ? 'Very High' : weather.uvIndex >= 5 ? 'High' : weather.uvIndex >= 3 ? 'Moderate' : 'Low'}
              </Text>
            </View>
            <Text style={styles.uvAdvice}>{weather.uvAdvice}</Text>
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
          <Text style={styles.sectionTitle}>Tracking Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Icon name="check-circle-outline" size={28} color={colors.secondary} />
              <Text style={styles.statValue}>{completedCount}/{checklist.length}</Text>
              <Text style={styles.statLabel}>Routine</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="camera-iris" size={28} color={colors.warning} />
              <Text style={styles.statValue}>{isRealData ? totalScansInSeries : 0}</Text>
              <Text style={styles.statLabel}>Scans Tracked</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="chart-line" size={28} color={colors.success} />
              <Text style={styles.statValue}>{isRealData ? `${recoveryPercent}%` : '0%'}</Text>
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
