'use client'

import { useEffect, useRef, useState } from 'react'

interface DirectMapProps {
  reports?: any[]
  center?: { lat: number; lng: number }
  zoom?: number
}

declare global {
  interface Window {
    google: any
    initDirectMap: () => void
  }
}

export function DirectMap({ reports = [], center = { lat: -23.5505, lng: -46.6333 }, zoom = 12 }: DirectMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mapInstance = useRef<any>(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      setError('Chave API do Google Maps não encontrada')
      return
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap()
      return
    }

    // Load Google Maps script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=pt-BR&region=BR`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      console.log('Google Maps loaded successfully')
      initializeMap()
    }
    
    script.onerror = () => {
      setError('Erro ao carregar o Google Maps')
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup script if component unmounts
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`)
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript)
      }
    }
  }, [])

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: false,
        fullscreenControl: true
      })

      mapInstance.current = map
      setIsLoaded(true)

      // Add markers for reports
      reports.forEach((report, index) => {
        if (report.latitude && report.longitude) {
          const marker = new window.google.maps.Marker({
            position: { lat: report.latitude, lng: report.longitude },
            map: map,
            title: report.title,
            icon: {
              url: getMarkerIconUrl(report.status),
              scaledSize: new window.google.maps.Size(32, 32),
              anchor: new window.google.maps.Point(16, 32)
            }
          })

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="max-width: 250px;">
                <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${report.title}</h3>
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${report.description}</p>
                <div style="font-size: 11px; color: #888;">
                  <p><strong>Status:</strong> ${getStatusText(report.status)}</p>
                  <p><strong>Categoria:</strong> ${report.category}</p>
                  <p><strong>Data:</strong> ${new Date(report.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            `
          })

          marker.addListener('click', () => {
            infoWindow.open(map, marker)
          })
        }
      })

      console.log(`Map initialized with ${reports.length} reports`)
    } catch (err: any) {
      console.error('Error initializing map:', err)
      setError('Erro ao inicializar o mapa: ' + err.message)
    }
  }

  const getMarkerIconUrl = (status: string) => {
    const color = getStatusColor(status)
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2C11.04 2 7 6.04 7 11c0 7.5 9 19 9 19s9-11.5 9-19c0-4.96-4.04-9-9-9z" fill="${color}" stroke="#fff" stroke-width="2"/>
        <circle cx="16" cy="11" r="4" fill="#fff"/>
      </svg>
    `)}`
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return '#f59e0b'
      case 'em_progresso':
        return '#3b82f6'
      case 'resolvido':
        return '#10b981'
      default:
        return '#6b7280'
    }
  }

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return 'Pendente'
      case 'em_progresso':
        return 'Em Progresso'
      case 'resolvido':
        return 'Resolvido'
      default:
        return status
    }
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center p-8">
          <div className="text-red-600 mb-2">⚠️</div>
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-700">Carregando Google Maps...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}
