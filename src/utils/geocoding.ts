const MAPBOX_API_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

export async function geocodeAddress(address: string): Promise<[number, number] | null> {
  const encodedAddress = encodeURIComponent(address);
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  
  const response = await fetch(`${MAPBOX_API_URL}/${encodedAddress}.json?access_token=${accessToken}`);
  
  if (!response.ok) {
    throw new Error('Geocoding request failed');
  }
  
  const data = await response.json();
  
  if (data.features && data.features.length > 0) {
    const [longitude, latitude] = data.features[0].center;
    return [latitude, longitude];
  }
  
  return null;
}