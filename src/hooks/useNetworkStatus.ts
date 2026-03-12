/**
 * useNetworkStatus hook
 * Tracks device internet connectivity using @react-native-community/netinfo.
 */
import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  return { isConnected, isOffline: isConnected === false };
}
