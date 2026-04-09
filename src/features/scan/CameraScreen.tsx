import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import { 
  Camera, 
  useCameraDevice, 
  useCameraPermission,
  PhotoFile
} from 'react-native-vision-camera';

import { useTheme } from '../../theme';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { analyzeSkinImage, AnalysisResult } from '../../services/api';
import { saveScanResult } from '../../services/firestore';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';
import { CustomModal } from '../../components';

type CameraRouteProp = RouteProp<RootStackParamList, 'Camera'>;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

export default function CameraScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CameraRouteProp>();
  const { colors, isDarkMode } = useTheme();
  
  // Camera State
  const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('back');
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('auto');
  const device = useCameraDevice(cameraPosition);
  const { hasPermission, requestPermission } = useCameraPermission();
  const camera = React.useRef<Camera>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Align & Hold Steady...');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    subtitle: string;
    icon: string;
    iconColor?: string;
  } | null>(null);

  // Effect to Check/Request Permission
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  // Effect to handle image from gallery (passed via route)
  useEffect(() => {
    if (route.params?.selectedImage && !isProcessing) {
      const uri = route.params.selectedImage;
      // Clear the param immediately so it doesn't re-trigger on re-focus
      navigation.setParams({ selectedImage: undefined });
      handleAnalysis(uri);
    }
  }, [route.params?.selectedImage]);

  const handleGalleryPicker = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.didCancel) return;
      
      if (result.errorCode) {
        setModalContent({
          title: 'Gallery Error',
          subtitle: result.errorMessage || 'Failed to open gallery. Please check permissions.',
          icon: 'image-remove',
          iconColor: colors.error,
        });
        setModalVisible(true);
        return;
      }

      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        handleAnalysis(result.assets[0].uri);
      }
    } catch (err: any) {
      setModalContent({
        title: 'Error',
        subtitle: `Unexpected Error: ${err.message || 'Unknown'}`,
        icon: 'alert-circle-outline',
        iconColor: colors.error,
      });
      setModalVisible(true);
    }
  };

  const handleCapture = async () => {
    if (!camera.current || isProcessing) return;
    
    try {
      setIsProcessing(true);
      setStatusText('Capturing...');
      
      // We don't change isActive yet to ensure camera is ready
      const photo: PhotoFile = await camera.current.takePhoto({
        flash: flashMode,
        enableShutterSound: true,
      });
      
      const uri = photo.path.startsWith('file://') ? photo.path : `file://${photo.path}`;
      handleAnalysis(uri);
    } catch (e: any) {
      setIsProcessing(false);
      setStatusText('Align & Hold Steady...');
      setModalContent({
        title: 'Capture Error',
        subtitle: e.message || 'Failed to capture photo. Please try again.',
        icon: 'camera-off',
        iconColor: colors.error,
      });
      setModalVisible(true);
    }
  };

  const handleAnalysis = async (uri: string) => {
    setIsProcessing(true);
    setProgress(0);
    setStatusText('Analyzing skin condition...');

    try {
      // Simulate progress while calling API
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            return 90; // Hold at 90% until API responds
          }
          return prev + 10;
        });
      }, 300);

      setStatusText('Analyzing skin condition...');

      // Call the AI backend with a real URI if provided, otherwise placeholder
      const localImageUri = uri || 'placeholder_uri';
      const result: AnalysisResult = await analyzeSkinImage(localImageUri);

      clearInterval(progressInterval);
      setProgress(75);
      setStatusText('Saving image to cloud...');

      // Upload the image to Cloudinary for permanent storage
      let finalImageUri = localImageUri;
      if (localImageUri !== 'placeholder_uri') {
        try {
          finalImageUri = await uploadImageToCloudinary(localImageUri);
          console.log('Image permanently hosted at:', finalImageUri);
        } catch (uploadError) {
          console.warn('Cloudinary upload failed, falling back to local cache URI:', uploadError);
          // Keep finalImageUri as localImageUri so the user can at least see it in this session
        }
      }

      setProgress(95);
      setStatusText('Processing analysis...');

      // We no longer save immediately here. 
      // We pass the result to ResultsScreen so the user can choose 
      // where to save it (Current Journey, New Journey, or Temp).
      
      setProgress(100);
      setStatusText('Analysis complete!');

      // Navigate to Results with the analysis data and permanent URI
      setTimeout(() => {
        navigation.replace('Results', {
          analysisData: result,
          scanId: result.scan_id || `SCAN_${Date.now()}`,
          imageUri: finalImageUri,
        });
      }, 500);
    } catch (error: any) {
      setIsProcessing(false);
      setProgress(0);
      setStatusText('Align & Hold Steady...');
      setModalContent({
        title: 'Analysis Failed',
        subtitle: error.message || 'Could not connect to the AI server. Please check your internet connection.',
        icon: 'server-network-off',
        iconColor: colors.error,
      });
      setModalVisible(true);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
    },
    cameraPreview: {
      flex: 1,
      backgroundColor: '#1a1a1a',
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: {
      color: colors.white,
      fontSize: 18,
      opacity: 0.5,
    },
    placeholderSubtext: {
      color: colors.white,
      fontSize: 12,
      opacity: 0.3,
      marginTop: 8,
    },
    overlayContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'space-between',
    },
    topControls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    controlButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    autoMode: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    autoModeText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: '500',
    },
    scanFrameContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    scanFrame: {
      width: width * 0.7,
      height: width * 0.7,
      borderRadius: width * 0.35,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.3)',
      position: 'relative',
    },
    corner: {
      position: 'absolute',
      width: 30,
      height: 30,
      borderColor: colors.white,
    },
    topLeft: {
      top: -2,
      left: -2,
      borderTopWidth: 3,
      borderLeftWidth: 3,
      borderTopLeftRadius: width * 0.35,
    },
    topRight: {
      top: -2,
      right: -2,
      borderTopWidth: 3,
      borderRightWidth: 3,
      borderTopRightRadius: width * 0.35,
    },
    bottomLeft: {
      bottom: -2,
      left: -2,
      borderBottomWidth: 3,
      borderLeftWidth: 3,
      borderBottomLeftRadius: width * 0.35,
    },
    bottomRight: {
      bottom: -2,
      right: -2,
      borderBottomWidth: 3,
      borderRightWidth: 3,
      borderBottomRightRadius: width * 0.35,
    },
    alignText: {
      color: colors.white,
      fontSize: 16,
      marginTop: 20,
      opacity: 0.8,
    },
    processingContainer: {
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    progressBar: {
      width: '100%',
      height: 6,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#4CAF50',
      borderRadius: 3,
    },
    processingText: {
      color: colors.white,
      fontSize: 14,
      marginTop: 12,
    },
    bottomControls: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingBottom: 40,
      paddingHorizontal: 20,
    },
    galleryButton: {
      alignItems: 'center',
      gap: 4,
    },
    captureButton: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 4,
      borderColor: colors.white,
      alignItems: 'center',
      justifyContent: 'center',
    },
    captureButtonDisabled: {
      borderColor: 'rgba(255,255,255,0.3)',
    },
    captureInner: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.white,
    },
    captureInnerDisabled: {
      backgroundColor: 'rgba(255,255,255,0.3)',
    },
    cancelButton: {
      alignItems: 'center',
      gap: 4,
    },
    bottomButtonText: {
      color: colors.white,
      fontSize: 12,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.cameraPreview}>
        {device && hasPermission ? (
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true} // Keep active to allow capture, handle overlay separately
            photo={true}
          />
        ) : (
          <View style={styles.cameraPreview}>
            <Text style={styles.placeholderText}>
              {!device ? 'No camera device found' : 'No camera permission'}
            </Text>
          </View>
        )}

        {/* Overlay UI */}
        <SafeAreaView style={styles.overlayContainer}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color={colors.white} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.autoMode}
              onPress={() => setFlashMode(f => f === 'auto' ? 'on' : f === 'on' ? 'off' : 'auto')}
            >
              <Icon 
                name={flashMode === 'off' ? 'flash-off' : flashMode === 'auto' ? 'flash-auto' : 'flash'} 
                size={18} 
                color={colors.white} 
                style={{ marginRight: 4 }} 
              />
              <Text style={styles.autoModeText}>
                {flashMode === 'auto' ? 'Auto' : flashMode === 'on' ? 'On' : 'Off'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => setCameraPosition(p => p === 'back' ? 'front' : 'back')}
            >
              <Icon name="camera-flip" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Scan Frame */}
          <View style={styles.scanFrameContainer}>
            <View style={styles.scanFrame}>
              {/* Corner brackets */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.alignText}>{statusText}</Text>
          </View>

          {/* Processing indicator */}
          {isProcessing && (
            <View style={styles.processingContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.processingText}>
                {progress < 100 ? `Processing ${progress}%` : '✅ Analysis Complete!'}
              </Text>
            </View>
          )}

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity 
              style={styles.galleryButton}
              onPress={handleGalleryPicker}
              disabled={isProcessing}
            >
              <Icon name="image" size={24} color={isProcessing ? 'rgba(255,255,255,0.3)' : colors.white} />
              <Text style={[styles.bottomButtonText, isProcessing && { opacity: 0.3 }]}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.captureButton, (isProcessing || !hasPermission) && styles.captureButtonDisabled]}
              onPress={handleCapture}
              disabled={isProcessing || !hasPermission}
            >
              <View style={[styles.captureInner, (isProcessing || !hasPermission) && styles.captureInnerDisabled]} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="close" size={24} color={colors.white} />
              <Text style={styles.bottomButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

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
