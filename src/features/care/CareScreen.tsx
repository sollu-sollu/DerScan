import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';

import { InfoCard, CustomModal, NativeMapView } from '../../components';
import { useTheme } from '../../theme';
import { MapType } from 'react-native-maps';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDdyZqQW6Bs2YH3o2sH-yK97c9gQx_6Jow';

interface NearbyPlace {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  distance: number;
  address?: string;
  phone?: string;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function CareScreen() {
  const { colors, spacing, borderRadius, typography, isDarkMode, shadows } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  // Real GPS position — never overwritten by search, used for routing origin
  const [gpsLat, setGpsLat] = useState<number | null>(null);
  const [gpsLng, setGpsLng] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [activeRoute, setActiveRoute] = useState<[number, number][] | undefined>();
  const [isRoutingId, setIsRoutingId] = useState<string | null>(null);
  const [radius, setRadius] = useState(5000); // Default 5km
  const [searchLoading, setSearchLoading] = useState(false);
  const [placesLoading, setPlacesLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [mapType, setMapType] = useState<MapType>('standard');
  const [is3D, setIs3D] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    subtitle: string;
    icon: string;
    iconColor?: string;
  } | null>(null);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const radiusTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [searchedLocation, setSearchedLocation] = useState<{ name: string; lat: number; lng: number } | null>(null);

  useEffect(() => {
    requestLocationAndFetch();
  }, []);

  const requestLocationAndFetch = async () => {
    setLoading(true);
    try {
      // Request location permission on Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'DerScan needs your location to find nearby dermatology clinics.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setLocationError('Location permission denied');
          setLoading(false);
          return;
        }
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLat(latitude);
          setUserLng(longitude);
          setGpsLat(latitude);
          setGpsLng(longitude);
          fetchNearbyPlaces(latitude, longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError('Could not get your location. Using default.');
          // Fallback to a default location (Chennai, India)
          const defaultLat = 13.0827;
          const defaultLng = 80.2707;
          setUserLat(defaultLat);
          setUserLng(defaultLng);
          setGpsLat(defaultLat);
          setGpsLng(defaultLng);
          fetchNearbyPlaces(defaultLat, defaultLng);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (e) {
      setLocationError('Location error');
      setLoading(false);
    }
  };

  const fetchNearbyPlaces = async (lat: number, lng: number, currentRadius: number = radius, customQuery?: string) => {
    try {
      setPlacesLoading(true);
      const url = 'https://places.googleapis.com/v1/places:searchText';
      
      const textQuery = customQuery || [
        'Dermatologist', 'Skin clinic', 'Skin doctor', 'Skin specialist',
        'Best dermatology clinic', 'Private dermatologist', 'Skin & Hair clinic',
        'Medical spa', 'Cosmetic clinic', 'Hair transplant clinic', 'Dermatology pharmacy'
      ].join(' ');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.shortFormattedAddress'
        },
        body: JSON.stringify({
          textQuery,
          locationBias: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: currentRadius
            }
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Places API (New) Error');
      }

      // Strict Keyword Whitelist for filtering out "Noise" (General hospitals without skin focus)
      const whitelist = [
        'derma', 'skin', 'clinic', 'specialist', 'hair', 'cosmetic', 'spa', 'pharmacy', 'care'
      ];

      const results: NearbyPlace[] = (data.places || [])
        .map((place: any) => ({
          id: place.id,
          name: place.displayName?.text || 'Unknown Clinic',
          type: place.types?.[0]?.replace(/_/g, ' ') || 'clinic',
          lat: place.location.latitude,
          lng: place.location.longitude,
          distance: getDistance(lat, lng, place.location.latitude, place.location.longitude),
          address: place.shortFormattedAddress || place.formattedAddress || '',
          phone: '', 
        }))
        .filter((place: any) => {
          const lowerName = place.name.toLowerCase();
          const lowerType = place.type.toLowerCase();
          const inRadius = place.distance <= (currentRadius + 100) / 1000; // Small buffer
          
          // Must match a skin/specialty keyword OR be a clinic/pharmacy explicitly
          const matchWhitelist = whitelist.some(word => lowerName.includes(word) || lowerType.includes(word));
          
          return inRadius && matchWhitelist;
        })
        .sort((a: NearbyPlace, b: NearbyPlace) => a.distance - b.distance);

      setPlaces(results);
      return results;
    } catch (e: any) {
      console.error('Map Data Error:', e.message);
      setLocationError('Service adjustment in progress. Testing API connectivity...');
    } finally {
      setPlacesLoading(false);
      setLoading(false); // Ensure initial spinner is gone
    }
  };

  const fetchSuggestions = async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      // Using Places API (New) Autocomplete endpoint
      const url = 'https://places.googleapis.com/v1/places:autocomplete';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        },
        body: JSON.stringify({
          input,
          locationBias: {
            circle: {
              center: { latitude: userLat || 13.0827, longitude: userLng || 80.2707 },
              radius: 50000 // Bias towards current area
            }
          }
        })
      });
      const data = await response.json();

      if (data.suggestions) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      }
    } catch (e) {
      console.error('Autocomplete Error:', e);
    }
  };

  const handleSelectSuggestion = async (description: string, placeId?: string) => {
    setSearchQuery(description);
    setShowSuggestions(false);
    setSearchLoading(true);
    
    try {
      let lat: number | null = null;
      let lng: number | null = null;

      // Try Place Details first if we have a placeId (most reliable)
      if (placeId) {
        const detailUrl = `https://places.googleapis.com/v1/places/${placeId}`;
        const detailRes = await fetch(detailUrl, {
          headers: {
            'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
            'X-Goog-FieldMask': 'location',
          },
        });
        const detailData = await detailRes.json();
        if (detailData.location) {
          lat = detailData.location.latitude;
          lng = detailData.location.longitude;
        }
      }

      // Fallback to Geocoding if Place Details didn't work
      if (!lat || !lng) {
        const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(description)}&key=${GOOGLE_MAPS_API_KEY}`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();
        if (geoData.status === 'OK' && geoData.results.length > 0) {
          lat = geoData.results[0].geometry.location.lat;
          lng = geoData.results[0].geometry.location.lng;
        }
      }

      if (lat && lng) {
        console.log('Jumping to suggestion:', lat, lng, description);
        setPlaces([]);
        setActiveRoute(undefined);
        setSearchedLocation({ name: description, lat, lng });
        setUserLat(lat);
        setUserLng(lng);
        fetchNearbyPlaces(lat, lng);
      } else {
        console.warn('Could not resolve location for:', description);
      }
    } catch (e) {
      console.error('Select Suggestion Error:', e);
    } finally {
      setSearchLoading(false);
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      // 1. Try Geocoding first (best for jumping to a city/street)
      const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${GOOGLE_MAPS_API_KEY}`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();

      if (geoData.status === 'OK' && geoData.results.length > 0) {
        const { lat, lng } = geoData.results[0].geometry.location;
        setPlaces([]);
        setActiveRoute(undefined);
        setSearchedLocation({ name: searchQuery, lat, lng });
        setUserLat(lat);
        setUserLng(lng);
        fetchNearbyPlaces(lat, lng);
      } else {
        // 2. Fallback: Search directly for businesses/clinics using the query
        // This handles "clinic in Chennai" or "Park Street Pharmacy"
        const results = await fetchNearbyPlaces(userLat || 13.0827, userLng || 80.2707, radius, searchQuery);
        
        // If we found something, jump to the first result
        if (results && results.length > 0) {
          setUserLat(results[0].lat);
          setUserLng(results[0].lng);
        }
      }
    } catch (e) {
      console.error('Search Error:', e);
      Alert.alert('Search Error', 'Could not complete search. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
    else {
      setModalContent({
        title: 'No Phone Number',
        subtitle: 'Apologies, we do not have a contact number for this specific clinic in our records.',
        icon: 'phone-off',
        iconColor: colors.textLight,
      });
      setModalVisible(true);
    }
  };

  const fetchRoute = async (destLat: number, destLng: number, clinicId: string) => {
    // Use real GPS as origin, not the map center
    const originLat = gpsLat || userLat;
    const originLng = gpsLng || userLng;
    if (!originLat || !originLng) return;
    setIsRoutingId(clinicId);
    
    try {
      // OSRM requires coordinates in [longitude, latitude] format
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        // OSRM returns [lng, lat], our MapView expects [lat, lng]
        const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
          (c: number[]) => [c[1], c[0]]
        );
        setActiveRoute(coords);
      } else {
        Alert.alert('Route Error', 'Could not find a route to this location.');
      }
    } catch (e) {
      console.error('OSRM Routing Error:', e);
      setModalContent({
        title: 'Route Error',
        subtitle: 'Could not fetch directions at this time. Please check your internet connection.',
        icon: 'map-marker-off',
        iconColor: colors.error,
      });
      setModalVisible(true);
    } finally {
      setIsRoutingId(null);
    }
  };

  const filteredPlaces = searchQuery
    ? places.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : places;

  const mapMarkers = filteredPlaces.map(p => ({
    lat: p.lat,
    lng: p.lng,
    name: p.name,
    type: p.type,
  }));

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: spacing.lg, paddingBottom: 100 },
    header: { marginBottom: spacing.lg },
    title: { ...typography.h3, color: colors.text },
    subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
    searchContainer: {
      ...shadows.sm,
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.cardBackground, borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md, marginBottom: spacing.lg, height: 50,
      zIndex: 2000, // Higher than map components
      elevation: 5, // Android shadow and layering
      overflow: 'visible', // Ensure suggestions aren't clipped
    },
    searchInput: {
      flex: 1, marginLeft: spacing.sm, color: colors.text, ...typography.body,
    },
    suggestionContainer: {
      ...shadows.md,
      position: 'absolute',
      top: 52,
      left: 0,
      right: 0,
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.md,
      zIndex: 3000,
      elevation: 8,
      borderWidth: 1,
      borderColor: colors.border,
      maxHeight: 200,
    },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    suggestionText: {
      ...typography.bodySmall,
      color: colors.text,
      marginLeft: spacing.sm,
    },
    section: { marginBottom: spacing.xl },
    sectionTitle: {
      ...typography.body, fontWeight: '600', color: colors.text, marginBottom: spacing.md,
    },
    mapContainer: {
      marginBottom: spacing.lg, borderRadius: borderRadius.lg,
      overflow: 'hidden', ...shadows.md,
    },
    helpCard: {
      backgroundColor: colors.primary, flexDirection: 'row',
      padding: spacing.lg, borderRadius: borderRadius.lg,
      alignItems: 'center', ...shadows.lg,
    },
    helpContent: { flex: 1 },
    helpTitle: {
      ...typography.body, fontWeight: '700',
      color: isDarkMode ? colors.primaryDark : colors.white,
    },
    helpSubtitle: {
      ...typography.caption, color: isDarkMode ? colors.primaryDark : colors.white,
      opacity: 0.8, marginTop: 2,
    },
    helpIcon: {
      width: 48, height: 48, borderRadius: 24,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center', justifyContent: 'center', marginLeft: spacing.md,
    },
    clinicCard: { marginBottom: spacing.md },
    clinicHeader: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'flex-start', marginBottom: spacing.sm,
    },
    clinicName: {
      ...typography.body, fontWeight: '600', color: colors.text, flex: 1,
    },
    distanceBadge: {
      backgroundColor: isDarkMode ? '#1a3a2a' : '#E8F5E9',
      paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
    },
    distanceText: { fontSize: 11, fontWeight: '600', color: colors.success },
    typeBadge: {
      backgroundColor: isDarkMode ? '#1a2a3a' : '#E3F2FD',
      paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4,
      alignSelf: 'flex-start', marginBottom: spacing.sm,
    },
    typeText: {
      fontSize: 10, fontWeight: '600', color: isDarkMode ? '#90CAF9' : '#1565C0',
      textTransform: 'capitalize',
    },
    clinicInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    clinicInfoText: { ...typography.caption, color: colors.textSecondary, marginLeft: 4, flex: 1 },
    clinicActions: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.md },
    actionBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.background, paddingVertical: 10, borderRadius: borderRadius.md,
      borderWidth: 1, borderColor: colors.border,
    },
    actionBtnText: { ...typography.caption, fontWeight: '600', color: colors.text, marginLeft: 6 },
    primaryActionBtn: { backgroundColor: colors.primary, borderColor: colors.primary },
    primaryActionText: { color: isDarkMode ? colors.primaryDark : colors.white },
    emptyText: {
      ...typography.bodySmall, color: colors.textLight,
      textAlign: 'center', paddingVertical: spacing.xl,
    },
    loadingMap: {
      height: 320, borderRadius: borderRadius.lg, backgroundColor: colors.cardBackground,
      justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg,
    },
    mapIndicatorContainer: {
       position: 'absolute',
       top: '50%',
       left: '50%',
       marginLeft: -15,
       marginTop: -15,
       zIndex: 10,
       backgroundColor: 'rgba(255,255,255,0.8)',
       padding: 8,
       borderRadius: 20,
    },
    mapActions: {
      position: 'absolute',
      top: spacing.md,
      right: spacing.md,
      gap: spacing.sm,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    radiusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      ...shadows.sm,
    },
    radiusBtn: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: colors.background,
    },
    radiusValue: {
      paddingHorizontal: 10,
      minWidth: 50,
      alignItems: 'center',
    },
    radiusText: {
      ...typography.caption,
      fontWeight: '800',
      color: colors.primary,
    },
    mapStyleBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.cardBackground,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.sm,
    },
    activeStyleBtn: {
      backgroundColor: colors.primary,
    },
    stylePickerExpanded: {
      position: 'absolute',
      right: 50,
      top: 50,
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.md,
      padding: 4,
      flexDirection: 'row',
      gap: 4,
      ...shadows.md,
    },
    miniStyleBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeMiniBtn: {
      backgroundColor: colors.primary,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Professional Care</Text>
            <View style={styles.radiusContainer}>
              <TouchableOpacity 
                style={styles.radiusBtn}
                onPress={() => {
                  const next = Math.max(1000, radius - 1000);
                  setRadius(next);
                  // Debounce radius fetch
                  if (radiusTimerRef.current) clearTimeout(radiusTimerRef.current);
                  radiusTimerRef.current = setTimeout(() => {
                    if (userLat && userLng) fetchNearbyPlaces(userLat, userLng, next);
                  }, 500);
                }}
              >
                <Icon name="minus" size={14} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <View style={styles.radiusValue}>
                <Text style={styles.radiusText}>{radius/1000}km</Text>
              </View>

              <TouchableOpacity 
                style={styles.radiusBtn}
                onPress={() => {
                  const next = Math.min(50000, radius + 1000);
                  setRadius(next);
                  // Debounce radius fetch
                  if (radiusTimerRef.current) clearTimeout(radiusTimerRef.current);
                  radiusTimerRef.current = setTimeout(() => {
                    if (userLat && userLng) fetchNearbyPlaces(userLat, userLng, next);
                  }, 500);
                }}
              >
                <Icon name="plus" size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.subtitle}>Find nearby clinics and specialists</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          {searchLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
          ) : (
            <Icon name="magnify" size={24} color={colors.textLight} />
          )}
          <TextInput
            style={styles.searchInput}
            placeholder="Search city, street or location..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              fetchSuggestions(text);
            }}
            onSubmitEditing={searchLocation}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { 
              setSearchQuery(''); 
              setSuggestions([]);
              setShowSuggestions(false);
              setSearchedLocation(null);
              requestLocationAndFetch(); 
            }} style={{ padding: 4 }}>
              <Icon name="close-circle" size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
          {/* Dedicated Search Button — works on emulator without keyboard Enter */}
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={searchLocation}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 8,
                padding: 8,
                marginLeft: 6,
              }}
            >
              <Icon name="magnify" size={18} color="#FFF" />
            </TouchableOpacity>
          )}

            {/* Suggestions Dropdown - Moved inside a wrapping view to prevent clipping */}
            {showSuggestions && suggestions.length > 0 && (
              <View style={styles.suggestionContainer}>
                <ScrollView keyboardShouldPersistTaps="always">
                  {suggestions.map((item: any, idx: number) => (
                    <TouchableOpacity
                      key={item.placePrediction?.placeId || idx}
                      style={styles.suggestionItem}
                      onPress={() => handleSelectSuggestion(
                        item.placePrediction?.text?.text || '',
                        item.placePrediction?.placeId || undefined
                      )}
                    >
                      <Icon name="map-marker-outline" size={18} color={colors.textLight} />
                      <Text style={styles.suggestionText} numberOfLines={1}>
                        {item.placePrediction?.text?.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          {loading || !userLat || !userLng ? (
            <View style={styles.loadingMap}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.emptyText, { marginTop: spacing.sm }]}>
                {locationError || 'Initializing map...'}
              </Text>
            </View>
          ) : (
            <View style={{ height: 320 }}>
              <NativeMapView
                latitude={userLat || 0}
                longitude={userLng || 0}
                markers={mapMarkers}
                route={activeRoute}
                height={320}
                borderRadius={borderRadius.lg}
                mapType={mapType}
                is3D={is3D}
                radius={radius}
              />
              
              {/* Background Loader during radius updates */}
              {placesLoading && (
                <View style={styles.mapIndicatorContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              )}
              
              {/* Map Controls */}
              <View style={styles.mapActions}>
                {/* 3D/2D Toggle */}
                <TouchableOpacity 
                  style={[styles.mapStyleBtn, is3D && styles.activeStyleBtn]}
                  onPress={() => setIs3D(!is3D)}
                >
                  <Text style={{ 
                    color: is3D ? colors.white : colors.text, 
                    fontWeight: '700', 
                    fontSize: 10 
                  }}>
                    {is3D ? '2D' : '3D'}
                  </Text>
                </TouchableOpacity>

                {/* Layer Toggle Button */}
                <TouchableOpacity 
                  style={[styles.mapStyleBtn, showStylePicker && styles.activeStyleBtn]}
                  onPress={() => setShowStylePicker(!showStylePicker)}
                >
                  <Icon 
                    name="layers-outline" 
                    size={20} 
                    color={showStylePicker ? colors.white : colors.text} 
                  />
                </TouchableOpacity>

                {/* Floating Style Picker */}
                {showStylePicker && (
                  <View style={styles.stylePickerExpanded}>
                    <TouchableOpacity 
                      style={[styles.miniStyleBtn, mapType === 'standard' && styles.activeMiniBtn]}
                      onPress={() => { setMapType('standard'); setShowStylePicker(false); }}
                    >
                      <Icon name="map" size={16} color={mapType === 'standard' ? colors.white : colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.miniStyleBtn, mapType === 'satellite' && styles.activeMiniBtn]}
                      onPress={() => { setMapType('hybrid'); setShowStylePicker(false); }}
                    >
                      <Icon name="satellite-variant" size={16} color={mapType === 'hybrid' ? colors.white : colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.miniStyleBtn, mapType === 'terrain' && styles.activeMiniBtn]}
                      onPress={() => { setMapType('terrain'); setShowStylePicker(false); }}
                    >
                      <Icon name="terrain" size={16} color={mapType === 'terrain' ? colors.white : colors.text} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Telehealth CTA */}
        {/* <View style={styles.section}>
          <TouchableOpacity style={styles.helpCard}>
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>Skin Telehealth</Text>
              <Text style={styles.helpSubtitle}>Consult with a doctor in 15 mins</Text>
            </View>
            <View style={styles.helpIcon}>
              <Icon name="video" size={24} color={colors.white} />
            </View>
          </TouchableOpacity>
        </View> */}

        {/* Searched Location Card */}
        {searchedLocation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Searched Location</Text>
            <InfoCard style={styles.clinicCard}>
              <View style={styles.clinicHeader}>
                <Text style={styles.clinicName}>{searchedLocation.name}</Text>
                <View style={[styles.distanceBadge, { backgroundColor: isDarkMode ? '#3a1a1a' : '#FFEBEE' }]}>
                  <Text style={[styles.distanceText, { color: '#E53935' }]}>
                    <Icon name="map-marker" size={11} color="#E53935" /> Searched
                  </Text>
                </View>
              </View>

              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>search result</Text>
              </View>

              <View style={styles.clinicActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.primaryActionBtn]}
                  onPress={() => {
                    const origin = gpsLat && gpsLng ? `${gpsLat},${gpsLng}` : '';
                    const dest = `${searchedLocation.lat},${searchedLocation.lng}`;
                    const url = Platform.select({
                      ios: `maps://app?saddr=${origin}&daddr=${dest}`,
                      android: `google.navigation:q=${dest}`,
                    });
                    if (url) Linking.openURL(url).catch(() => {
                      Linking.openURL(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`);
                    });
                  }}
                >
                  <Icon name="navigation-variant" size={16} color={isDarkMode ? colors.primaryDark : colors.white} />
                  <Text style={[styles.actionBtnText, styles.primaryActionText]}>Navigate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: colors.primary }]}
                  onPress={() => fetchRoute(searchedLocation.lat, searchedLocation.lng, 'searched')}
                  disabled={isRoutingId !== null}
                >
                  {isRoutingId === 'searched' ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <Icon name="map-marker-path" size={16} color={colors.primary} />
                      <Text style={[styles.actionBtnText, { color: colors.primary }]}>Route</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </InfoCard>
          </View>
        )}

        {/* Nearby Clinics List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Nearby Specialists ({filteredPlaces.length})
          </Text>

          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : filteredPlaces.length === 0 ? (
            <Text style={styles.emptyText}>
              {searchQuery ? 'No results match your search.' : 'No nearby clinics found. Try expanding your search.'}
            </Text>
          ) : (
            filteredPlaces.map(clinic => (
              <InfoCard key={clinic.id} style={styles.clinicCard}>
                <View style={styles.clinicHeader}>
                  <Text style={styles.clinicName}>{clinic.name}</Text>
                  <View style={styles.distanceBadge}>
                    <Text style={styles.distanceText}>
                      {clinic.distance < 1
                        ? `${Math.round(clinic.distance * 1000)} m`
                        : `${clinic.distance.toFixed(1)} km`}
                    </Text>
                  </View>
                </View>

                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>{clinic.type}</Text>
                </View>

                {clinic.address ? (
                  <View style={styles.clinicInfo}>
                    <Icon name="map-marker" size={14} color={colors.textLight} />
                    <Text style={styles.clinicInfoText}>{clinic.address}</Text>
                  </View>
                ) : null}

                <View style={styles.clinicActions}>
                  {clinic.phone ? (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleCall(clinic.phone || '')}
                    >
                      <Icon name="phone" size={16} color={colors.text} />
                      <Text style={styles.actionBtnText}>Call</Text>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    style={[
                      styles.actionBtn, 
                      styles.primaryActionBtn,
                    ]}
                    onPress={() => {
                      // Open Google Maps with directions
                      const origin = gpsLat && gpsLng ? `${gpsLat},${gpsLng}` : '';
                      const dest = `${clinic.lat},${clinic.lng}`;
                      const url = Platform.select({
                        ios: `maps://app?saddr=${origin}&daddr=${dest}`,
                        android: `google.navigation:q=${dest}`,
                      });
                      if (url) Linking.openURL(url).catch(() => {
                        // Fallback to web Google Maps
                        Linking.openURL(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`);
                      });
                    }}
                  >
                    <Icon name="navigation-variant" size={16} color={isDarkMode ? colors.primaryDark : colors.white} />
                    <Text style={[styles.actionBtnText, styles.primaryActionText]}>Navigate</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { borderColor: colors.primary }]}
                    onPress={() => fetchRoute(clinic.lat, clinic.lng, clinic.id)}
                    disabled={isRoutingId !== null}
                  >
                    {isRoutingId === clinic.id ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <>
                        <Icon name="map-marker-path" size={16} color={colors.primary} />
                        <Text style={[styles.actionBtnText, { color: colors.primary }]}>Route</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </InfoCard>
            ))
          )}
        </View>

        {/* Emergency Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When to seek urgent care?</Text>
          <InfoCard style={{ backgroundColor: isDarkMode ? '#2B1212' : '#FFF5F5' }}>
            <Text style={[typography.bodySmall, { color: isDarkMode ? '#FF9A9A' : '#C53030', lineHeight: 20 }]}>
              • Sudden spreading of rash{'\n'}
              • High fever accompanied by skin issues{'\n'}
              • Signs of infection (pus, warmth, swelling){'\n'}
              • Severe pain or blistering
            </Text>
          </InfoCard>
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
    </SafeAreaView>
  );
}
