import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';

export default function ScanScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Smart Scan</Text>
        <Text style={styles.headerSubtitle}>AI-powered skin analysis</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Scan Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.mainOption}
            onPress={() => navigation.navigate('Camera' as never)}
          >
            <View style={styles.optionIconContainer}>
              <Icon name="camera" size={48} color={theme.colors.white} />
            </View>
            <Text style={styles.optionTitle}>Take Photo</Text>
            <Text style={styles.optionDesc}>
              Use your camera to capture the affected area
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryOption}>
            <View style={styles.secondaryIconContainer}>
              <Icon name="image-multiple" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.secondaryTextContainer}>
              <Text style={styles.secondaryTitle}>Upload from Gallery</Text>
              <Text style={styles.secondaryDesc}>Select an existing photo</Text>
            </View>
            <Icon name="chevron-right" size={24} color={theme.colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Tips for Best Results</Text>
          
          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Icon name="lightbulb-on" size={24} color={theme.colors.warning} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipHeading}>Good Lighting</Text>
              <Text style={styles.tipText}>
                Use natural daylight or bright indoor lighting
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Icon name="cellphone" size={24} color={theme.colors.secondary} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipHeading}>Steady Position</Text>
              <Text style={styles.tipText}>
                Hold your device steady, 6-10 inches from skin
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Icon name="focus-field" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipHeading}>Clear Focus</Text>
              <Text style={styles.tipText}>
                Ensure the affected area is in sharp focus
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Scans */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Scans</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.emptyState}>
            <Icon name="camera-off" size={48} color={theme.colors.textLight} />
            <Text style={styles.emptyText}>No recent scans</Text>
            <Text style={styles.emptySubtext}>
              Your scan history will appear here
            </Text>
          </View>
        </View>
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.white,
    opacity: 0.8,
    marginTop: 4,
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
  optionsContainer: {
    gap: theme.spacing.md,
  },
  mainOption: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  optionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  optionDesc: {
    fontSize: 14,
    color: theme.colors.white,
    opacity: 0.8,
    textAlign: 'center',
  },
  secondaryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  secondaryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryTextContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  secondaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  secondaryDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  tipsSection: {
    marginTop: theme.spacing.xl,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  tipHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  tipText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  recentSection: {
    marginTop: theme.spacing.xl,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
});
