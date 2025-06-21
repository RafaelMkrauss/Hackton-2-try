'use client'

import { useEffect, useRef, useState } from 'react'
import { DEFAULT_MAP_CENTER } from '@/lib/constants/maps'

interface SimpleMapProps {
  className?: string
}

export function SimpleMap({ className = "w-full h-96" }: SimpleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      setLoadError('API Key não encontrada')
      return
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap()
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=pt-BR&region=BR&callback=initMap`
    script.async = true
    script.defer = true

    // Create global callback
    window.initMap = () => {
      console.log('Google Maps loaded via callback')
      initializeMap()
    }

    script.onerror = () => {
      console.error('Failed to load Google Maps script')
      setLoadError('Falha ao carregar Google Maps')
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (window.initMap) {
        delete window.initMap
      }
    }
  }, [])

  const initializeMap = () => {
    if (!mapRef.current || mapInstance.current) return

    try {
      console.log('Initializing Google Maps...')
      const map = new google.maps.Map(mapRef.current, {
        center: DEFAULT_MAP_CENTER, // Brasília
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      })

      mapInstance.current = map
      setIsLoaded(true)
      console.log('Google Maps initialized successfully')      // Add a marker to test
      new google.maps.Marker({
        position: DEFAULT_MAP_CENTER,
        map: map,
        title: 'Brasília',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16)
        }
      })    } catch (error) {
      console.error('Error initializing map:', error)
      setLoadError(`Erro ao inicializar mapa: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  if (loadError) {
    return (
      <div className={`${className} flex items-center justify-center bg-red-50 border border-red-200 rounded-lg`}>
        <div className="text-center p-4">
          <p className="text-red-700 font-medium">❌ Erro no Google Maps</p>
          <p className="text-red-600 text-sm mt-1">{loadError}</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg`}>
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
        ✅ Google Maps carregado com sucesso!
      </div>
      <div ref={mapRef} className={className} />
    </div>
  )
}

// Extend window type
declare global {
  interface Window {
    initMap?: () => void
  }
}
