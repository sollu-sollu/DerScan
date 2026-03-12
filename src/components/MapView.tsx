/**
 * MapView Component
 * Renders OpenStreetMap + Leaflet.js inside a WebView.
 * Completely free — no API keys required.
 */
import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface MapMarker {
  lat: number;
  lng: number;
  name: string;
  type: string;
}

interface MapViewProps {
  latitude: number;
  longitude: number;
  markers: MapMarker[];
  route?: [number, number][]; // Array of [lat, lng] for drawing path
  height?: number;
  borderRadius?: number;
}

export default function LeafletMapView({
  latitude,
  longitude,
  markers,
  route,
  height = 280,
  borderRadius = 16,
}: MapViewProps) {

  const markerJs = markers.map(m => {
    const icon = m.type === 'hospital' ? '🏥' : '🩺';
    return `L.marker([${m.lat}, ${m.lng}], { icon: L.divIcon({ html: '<div style="font-size:22px">${icon}</div>', iconSize: [28, 28], className: '' }) }).addTo(map).bindPopup('<b>${m.name.replace(/'/g, "\\'")}</b><br><small>${m.type}</small>');`;
  }).join('\n');

  // Generate JS for drawing the route polyline
  const routeJs = route && route.length > 0 
    ? `
      var routeCoords = ${JSON.stringify(route)};
      var routeLine = L.polyline(routeCoords, {
        color: '#4285F4',
        weight: 5,
        opacity: 0.8,
        smoothFactor: 1
      }).addTo(map);
      map.fitBounds(routeLine.getBounds(), { padding: [20, 20] });
    ` 
    : '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    #map { width: 100%; height: 100vh; }
    .leaflet-popup-content { font-family: -apple-system, sans-serif; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([${latitude}, ${longitude}], 14);
    
    // Using a sleek, dark-themed or standard tile based on what we want. We'll stick to OSM standard but it looks clean.
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // User location marker
    L.circleMarker([${latitude}, ${longitude}], {
      radius: 8, fillColor: '#4285F4', color: '#fff',
      weight: 2, fillOpacity: 1
    }).addTo(map).bindPopup('<b>You are here</b>');

    // Clinic/Hospital markers
    ${markerJs}

    // Route Polyline
    ${routeJs}
  </script>
</body>
</html>`;

  return (
    <View style={[styles.container, { height, borderRadius }]}>
      <WebView
        source={{ html }}
        style={[styles.webview, { borderRadius }]}
        scrollEnabled={false}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="small" color="#1F4E5A" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  webview: { flex: 1 },
  loader: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0',
  },
});
