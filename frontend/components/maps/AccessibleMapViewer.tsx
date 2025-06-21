'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  ZoomInIcon, 
  ZoomOutIcon, 
  NavigationIcon, 
  ListIcon,
  InfoIcon,
  MapPinIcon,
  SearchIcon
} from 'lucide-react'
import { AccessibleStatusBadge } from '@/components/ui/AccessibleStatusBadge'

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

interface AccessibleMapViewerProps {
  reports: Report[]
  selectedReport: Report | null
  onReportSelect: (report: Report | null) => void
  viewMode: 'map' | 'list'
  searchTerm: string
}

export function AccessibleMapViewer({
  reports,
  selectedReport,
  onReportSelect,
  viewMode,
  searchTerm
}: AccessibleMapViewerProps) {
  const [zoomLevel, setZoomLevel] = useState(13)
  const [focusedReportIndex, setFocusedReportIndex] = useState(-1)
  const mapRef = useRef<HTMLDivElement>(null)

  // Filter reports based on search
  const filteredReports = reports.filter(report => 
    searchTerm === '' || 
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleKeyNavigation = (event: React.KeyboardEvent) => {
    if (viewMode !== 'map') return

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault()
        const direction = event.key === 'ArrowUp' ? -1 : 1
        const newIndex = Math.max(0, Math.min(filteredReports.length - 1, focusedReportIndex + direction))
        setFocusedReportIndex(newIndex)
        if (filteredReports[newIndex]) {
          onReportSelect(filteredReports[newIndex])
        }
        break
      case 'Enter':
        if (focusedReportIndex >= 0 && filteredReports[focusedReportIndex]) {
          // Navigate to report details
          window.location.href = `/reports/${filteredReports[focusedReportIndex].id}`
        }
        break
      case 'Escape':
        onReportSelect(null)
        setFocusedReportIndex(-1)
        break
      case '+':
      case '=':
        event.preventDefault()
        setZoomLevel(prev => Math.min(20, prev + 1))
        break
      case '-':
      case '_':
        event.preventDefault()
        setZoomLevel(prev => Math.max(8, prev - 1))
        break
    }
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <ListIcon className="w-5 h-5 mr-2 text-gray-600" />
            📋 Lista de Denúncias ({filteredReports.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {filteredReports.length > 0 ? (
            filteredReports.map((report, index) => (
              <button
                key={report.id}
                onClick={() => onReportSelect(report)}
                className={`w-full p-4 text-left hover:bg-gray-50 focus:bg-blue-50 focus:ring-2 focus:ring-blue-300 transition-colors ${
                  selectedReport?.id === report.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                aria-label={`Denúncia: ${report.title} - ${report.category} - Status: ${report.status}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {report.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      🏷️ {report.category} • 📍 {report.location}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {report.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      📅 {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="ml-4">
                    <AccessibleStatusBadge status={report.status} size="sm" />
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center">
              <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                📋 Nenhuma denúncia encontrada
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 
                  `Não encontramos denúncias para "${searchTerm}". Tente outros termos.` :
                  'Não há denúncias disponíveis no momento.'
                }
              </p>
            </div>
          )}
        </div>
        
        {selectedReport && (
          <div className="p-4 bg-blue-50 border-t border-blue-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-blue-900">{selectedReport.title}</h4>
                <p className="text-sm text-blue-800 mt-1">{selectedReport.description}</p>
                <div className="flex items-center mt-2 space-x-3">
                  <AccessibleStatusBadge status={selectedReport.status} size="sm" />
                  <span className="text-xs text-blue-600">
                    📍 {selectedReport.location}
                  </span>
                </div>
              </div>
              <button
                onClick={() => window.location.href = `/reports/${selectedReport.id}`}
                className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300"
              >
                Ver Detalhes
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Map Controls */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <MapPinIcon className="w-5 h-5 mr-2 text-gray-600" />
              🗺️ Mapa Interativo
            </h3>
            <div className="text-sm text-gray-600">
              📊 {filteredReports.length} denúncias visíveis
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setZoomLevel(prev => Math.min(20, prev + 1))}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-300"
              aria-label="Aumentar zoom"
              title="Zoom In (+)"
            >
              <ZoomInIcon className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 min-w-[3rem] text-center">
              {zoomLevel}x
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.max(8, prev - 1))}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-300"
              aria-label="Diminuir zoom"
              title="Zoom Out (-)"
            >
              <ZoomOutIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Keyboard Instructions */}
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <InfoIcon className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800">
              <strong>♿ Navegação por teclado:</strong> 
              ↑↓ para navegar denúncias • Enter para ver detalhes • +/- para zoom • Esc para limpar seleção
            </div>
          </div>
        </div>
      </div>

      {/* Map Area - Simplified for accessibility */}
      <div
        ref={mapRef}
        className="relative h-96 bg-gray-100 focus:ring-2 focus:ring-blue-300 focus:outline-none"
        tabIndex={0}
        onKeyDown={handleKeyNavigation}
        role="application"
        aria-label="Mapa interativo de denúncias. Use as setas para navegar entre denúncias, Enter para ver detalhes."
      >
        {/* Simplified map representation */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
          <div className="text-center">
            <NavigationIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">🗺️ Mapa Simplificado</h4>
            <p className="text-sm text-gray-500 max-w-md">
              Representação simplificada para melhor acessibilidade. 
              Use a vista em lista para navegar facilmente pelas denúncias.
            </p>
          </div>
        </div>

        {/* Report Markers */}
        {filteredReports.map((report, index) => (
          <button
            key={report.id}
            onClick={() => onReportSelect(report)}
            className={`absolute w-8 h-8 rounded-full border-2 border-white shadow-lg transition-all focus:ring-2 focus:ring-blue-300 ${
              selectedReport?.id === report.id
                ? 'bg-blue-600 scale-125 z-10'
                : focusedReportIndex === index
                ? 'bg-yellow-500 scale-110 z-10'
                : 'bg-red-500 hover:scale-110'
            }`}
            style={{
              left: `${20 + (index % 6) * 60}px`,
              top: `${50 + Math.floor(index / 6) * 60}px`
            }}
            aria-label={`Denúncia ${index + 1}: ${report.title} - ${report.category}`}
            title={report.title}
          >
            <span className="sr-only">{report.title}</span>
          </button>
        ))}

        {/* Selected Report Info */}
        {selectedReport && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{selectedReport.title}</h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{selectedReport.description}</p>
                <div className="flex items-center mt-2 space-x-3">
                  <AccessibleStatusBadge status={selectedReport.status} size="sm" />
                  <span className="text-xs text-gray-500">📍 {selectedReport.location}</span>
                </div>
              </div>
              <div className="ml-4 flex space-x-2">
                <button
                  onClick={() => onReportSelect(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-gray-300 rounded"
                  aria-label="Fechar detalhes"
                >
                  ×
                </button>
                <button
                  onClick={() => window.location.href = `/reports/${selectedReport.id}`}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300"
                >
                  Ver Detalhes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
