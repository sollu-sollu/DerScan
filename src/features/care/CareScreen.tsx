import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { PrimaryButton, InfoCard } from '../../components';
import { theme } from '../../theme';

const { width } = Dimensions.get('window');

export default function CareScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Status Bar Spacer */}
        <View style={styles.header}>
          <View style={styles.secureProfile}>
            <Icon name="shield-check" size={14} color={theme.colors.success} />
            <Text style={styles.secureText}>Secure profile</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Consult & Records</Text>
        <Text style={styles.subtitle}>Find care and manage your history</Text>

        {/* Map Card */}
        <InfoCard style={styles.mapCard}>
          <View style={styles.mapPlaceholder}>
            <Icon name="map-marker" size={32} color={theme.colors.primary} />
            <Text style={styles.mapPlaceholderText}>Map Preview</Text>
            <Text style={styles.mapPlaceholderSubtext}>(react-native-maps)</Text>
          </View>

          {/* Doctor Info */}
          <View style={styles.doctorInfo}>
            <View style={styles.doctorAvatar}>
              <Icon name="doctor" size={24} color={theme.colors.white} />
            </View>
            <View style={styles.doctorDetails}>
              <Text style={styles.doctorName}>Dr. A. Sharma</Text>
              <Text style={styles.doctorDistance}>0.8km away</Text>
            </View>
            <TouchableOpacity style={styles.locationButton}>
              <Icon name="crosshairs-gps" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </InfoCard>

        {/* Book Teleconsult */}
        <TouchableOpacity style={styles.teleconsultCard} activeOpacity={0.8}>
          <View style={styles.teleconsultIcon}>
            <Icon name="video" size={24} color={theme.colors.white} />
          </View>
          <Text style={styles.teleconsultText}>Book Teleconsult</Text>
          <Icon name="chevron-right" size={24} color={theme.colors.white} />
        </TouchableOpacity>

        {/* Generate Report */}
        <TouchableOpacity style={styles.reportCard} activeOpacity={0.8}>
          <View style={styles.reportContent}>
            <Text style={styles.reportTitle}>Generate PDF</Text>
            <Text style={styles.reportSubtitle}>Report</Text>
          </View>
          <View style={styles.downloadIcon}>
            <Icon name="download" size={24} color={theme.colors.primary} />
          </View>
        </TouchableOpacity>

        {/* Recent History */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>RECENT HISTORY</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {/* History items would go here */}
          <View style={styles.emptyHistory}>
            <Icon name="history" size={40} color={theme.colors.secondary} />
            <Text style={styles.emptyHistoryText}>No recent scans</Text>
          </View>
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
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  secureProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  secureText: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: 24,
  },
  mapCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mapPlaceholder: {
    height: 150,
    backgroundColor: '#E8F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: 10,
    color: theme.colors.textLight,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  doctorDistance: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  locationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teleconsultCard: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
  },
  teleconsultIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teleconsultText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
  reportCard: {
    backgroundColor: theme.colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  reportContent: {},
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  reportSubtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  downloadIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historySection: {
    marginTop: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textLight,
    letterSpacing: 0.5,
  },
  viewAllText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyHistoryText: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: 8,
  },
});
