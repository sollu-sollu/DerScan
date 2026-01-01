import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { PrimaryButton, InfoCard, ChecklistItem } from '../../components';
import { theme } from '../../theme';

export default function PlanScreen() {
  const [routine, setRoutine] = useState([
    { id: '1', title: 'Gentle Cleanser', subtitle: 'Use lukewarm water. Pat dry, do not rub.', time: '8:00 AM', checked: true, icon: 'water' },
    { id: '2', title: 'Apply Steroid Cream', subtitle: 'Topical Corticosteroid to affected areas only.', time: '8:15 AM', checked: true, icon: 'medical-bag' },
    { id: '3', title: 'Apply Moisturizer', subtitle: 'Apply generously over whole body to lock in moisture.', time: '8:00 PM', checked: false, icon: 'bottle-tonic', reminder: true },
  ]);

  const toggleRoutine = (id: string) => {
    setRoutine(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const completedCount = routine.filter(item => item.checked).length;
  const progressPercent = (completedCount / routine.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Icon name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Treatment Plan</Text>
          <TouchableOpacity>
            <Icon name="dots-vertical" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Diagnosis Card */}
        <InfoCard style={styles.diagnosisCard}>
          <View style={styles.diagnosisRow}>
            <View>
              <Text style={styles.diagnosisLabel}>DIAGNOSIS</Text>
              <Text style={styles.diagnosisName}>Eczema (Atopic{'\n'}Dermatitis)</Text>
              <View style={styles.severityBadge}>
                <Text style={styles.severityText}>Moderate Severity (6.5/10)</Text>
              </View>
            </View>
            <View style={styles.diagnosisIcon}>
              <Icon name="medical-bag" size={28} color={theme.colors.primary} />
            </View>
          </View>
        </InfoCard>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's Progress</Text>
            <Text style={styles.progressText}>{completedCount} of {routine.length} Completed</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        {/* Daily Routine */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="format-list-bulleted" size={20} color={theme.colors.text} />
            <Text style={styles.sectionTitle}>Daily Routine</Text>
          </View>
          <InfoCard>
            {routine.map(item => (
              <View key={item.id}>
                <ChecklistItem
                  title={item.title}
                  subtitle={item.subtitle}
                  time={item.time}
                  checked={item.checked}
                  onToggle={() => toggleRoutine(item.id)}
                  icon={item.icon}
                  iconColor={item.checked ? theme.colors.success : theme.colors.primary}
                />
                {item.reminder && !item.checked && (
                  <View style={styles.reminderRow}>
                    <Text style={styles.reminderLabel}>Reminder</Text>
                    <Icon name="toggle-switch" size={40} color={theme.colors.primary} />
                  </View>
                )}
              </View>
            ))}
          </InfoCard>
        </View>

        {/* Add Custom Treatment */}
        <TouchableOpacity style={styles.addButton}>
          <Icon name="plus-circle-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.addButtonText}>Add Custom Treatment</Text>
        </TouchableOpacity>

        {/* Lifestyle Adjustments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifestyle Adjustments</Text>
          <View style={styles.lifestyleRow}>
            <View style={styles.lifestyleItem}>
              <View style={styles.lifestyleIconBg}>
                <Icon name="shower" size={24} color="#1976D2" />
              </View>
              <Text style={styles.lifestyleTitle}>Short Showers</Text>
              <Text style={styles.lifestyleSubtitle}>Max 10 mins</Text>
            </View>
            <View style={styles.lifestyleItem}>
              <View style={styles.lifestyleIconBg}>
                <Icon name="tshirt-crew" size={24} color="#FF5722" />
              </View>
              <Text style={styles.lifestyleTitle}>Cotton Clothes</Text>
              <Text style={styles.lifestyleSubtitle}>Loose fitting</Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <PrimaryButton
          title="Save Updates"
          onPress={() => {}}
          style={styles.saveButton}
        />
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
  diagnosisCard: {
    backgroundColor: '#E8F4F6',
    marginBottom: 20,
  },
  diagnosisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  diagnosisLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  diagnosisName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  severityBadge: {
    backgroundColor: '#C8E6C9',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2E7D32',
  },
  diagnosisIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 52,
    paddingVertical: 4,
  },
  reminderLabel: {
    fontSize: 13,
    color: theme.colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.primary,
    borderRadius: 12,
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  lifestyleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  lifestyleItem: {
    flex: 1,
    backgroundColor: '#F5F7F8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  lifestyleIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  lifestyleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  lifestyleSubtitle: {
    fontSize: 11,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  saveButton: {
    marginTop: 8,
  },
});
