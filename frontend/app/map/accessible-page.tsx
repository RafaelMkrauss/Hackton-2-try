'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { 
  MapPinIcon, 
  FilterIcon, 
  RefreshCwIcon,
  ListIcon,
  SearchIcon,
  InfoIcon,
  EyeIcon
} from 'lucide-react'
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

export default function AccessibleMapPage() {
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
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false)

  const categories = [
    'Infraestrutura',
    'Limpeza Urbana',
    'Iluminação Pública',
    'Segurança',
    'Transporte Público',
    'Meio Ambiente',
    'Buracos na Via',
    'Acessibilidade',
    'Sinalização'
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
  }, [user, loading])

  useEffect(() => {
    let filtered = reports

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(report => report.status === filters.status)
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(report => report.category === filters.category)
    }

    setFilteredReports(filtered)
  }, [reports, filters, searchTerm])

  const fetchReports = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/reports')
      const reportsWithLocation = response.data.filter((report: Report) => 
        report.latitude && report.longitude
      )
      setReports(reportsWithLocation)
    } catch (error) {
      console.error('Erro ao carregar denúncias:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

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

      {/* Accessibility Panel */}
      {showAccessibilityPanel && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start">
              <InfoIcon className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-2">♿ Instruções de Acessibilidade</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• <strong>Navegação:</strong> Use Tab para navegar entre controles, Enter para ativar</p>
                  <p>• <strong>Mapa:</strong> Use as setas do teclado para navegar pelo mapa, + e - para zoom</p>
                  <p>• <strong>Filtros:</strong> Use os controles abaixo para filtrar denúncias por categoria ou status</p>
                  <p>• <strong>Lista:</strong> Alterne para "Lista" para uma visão mais acessível das denúncias</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center">
              <FilterIcon className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">🔍 Filtros e Busca</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="🔍 Buscar denúncias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                  aria-label="Buscar denúncias por título ou descrição"
                />
              </div>
              
              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filtrar por status"
              >
                <option value="">📊 Todos os Status</option>
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              
              {/* Category Filter */}
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filtrar por categoria"
              >
                <option value="">🏷️ Todas as Categorias</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              
              <button
                onClick={fetchReports}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 flex items-center transition-colors"
                aria-label="Atualizar lista de denúncias"
              >
                <RefreshCwIcon className="w-4 h-4 mr-2" />
                🔄 Atualizar
              </button>
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="mt-4 text-sm text-gray-600">
            📈 Mostrando {filteredReports.length} de {reports.length} denúncias
          </div>
        </div>

        {/* Map/List Viewer */}
        <AccessibleMapViewer
          reports={filteredReports}
          selectedReport={selectedReport}
          onReportSelect={setSelectedReport}
          viewMode={viewMode}
          searchTerm={searchTerm}
        />
      </main>
    </div>
  )
}
