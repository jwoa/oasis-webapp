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

export default function CheckAreaForm() {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<Inputs>()
  const [isUsingGeolocation, setIsUsingGeolocation] = useState(false)
  const { location, error: geolocationError } = useGeolocation()
  const [showMap, setShowMap] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [geocodeError, setGeocodeError] = useState<string | null>(null)

  const watchLatitude = watch('latitude')
  const watchLongitude = watch('longitude')

  useEffect(() => {
    if (isUsingGeolocation && location) {
      setValue('latitude', location.latitude)
      setValue('longitude', location.longitude)
      setShowMap(true)
    }
  }, [isUsingGeolocation, location, setValue])

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true)
    setGeocodeError(null)
    
    try {
      if (!isUsingGeolocation) {
        const coordinates = await geocodeAddress(data.address)
        if (coordinates) {
          setValue('latitude', coordinates[0])
          setValue('longitude', coordinates[1])
        } else {
          throw new Error('Unable to geocode the provided address')
        }
      }
      
      setShowMap(true)
      // TODO: Implement backend API call to check if it's a food desert
      // For now, let's just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      // TODO: Update UI with food desert information
    } catch (error) {
      setGeocodeError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

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
      
      {/* Placeholder for food desert information */}
      {showMap && (
        <div className="mt-6 p-4 bg-white shadow rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Area Information</h2>
          <p>Loading food desert information...</p>
          {/* We'll replace this with actual data from our backend later */}
        </div>
      )}
    </div>
  )
}