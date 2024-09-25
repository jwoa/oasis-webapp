'use client'

import { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useGeolocation } from '@/hooks/useGeolocation'
import MapComponent from '@/components/Map'
import { geocodeAddress } from '@/utils/geocoding'

type Inputs = {
  address: string;
  latitude?: number;
  longitude?: number;
};

type FoodDesertResult = {
  isFoodDesert: boolean;
  foodSources: any[];
};

export default function CheckAreaForm() {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<Inputs>()
  const [isUsingGeolocation, setIsUsingGeolocation] = useState(false)
  const { location, error: geolocationError } = useGeolocation()
  const [showMap, setShowMap] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [geocodeError, setGeocodeError] = useState<string | null>(null)
  const [foodDesertResult, setFoodDesertResult] = useState<FoodDesertResult | null>(null)

  const watchLatitude = watch('latitude')
  const watchLongitude = watch('longitude')

  useEffect(() => {
    if (isUsingGeolocation && location) {
      setValue('latitude', location.latitude)
      setValue('longitude', location.longitude)
      setShowMap(true)
    }
  }, [isUsingGeolocation, location, setValue])

  const checkFoodDesertStatus = async (latitude: number, longitude: number) => {
    console.log('Sending request with coordinates:', latitude, longitude);
    const response = await fetch('/api/checkFoodDesert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ latitude, longitude }),
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API response:', response.status, errorText);
      throw new Error(`Failed to check food desert status: ${errorText}`);
    }
  
    return await response.json();
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true);
    setGeocodeError(null);
    setFoodDesertResult(null);
    
    try {
      let lat = data.latitude;
      let lng = data.longitude;

      if (!isUsingGeolocation) {
        const coordinates = await geocodeAddress(data.address);
        if (coordinates) {
          [lat, lng] = coordinates;
          setValue('latitude', lat);
          setValue('longitude', lng);
        } else {
          throw new Error('Unable to geocode the provided address');
        }
      }

      if (lat && lng) {
        setShowMap(true);
        const result = await checkFoodDesertStatus(lat, lng);
        setFoodDesertResult(result);
      } else {
        throw new Error('Invalid coordinates');
      }
    } catch (error) {
      setGeocodeError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            type="text"
            id="address"
            {...register("address", { required: !isUsingGeolocation })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={isUsingGeolocation}
          />
          {errors.address && <p className="mt-2 text-sm text-red-600">Address is required</p>}
        </div>
        <div className="flex items-center">
          <input
            id="isUsingGeolocation"
            type="checkbox"
            checked={isUsingGeolocation}
            onChange={() => setIsUsingGeolocation(!isUsingGeolocation)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isUsingGeolocation" className="ml-2 block text-sm text-gray-900">
            Use my current location
          </label>
        </div>
        {isUsingGeolocation && (
          <>
            <input type="hidden" {...register("latitude")} />
            <input type="hidden" {...register("longitude")} />
          </>
        )}
        {geolocationError && <p className="mt-2 text-sm text-red-600">{geolocationError}</p>}
        {geocodeError && <p className="mt-2 text-sm text-red-600">{geocodeError}</p>}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Check Area'}
          </button>
        </div>
      </form>
      
      {showMap && watchLatitude && watchLongitude && (
        <div className="mt-6">
          <MapComponent latitude={watchLatitude} longitude={watchLongitude} />
        </div>
      )}
      
      {foodDesertResult && (
        <div className="mt-6 p-4 bg-white shadow rounded-lg text-zinc-950">
          <h2 className="text-xl font-semibold mb-2">Area Information</h2>
          <p>This area is {foodDesertResult.isFoodDesert ? '' : 'not '}considered a food desert.</p>
          <h3 className="text-lg font-semibold mt-4 mb-2">Nearby Food Sources:</h3>
          <ul>
            {foodDesertResult.foodSources.map((source, index) => (
              <li key={index}>{source.place_name} - {(source.properties.distance / 1609.34).toFixed(2)} miles</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}