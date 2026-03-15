import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { PrimaryButton, InfoCard, CustomModal, ChecklistItem } from '../../components';
import { useTheme } from '../../theme';
import { safeIcon } from '../../utils/safeIcon';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { generateAndSharePDF } from '../../services/pdfService';
import { useAuthStore } from '../../store/authStore';
import { ActivityIndicator, Pressable } from 'react-native';
import { saveScanResult, getLatestScan, getUserSeries } from '../../services/firestore';
import { AnalysisResult } from '../../services/api';

type ResultsRouteProp = RouteProp<RootStackParamList, 'Results'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function getSeverityColor(severity: number): string {
  if (severity <= 3) return '#4CAF50';
  if (severity <= 5) return '#FFEB3B';
  if (severity <= 7) return '#FF9800';
  return '#F44336';
}

export default function ResultsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ResultsRouteProp>();
  const { colors, spacing, borderRadius, typography, shadows, isDarkMode } = useTheme();
  
  const analysisData = route.params?.analysisData;
  const scannedImageUri = route.params?.imageUri;

  // Use real data or fallback
  const severity = analysisData?.severity ?? 6.5;
  const severityLabel = analysisData?.severity_label ?? 'MODERATE';
  const conditionName = analysisData?.condition_name ?? 'Analysis Pending';
  const conditionType = analysisData?.condition_type ?? 'Unknown';
  const description = analysisData?.description ?? 'No description available.';
  const warning = analysisData?.warning ?? 'Please consult a dermatologist for confirmation.';
  const scanId = analysisData?.scan_id ?? route.params?.scanId ?? '#------';
  const precautions = analysisData?.precautions ?? [];
  const whenToSeeDoctor = analysisData?.when_to_see_doctor ?? '';

  const { user } = useAuthStore();
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  const [saveModalVisible, setSaveModalVisible] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [notifyModalVisible, setNotifyModalVisible] = React.useState(false);
  const [notifyModalContent, setNotifyModalContent] = React.useState<{
    title: string;
    subtitle: string;
    icon: string;
    iconColor?: string;
  } | null>(null);
  const [matchingSeries, setMatchingSeries] = React.useState<{id: string, name: string} | null>(null);
  const [allSeries, setAllSeries] = React.useState<{id: string, name: string}[]>([]);

  React.useEffect(() => {
    const checkMatchingSeries = async () => {
      const latest = await getLatestScan();
      const series = await getUserSeries();
      setAllSeries(series);

      if (latest && latest.condition_name === conditionName) {
        setMatchingSeries({ id: latest.seriesId!, name: latest.condition_name });
      }
    };
    checkMatchingSeries();
  }, [conditionName]);

  const handleShareReport = async () => {
    // ... same as before ...
  };

  const handleSaveResult = async (type: 'current' | 'new' | 'temp') => {
    if (!analysisData) return;
    
    setIsSaving(true);
    try {
      const resultToSave: AnalysisResult = {
        ...analysisData,
        image_uri: scannedImageUri,
        scan_id: scanId,
      };

      if (type === 'current' && matchingSeries) {
        resultToSave.seriesId = matchingSeries.id;
        resultToSave.isTemp = false;
        resultToSave.isBaseline = false;
      } else if (type === 'new') {
        resultToSave.seriesId = `SERIES_${Date.now()}`;
        resultToSave.isTemp = false;
        resultToSave.isBaseline = true;
      } else {
        resultToSave.seriesId = 'TEMP';
        resultToSave.isTemp = true;
        resultToSave.isBaseline = false;
      }

      await saveScanResult(resultToSave);
      setSaveModalVisible(false);
      navigation.navigate('MainTabs', { screen: 'Track' } as any);
    } catch (error) {
      setNotifyModalContent({
        title: 'Save Error',
        subtitle: 'Could not save the results. Please check your storage or internet connection.',
        icon: 'content-save-alert-outline',
        iconColor: colors.error,
      });
      setNotifyModalVisible(true);
    } finally {
      setIsSaving(false);
    }
  };

  const severityColor = getSeverityColor(severity);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: spacing.lg,
      paddingBottom: 100,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    title: {
      ...typography.h3,
      color: colors.text,
    },
    scanId: {
      ...typography.caption,
      color: colors.textLight,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    diagnosisCard: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
    },
    diagnosisContent: {
      flex: 1,
    },
    diagnosisLabel: {
      color: isDarkMode ? colors.primaryDark : 'rgba(255,255,255,0.7)',
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 1,
    },
    diagnosisName: {
      color: isDarkMode ? colors.primaryDark : colors.white,
      fontSize: 18,
      fontWeight: '700',
      marginTop: 4,
    },
    typeBadge: {
      backgroundColor: isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)',
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: borderRadius.sm,
      marginTop: spacing.sm,
    },
    typeText: {
      color: isDarkMode ? colors.primaryDark : colors.white,
      fontSize: 11,
      fontWeight: '500',
    },
    descriptionCard: {
      marginBottom: spacing.md,
    },
    descriptionTitle: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    descriptionText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    severityCard: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
      marginBottom: spacing.md,
    },
    severityTitle: {
      ...typography.h3,
      color: colors.text,
      marginBottom: spacing.lg,
    },
    gaugeContainer: {
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    gaugeBg: {
      width: 200,
      height: 100,
      borderTopLeftRadius: 100,
      borderTopRightRadius: 100,
      backgroundColor: isDarkMode ? '#333' : '#E0E0E0',
      overflow: 'hidden',
      flexDirection: 'row',
      position: 'relative',
    },
    segment: {
      flex: 1,
      height: '100%',
    },
    greenSegment: { backgroundColor: '#4CAF50' },
    yellowSegment: { backgroundColor: '#FFEB3B' },
    orangeSegment: { backgroundColor: '#FF9800' },
    redSegment: { backgroundColor: '#F44336' },
    needle: {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      marginLeft: -2,
      width: 4,
      height: 80,
      backgroundColor: isDarkMode ? colors.white : '#333',
      borderRadius: 2,
    },
    gaugeLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: 200,
      marginTop: spacing.sm,
    },
    gaugeLabel: {
      ...typography.caption,
      color: colors.textLight,
    },
    scoreContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginTop: spacing.md,
    },
    scoreValue: {
      fontSize: 48,
      fontWeight: '700',
      color: colors.text,
    },
    scoreMax: {
      fontSize: 20,
      color: colors.textLight,
      marginLeft: 4,
    },
    severityLabelText: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 4,
    },
    warningBox: {
      flexDirection: 'row',
      backgroundColor: isDarkMode ? '#2D200A' : '#FFF3E0',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginTop: spacing.lg,
      gap: spacing.md,
      alignItems: 'flex-start',
      width: '100%',
    },
    warningText: {
      flex: 1,
      ...typography.bodySmall,
      color: isDarkMode ? '#F39C12' : '#E65100',
      lineHeight: 18,
    },
    precautionsCard: {
      marginBottom: spacing.md,
    },
    precautionsTitle: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
    },
    precautionItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    precautionText: {
      flex: 1,
      ...typography.bodySmall,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    doctorCard: {
      marginBottom: spacing.md,
      backgroundColor: isDarkMode ? '#2B1212' : '#FFEBEE',
    },
    doctorHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    doctorTitle: {
      ...typography.body,
      fontWeight: '600',
      color: isDarkMode ? '#FF6B6B' : '#D32F2F',
    },
    doctorText: {
      ...typography.bodySmall,
      color: isDarkMode ? '#FF9A9A' : '#B71C1C',
      lineHeight: 18,
    },
    actionButton: {
      marginTop: spacing.sm,
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: 14,
      marginTop: spacing.sm,
    },
    secondaryButtonText: {
      ...typography.body,
      fontWeight: '500',
      color: colors.primary,
    },
    scannedImageContainer: {
      marginBottom: spacing.lg,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      backgroundColor: colors.cardBackground,
      ...shadows.md,
    },
    scannedImage: {
      width: '100%',
      height: 200,
      resizeMode: 'cover',
    },
    imageOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: spacing.xs,
      alignItems: 'center',
    },
    imageOverlayText: {
      color: colors.white,
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    treatmentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    treatmentText: {
      ...typography.bodySmall,
      color: colors.text,
      flex: 1,
    },
    clinicalSection: {
      marginBottom: spacing.lg,
    },
    clinicalTitle: {
      ...typography.body,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    clinicalNote: {
      flexDirection: 'row',
      marginBottom: spacing.xs,
      gap: spacing.sm,
    },
    clinicalBullet: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.primary,
      marginTop: 8,
    },
    clinicalText: {
      ...typography.bodySmall,
      color: colors.text,
      flex: 1,
      lineHeight: 20,
    },
    differentialBadge: {
      backgroundColor: colors.background,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: spacing.sm,
      marginBottom: spacing.sm,
    },
    differentialText: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    bottomActions: {
      marginBottom: spacing.md,
      backgroundColor: isDarkMode ? '#2B1212' : '#FFEBEE',
    },
    saveOptionPremium: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.md,
    },
    saveOptionIconSmall: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveOptionTitle: {
      fontSize: 15,
      fontWeight: '600',
    },
    saveOptionCaption: {
      fontSize: 11,
      marginTop: 2,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs')}>
            <Icon name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Analysis Complete</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.scanId}>Scan ID: {scanId} • Just now</Text>

        {/* Scanned Image Display */}
        {scannedImageUri && (
          <View style={styles.scannedImageContainer}>
            <Image 
              source={{ uri: scannedImageUri }} 
              style={styles.scannedImage} 
            />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageOverlayText}>Analyzed Area</Text>
            </View>
          </View>
        )}

        {/* Clinical Insights Section */}
        {(analysisData?.clinical_features?.length || 0) > 0 && (
          <View style={styles.clinicalSection}>
            <Text style={styles.clinicalTitle}>Clinical Observations</Text>
            {analysisData?.clinical_features?.map((feature, idx) => (
              <View key={idx} style={styles.clinicalNote}>
                <View style={styles.clinicalBullet} />
                <Text style={styles.clinicalText}>{feature}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Differential Diagnosis (Possibilities) */}
        {(analysisData?.differential_diagnosis?.length || 0) > 0 && (
          <View style={styles.clinicalSection}>
            <Text style={styles.clinicalTitle}>Possible Alternatives (Differential)</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {analysisData?.differential_diagnosis?.map((item, idx) => (
                <View key={idx} style={styles.differentialBadge}>
                  <Text style={styles.differentialText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Diagnosis Card */}
        <View style={styles.diagnosisCard}>
          <View style={styles.diagnosisContent}>
            <Text style={styles.diagnosisLabel}>MOST LIKELY DIAGNOSIS</Text>
            <Text style={styles.diagnosisName}>{conditionName}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{conditionType}</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={20} color={isDarkMode ? colors.primaryDark : colors.white} />
        </View>

        {/* Description */}
        <InfoCard style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>Clinical Summary</Text>
          <Text style={styles.descriptionText}>{description}</Text>
        </InfoCard>

        {/* Severity Analysis */}
        <InfoCard style={styles.severityCard}>
          <Text style={styles.severityTitle}>Severity Analysis</Text>

          {/* Gauge Visualization */}
          <View style={styles.gaugeContainer}>
            <View style={styles.gaugeBg}>
              <View style={[styles.segment, styles.greenSegment]} />
              <View style={[styles.segment, styles.yellowSegment]} />
              <View style={[styles.segment, styles.orangeSegment]} />
              <View style={[styles.segment, styles.redSegment]} />
              <View style={[
                styles.needle, 
                { 
                  transform: [
                    { translateX: 0 },
                    { translateY: 40 }, // Needle center
                    { rotate: `${(severity / 10) * 180 - 90}deg` },
                    { translateY: -40 }
                  ] 
                }
              ]} 
              />
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
          <Text style={[styles.severityLabelText, { color: severityColor }]}>{severityLabel}</Text>

          {/* Warning */}
          <View style={styles.warningBox}>
            <Icon name="alert" size={20} color={isDarkMode ? colors.warning : "#FF9800"} />
            <Text style={styles.warningText}>{warning}</Text>
          </View>
        </InfoCard>

        {/* Precautions */}
        {precautions.length > 0 && (
          <InfoCard style={styles.precautionsCard}>
            <Text style={styles.precautionsTitle}>⚠️ Precautions</Text>
            {precautions.map((item, index) => (
              <View key={index} style={styles.precautionItem}>
                <Icon name="alert-circle-outline" size={16} color={colors.warning} />
                <Text style={styles.precautionText}>{item}</Text>
              </View>
            ))}
          </InfoCard>
        )}

        {/* Preliminary Treatment Plan */}
        {(analysisData?.daily_routine?.length || 0) > 0 && (
          <View style={[styles.clinicalSection, { marginTop: spacing.lg }]}>
            <View style={styles.sectionHeader}>
              <Icon name="clipboard-pulse-outline" size={22} color={colors.primary} />
              <Text style={[styles.clinicalTitle, { marginLeft: spacing.xs, marginBottom: 0 }]}>
                Recommended Treatment Plan
              </Text>
            </View>
            
            <View style={{ marginTop: spacing.md }}>
              <Text style={[styles.descriptionTitle, { fontSize: 13 }]}>Daily Routine</Text>
              <InfoCard style={{ marginTop: spacing.xs, paddingVertical: spacing.xs }}>
                {analysisData?.daily_routine?.map((item, index) => (
                  <ChecklistItem
                    key={index}
                    title={item.title}
                    subtitle={item.subtitle}
                    time={item.time}
                    checked={false}
                    onToggle={() => {}}
                    icon={item.icon || 'medical-bag'}
                    iconColor={colors.primary}
                  />
                ))}
              </InfoCard>
            </View>

            {(analysisData?.lifestyle_adjustments?.length || 0) > 0 && (
              <View style={{ marginTop: spacing.lg }}>
                <Text style={[styles.descriptionTitle, { fontSize: 13 }]}>Lifestyle Tips</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs }}>
                  {analysisData?.lifestyle_adjustments?.map((item, index) => (
                    <View key={index} style={{ 
                      backgroundColor: colors.cardBackground, 
                      padding: spacing.md, 
                      borderRadius: borderRadius.md,
                      flex: 1, minWidth: '45%',
                      borderWidth: 1, borderColor: colors.border
                    }}>
                      <Icon name={safeIcon(item.icon, 'star')} size={20} color={colors.primary} style={{ marginBottom: 4 }} />
                      <Text style={{ ...typography.bodySmall, fontWeight: '700', color: colors.text }}>{item.title}</Text>
                      <Text style={{ ...typography.caption, color: colors.textSecondary }}>{item.subtitle}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* When to See Doctor */}
        {whenToSeeDoctor !== '' && (
          <InfoCard style={styles.doctorCard}>
            <View style={styles.doctorHeader}>
              <Icon name="hospital-building" size={20} color={isDarkMode ? colors.accent : "#D32F2F"} />
              <Text style={styles.doctorTitle}>When to See a Doctor</Text>
            </View>
            <Text style={styles.doctorText}>{whenToSeeDoctor}</Text>
          </InfoCard>
        )}

        {/* Action Buttons */}
        <PrimaryButton
          title={isGeneratingPdf ? "Generating Report..." : "Share Clinical Report"}
          onPress={handleShareReport}
          variant="outline"
          style={styles.actionButton}
          disabled={isGeneratingPdf}
          icon={isGeneratingPdf ? undefined : <Icon name="share-variant" size={20} color={colors.primary} />}
        />

        <PrimaryButton
          title="Finalize & Save Result"
          onPress={() => setSaveModalVisible(true)}
          style={styles.actionButton}
        />

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('MainTabs')}
        >
          <Icon name="close" size={20} color={colors.textLight} />
          <Text style={styles.secondaryButtonText}>Discard Result</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Save Options Modal */}
      <CustomModal
        visible={saveModalVisible}
        onClose={() => setSaveModalVisible(false)}
        title="Finalize & Save"
        subtitle="Categorizing your scans keeps your healing progress accurate."
        icon="shield-check"
      >
        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          {matchingSeries ? (
            <TouchableOpacity 
              style={[
                styles.saveOptionPremium, 
                { borderColor: colors.primary, backgroundColor: colors.primary + '08' }
              ]}
              onPress={() => handleSaveResult('current')}
            >
              <View style={[styles.saveOptionIconSmall, { backgroundColor: colors.primary }]}>
                <Icon name="check-decagram" size={20} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.saveOptionTitle, { color: colors.text }]}>Add to Active Journey</Text>
                <Text style={[styles.saveOptionCaption, { color: colors.primary }]}>
                  Matches current "{matchingSeries.name}" progress
                </Text>
              </View>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity 
            style={styles.saveOptionPremium}
            onPress={() => handleSaveResult('new')}
          >
            <View style={[styles.saveOptionIconSmall, { backgroundColor: colors.secondary }]}>
              <Icon name="plus-circle" size={20} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.saveOptionTitle, { color: colors.text }]}>Start New Journey</Text>
              <Text style={[styles.saveOptionCaption, { color: colors.textLight }]}>Creates a new healing chart</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.saveOptionPremium}
            onPress={() => handleSaveResult('temp')}
          >
            <View style={[styles.saveOptionIconSmall, { backgroundColor: colors.textLight }]}>
              <Icon name="folder-outline" size={20} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.saveOptionTitle, { color: colors.text }]}>Save as Individual Scan</Text>
              <Text style={[styles.saveOptionCaption, { color: colors.textLight }]}>Will not affect journey stats</Text>
            </View>
          </TouchableOpacity>
        </View>
      </CustomModal>

      {/* Generic Notification Modal */}
      {notifyModalContent && (
        <CustomModal
          visible={notifyModalVisible}
          onClose={() => setNotifyModalVisible(false)}
          title={notifyModalContent.title}
          subtitle={notifyModalContent.subtitle}
          icon={notifyModalContent.icon}
          iconColor={notifyModalContent.iconColor}
        />
      )}
    </SafeAreaView>
  );
}
