'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { GlobalReportsMap } from '@/components/maps/CleanReportsMap'
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
  HomeIcon,
  XIcon,
  MenuIcon
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      const response = await api.get('/reports/map')
      const reportsData = response.data || []
      const reportsWithLocation = reportsData.filter((report: Report) => 
        report.latitude && report.longitude
      )
      setReports(reportsWithLocation)
    } catch (error) {
      console.error('Erro ao carregar denúncias:', error)
      setReports([])
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
  }  // Main component render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors mr-2 sm:hidden"
                aria-label="Voltar ao dashboard"
              >
                <HomeIcon className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                <MapPinIcon className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Mapa de Denúncias</h1>
                <p className="text-sm sm:text-base text-gray-600 truncate">
                  🗺️ <span className="hidden sm:inline">Visualize problemas urbanos na sua região</span>
                  <span className="sm:hidden">Problemas urbanos</span>
                </p>
              </div>
            </div>
              {/* Mobile menu button and accessibility */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-300 transition-colors"
                aria-label="Opções de acessibilidade"
                title="Acessibilidade"
              >
                <EyeIcon className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-300 transition-colors lg:hidden"
                aria-label="Toggle sidebar"
              >
                <MenuIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Desktop controls */}
            <div className="hidden lg:flex items-center space-x-3">
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
                title="Opções de acessibilidade"
              >
                <EyeIcon className="w-5 h-5" />
              </button>
              
              <button
                onClick={fetchReports}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-300 transition-colors"
                aria-label="Atualizar denúncias"
                title="Atualizar mapa"
                disabled={isLoading}
              >
                <RefreshCwIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>      <div className="flex h-[calc(100vh-4rem)] relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:relative z-50 lg:z-auto
          w-80 sm:w-96 lg:w-80 xl:w-96 
          bg-white border-r border-gray-200 flex flex-col
          transition-transform duration-300 ease-in-out
          h-[calc(100vh-4rem)] lg:h-auto
        `}>
          {/* Mobile Close Button */}
          <div className="lg:hidden flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Filtros e Denúncias</h3>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              aria-label="Fechar sidebar"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar denúncias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Buscar denúncias"
              />
            </div>
          </div>
          
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
                  aria-label="Filtrar por status"
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
                  aria-label="Filtrar por categoria"
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
                    aria-hidden="true"
                  ></div>
                  <span className="text-sm text-gray-700">{status.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reports List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">
                  Denúncias ({filteredReports.length})
                </h3>
                {viewMode === 'list' && (
                  <button
                    onClick={() => setViewMode('map')}
                    className="lg:hidden text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Ver no mapa
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                {filteredReports
                  .filter(report => 
                    searchTerm === '' || 
                    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    report.category.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((report) => (
                  <div
                    key={report.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md focus:ring-2 focus:ring-blue-300 ${
                      selectedReport?.id === report.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedReport(report)
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false)
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Selecionar denúncia: ${report.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedReport(report)
                        if (window.innerWidth < 1024) {
                          setSidebarOpen(false)
                        }
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-2 flex-1 mr-2">
                        {report.title}
                      </h4>
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: getStatusColor(report.status) }}
                        title={report.status}
                        aria-label={`Status: ${report.status}`}
                      ></div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {report.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="truncate mr-2">{report.category}</span>
                      <span className="flex-shrink-0">{new Date(report.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
                
                {filteredReports.filter(report => 
                  searchTerm === '' || 
                  report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  report.category.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-8">
                    <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      {searchTerm ? 'Nenhuma denúncia encontrada para sua busca' : 'Nenhuma denúncia encontrada com os filtros aplicados'}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                      >
                        Limpar busca
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>        {/* Map Container */}
        <div className="flex-1 relative">
          {/* Show accessibility panel or regular map */}
          {showAccessibilityPanel ? (
            <div className="h-full bg-white">
              <AccessibleMapViewer 
                reports={filteredReports}
                selectedReport={selectedReport}
                onReportSelect={setSelectedReport}
                viewMode={viewMode}
                searchTerm={searchTerm}
              />
            </div>
          ) : viewMode === 'list' ? (
            <div className="h-full bg-white p-4 lg:hidden overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Lista de Denúncias</h2>
              <div className="space-y-4">
                {filteredReports
                  .filter(report => 
                    searchTerm === '' || 
                    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    report.category.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-gray-900 text-base">{report.title}</h3>
                      <AccessibleStatusBadge status={report.status} size="sm" />
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{report.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{report.category}</span>
                      <span>{new Date(report.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <button
                      onClick={() => router.push(`/reports/${report.id}`)}
                      className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full">
              <GlobalReportsMap 
                reports={filteredReports}
                selectedReport={selectedReport}
                onReportSelect={setSelectedReport}
              />
            </div>
          )}

          {/* Mobile view toggle for bottom of screen */}
          <div className="lg:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
            <div className="bg-white rounded-lg shadow-lg p-1 flex">
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Ver mapa"
              >
                <MapPinIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Ver lista"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Selected Report Popup */}
          {selectedReport && viewMode === 'map' && !showAccessibilityPanel && (
            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-md mx-auto lg:mx-0 z-20">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex-1 mr-2">{selectedReport.title}</h4>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded"
                  aria-label="Fechar popup"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {selectedReport.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AccessibleStatusBadge status={selectedReport.status} size="sm" />
                  <span className="text-xs text-gray-500">{selectedReport.category}</span>
                </div>
                
                <button
                  onClick={() => router.push(`/reports/${selectedReport.id}`)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Ver detalhes
                </button>
              </div>
            </div>
          )}

          {/* Accessibility panel overlay for mobile */}
          {showAccessibilityPanel && (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
              <div className="bg-white w-full rounded-t-xl p-4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Opções de Acessibilidade</h3>
                  <button
                    onClick={() => setShowAccessibilityPanel(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                    aria-label="Fechar painel de acessibilidade"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
                <AccessibleMapViewer 
                  reports={filteredReports}
                  selectedReport={selectedReport}
                  onReportSelect={setSelectedReport}
                  viewMode={viewMode}
                  searchTerm={searchTerm}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
