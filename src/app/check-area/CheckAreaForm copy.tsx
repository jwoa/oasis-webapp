'use client'

import { useState, useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useGeolocation } from '../../hooks/useGeolocation'

type Inputs = {
  address: string;
  latitude?: number;
  longitude?: number;
};

export default function CheckAreaForm() {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<Inputs>()
  const [enableGeolocation, setEnableGeolocation] = useState(false)
  const { location, error: geolocationError } = useGeolocation()

  useEffect(() => {
    if (enableGeolocation && location) {
      setValue('latitude', location.latitude)
      setValue('longitude', location.longitude)
    }
  }, [enableGeolocation, location, setValue])

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log(data)
    // TODO: Implement form submission logic
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <input
          type="text"
          id="address"
          {...register("address", { required: !enableGeolocation })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={enableGeolocation}
        />
        {errors.address && <p className="mt-2 text-sm text-red-600">Address is required</p>}
      </div>
      <div className="flex items-center">
        <input
          id="useGeolocation"
          type="checkbox"
          checked={enableGeolocation}
          onChange={() => setEnableGeolocation(!enableGeolocation)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="useGeolocation" className="ml-2 block text-sm text-gray-900">
          Use my current location
        </label>
      </div>
      {enableGeolocation && (
        <>
          <input type="hidden" {...register("latitude")} />
          <input type="hidden" {...register("longitude")} />
        </>
      )}
      {geolocationError && <p className="mt-2 text-sm text-red-600">{geolocationError}</p>}
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Check Area
        </button>
      </div>
    </form>
  )
}