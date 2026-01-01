import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';

interface ChecklistItemData {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  icon: string;
  completed: boolean;
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const [checklist, setChecklist] = useState<ChecklistItemData[]>([
    {
      id: '1',
      title: 'Morning Moisturizer',
      subtitle: 'Apply after cleansing',
      time: '8:00 AM',
      icon: 'water-outline',
      completed: true,
    },
    {
      id: '2',
      title: 'Sunscreen Application',
      subtitle: 'SPF 50+ recommended',
      time: '9:00 AM',
      icon: 'white-balance-sunny',
      completed: true,
    },
    {
      id: '3',
      title: 'Hydration Check',
      subtitle: 'Drink 8 glasses of water',
      time: '12:00 PM',
      icon: 'cup-water',
      completed: false,
    },
    {
      id: '4',
      title: 'Evening Treatment',
      subtitle: 'Apply prescribed cream',
      time: '9:00 PM',
      icon: 'medical-bag',
      completed: false,
    },
  ]);

  const toggleChecklist = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = checklist.filter(item => item.completed).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning! 👋</Text>
          <Text style={styles.date}>Tuesday, December 24</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Icon name="bell-outline" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
            <Text style={styles.sectionTitle}>Daily Routine</Text>
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
                    <Icon name="check" size={16} color={theme.colors.white} />
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
              <Icon name="water" size={28} color={theme.colors.secondary} />
              <Text style={styles.statValue}>6/8</Text>
              <Text style={styles.statLabel}>Glasses</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="fire" size={28} color={theme.colors.warning} />
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="chart-line" size={28} color={theme.colors.success} />
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
            <Icon name="camera-iris" size={32} color={theme.colors.white} />
            <View style={styles.scanButtonText}>
              <Text style={styles.scanButtonTitle}>New Skin Scan</Text>
              <Text style={styles.scanButtonSubtitle}>Check your skin health</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.white,
  },
  date: {
    fontSize: 14,
    color: theme.colors.white,
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
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  weatherCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherInfo: {
    marginLeft: theme.spacing.md,
  },
  temperature: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
  },
  weatherDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  uvContainer: {
    alignItems: 'flex-end',
  },
  uvLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  uvBadge: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginVertical: 4,
  },
  uvValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
  },
  uvAdvice: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  progress: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  checklistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
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
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  checklistInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  checklistTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  checklistTitleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
  },
  checklistSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  checklistTime: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: 4,
    ...theme.shadows.sm,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  scanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanButtonText: {
    marginLeft: theme.spacing.md,
  },
  scanButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
  },
  scanButtonSubtitle: {
    fontSize: 13,
    color: theme.colors.white,
    opacity: 0.8,
  },
});
