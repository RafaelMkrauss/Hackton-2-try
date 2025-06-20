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

interface SimpleReportsMapProps {
  reports: Report[]
  selectedReport: Report | null
  onReportSelect: (report: Report | null) => void
  className?: string
}

export function SimpleReportsMap({ 
  reports, 
  selectedReport, 
  onReportSelect,
  className = "w-full h-96"
}: SimpleReportsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState('Carregando Google Maps...')

  useEffect(() => {
    let isMounted = true
    
    const initializeGoogleMaps = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      
      if (!apiKey) {
        if (isMounted) {
          setError('API Key não encontrada')
          setLoadingMessage('Erro: API Key não configurada')
        }
        return
      }      // Add global error handler
      (window as any).gm_authFailure = function() {
        console.error('Google Maps authentication failed!')
        if (isMounted) {
          setError('Falha na autenticação do Google Maps.\n\nVerifique:\n• Billing habilitado no Google Cloud\n• APIs habilitadas (Maps JavaScript API, Places API)\n• Restrições de domínio configuradas\n• API Key válida')
          setLoadingMessage('Erro de autenticação')
        }
      }

      // Check if already loaded
      if ((window as any).google?.maps?.Map) {
        console.log('Google Maps already available')
        if (isMounted) {
          setLoadingMessage('Inicializando mapa...')
          await initializeMap()
        }
        return
      }

      if (isMounted) {
        setLoadingMessage('Carregando Google Maps API...')
      }

      try {
        // Load the script without callback
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=pt-BR&region=BR`
        script.async = true
        script.defer = true

        const loadPromise = new Promise<void>((resolve, reject) => {
          script.onload = () => {
            console.log('Google Maps script loaded')
            // Wait a bit for Google Maps to initialize          setTimeout(() => {
            if ((window as any).google?.maps?.Map) {
              console.log('Google Maps API ready')
              resolve()
            } else {
              reject(new Error('Google Maps API not available after script load'))
            }
          }, 100)
          }
          
          script.onerror = () => {
            reject(new Error('Failed to load Google Maps script'))
          }
        })

        // Only add script if not already present
        const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`)
        if (!existingScript) {
          document.head.appendChild(script)
        }

        // Wait for script to load or timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout loading Google Maps')), 10000)
        })

        await Promise.race([loadPromise, timeoutPromise])

        if (isMounted) {
          setLoadingMessage('Google Maps carregado, inicializando...')
          await initializeMap()
        }

      } catch (error) {
        console.error('Error loading Google Maps:', error)
        if (isMounted) {
          setError(`Erro ao carregar Google Maps: ${error instanceof Error ? error.message : String(error)}\n\nPossíveis soluções:\n• Verificar conexão com internet\n• Habilitar billing no Google Cloud Console\n• Remover restrições de domínio temporariamente`)
          setLoadingMessage('Erro ao carregar')
        }
      }
    }

    const initializeMap = async () => {
      if (!mapRef.current || !window.google?.maps?.Map) {
        console.error('Map container or Google Maps not available')
        return
      }

      try {
        console.log('Initializing Google Map...')
        
        const map = new google.maps.Map(mapRef.current, {
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
          setLoadingMessage('')
        }
        
        console.log('Google Map initialized successfully')

        // Add markers for reports
        updateMarkers()

      } catch (error) {
        console.error('Error initializing map:', error)
        if (isMounted) {
          setError(`Erro ao inicializar mapa: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
    }

    const updateMarkers = () => {
      if (!mapInstance.current || !window.google?.maps) return

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
        
        if (mapInstance.current && !bounds.isEmpty()) {
          mapInstance.current.fitBounds(bounds)          // Ensure minimum zoom level
          const listener = google.maps.event.addListenerOnce(mapInstance.current, 'bounds_changed', () => {
            const currentZoom = mapInstance.current?.getZoom()
            if (mapInstance.current && currentZoom && currentZoom > 15) {
              mapInstance.current.setZoom(15)
            }
          })
        }
      }
    }

    // Start the initialization
    initializeGoogleMaps()

    return () => {
      isMounted = false
      if (window.gm_authFailure) {
        delete window.gm_authFailure
      }
    }
  }, [])

  // Update markers when reports change
  useEffect(() => {
    if (isLoaded && mapInstance.current) {
      const updateMarkers = () => {
        if (!mapInstance.current || !window.google?.maps) return

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
                href="/multi-computer-diagnosis.html" 
                target="_blank"
                className="block w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
              >
                🔧 Abrir Diagnóstico
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
              Se demorar muito, verifique as configurações do Google Cloud Console
            </div>
            <div className="text-gray-400 text-xs mt-2">
              <a href="/multi-computer-diagnosis.html" target="_blank" className="underline">
                🔧 Abrir diagnóstico completo
              </a>
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
    </div>
  )
}
