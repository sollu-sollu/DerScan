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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../theme';
import { getScanHistory, getScansBySeries } from '../../services/firestore';
import { AnalysisResult } from '../../services/api';

export default function HistoryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors, spacing, borderRadius, shadows, typography } = useTheme();
  
  const seriesId = route.params?.seriesId;
  const seriesName = route.params?.seriesName;

  const [history, setHistory] = useState<(AnalysisResult & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  // Derive baselines for each series to calculate progress rates
  const baselines = React.useMemo(() => {
    const map: Record<string, { severity: number; id: string }> = {};
    // Iterating backwards guarantees the first scan we hit for a series is the oldest (baseline)
    for (let i = history.length - 1; i >= 0; i--) {
      const scan = history[i];
      if (scan.seriesId && !(scan.seriesId in map)) {
        map[scan.seriesId] = { severity: scan.severity || 0, id: scan.id };
      }
    }
    return map;
  }, [history]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const fetchHistory = async () => {
        setLoading(true);
        try {
          const data = seriesId ? await getScansBySeries(seriesId) : await getScanHistory();
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.cardBackground,
      ...shadows.sm,
    },
    title: {
      ...typography.h3,
      color: colors.text,
      marginLeft: spacing.md,
    },
    scrollContent: {
      padding: spacing.lg,
      paddingBottom: spacing.xxl,
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
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxl * 2,
    },
    emptyText: {
      ...typography.body,
      color: colors.textLight,
      marginTop: spacing.md,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.cardBackground} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {seriesName ? `${seriesName} History` : 'All Scans'}
        </Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={colors.primary} size="large" />
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
                    {(() => {
                      if (!item.seriesId || item.severity === undefined) return null;
                      const base = baselines[item.seriesId];
                      if (!base || base.severity === 0) return null;
                      
                      if (item.id === base.id) {
                        return <Text style={{ color: colors.primary, fontWeight: 'bold' }}> • Baseline</Text>;
                      }
                      
                      const progress = Math.round(((base.severity - item.severity) / base.severity) * 100);
                      const progressColor = progress > 0 ? colors.success : (progress < 0 ? colors.error : colors.textLight);
                      const sign = progress > 0 ? '+' : '';
                      
                      return (
                        <Text style={{ color: progressColor, fontWeight: 'bold' }}>
                          {` • ${sign}${progress}%`}
                        </Text>
                      );
                    })()}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="camera-off" size={64} color={colors.textLight} />
            <Text style={styles.emptyText}>No scan history found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
