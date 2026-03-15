const fetch = require('node-fetch');

const GOOGLE_MAPS_API_KEY = 'AIzaSyDdyZqQW6Bs2YH3o2sH-yK97c9gQx_6Jow';

async function testApi() {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  
  console.log('Testing Places API (New) with key:', GOOGLE_MAPS_API_KEY);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress'
      },
      body: JSON.stringify({
        textQuery: 'Dermatologist clinic',
        locationBias: {
          circle: {
            center: { latitude: 13.0827, longitude: 80.2707 },
            radius: 5000
          }
        }
      })
    });

    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

testApi();
