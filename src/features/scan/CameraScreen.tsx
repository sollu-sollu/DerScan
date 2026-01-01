import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { theme } from '../../theme';
import { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simulate camera capture and processing
  const handleCapture = () => {
    setIsProcessing(true);
    setProgress(0);

    // Simulate processing progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            navigation.replace('Results', { scanId: 'SCAN_' + Date.now() });
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  return (
    <View style={styles.container}>
      {/* Camera Preview Placeholder */}
      <View style={styles.cameraPreview}>
        <Text style={styles.placeholderText}>Camera Preview</Text>
        <Text style={styles.placeholderSubtext}>
          (Vision Camera integration required)
        </Text>

        {/* Overlay UI */}
        <SafeAreaView style={styles.overlayContainer}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="flash-off" size={24} color={theme.colors.white} />
            </TouchableOpacity>
            <View style={styles.autoMode}>
              <Text style={styles.autoModeText}>Auto ▼</Text>
            </View>
            <TouchableOpacity style={styles.controlButton}>
              <Icon name="camera-flip" size={24} color={theme.colors.white} />
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
            <Text style={styles.alignText}>
              {isProcessing ? 'Analyzing skin texture...' : 'Align & Hold Steady...'}
            </Text>
          </View>

          {/* Processing indicator */}
          {isProcessing && (
            <View style={styles.processingContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.processingText}>Processing {progress}%</Text>
            </View>
          )}

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity style={styles.galleryButton}>
              <Icon name="image" size={24} color={theme.colors.white} />
              <Text style={styles.bottomButtonText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCapture}
              disabled={isProcessing}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="close" size={24} color={theme.colors.white} />
              <Text style={styles.bottomButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

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
    color: theme.colors.white,
    fontSize: 18,
    opacity: 0.5,
  },
  placeholderSubtext: {
    color: theme.colors.white,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  autoModeText: {
    color: theme.colors.white,
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
    borderColor: theme.colors.white,
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
    color: theme.colors.white,
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
    color: theme.colors.white,
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
    borderColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.white,
  },
  cancelButton: {
    alignItems: 'center',
    gap: 4,
  },
  bottomButtonText: {
    color: theme.colors.white,
    fontSize: 12,
  },
});
