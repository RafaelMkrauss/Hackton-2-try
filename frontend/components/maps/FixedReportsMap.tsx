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

interface FixedReportsMapProps {
  reports: Report[]
  selectedReport: Report | null
  onReportSelect: (report: Report | null) => void
  className?: string
}

export function FixedReportsMap({ 
  reports, 
  selectedReport, 
  onReportSelect,
  className = "w-full h-96"
}: FixedReportsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapState, setMapState] = useState<{
    isLoaded: boolean
    error: string | null
    message: string
  }>({
    isLoaded: false,
    error: null,
    message: 'Carregando...'
  })

  useEffect(() => {
    let isMounted = true
    let mapInstance: any = null
    let markers: any[] = []

    const log = (message: string) => {
      console.log(`[FixedReportsMap] ${message}`)
      if (isMounted) {
        setMapState(prev => ({ ...prev, message }))
      }
    }

    const setError = (error: string) => {
      console.error(`[FixedReportsMap] ${error}`)
      if (isMounted) {
        setMapState(prev => ({ ...prev, error, message: 'Erro' }))
      }
    }

    const initMap = () => {
      if (!mapRef.current) {
        setError('Container do mapa não encontrado')
        return
      }

      if (!(window as any).google?.maps) {
        setError('Google Maps não está disponível')
        return
      }

      try {
        log('Criando instância do mapa...')
        
        const map = new (window as any).google.maps.Map(mapRef.current, {
          center: { lat: -15.7942, lng: -47.8822 }, // Brasília
          zoom: 12,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true
        })

        mapInstance = map
        
        if (isMounted) {
          setMapState({
            isLoaded: true,
            error: null,
            message: 'Mapa carregado com sucesso!'
          })
        }

        log('Mapa inicializado com sucesso!')

        // Add markers for reports
        addMarkersToMap()

      } catch (error) {
        setError(`Erro ao criar mapa: ${error}`)
      }
    }

    const addMarkersToMap = () => {
      if (!mapInstance || !(window as any).google?.maps) return

      // Clear existing markers
      markers.forEach(marker => marker.setMap(null))
      markers = []

      // Add markers for each report
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
    }

    const loadGoogleMaps = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      
      if (!apiKey) {
        setError('API Key não encontrada')
        return
      }

      log('Verificando Google Maps...')

      // Check if already loaded
      if ((window as any).google?.maps) {
        log('Google Maps já está carregado!')
        initMap()
        return
      }

      log('Carregando Google Maps...')

      try {
        // Check if script already exists
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
        if (existingScript) {
          log('Script já existe, aguardando carregar...')
          
          // Wait for it to load
          let attempts = 0
          const checkInterval = setInterval(() => {
            attempts++
            if ((window as any).google?.maps) {
              clearInterval(checkInterval)
              log('Google Maps carregado via script existente!')
              initMap()
            } else if (attempts > 100) { // 10 seconds
              clearInterval(checkInterval)
              setError('Timeout aguardando Google Maps carregar')
            }
          }, 100)
          return
        }

        // Create new script
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=pt-BR&region=BR`
        script.async = true
        script.defer = true

        script.onload = () => {
          log('Script carregado, verificando API...')
          setTimeout(() => {
            if ((window as any).google?.maps) {
              log('Google Maps API disponível!')
              initMap()
            } else {
              setError('Google Maps API não disponível após carregar script')
            }
          }, 500) // Give it a bit more time
        }

        script.onerror = () => {
          setError('Falha ao carregar script do Google Maps')
        }

        document.head.appendChild(script)

      } catch (error) {
        setError(`Erro carregando Google Maps: ${error}`)
      }
    }

    // Start loading
    loadGoogleMaps()

    return () => {
      isMounted = false
      // Clean up markers
      markers.forEach(marker => marker.setMap(null))
    }
  }, [])

  // Update markers when reports change
  useEffect(() => {
    if (mapState.isLoaded) {
      // Re-add markers when reports change
      // This would need to be implemented similar to above
    }
  }, [reports, mapState.isLoaded])

  return (
    <div className="relative">
      <div ref={mapRef} className={className} />
      
      {mapState.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg border-2 border-red-200">
          <div className="text-center p-4 max-w-md">
            <div className="text-red-600 text-lg font-semibold mb-2">⚠️ Erro no Mapa</div>
            <div className="text-red-700 text-sm mb-4">{mapState.error}</div>
            <div className="space-y-2">
              <button 
                onClick={() => window.location.reload()} 
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                🔄 Recarregar
              </button>
              <a 
                href="/multi-computer-diagnosis.html" 
                target="_blank"
                className="block w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
              >
                🔧 Diagnóstico
              </a>
            </div>
          </div>
        </div>
      )}
      
      {!mapState.isLoaded && !mapState.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-gray-200">
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <div className="text-gray-700 font-medium">{mapState.message}</div>
            <div className="text-gray-500 text-sm mt-2">
              Se o diagnóstico HTML funciona mas este não, pode ser um problema de React/Next.js
            </div>
          </div>
        </div>
      )}
      
      {mapState.isLoaded && reports.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
          <p className="text-white text-center">
            📍 Nenhum relatório encontrado<br />
            <span className="text-sm opacity-75">Crie um novo relatório para vê-lo no mapa</span>
          </p>
        </div>
      )}

      {/* Debug Info */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
        Status: {mapState.isLoaded ? '✅' : '⏳'} | Erro: {mapState.error ? '❌' : '✅'}
        <br />
        Google: {(window as any).google ? '✅' : '❌'} | Maps: {(window as any).google?.maps ? '✅' : '❌'}
      </div>
    </div>
  )
}
