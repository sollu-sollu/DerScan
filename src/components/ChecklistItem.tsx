import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme';

interface ChecklistItemProps {
  title: string;
  subtitle?: string;
  time?: string;
  checked: boolean;
  onToggle: () => void;
  icon?: string;
  iconColor?: string;
  style?: ViewStyle;
}

export function ChecklistItem({
  title,
  subtitle,
  time,
  checked,
  onToggle,
  icon,
  iconColor = theme.colors.primary,
  style,
}: ChecklistItemProps) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        {icon && (
          <View style={[styles.iconBg, { backgroundColor: `${iconColor}15` }]}>
            <Icon name={icon} size={20} color={iconColor} />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.title, checked && styles.checkedTitle]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, checked && styles.checkedSubtitle]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.rightSection}>
        {time && <Text style={styles.time}>{time}</Text>}
        <View style={[styles.checkbox, checked && styles.checkedBox]}>
          {checked && <Icon name="check" size={14} color={theme.colors.white} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  checkedTitle: {
    textDecorationLine: 'line-through',
    color: theme.colors.textLight,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  checkedSubtitle: {
    textDecorationLine: 'line-through',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  time: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
});

export default ChecklistItem;
