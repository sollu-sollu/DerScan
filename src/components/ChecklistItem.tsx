import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme';

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
  iconColor,
  style,
}: ChecklistItemProps) {
  const { colors } = useTheme();
  const activeIconColor = iconColor || colors.primary;

  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: colors.border }, style]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        {icon && (
          <View style={[styles.iconBg, { backgroundColor: `${activeIconColor}15` }]}>
            <Icon name={icon} size={20} color={activeIconColor} />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={[
            styles.title, 
            { color: colors.text },
            checked && { color: colors.textLight, textDecorationLine: 'line-through' }
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[
              styles.subtitle, 
              { color: colors.textLight },
              checked && { textDecorationLine: 'line-through' }
            ]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.rightSection}>
        {time && <Text style={[styles.time, { color: colors.textLight }]}>{time}</Text>}
        <View style={[
          styles.checkbox, 
          { borderColor: colors.secondary },
          checked && { backgroundColor: colors.success, borderColor: colors.success }
        ]}>
          {checked && <Icon name="check" size={14} color={colors.white} />}
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
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  time: {
    fontSize: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChecklistItem;
