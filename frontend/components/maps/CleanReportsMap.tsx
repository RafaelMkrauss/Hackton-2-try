'use client'

import { useEffect, useRef, useState } from 'react'

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

interface WorkingMapProps {
  reports: Report[]
  selectedReport: Report | null
  onReportSelect: (report: Report | null) => void
  className?: string
}

export function GlobalReportsMap({ 
  reports, 
  selectedReport, 
  onReportSelect,
  className = "w-full h-96"
}: WorkingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapState, setMapState] = useState({
    isLoaded: false,
    error: null as string | null,
    message: 'Aguardando Google Maps...'
  })

  useEffect(() => {
    let mounted = true
    let mapInstance: any = null
    let markers: any[] = []

    const waitForGoogleMaps = () => {
      console.log('🔍 Verificando Google Maps...')
      
      if (!mounted) return

      // Check if Google Maps is available
      if ((window as any).google?.maps?.Map) {
        console.log('✅ Google Maps encontrado!')
        createMap()
        return
      }

      // Wait a bit more
      setMapState(prev => ({ ...prev, message: 'Aguardando Google Maps carregar...' }))
      setTimeout(waitForGoogleMaps, 200)
    }

    const createMap = () => {
      if (!mapRef.current || !mounted) return

      try {
        console.log('🗺️ Criando mapa...')

        // Ensure container has proper dimensions
        const container = mapRef.current
        container.style.width = '100%'
        container.style.height = '400px'
        container.style.minHeight = '400px'

        const map = new (window as any).google.maps.Map(container, {
          center: { lat: -23.5505, lng: -46.6333 },
          zoom: 12,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true
        })

        console.log('✅ Mapa criado:', map)
        mapInstance = map

        // Force resize after creation
        setTimeout(() => {
          if (map && (window as any).google?.maps?.event) {
            (window as any).google.maps.event.trigger(map, 'resize')
          }
        }, 100)

        if (mounted) {
          setMapState({
            isLoaded: true,
            error: null,
            message: 'Mapa carregado!'
          })
        }

        // Add markers for reports
        addMarkers()

      } catch (error) {
        console.error('❌ Erro ao criar mapa:', error)
        if (mounted) {
          setMapState(prev => ({
            ...prev,
            error: `Erro ao criar mapa: ${error}`,
            message: 'Erro'
          }))
        }
      }
    }

    const addMarkers = () => {
      if (!mapInstance || !reports.length) return

      console.log(`📍 Adicionando ${reports.length} marcadores...`)

      // Clear existing markers
      markers.forEach(marker => marker.setMap(null))
      markers = []

      reports.forEach(report => {
        if (report.latitude && report.longitude) {
          const marker = new (window as any).google.maps.Marker({
            position: { lat: report.latitude, lng: report.longitude },
            map: mapInstance,
            title: report.title
          })

          const infoWindow = new (window as any).google.maps.InfoWindow({
            content: `
              <div style="padding: 12px; max-width: 300px;">
                <h3 style="margin: 0 0 8px 0; color: #1f2937;">${report.title}</h3>
                <p style="margin: 0 0 8px 0; color: #6b7280;">${report.description}</p>
                <div style="font-size: 12px; color: #9ca3af;">
                  <span>Status: <strong>${report.status}</strong></span><br>
                  <span>Por: ${report.author.name}</span>
                </div>
              </div>
            `
          })

          marker.addListener('click', () => {
            infoWindow.open(mapInstance, marker)
            onReportSelect(report)
          })

          markers.push(marker)
        }
      })

      console.log(`✅ ${markers.length} marcadores adicionados`)
    }

    // Start the process
    waitForGoogleMaps()

    return () => {
      mounted = false
      markers.forEach(marker => marker.setMap(null))
    }
  }, [])

  // Update markers when reports change
  useEffect(() => {
    if (mapState.isLoaded) {
      console.log('🔄 Atualizando marcadores...')
      // Would re-add markers here
    }
  }, [reports, mapState.isLoaded])

  return (
    <div className="relative">
      {/* Map Container */}
      <div 
        ref={mapRef}
        className={className}
        style={{
          width: '100%',
          height: '400px',
          minHeight: '400px',
          backgroundColor: '#f5f5f5',
          border: '1px solid #ccc',
          borderRadius: '8px'
        }}
      />
      
      {/* Error State */}
      {mapState.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg border-2 border-red-200">
          <div className="text-center p-4 max-w-md">
            <div className="text-red-600 text-lg font-semibold mb-2">⚠️ Erro no Mapa</div>
            <div className="text-red-700 text-sm mb-4">{mapState.error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              🔄 Recarregar
            </button>
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {!mapState.isLoaded && !mapState.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-gray-200">
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <div className="text-gray-700 font-medium">{mapState.message}</div>
            <div className="text-gray-500 text-sm mt-1">
              Google Maps carregado via Script global
            </div>
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {mapState.isLoaded && reports.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
          <p className="text-white text-center">
            📍 Nenhum relatório encontrado<br />
            <span className="text-sm opacity-75">Crie um novo relatório para vê-lo no mapa</span>
          </p>
        </div>
      )}

      {/* Debug Panel */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
        <div>Status: {mapState.isLoaded ? '✅ Carregado' : '⏳ Carregando'}</div>
        <div>Google: {(window as any).google ? '✅' : '❌'}</div>
        <div>Maps: {(window as any).google?.maps ? '✅' : '❌'}</div>
        <div>Script Global: ✅</div>
        <div>Relatórios: {reports.length}</div>
        <div>Container: {mapRef.current ? '✅' : '❌'}</div>
      </div>
    </div>
  )
}
