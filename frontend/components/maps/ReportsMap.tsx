'use client'

import { useState, useCallback, useRef } from 'react'
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api'

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

interface ReportsMapProps {
  reports: Report[]
  selectedReport: Report | null
  onReportSelect: (report: Report | null) => void
  center?: { lat: number; lng: number }
  zoom?: number
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

const defaultCenter = {
  lat: -23.5505, // São Paulo coordinates as default
  lng: -46.6333
}

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  scaleControl: true,
  streetViewControl: true,
  rotateControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
}

export function ReportsMap({ 
  reports, 
  selectedReport, 
  onReportSelect, 
  center = defaultCenter, 
  zoom = 12 
}: ReportsMapProps) {
  const mapRef = useRef<google.maps.Map>()
  const [activeInfoWindow, setActiveInfoWindow] = useState<string | null>(null)

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const onMarkerClick = (report: Report) => {
    setActiveInfoWindow(report.id)
    onReportSelect(report)
  }

  const onInfoWindowClose = () => {
    setActiveInfoWindow(null)
    onReportSelect(null)
  }

  const getMarkerIcon = (status: string) => {
    const color = getStatusColor(status)
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}" stroke="#fff" stroke-width="2"/>
          <circle cx="12" cy="9" r="3" fill="#fff"/>
        </svg>
      `)}`,
      scaledSize: new google.maps.Size(32, 32),
      anchor: new google.maps.Point(16, 32)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
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

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={zoom}
      options={mapOptions}
      onLoad={onMapLoad}
    >
      {reports.map((report) => (
        <Marker
          key={report.id}
          position={{
            lat: report.latitude,
            lng: report.longitude
          }}
          icon={getMarkerIcon(report.status)}
          onClick={() => onMarkerClick(report)}
          title={report.title}
        >
          {activeInfoWindow === report.id && (
            <InfoWindow
              position={{
                lat: report.latitude,
                lng: report.longitude
              }}
              onCloseClick={onInfoWindowClose}
            >
              <div className="max-w-xs p-2">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                  {report.title}
                </h3>
                
                <p className="text-gray-600 text-xs mb-3 line-clamp-3">
                  {report.description}
                </p>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Status:</span>
                    <span 
                      className="px-2 py-1 rounded-full text-white font-medium"
                      style={{ backgroundColor: getStatusColor(report.status) }}
                    >
                      {getStatusText(report.status)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Categoria:</span>
                    <span className="text-gray-700">{report.category}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Data:</span>
                    <span className="text-gray-700">{formatDate(report.createdAt)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Autor:</span>
                    <span className="text-gray-700">{report.author.name}</span>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <a
                      href={`/reports/${report.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver detalhes →
                    </a>
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </Marker>
      ))}
    </GoogleMap>
  )
}
