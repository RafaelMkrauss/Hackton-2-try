'use client'

import { useEffect, useRef, useState } from 'react'

interface Location {
  lat: number
  lng: number
  address?: string
}

interface WorkingLocationPickerProps {
  onLocationSelect: (location: Location) => void
  initialLocation?: Location
  className?: string
}

export function WorkingLocationPicker({ 
  onLocationSelect, 
  initialLocation,
  className = "w-full h-96"
}: WorkingLocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState('Carregando Google Maps...')
  
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      setError('API Key não encontrada')
      setLoadingMessage('Erro: API Key não configurada')
      return
    }

    setLoadingMessage('Verificando Google Maps...')

    // Add global error handler for Google Maps authentication failures
    window.gm_authFailure = function() {
      console.error('Google Maps authentication failed!')
      setError('Falha na autenticação do Google Maps. Verifique:\n1. Billing habilitado\n2. APIs habilitadas\n3. Restrições de domínio\n4. API Key válida')
      setLoadingMessage('Erro de autenticação')
    }

    // Check if Google Maps is already loaded
    if (window.google?.maps?.Map) {
      console.log('Google Maps already loaded, initializing location picker...')
      setLoadingMessage('Google Maps encontrado, inicializando...')
      initializeMap()
      return
    }

    // Check if script is already loading
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`)
    if (existingScript) {
      console.log('Google Maps script already exists, waiting for load...')
      setLoadingMessage('Aguardando script carregar...')
      
      // Wait for existing script to load
      let attempts = 0
      const checkInterval = setInterval(() => {
        attempts++
        setLoadingMessage(`Aguardando Google Maps... (${attempts}/100)`)
        
        if (window.google?.maps?.Map) {
          clearInterval(checkInterval)
          console.log('Google Maps loaded via existing script')
          setLoadingMessage('Google Maps carregado, inicializando...')
          initializeMap()
        }
      }, 100)
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        if (!window.google?.maps?.Map) {
          setError('Timeout aguardando Google Maps carregar. Possíveis causas:\n1. Billing não habilitado\n2. Restrições de domínio\n3. API Key inválida')
          setLoadingMessage('Timeout - Verifique configurações')
        }
      }, 10000)
      return
    }

    // Load Google Maps script
    console.log('Loading Google Maps script...')
    setLoadingMessage('Carregando script do Google Maps...')
    
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=pt-BR&region=BR&callback=initWorkingLocationPicker`
    script.async = true
    script.defer = true

    // Create global callback
    window.initWorkingLocationPicker = () => {
      console.log('Google Maps loaded successfully for WorkingLocationPicker')
      setLoadingMessage('Script carregado, inicializando seletor...')
      initializeMap()
    }

    script.onerror = () => {
      console.error('Failed to load Google Maps script')
      setError('Falha ao carregar Google Maps. Verifique:\n1. Conexão com internet\n2. API Key válida\n3. Billing habilitado\n4. Restrições de domínio')
      setLoadingMessage('Erro ao carregar script')
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (window.initWorkingLocationPicker) {
        delete window.initWorkingLocationPicker
      }
      if (window.gm_authFailure) {
        delete window.gm_authFailure
      }
    }
  }, [])
  const initializeMap = () => {
    if (!mapRef.current || mapInstance.current) return

    // Double-check that Google Maps is actually available
    if (!window.google?.maps?.Map) {
      console.error('Google Maps not available when trying to initialize location picker')
      setError('Google Maps não está disponível')
      return
    }

    try {
      console.log('Initializing WorkingLocationPicker...')
      
      const center = initialLocation || { lat: -23.5505, lng: -46.6333 } // São Paulo default
      
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        clickableIcons: true
      })

      mapInstance.current = map
      geocoderRef.current = new google.maps.Geocoder()

      // Add click listener to map
      map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const location = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          }
          handleLocationSelect(location)
        }
      })

      // If there's an initial location, place marker there
      if (initialLocation) {
        placeMarker(initialLocation)
      }

      setIsLoaded(true)
      setError(null)
      console.log('WorkingLocationPicker initialized successfully')

    } catch (error) {
      console.error('Error initializing WorkingLocationPicker:', error)
      setError(`Erro ao inicializar mapa: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const placeMarker = (location: Location) => {
    if (!mapInstance.current) return

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null)
    }

    // Create new marker
    const marker = new google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: mapInstance.current,
      title: 'Localização selecionada',
      animation: google.maps.Animation.DROP,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
            <circle cx="16" cy="16" r="4" fill="white"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 32)
      }
    })

    markerRef.current = marker

    // Center map on marker
    mapInstance.current.panTo({ lat: location.lat, lng: location.lng })
  }

  const handleLocationSelect = async (location: { lat: number, lng: number }) => {
    setSelectedLocation(location)
    placeMarker(location)

    // Try to get address from coordinates
    if (geocoderRef.current) {
      try {        const response = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoderRef.current!.geocode(
            { location: { lat: location.lat, lng: location.lng } },
            (results, status) => {
              if (status === 'OK' && results) {
                resolve(results)
              } else {
                reject(new Error(`Geocoding failed: ${status}`))
              }
            }
          )
        })

        const address = response[0]?.formatted_address
        const locationWithAddress = { ...location, address }
        setSelectedLocation(locationWithAddress)
        onLocationSelect(locationWithAddress)
      } catch (error) {
        console.warn('Failed to get address:', error)
        onLocationSelect(location)
      }
    } else {
      onLocationSelect(location)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada neste navegador.')
      return
    }

    setIsGeolocating(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        handleLocationSelect(location)
        setIsGeolocating(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        alert('Erro ao obter localização: ' + error.message)
        setIsGeolocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  const searchLocation = async (query: string) => {
    if (!geocoderRef.current || !query.trim()) return

    try {      const response = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoderRef.current!.geocode(
          { address: query },
          (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
              resolve(results)
            } else {
              reject(new Error(`Geocoding failed: ${status}`))
            }
          }
        )
      })

      const result = response[0]
      const location = {
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng(),
        address: result.formatted_address
      }

      handleLocationSelect(location)
    } catch (error) {
      console.error('Search failed:', error)
      alert('Localização não encontrada. Tente um endereço mais específico.')
    }
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-red-50 border border-red-200 rounded-lg`}>
        <div className="text-center p-4">
          <p className="text-red-700 font-medium">❌ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg`}>
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar endereço..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                searchLocation(e.currentTarget.value)
              }
            }}
          />
        </div>
        <button
          onClick={getCurrentLocation}
          disabled={isGeolocating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
        >
          {isGeolocating ? '🔄 Localizando...' : '📍 Minha Localização'}
        </button>
      </div>

      {/* Selected location info */}
      {selectedLocation && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700 font-medium">📍 Localização Selecionada:</p>
          <p className="text-green-600 text-sm">
            {selectedLocation.address || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
          </p>
        </div>
      )}

      {/* Map */}
      <div className="relative">
        <div ref={mapRef} className={className} />
        <div className="absolute top-2 left-2 bg-white p-2 rounded shadow text-xs text-gray-600">
          💡 Clique no mapa para selecionar uma localização
        </div>
      </div>
    </div>
  )
}

// Extend window type
declare global {
  interface Window {
    initWorkingLocationPicker?: () => void
  }
}
