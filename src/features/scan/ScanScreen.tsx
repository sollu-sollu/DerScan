import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '../../theme';
import { CustomModal } from '../../components';
import { getScanHistory } from '../../services/firestore';
import { AnalysisResult } from '../../services/api';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export default function ScanScreen() {
  const navigation = useNavigation<any>();
  const { colors, spacing, borderRadius, shadows, isDarkMode } = useTheme();
  const { isOffline } = useNetworkStatus();
  
  const [history, setHistory] = useState<(AnalysisResult & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    subtitle: string;
    icon: string;
    iconColor?: string;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const fetchHistory = async () => {
        setLoading(true);
        try {
          const data = await getScanHistory();
          if (isMounted) {
            setHistory(data);
          }
        } catch (error) {
          console.error('Failed to fetch history:', error);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      fetchHistory();
      return () => { isMounted = false; };
    }, [])
  );

  const handleGalleryUpload = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.didCancel) return;
      
      if (result.errorCode) {
        setModalContent({
          title: 'Gallery Error',
          subtitle: result.errorMessage || `An error occurred while opening the gallery (Error: ${result.errorCode})`,
          icon: 'image-remove',
          iconColor: colors.error,
        });
        setModalVisible(true);
        return;
      }

      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        navigation.navigate('Camera', { selectedImage: result.assets[0].uri });
      }
    } catch (error: any) {
       setModalContent({
         title: 'Error',
         subtitle: error.message || 'An unexpected error occurred. Please try again.',
         icon: 'alert-circle-outline',
         iconColor: colors.error,
       });
       setModalVisible(true);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? colors.background : colors.primary,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.white,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.white,
      opacity: 0.8,
      marginTop: 4,
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
    optionsContainer: {
      gap: spacing.md,
    },
    mainOption: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      alignItems: 'center',
      ...shadows.lg,
    },
    optionIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    optionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDarkMode ? colors.primaryDark : colors.white,
      marginBottom: spacing.xs,
    },
    optionDesc: {
      fontSize: 14,
      color: isDarkMode ? colors.primaryDark : colors.white,
      opacity: 0.8,
      textAlign: 'center',
    },
    secondaryOption: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      ...shadows.sm,
    },
    secondaryIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryTextContainer: {
      flex: 1,
      marginLeft: spacing.md,
    },
    secondaryTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    secondaryDesc: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    tipsSection: {
      marginTop: spacing.xl,
    },
    tipsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
    },
    tipCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
      ...shadows.sm,
    },
    tipIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tipContent: {
      flex: 1,
      marginLeft: spacing.md,
    },
    tipHeading: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    tipText: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    recentSection: {
      marginTop: spacing.xl,
    },
    recentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    recentTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    seeAll: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.lg,
      ...shadows.sm,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      marginTop: spacing.md,
    },
    emptySubtext: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
    historyList: {
      gap: spacing.sm,
    },
    historyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      ...shadows.sm,
    },
    historyIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    historyContent: {
      flex: 1,
      marginLeft: spacing.md,
    },
    historyName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    historyDate: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={isDarkMode ? colors.background : colors.primary} 
      />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Smart Scan</Text>
        <Text style={styles.headerSubtitle}>AI-powered skin analysis</Text>
        {isOffline && (
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: '#FF980020', paddingHorizontal: 10,
            paddingVertical: 4, borderRadius: 12, marginTop: 8, alignSelf: 'flex-start',
          }}>
            <Icon name="wifi-off" size={14} color="#FF9800" />
            <Text style={{ color: '#FF9800', fontSize: 11, fontWeight: '600', marginLeft: 4 }}>
              Offline — Viewing cached data
            </Text>
          </View>
        )}
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
              <Icon name="camera" size={48} color={isDarkMode ? colors.primaryDark : colors.white} />
            </View>
            <Text style={styles.optionTitle}>Take Photo</Text>
            <Text style={styles.optionDesc}>
              Use your camera to capture the affected area
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryOption}
            onPress={handleGalleryUpload}
          >
            <View style={styles.secondaryIconContainer}>
              <Icon name="image-multiple" size={32} color={colors.primary} />
            </View>
            <View style={styles.secondaryTextContainer}>
              <Text style={styles.secondaryTitle}>Upload from Gallery</Text>
              <Text style={styles.secondaryDesc}>Select an existing photo</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Tips for Best Results</Text>
          
          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Icon name="lightbulb-on" size={24} color={colors.warning} />
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
              <Icon name="cellphone" size={24} color={colors.secondary} />
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
              <Icon name="focus-field" size={24} color={colors.primary} />
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
            {history.length > 0 && (
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {loading ? (
            <View style={[styles.emptyState, { paddingVertical: spacing.xxl }]}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={[styles.emptyText, { marginTop: spacing.md }]}>Loading history...</Text>
            </View>
          ) : history.length > 0 ? (
            <View style={styles.historyList}>
              {history.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.historyItem}
                  onPress={() => navigation.navigate('Results', { 
                    analysisData: item,
                    scanId: item.id,
                    imageUri: item.image_uri
                  })}
                >
                  <View style={styles.historyIcon}>
                    {item.image_uri ? (
                      <Image 
                        source={{ uri: item.image_uri }} 
                        style={{ width: 44, height: 44, borderRadius: 22 }} 
                      />
                    ) : (
                      <Icon name="clipboard-pulse-outline" size={24} color={colors.primary} />
                    )}
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyName}>{item.condition_name}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(item.timestamp).toLocaleDateString()} • {item.severity_label}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={20} color={colors.textLight} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="camera-off" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>No recent scans</Text>
              <Text style={styles.emptySubtext}>
                Your scan history will appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Shared Custom Modal */}
      {modalContent && (
        <CustomModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title={modalContent.title}
          subtitle={modalContent.subtitle}
          icon={modalContent.icon}
          iconColor={modalContent.iconColor}
        />
      )}
    </View>
  );
}
