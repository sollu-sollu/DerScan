import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';

interface InfoCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function InfoCard({ children, style }: InfoCardProps) {
  const { colors, borderRadius, spacing, shadows } = useTheme();
  
  return (
    <View style={[
      styles.infoCard, 
      { backgroundColor: colors.cardBackground, borderRadius: borderRadius.lg, padding: spacing.lg },
      shadows.md,
      style
    ]}>
      {children}
    </View>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color?: string;
  style?: ViewStyle;
}

export function StatCard({ icon, value, label, color, style }: StatCardProps) {
  const { colors, borderRadius, spacing, shadows } = useTheme();
  
  return (
    <View style={[
      styles.statCard, 
      { backgroundColor: colors.cardBackground, borderRadius: borderRadius.md, padding: spacing.md },
      shadows.sm,
      style
    ]}>
      <View style={[
        styles.statIconContainer, 
        { backgroundColor: colors.background, marginBottom: spacing.sm },
        color ? { backgroundColor: `${color}20` } : {}
      ]}>
        {icon}
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoCard: {
  },
  statCard: {
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
});
