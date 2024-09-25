import { NextApiRequest, NextApiResponse } from 'next'

const MAPBOX_API_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const FOOD_KEYWORDS = 'supermarket,grocery,food,vegetable,restaurant';
// const FOOD_KEYWORDS = 'gym,health';
const DISTANCE_THRESHOLD = 1609.34; // 1 mile in meters

async function searchNearbyFood(latitude: number, longitude: number): Promise<any[]> {
    const accessToken = process.env.MAPBOX_TOKEN;
    if (!accessToken) {
      throw new Error('MAPBOX_TOKEN is not set in environment variables');
    }
  
    const url = `${MAPBOX_API_URL}/${FOOD_KEYWORDS}.json?type=poi&proximity=${longitude},${latitude}&access_token=${accessToken}`;
    
    console.log('Fetching from URL:', url);
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Mapbox API response:', response.status, errorText);
        throw new Error(`Mapbox API responded with status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      return data.features || [];
    } catch (error) {
      console.error('Error in searchNearbyFood:', error);
      throw error;
    }
  }
  
  function isLocationFoodDesert(foodSources: any[]): boolean {
    return !foodSources.some(source => source.properties.distance < DISTANCE_THRESHOLD);
  }
  
  export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  
    const { latitude, longitude } = req.body;
  
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
  
    try {
      console.log('Received request for coordinates:', latitude, longitude);
      const foodSources = await searchNearbyFood(latitude, longitude);
      console.log('Found food sources:', foodSources.length);
      const isFoodDesert = isLocationFoodDesert(foodSources);
  
      res.status(200).json({
        isFoodDesert,
        foodSources: foodSources.slice(0, 5) // Return top 5 food sources
      });
    } catch (error) {
      console.error('Error checking food desert status:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }