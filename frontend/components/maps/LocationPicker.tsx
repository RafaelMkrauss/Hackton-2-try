'use client'

import { useState, useCallback } from 'react'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { MapPinIcon } from 'lucide-react'

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void
  initialLocation?: { lat: number; lng: number }
  className?: string
}

const mapContainerStyle = {
  width: '100%',
  height: '300px'
}

const defaultCenter = {
  lat: -23.5505, // São Paulo coordinates as default
  lng: -46.6333
}

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false
}

export function LocationPicker({ 
  onLocationSelect, 
  initialLocation = defaultCenter,
  className = ""
}: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation
  )

  const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()
      
      setSelectedLocation({ lat, lng })
      
      // Try to get address using reverse geocoding
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            onLocationSelect({
              lat,
              lng,
              address: results[0].formatted_address
            })
          } else {
            onLocationSelect({ lat, lng })
          }
        }
      )
    }
  }, [onLocationSelect])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          
          setSelectedLocation({ lat, lng })
          
          // Get address using reverse geocoding
          const geocoder = new google.maps.Geocoder()
          geocoder.geocode(
            { location: { lat, lng } },
            (results, status) => {
              if (status === 'OK' && results && results[0]) {
                onLocationSelect({
                  lat,
                  lng,
                  address: results[0].formatted_address
                })
              } else {
                onLocationSelect({ lat, lng })
              }
            }
          )
        },
        (error) => {
          console.error('Error getting current location:', error)
        }
      )
    }
  }

  return (
    <div className={className}>
      <div className="mb-3 flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Localização no Mapa
        </label>
        <button
          type="button"
          onClick={getCurrentLocation}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <MapPinIcon className="w-4 h-4 mr-1" />
          Usar minha localização
        </button>
      </div>
      
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={selectedLocation || defaultCenter}
          zoom={15}
          options={mapOptions}
          onClick={onMapClick}
        >
          {selectedLocation && (
            <Marker
              position={selectedLocation}
              icon={{
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#ef4444" stroke="#fff" stroke-width="2"/>
                    <circle cx="12" cy="9" r="3" fill="#fff"/>
                  </svg>
                `)}`,
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 32)
              }}
            />
          )}
        </GoogleMap>
      </div>
      
      <p className="mt-2 text-sm text-gray-600">
        Clique no mapa para selecionar a localização da denúncia
      </p>
    </div>
  )
}
