/**
 * DerScan Firestore Service
 * 
 * Manages scan history and analysis results in Firebase Firestore.
 */

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { AnalysisResult } from './api';

// Enable Firestore offline persistence for offline mode
firestore().settings({
  persistence: true,
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
});

const SCANS_COLLECTION = 'scans';

/**
 * Save a scan analysis result to Firestore.
 */
export async function saveScanResult(result: AnalysisResult): Promise<string> {
  const currentUser = auth().currentUser;
  if (!currentUser) throw new Error('User not authenticated');

  try {
    const docRef = await firestore()
      .collection(SCANS_COLLECTION)
      .add({
        ...result,
        userId: currentUser.uid,
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
  const currentUser = auth().currentUser;
  if (!currentUser) return [];

  try {
    const snapshot = await firestore()
      .collection(SCANS_COLLECTION)
      .where('userId', '==', currentUser.uid)
      .limit(20)
      .get();

    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as (AnalysisResult & { id: string, created_at?: any })[];

    // Sort locally to avoid requiring a Firestore composite index (userId + created_at)
    return results.sort((a, b) => {
      const timeA = a.created_at?.toDate?.()?.getTime() || 0;
      const timeB = b.created_at?.toDate?.()?.getTime() || 0;
      return timeB - timeA;
    }) as (AnalysisResult & { id: string })[];
  } catch (error) {
    console.error('Failed to fetch scan history:', error);
    return [];
  }
}

/**
 * Get the latest scan result for the current user.
 * @param seriesId Optional seriesId to filter by
 */
export async function getLatestScan(seriesId?: string): Promise<(AnalysisResult & { id: string, seriesId?: string }) | null> {
  const currentUser = auth().currentUser;
  if (!currentUser) return null;

  try {
    let query = firestore()
      .collection(SCANS_COLLECTION)
      .where('userId', '==', currentUser.uid);

    if (seriesId) {
      query = query.where('seriesId', '==', seriesId);
    } else {
      // If no seriesId, we want the latest "Categorized" scan (not temp)
      query = query.where('isTemp', '==', false);
    }

    const snapshot = await query.get();

    if (snapshot.empty) return null;

    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as (AnalysisResult & { id: string, seriesId?: string, created_at?: any })[];

    // Sort locally to avoid requiring a Firestore composite index
    results.sort((a, b) => {
      const timeA = a.created_at?.toDate?.()?.getTime() || 0;
      const timeB = b.created_at?.toDate?.()?.getTime() || 0;
      return timeB - timeA;
    });

    return results[0] as (AnalysisResult & { id: string, seriesId?: string });
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

/**
 * Get all scans in a specific series.
 */
export async function getScansBySeries(seriesId: string): Promise<(AnalysisResult & { id: string })[]> {
  const currentUser = auth().currentUser;
  if (!currentUser) return [];

  try {
    const snapshot = await firestore()
      .collection(SCANS_COLLECTION)
      .where('userId', '==', currentUser.uid)
      .where('seriesId', '==', seriesId)
      .get();

    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as (AnalysisResult & { id: string, created_at?: any })[];

    return results.sort((a, b) => {
      const timeA = a.created_at?.toDate?.()?.getTime() || 0;
      const timeB = b.created_at?.toDate?.()?.getTime() || 0;
      return timeB - timeA;
    }) as (AnalysisResult & { id: string })[];
  } catch (error) {
    console.error('Failed to fetch scans by series:', error);
    return [];
  }
}

/**
 * Get all unique series IDs for the current user.
 */
export async function getUserSeries(): Promise<{id: string, name: string}[]> {
  const currentUser = auth().currentUser;
  if (!currentUser) return [];

  try {
    const snapshot = await firestore()
      .collection(SCANS_COLLECTION)
      .where('userId', '==', currentUser.uid)
      .where('isBaseline', '==', true)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.seriesId,
        name: data.condition_name
      };
    });
  } catch (error) {
    console.error('Failed to fetch series list:', error);
    return [];
  }
}

/**
 * Delete an entire series and all its associated scans.
 */
export async function deleteSeries(seriesId: string): Promise<void> {
  const currentUser = auth().currentUser;
  if (!currentUser) return;

  try {
    const snapshot = await firestore()
      .collection(SCANS_COLLECTION)
      .where('userId', '==', currentUser.uid)
      .where('seriesId', '==', seriesId)
      .get();

    const batch = firestore().batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error(`Failed to delete series ${seriesId}:`, error);
    throw error;
  }
}
