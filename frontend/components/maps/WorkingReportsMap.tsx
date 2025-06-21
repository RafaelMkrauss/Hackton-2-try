'use client'

import { useEffect, useRef, useState } from 'react'

// Extend Window interface for Google Maps callbacks
declare global {
  interface Window {
    google?: any
    initWorkingMap?: () => void
    gm_authFailure?: () => void
  }
}

interface Report {
  id: string
  title: string
  description: string
  status: string
  category: string
  location: string
  latitude: number
  longitude: number
  createdAt: string
  author: {
    name: string
  }
}

interface WorkingReportsMapProps {
  reports: Report[]
  selectedReport: Report | null
  onReportSelect: (report: Report | null) => void
  className?: string
}

export function WorkingReportsMap({ 
  reports, 
  selectedReport, 
  onReportSelect,
  className = "w-full h-96"
}: WorkingReportsMapProps) {  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
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
      console.log('Google Maps already loaded, initializing map...')
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
    }    // Load Google Maps script
    console.log('Loading Google Maps script...')
    setLoadingMessage('Carregando script do Google Maps...')
      // Create global callback BEFORE creating the script
    const callbackName = `initWorkingMap_${Date.now()}`
    ;(window as any)[callbackName] = () => {
      console.log('Google Maps loaded successfully for WorkingReportsMap')
      setLoadingMessage('Script carregado, inicializando mapa...')
      initializeMap()
      // Clean up the callback
      delete (window as any)[callbackName]
    }
    
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=pt-BR&region=BR&callback=${callbackName}`
    script.async = true
    script.defer = true

    script.onerror = () => {
      console.error('Failed to load Google Maps script')
      setError('Falha ao carregar Google Maps. Verifique:\n1. Conexão com internet\n2. API Key válida\n3. Billing habilitado\n4. Restrições de domínio')
      setLoadingMessage('Erro ao carregar script')
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (window.gm_authFailure) {
        delete window.gm_authFailure
      }
    }
  }, [])
  const initializeMap = () => {
    if (!mapRef.current || mapInstance.current) return

    // Double-check that Google Maps is actually available
    if (!window.google?.maps?.Map) {
      console.error('Google Maps not available when trying to initialize')
      setError('Google Maps não está disponível')
      return
    }

    try {
      console.log('Initializing WorkingReportsMap...')
      
      // Create map centered on São Paulo
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: -15.7942, lng: -47.8822 }, // Brasília
        zoom: 12,
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
      setError(null)
      console.log('WorkingReportsMap initialized successfully')

      // Add reports as markers
      updateMarkers()

    } catch (error) {
      console.error('Error initializing WorkingReportsMap:', error)
      setError(`Erro ao inicializar mapa: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const updateMarkers = () => {
    if (!mapInstance.current || !isLoaded) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Add new markers for each report
    reports.forEach(report => {
      if (report.latitude && report.longitude) {
        const marker = new google.maps.Marker({
          position: { lat: report.latitude, lng: report.longitude },
          map: mapInstance.current,
          title: report.title,
          icon: {
            url: getMarkerIcon(report.status),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 40)
          }
        })

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; max-width: 300px;">
              <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">${report.title}</h3>
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">${report.description}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #9ca3af;">
                <span>Status: <strong style="color: ${getStatusColor(report.status)}">${report.status}</strong></span>
                <span>Por: ${report.author.name}</span>
              </div>
            </div>
          `
        })

        marker.addListener('click', () => {
          // Close any open info windows
          markersRef.current.forEach(m => {
            const iw = (m as any).infoWindow
            if (iw) iw.close()
          })
          
          infoWindow.open(mapInstance.current, marker)
          onReportSelect(report)
        })

        // Store reference to info window
        ;(marker as any).infoWindow = infoWindow
        markersRef.current.push(marker)
      }
    })

    // If there are reports, adjust map bounds to fit all markers
    if (reports.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      reports.forEach(report => {
        if (report.latitude && report.longitude) {
          bounds.extend({ lat: report.latitude, lng: report.longitude })
        }
      })
      mapInstance.current?.fitBounds(bounds)
    }
  }

  // Update markers when reports change
  useEffect(() => {
    updateMarkers()
  }, [reports, isLoaded])

  // Highlight selected report
  useEffect(() => {
    if (!selectedReport || !isLoaded) return

    markersRef.current.forEach(marker => {
      const position = marker.getPosition()
      if (position && 
          position.lat() === selectedReport.latitude && 
          position.lng() === selectedReport.longitude) {
        
        // Open info window for selected report
        const infoWindow = (marker as any).infoWindow
        if (infoWindow) {
          infoWindow.open(mapInstance.current, marker)
        }
        
        // Center map on selected marker
        mapInstance.current?.panTo(position)
      }
    })
  }, [selectedReport, isLoaded])

  const getMarkerIcon = (status: string): string => {
    const color = getStatusColor(status)
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="${color}" stroke="#ffffff" stroke-width="3"/>
        <circle cx="20" cy="20" r="8" fill="#ffffff"/>
        <text x="20" y="25" text-anchor="middle" fill="${color}" font-family="Arial" font-size="12" font-weight="bold">!</text>
      </svg>
    `)}`
  }

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'aberto':
        return '#ef4444' // red
      case 'em andamento':
        return '#f59e0b' // amber
      case 'resolvido':
        return '#10b981' // green
      default:
        return '#6b7280' // gray
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
          <p className="text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="relative">
      <div ref={mapRef} className={className} />
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg border-2 border-red-200">
          <div className="text-center p-4">
            <div className="text-red-600 text-lg font-semibold mb-2">⚠️ Erro no Mapa</div>
            <div className="text-red-700 text-sm whitespace-pre-line">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      )}
      
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-gray-200">
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <div className="text-gray-700 font-medium">{loadingMessage}</div>
            <div className="text-gray-500 text-sm mt-1">
              Se demorar muito, verifique as configurações do Google Cloud Console
            </div>
          </div>
        </div>
      )}
      
      {isLoaded && reports.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
          <p className="text-white text-center">
            📍 Nenhum relatório encontrado<br />
            <span className="text-sm opacity-75">Crie um novo relatório para vê-lo no mapa</span>
          </p>
        </div>
      )}
    </div>  )
}
