import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  children?: React.ReactNode;
  primaryAction?: {
    label: string;
    onPress: () => void;
    color?: string;
    loading?: boolean;
  };
  actions?: {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'destructive';
  }[];
}

export const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  icon,
  iconColor,
  children,
  primaryAction,
  actions,
}) => {
  const { colors, spacing, borderRadius, typography, shadows, isDarkMode } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: spacing.xl }}>
          <Pressable 
            style={[
              styles.modalContainer, 
              { 
                backgroundColor: colors.cardBackground, 
                borderRadius: borderRadius.xl,
                padding: spacing.xl,
                ...shadows.lg
              }
            ]}
          >
            {/* Icon Header */}
            {icon && (
              <View style={[styles.iconContainer, { backgroundColor: (iconColor || colors.primary) + '20', marginBottom: spacing.md }]}>
                <Icon name={icon} size={32} color={iconColor || colors.primary} />
              </View>
            )}

            <Text style={[styles.title, { ...typography.h3, color: colors.text }]}>{title}</Text>
            
            {subtitle && (
              <Text style={[styles.subtitle, { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.lg }]}>
                {subtitle}
              </Text>
            )}

            <View style={styles.childrenContainer}>
              {children}
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              {actions ? (
                actions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor: action.variant === 'primary' 
                          ? colors.primary 
                          : action.variant === 'destructive' 
                          ? colors.error 
                          : 'transparent',
                        borderRadius: borderRadius.md,
                        marginTop: index > 0 ? spacing.sm : 0,
                        borderWidth: action.variant === 'secondary' ? 1 : 0,
                        borderColor: colors.border,
                      }
                    ]}
                    onPress={action.onPress}
                  >
                    <Text style={[
                      styles.actionText,
                      {
                        color: action.variant === 'secondary' ? colors.text : colors.white,
                        fontWeight: '600',
                      }
                    ]}>
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : primaryAction ? (
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    {
                      backgroundColor: primaryAction.color || colors.primary,
                      borderRadius: borderRadius.md,
                    }
                  ]}
                  onPress={primaryAction.onPress}
                >
                  <Text style={styles.primaryButtonText}>{primaryAction.label}</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity 
                style={[styles.closeButton, { marginTop: (actions || primaryAction) ? spacing.sm : 0 }]}
                onPress={onClose}
              >
                <Text style={[styles.closeButtonText, { color: colors.textLight }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  modalContainer: {
    width: '100%',
    alignSelf: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
  },
  childrenContainer: {
    width: '100%',
  },
  actionsContainer: {
    width: '100%',
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  actionText: {
    fontSize: 16,
  },
  primaryButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
