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
import { useNavigation } from '@react-navigation/native';

import { PrimaryButton, InfoCard } from '../../components';
import { theme } from '../../theme';

export default function ResultsScreen() {
  const navigation = useNavigation();

  // Mock severity data
  const severity = 6.5;
  const severityLabel = 'MODERATE';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Analysis Complete</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.scanId}>Scan ID: #88219X • Just now</Text>

        {/* Diagnosis Card */}
        <TouchableOpacity style={styles.diagnosisCard} activeOpacity={0.8}>
          <Text style={styles.diagnosisTitle}>MOST LIKELY DIAGNOSIS</Text>
          <Icon name="chevron-right" size={20} color={theme.colors.white} />
        </TouchableOpacity>

        {/* Severity Analysis */}
        <InfoCard style={styles.severityCard}>
          <Text style={styles.severityTitle}>Severity Analysis</Text>

          {/* Gauge Visualization */}
          <View style={styles.gaugeContainer}>
            <View style={styles.gaugeBg}>
              {/* Colored segments */}
              <View style={[styles.segment, styles.greenSegment]} />
              <View style={[styles.segment, styles.yellowSegment]} />
              <View style={[styles.segment, styles.orangeSegment]} />
              <View style={[styles.segment, styles.redSegment]} />
              {/* Needle indicator */}
              <View style={[styles.needle, { transform: [{ rotate: `${(severity / 10) * 180 - 90}deg` }] }]} />
            </View>
            <View style={styles.gaugeLabels}>
              <Text style={styles.gaugeLabel}>Mild</Text>
              <Text style={styles.gaugeLabel}>Severe</Text>
            </View>
          </View>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreValue}>{severity}</Text>
            <Text style={styles.scoreMax}>/ 10</Text>
          </View>
          <Text style={styles.severityLabel}>{severityLabel}</Text>

          {/* Warning */}
          <View style={styles.warningBox}>
            <Icon name="alert" size={20} color="#FF9800" />
            <Text style={styles.warningText}>
              High redness detected. Inflammation markers are elevated compared to your baseline.
            </Text>
          </View>
        </InfoCard>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Icon name="home-outline" size={24} color={theme.colors.textLight} />
            <Text style={styles.navLabel}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
            <View style={styles.scanNavButton}>
              <Icon name="camera-iris" size={24} color={theme.colors.white} />
            </View>
            <Text style={styles.navLabelActive}>Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Icon name="account-outline" size={24} color={theme.colors.textLight} />
            <Text style={styles.navLabel}>Profile</Text>
          </TouchableOpacity>
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
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  scanId: {
    fontSize: 12,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  diagnosisCard: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  diagnosisTitle: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  severityCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  severityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 20,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  gaugeBg: {
    width: 200,
    height: 100,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
    flexDirection: 'row',
    position: 'relative',
  },
  segment: {
    flex: 1,
    height: '100%',
  },
  greenSegment: {
    backgroundColor: '#4CAF50',
  },
  yellowSegment: {
    backgroundColor: '#FFEB3B',
  },
  orangeSegment: {
    backgroundColor: '#FF9800',
  },
  redSegment: {
    backgroundColor: '#F44336',
  },
  needle: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -2,
    width: 4,
    height: 80,
    backgroundColor: '#333',
    borderRadius: 2,
    transformOrigin: 'bottom',
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    marginTop: 8,
  },
  gaugeLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.text,
  },
  scoreMax: {
    fontSize: 20,
    color: theme.colors.textLight,
    marginLeft: 4,
  },
  severityLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF9800',
    marginTop: 4,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
    gap: 12,
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    borderRadius: 30,
    marginTop: 24,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navItemActive: {
    marginTop: -30,
  },
  scanNavButton: {
    backgroundColor: theme.colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: theme.colors.background,
  },
  navLabel: {
    fontSize: 11,
    color: theme.colors.textLight,
    marginTop: 4,
  },
  navLabelActive: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
});
