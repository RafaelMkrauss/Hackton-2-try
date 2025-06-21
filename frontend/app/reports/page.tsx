'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { 
  SearchIcon, 
  FilterIcon, 
  MapPinIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  AlertTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-react'

interface Report {
  id: string
  title: string
  description: string
  status: string
  category: string
  location: string
  latitude?: number
  longitude?: number
  createdAt: string
  updatedAt: string
  author?: {
    name: string
  }
  images?: string[]
}

interface ReportsResponse {
  reports: Report[]
  pagination: {
    total: number
    page: number
    totalPages: number
  }
}

export default function ReportsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  })
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    location: ''
  })
  const [isLoading, setIsLoading] = useState(true)

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
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'EM_PROGRESSO', label: 'Em Progresso' },
    { value: 'RESOLVIDO', label: 'Resolvido' }
  ]

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchReports()
    }
  }, [user, loading, router, pagination.page, filters])

  const fetchReports = async () => {
    setIsLoading(true)
    try {      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '10',
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.status && { status: filters.status }),
        ...(filters.location && { location: filters.location })
      })
      
      const response = await api.get(`/reports/public?${params}`)
      const data: ReportsResponse = response.data

      setReports(data.reports || [])
      setPagination({
        page: data.pagination?.page || 1,
        totalPages: data.pagination?.totalPages || 1,
        total: data.pagination?.total || 0
      })
    } catch (error) {
      console.error('Erro ao carregar denúncias:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'em_progresso':
        return 'bg-blue-100 text-blue-800'
      case 'resolvido':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Denúncias</h1>
              <p className="text-gray-600">Gerencie e acompanhe denúncias</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-blue-600 hover:text-blue-700"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar denúncias..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os status</option>
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Localização..."
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando {reports.length} de {pagination.total} denúncias
          </p>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {reports.length > 0 ? (
            reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/reports/${report.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {report.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {getStatusIcon(report.status)}
                          <span className="ml-1">{report.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {report.description}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          {report.location}
                        </span>
                        <span>
                          Categoria: {report.category}
                        </span>
                        {report.author && (
                          <span>
                            Por: {report.author.name}
                          </span>
                        )}
                        <span>
                          {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {report.images && report.images.length > 0 && (
                      <div className="ml-4">
                        <img
                          src={report.images[0]}
                          alt="Imagem da denúncia"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FilterIcon className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma denúncia encontrada
              </h3>
              <p className="text-gray-600">
                Tente ajustar os filtros ou criar uma nova denúncia
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="flex items-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                Anterior
              </button>

              <div className="flex space-x-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm rounded-lg ${
                      page === pagination.page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="flex items-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
            </div>

            <div className="text-sm text-gray-700">
              Página {pagination.page} de {pagination.totalPages}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
