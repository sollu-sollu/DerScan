import React, { useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, MapType, Region } from 'react-native-maps';
import { useTheme } from '../theme';

interface MapMarker {
  lat: number;
  lng: number;
  name: string;
  type: string;
}

interface NativeMapViewProps {
  latitude: number;
  longitude: number;
  markers: MapMarker[];
  route?: [number, number][];
  height?: number;
  borderRadius?: number;
  mapType?: MapType;
  is3D?: boolean;
  radius?: number;
}

/**
 * Converts a radius in meters to a latitudeDelta suitable for react-native-maps.
 * 1 degree of latitude ≈ 111,320 meters.
 * We multiply by a padding factor so the circle fits comfortably in the view.
 */
function radiusToLatitudeDelta(radiusMeters: number): number {
  const KM_PER_DEGREE = 111.32;
  const radiusKm = radiusMeters / 1000;
  // The delta represents the full span, so diameter = radius * 2,
  // plus a 30% padding factor to keep markers inside the visible area.
  return (radiusKm * 2 * 1.3) / KM_PER_DEGREE;
}

export default function NativeMapView({
  latitude,
  longitude,
  markers,
  route,
  height = 280,
  borderRadius = 16,
  mapType = 'standard',
  is3D = false,
  radius = 5000,
}: NativeMapViewProps) {
  const { colors, isDarkMode } = useTheme();
  const mapRef = useRef<MapView>(null);
  const isFirstRender = useRef(true);

  // ── Effect 1: Zoom when center or radius changes ──────────────────
  // This is the primary controller — it fires whenever the user changes
  // their location (via search/suggestion) or adjusts the radius slider.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const latDelta = radiusToLatitudeDelta(radius);
    const lngDelta = latDelta * 1.2; // Slightly wider for landscape feel

    const region: Region = {
      latitude,
      longitude,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };

    if (isFirstRender.current) {
      // On first render, give the MapView a moment to mount before animating
      isFirstRender.current = false;
      setTimeout(() => {
        map.animateToRegion(region, 800);
      }, 500);
    } else {
      map.animateToRegion(region, 600);
    }
  }, [latitude, longitude, radius]);

  // ── Effect 2: Fit markers if they extend beyond the current view ──
  // This only runs when marker data actually changes. It uses fitToCoordinates
  // to smoothly expand the view if markers are outside the current region.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || markers.length === 0) return;

    // Build coordinate array including the user's position + all markers
    const allCoords = [
      { latitude, longitude },
      ...markers.map(m => ({ latitude: m.lat, longitude: m.lng })),
    ];

    // Only fit if there are markers to fit — we delay slightly so that
    // Effect 1 (radius zoom) has time to complete first.
    const timer = setTimeout(() => {
      map.fitToCoordinates(allCoords, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    }, 700);

    return () => clearTimeout(timer);
  }, [markers]);

  // ── Effect 3: Handle 3D tilt + zoom changes ──────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (is3D) {
      // 3D: Zoom to a fixed tight delta for true street-level immersion
      const closeDelta = 0.003;
      map.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: closeDelta,
          longitudeDelta: closeDelta * 1.2,
        },
        600,
      );
      // Apply pitch after region settles
      setTimeout(() => {
        map.animateCamera({ pitch: 60 }, { duration: 500 });
      }, 650);
    } else {
      // 2D: Reset pitch and restore radius-based zoom
      map.animateCamera({ pitch: 0 }, { duration: 300 });
      setTimeout(() => {
        const latDelta = radiusToLatitudeDelta(radius);
        map.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: latDelta,
            longitudeDelta: latDelta * 1.2,
          },
          500,
        );
      }, 350);
    }
  }, [is3D]);

  return (
    <View style={[styles.container, { height, borderRadius }]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: radiusToLatitudeDelta(radius),
          longitudeDelta: radiusToLatitudeDelta(radius) * 1.2,
        }}
        mapType={mapType}
        showsUserLocation={true}
        loadingEnabled={true}
        loadingIndicatorColor={colors.primary}
        customMapStyle={isDarkMode ? darkMapStyle : []}
      >
        {/* Search Center Marker */}
        <Marker
          coordinate={{ latitude, longitude }}
          title="Search Area"
          description="Clinics shown around this point"
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.centerMarker}>
            <View style={styles.centerMarkerDot} />
            <View style={styles.centerMarkerRing} />
          </View>
        </Marker>

        {/* Clinic/Hospital Markers */}
        {markers.map((marker, index) => (
          <Marker
            key={`${marker.lat}-${marker.lng}-${index}`}
            coordinate={{ latitude: marker.lat, longitude: marker.lng }}
            title={marker.name}
            description={marker.type}
          >
            <View style={[
              styles.markerContainer, 
              { backgroundColor: marker.type === 'hospital' ? colors.error : colors.primary }
            ]}>
              <View style={styles.markerInner} />
            </View>
          </Marker>
        ))}

        {/* Route Polyline */}
        {route && route.length > 0 && (
          <Polyline
            coordinates={route.map(r => ({ latitude: r[0], longitude: r[1] }))}
            strokeWidth={4}
            strokeColor={colors.primary}
          />
        )}
      </MapView>
    </View>
  );
}

const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#263c3f" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#6b9a76" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#38414e" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#212a37" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9ca5b3" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#1f282d" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#f3d19c" }]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [{ "color": "#2f3948" }]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#17263c" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#515c6d" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#17263c" }]
  }
];

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
  },
  centerMarker: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerMarkerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E53935',
    position: 'absolute',
  },
  centerMarkerRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E53935',
    backgroundColor: 'rgba(229, 57, 53, 0.15)',
  },
});
