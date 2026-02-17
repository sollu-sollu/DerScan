/**
 * DerScan Firestore Service
 * 
 * Manages scan history and analysis results in Firebase Firestore.
 */

import firestore from '@react-native-firebase/firestore';
import { AnalysisResult } from './api';

const SCANS_COLLECTION = 'scans';

/**
 * Save a scan analysis result to Firestore.
 */
export async function saveScanResult(result: AnalysisResult): Promise<string> {
  try {
    const docRef = await firestore()
      .collection(SCANS_COLLECTION)
      .add({
        ...result,
        created_at: firestore.FieldValue.serverTimestamp(),
      });

    console.log('Scan saved to Firestore:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Failed to save scan:', error);
    throw error;
  }
}

/**
 * Get all scan results, ordered by most recent first.
 */
export async function getScanHistory(): Promise<(AnalysisResult & { id: string })[]> {
  try {
    const snapshot = await firestore()
      .collection(SCANS_COLLECTION)
      .orderBy('created_at', 'desc')
      .limit(20)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as (AnalysisResult & { id: string })[];
  } catch (error) {
    console.error('Failed to fetch scan history:', error);
    return [];
  }
}

/**
 * Get the most recent scan result (for HomeScreen daily routine).
 */
export async function getLatestScan(): Promise<(AnalysisResult & { id: string }) | null> {
  try {
    const snapshot = await firestore()
      .collection(SCANS_COLLECTION)
      .orderBy('created_at', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as AnalysisResult & { id: string };
  } catch (error) {
    console.error('Failed to fetch latest scan:', error);
    return null;
  }
}

/**
 * Get a specific scan by ID.
 */
export async function getScanById(scanId: string): Promise<AnalysisResult | null> {
  try {
    const doc = await firestore()
      .collection(SCANS_COLLECTION)
      .doc(scanId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as AnalysisResult;
  } catch (error) {
    console.error('Failed to fetch scan:', error);
    return null;
  }
}

/**
 * Delete a scan result.
 */
export async function deleteScan(scanId: string): Promise<void> {
  try {
    await firestore()
      .collection(SCANS_COLLECTION)
      .doc(scanId)
      .delete();
  } catch (error) {
    console.error('Failed to delete scan:', error);
    throw error;
  }
}
