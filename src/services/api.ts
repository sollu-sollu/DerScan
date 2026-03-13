/**
 * DerScan API Service
 * 
 * Handles communication with the MedGemma AI backend.
 */

import { USE_MOCK_API } from './config';
import { useSettingsStore } from '../store/settingsStore';

// ─── Types ────────────────────────────────────────────────

export interface RoutineItem {
  title: string;
  subtitle: string;
  time: string;
  icon: string;
}

export interface LifestyleItem {
  title: string;
  subtitle: string;
  icon: string;
}

export interface AnalysisResult {
  scan_id: string;
  timestamp: string;
  condition_name: string;
  condition_type: string;
  severity: number;
  severity_label: string;
  description: string;
  warning: string;
  daily_routine: RoutineItem[];
  lifestyle_adjustments: LifestyleItem[];
  precautions: string[];
  when_to_see_doctor: string;
  image_uri?: string;
  clinical_features?: string[];
  differential_diagnosis?: string[];
  seriesId?: string;
  isTemp?: boolean;
  isBaseline?: boolean;
}

export interface HealthStatus {
  status: string;
  model_loaded: boolean;
  gpu_available: boolean;
  model_name: string;
}

// ─── API Functions ────────────────────────────────────────

/**
 * Check if the AI backend server is running and model is loaded.
 */
export async function checkServerHealth(): Promise<HealthStatus> {
  const baseUrl = useSettingsStore.getState().apiUrl;
  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw new Error('Cannot connect to AI server. Is it running?');
  }
}

/**
 * Send an image to the AI backend for skin analysis.
 * 
 * @param imageUri - Local file URI of the captured image
 * @returns Structured analysis result
 */
export async function analyzeSkinImage(imageUri: string): Promise<AnalysisResult> {
  const baseUrl = useSettingsStore.getState().apiUrl;
  
  // Use mock endpoint if configured (no GPU needed)
  if (USE_MOCK_API) {
    return analyzeMock();
  }

  try {
    const formData = new FormData();

    // React Native's FormData on Android needs file:// prefix
    const normalizedUri = imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`;

    formData.append('image', {
      uri: normalizedUri,
      type: 'image/jpeg',
      name: 'skin_scan.jpg',
    } as any);

    const response = await fetch(`${baseUrl}/analyze`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        // Do NOT set Content-Type — FormData sets it with boundary
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Analysis failed (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}

/**
 * Get mock analysis data (for testing without GPU/model).
 */
export async function analyzeMock(): Promise<AnalysisResult> {
  const baseUrl = useSettingsStore.getState().apiUrl;
  try {
    const response = await fetch(`${baseUrl}/analyze/mock`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Mock endpoint returned ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Mock analysis failed:', error);
    // Return hardcoded fallback if server is completely unreachable
    return getFallbackResult();
  }
}

/**
 * Fallback result when server is unreachable.
 * This allows the app to function for UI testing even without the backend.
 */
function getFallbackResult(): AnalysisResult {
  return {
    scan_id: `LOCAL_${Date.now()}`,
    timestamp: new Date().toISOString(),
    condition_name: 'Eczema (Atopic Dermatitis)',
    condition_type: 'Inflammatory',
    severity: 6.5,
    severity_label: 'MODERATE',
    description:
      'The skin shows signs of atopic dermatitis with erythematous patches and mild lichenification. Dry, scaly texture with evidence of recent inflammation.',
    warning:
      'High redness detected. Inflammation markers are elevated. Monitor for secondary infection.',
    daily_routine: [
      { title: 'Gentle Cleanser', subtitle: 'Use lukewarm water. Pat dry, do not rub.', time: '8:00 AM', icon: 'water' },
      { title: 'Apply Steroid Cream', subtitle: 'Topical Corticosteroid to affected areas only.', time: '8:15 AM', icon: 'medical-bag' },
      { title: 'Sunscreen Application', subtitle: 'SPF 50+ on exposed areas.', time: '9:00 AM', icon: 'white-balance-sunny' },
      { title: 'Hydration Check', subtitle: 'Drink at least 8 glasses of water.', time: '12:00 PM', icon: 'cup-water' },
      { title: 'Apply Moisturizer', subtitle: 'Apply generously to lock in moisture.', time: '8:00 PM', icon: 'bottle-tonic' },
      { title: 'Evening Treatment', subtitle: 'Apply prescribed cream before bed.', time: '9:00 PM', icon: 'medical-bag' },
    ],
    lifestyle_adjustments: [
      { title: 'Short Showers', subtitle: 'Max 10 mins, lukewarm', icon: 'shower' },
      { title: 'Cotton Clothes', subtitle: 'Loose fitting only', icon: 'tshirt-crew' },
    ],
    precautions: [
      'Avoid scratching — use cold compress for itch relief',
      'Do not use fragranced products',
      'Keep nails short to prevent skin damage',
    ],
    when_to_see_doctor:
      'Seek immediate attention if you notice signs of infection (pus, spreading redness, fever).',
  };
}
