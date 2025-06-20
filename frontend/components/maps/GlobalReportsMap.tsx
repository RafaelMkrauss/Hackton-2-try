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

interface GlobalReportsMapProps {
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
}: GlobalReportsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState('Aguardando Google Maps...')

  useEffect(() => {
    let isMounted = true
    let checkCount = 0

    const checkGoogleMaps = () => {
      checkCount++
      setLoadingMessage(`Verificando Google Maps... (${checkCount}/50)`)

      if ((window as any).google?.maps?.Map) {
        console.log('Google Maps encontrado globalmente!')
        if (isMounted) {
          initializeMap()
        }
        return true
      }
      
      if (checkCount >= 50) { // 5 seconds
        if (isMounted) {
          setError('Google Maps não carregou após 5 segundos.\n\nPossíveis causas:\n• Billing não habilitado\n• API Key inválida\n• Restrições de domínio\n• Conexão lenta')
          setLoadingMessage('Timeout')
        }
        return true
      }
      
      return false
    }

    const initializeMap = () => {
      if (!mapRef.current) {
        setError('Container do mapa não encontrado')
        return
      }

      try {
        console.log('Inicializando mapa com Google Maps global...')
        
        const map = new (window as any).google.maps.Map(mapRef.current, {
          center: { lat: -23.5505, lng: -46.6333 }, // São Paulo
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
        
        if (isMounted) {
          setIsLoaded(true)
          setError(null)
          setLoadingMessage('Mapa carregado!')
        }
        
        console.log('Mapa inicializado com sucesso!')
        updateMarkers()

      } catch (error) {
        console.error('Erro ao inicializar mapa:', error)
        if (isMounted) {
          setError(`Erro ao inicializar mapa: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
    }

    const updateMarkers = () => {
      if (!mapInstance.current || !(window as any).google?.maps) return

      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null))
      markersRef.current = []

      // Add new markers for each report
      reports.forEach(report => {
        if (report.latitude && report.longitude) {
          const marker = new (window as any).google.maps.Marker({
            position: { lat: report.latitude, lng: report.longitude },
            map: mapInstance.current,
            title: report.title,
            icon: {
              url: getMarkerIcon(report.status),
              scaledSize: new (window as any).google.maps.Size(40, 40),
              anchor: new (window as any).google.maps.Point(20, 40)
            }
          })

          const infoWindow = new (window as any).google.maps.InfoWindow({
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
      if (reports.length > 0 && mapInstance.current) {
        const bounds = new (window as any).google.maps.LatLngBounds()
        reports.forEach(report => {
          if (report.latitude && report.longitude) {
            bounds.extend({ lat: report.latitude, lng: report.longitude })
          }
        })
        
        if (!bounds.isEmpty()) {
          mapInstance.current.fitBounds(bounds)
          
          // Ensure minimum zoom level
          const listener = (window as any).google.maps.event.addListenerOnce(mapInstance.current, 'bounds_changed', () => {
            const currentZoom = mapInstance.current?.getZoom?.()
            if (mapInstance.current && currentZoom && currentZoom > 15) {
              mapInstance.current.setZoom(15)
            }
          })
        }
      }
    }

    // Check for Google Maps immediately and then every 100ms
    if (!checkGoogleMaps()) {
      const interval = setInterval(() => {
        if (checkGoogleMaps()) {
          clearInterval(interval)
        }
      }, 100)

      return () => {
        isMounted = false
        clearInterval(interval)
      }
    }

    return () => {
      isMounted = false
    }
  }, [])

  // Update markers when reports change
  useEffect(() => {
    if (isLoaded && mapInstance.current) {
      const updateMarkers = () => {
        if (!mapInstance.current || !(window as any).google?.maps) return

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null))
        markersRef.current = []

        // Add new markers for each report
        reports.forEach(report => {
          if (report.latitude && report.longitude) {
            const marker = new (window as any).google.maps.Marker({
              position: { lat: report.latitude, lng: report.longitude },
              map: mapInstance.current,
              title: report.title,
              icon: {
                url: getMarkerIcon(report.status),
                scaledSize: new (window as any).google.maps.Size(40, 40),
                anchor: new (window as any).google.maps.Point(20, 40)
              }
            })

            const infoWindow = new (window as any).google.maps.InfoWindow({
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
      }

      updateMarkers()
    }
  }, [reports, isLoaded])

  const getMarkerIcon = (status: string) => {
    const iconMap: { [key: string]: string } = {
      'PENDENTE': '🔴',
      'EM_ANALISE': '🟡', 
      'RESOLVIDO': '🟢',
      'REJEITADO': '⚫'
    }
    
    // Convert emoji to data URL for marker icon
    const emoji = iconMap[status] || '📍'
    const canvas = document.createElement('canvas')
    canvas.width = 40
    canvas.height = 40
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.font = '30px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(emoji, 20, 30)
    }
    return canvas.toDataURL()
  }

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'PENDENTE': '#ef4444',
      'EM_ANALISE': '#eab308',
      'RESOLVIDO': '#22c55e',
      'REJEITADO': '#6b7280'
    }
    return colorMap[status] || '#6b7280'
  }

  return (
    <div className="relative">
      <div ref={mapRef} className={className} />
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg border-2 border-red-200">
          <div className="text-center p-4 max-w-md">
            <div className="text-red-600 text-lg font-semibold mb-2">⚠️ Erro no Mapa</div>
            <div className="text-red-700 text-sm whitespace-pre-line mb-4">{error}</div>
            <div className="space-y-2">
              <button 
                onClick={() => window.location.reload()} 
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                🔄 Recarregar Página
              </button>
              <a 
                href="/html-vs-react-comparison.html" 
                target="_blank"
                className="block w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
              >
                🔧 Diagnóstico Completo
              </a>
            </div>
          </div>
        </div>
      )}
      
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-gray-200">
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <div className="text-gray-700 font-medium">{loadingMessage}</div>
            <div className="text-gray-500 text-sm mt-1">
              Google Maps carregado globalmente via Next.js Script
            </div>
            <div className="text-gray-400 text-xs mt-2">
              Se demorar, verifique Google Cloud Console
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

      {/* Real-time Debug Info */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded max-w-xs">
        <div>Status: {isLoaded ? '✅ Carregado' : '⏳ Carregando'}</div>
        <div>Google: {(window as any).google ? '✅' : '❌'}</div>
        <div>Maps: {(window as any).google?.maps ? '✅' : '❌'}</div>
        <div>Script Global: ✅</div>
        <div>Relatórios: {reports.length}</div>
        {error && <div className="text-red-300">Erro: ❌</div>}
      </div>
    </div>
  )
}
