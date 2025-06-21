'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { ReportsMap } from '@/components/maps/ReportsMap'
import { TestMap } from '@/components/maps/TestMap'
import { SimpleMap } from '@/components/maps/SimpleMap'
import { GlobalReportsMap } from '@/components/maps/CleanReportsMap'
import { GoogleMapsDebugger } from '@/components/maps/GoogleMapsDebugger'
import { SimpleTestMap } from '@/components/maps/SimpleTestMap'
import { 
  MapPinIcon, 
  FilterIcon, 
  LayersIcon,
  RefreshCwIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  EyeIcon,
  SearchIcon,
  InfoIcon,
  ListIcon,
  NavigationIcon,
  ZoomInIcon,
  ZoomOutIcon
} from 'lucide-react'
import { AccessibleStatusBadge } from '@/components/ui/AccessibleStatusBadge'
import { AccessibleMapViewer } from '@/components/maps/AccessibleMapViewer'

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

export default function MapPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    category: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false)

  const categories = [
    'Infraestrutura',
    'Limpeza Urbana',
    'Iluminação',
    'Segurança',
    'Transporte',
    'Meio Ambiente',
    'Outros'
  ]

  const statuses = [
    { value: 'PENDENTE', label: 'Pendente', color: '#f59e0b' },
    { value: 'EM_PROGRESSO', label: 'Em Progresso', color: '#3b82f6' },
    { value: 'RESOLVIDO', label: 'Resolvido', color: '#10b981' }
  ]

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchReports()
    }
  }, [user, loading, router])

  useEffect(() => {
    // Apply filters
    let filtered = reports
    
    if (filters.status) {
      filtered = filtered.filter(report => report.status === filters.status)
    }
    
    if (filters.category) {
      filtered = filtered.filter(report => report.category === filters.category)
    }
    
    setFilteredReports(filtered)
  }, [reports, filters])

  const fetchReports = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/reports?hasLocation=true&limit=1000')
      const reportsData = response.data.reports || response.data
      const reportsWithLocation = reportsData.filter((report: Report) => 
        report.latitude && report.longitude
      )
      setReports(reportsWithLocation)
    } catch (error) {
      console.error('Erro ao carregar denúncias:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const statusConfig = statuses.find(s => s.value === status)
    return statusConfig?.color || '#6b7280'
  }
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendente':
        return <ClockIcon className="w-4 h-4" />
      case 'em_progresso':
        return <AlertTriangleIcon className="w-4 h-4" />
      case 'resolvido':
        return <CheckCircleIcon className="w-4 h-4" />
      default:
        return <ClockIcon className="w-4 h-4" />
    }
  }
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Early return for loading state
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">🗺️ Carregando mapa de denúncias...</p>
          <p className="text-gray-500 text-sm mt-2">Aguarde enquanto carregamos as informações</p>
        </div>
      </div>
    )
  }
  // Main component render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <MapPinIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mapa de Denúncias</h1>
                <p className="text-gray-600">🗺️ Visualize problemas urbanos na sua região</p>
              </div>
            </div>
            
            {/* View Toggle and Accessibility */}
            <div className="flex items-center space-x-3">
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-300 ${
                    viewMode === 'map'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label="Visualizar em modo mapa"
                  aria-pressed={viewMode === 'map'}
                >
                  <MapPinIcon className="w-4 h-4 mr-1 inline" />
                  🗺️ Mapa
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-300 ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label="Visualizar em modo lista"
                  aria-pressed={viewMode === 'list'}
                >
                  <ListIcon className="w-4 h-4 mr-1 inline" />
                  📋 Lista
                </button>
              </div>
                <button
                onClick={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-300 transition-colors"
                aria-label="Painel de acessibilidade"
                aria-expanded={showAccessibilityPanel}
              >
                <EyeIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center mb-4">
              <FilterIcon className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="font-medium text-gray-900">Filtros</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos os status</option>
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center mb-4">
              <LayersIcon className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="font-medium text-gray-900">Legendas</h3>
            </div>
            
            <div className="space-y-2">
              {statuses.map((status) => (
                <div key={status.value} className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <span className="text-sm text-gray-700">{status.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reports List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-4">
                Denúncias ({filteredReports.length})
              </h3>
              
              <div className="space-y-3">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedReport?.id === report.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {report.title}
                      </h4>
                      <div 
                        className="w-3 h-3 rounded-full ml-2 flex-shrink-0"
                        style={{ backgroundColor: getStatusColor(report.status) }}
                        title={report.status}
                      ></div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {report.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{report.category}</span>
                      <span>{new Date(report.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
                
                {filteredReports.length === 0 && (
                  <div className="text-center py-8">
                    <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      Nenhuma denúncia encontrada com os filtros aplicados
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>        {/* Map Container */}
        <div className="flex-1 relative">          {/* Working Map - This should actually work! */}
          <SimpleTestMap />{/* Test Components (overlay for debugging) */}
          <div className="absolute top-4 left-4 right-4 z-10 space-y-4 max-w-md">
            <GoogleMapsDebugger />
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h3 className="font-medium mb-2">🧪 Teste com @react-google-maps/api</h3>
              <TestMap />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h3 className="font-medium mb-2">🗺️ Teste SimpleMap (implementação direta)</h3>
              <SimpleMap className="w-full h-32" />
            </div>
          </div>

          {/* Selected Report Popup */}
          {selectedReport && (
            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-md">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-gray-900">{selectedReport.title}</h4>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {selectedReport.description}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium`}>
                  {getStatusIcon(selectedReport.status)}
                  <span className="ml-1">{selectedReport.status.replace('_', ' ')}</span>
                </span>
                
                <button
                  onClick={() => router.push(`/reports/${selectedReport.id}`)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Ver detalhes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
