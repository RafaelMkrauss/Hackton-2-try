'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { AccessibleStatusBadge } from '@/components/ui/AccessibleStatusBadge'
import { 
  BarChart3Icon, 
  MapPinIcon, 
  PlusCircleIcon, 
  BellIcon, 
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertTriangleIcon,
  LogOutIcon,
  HomeIcon,
  TrendingUpIcon,
  EyeIcon,
  MessageSquareIcon
} from 'lucide-react'
import { QuickAnswerWidget } from '@/components/gamification/QuickAnswerWidget'
import { ActivityCalendar } from '@/components/gamification/ActivityCalendar'
import { GamificationStats } from '@/components/gamification/GamificationStats'

interface DashboardStats {
  totalReports: number
  pendingReports: number
  completedReports: number
  myReports?: number
}

interface RecentReport {
  id: string
  title: string
  status: string
  createdAt: string
  category: string
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    pendingReports: 0,
    completedReports: 0,
    myReports: 0
  })
  const [recentReports, setRecentReports] = useState<RecentReport[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user, loading, router])
  const handleLogout = () => {
    logout()
  }

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, reportsResponse] = await Promise.all([
        api.get('/reports/stats'),
        api.get('/reports?limit=5')
      ])

      setStats(statsResponse.data)
      setRecentReports(reportsResponse.data.reports || reportsResponse.data)
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setIsLoading(false)
    }
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
    <div className="min-h-screen bg-gray-50">      {/* Header */}      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center min-w-0 flex-1">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                <HomeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm sm:text-base text-gray-600 truncate">
                  👋 Olá, {user?.name}! 
                  <span className="hidden sm:inline"> Bem-vindo ao painel de denúncias</span>
                  <span className="sm:hidden"> Painel de denúncias</span>
                </p>
              </div>
            </div>            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button 
                className="p-2 text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-blue-300 rounded-lg transition-colors relative"
                aria-label="Notificações"
              >
                <BellIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={() => router.push('/reports/new')}
                className="bg-blue-600 text-white px-2 sm:px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 flex items-center space-x-1 sm:space-x-2 transition-colors font-medium text-sm sm:text-base"
                aria-label="Criar nova denúncia"
              >
                <PlusCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">📝 Nova Denúncia</span>
                <span className="sm:hidden">Nova</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-2 sm:px-4 py-2 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-300 flex items-center space-x-1 sm:space-x-2 transition-colors text-sm sm:text-base"
                aria-label="Fazer logout"
              >
                <LogOutIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">        {/* Gamification Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="lg:col-span-2">
            <QuickAnswerWidget />
          </div>
          <div>
            <GamificationStats />
          </div>
        </div>        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <BarChart3Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">📊 Total de Denúncias</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900" aria-label={`${stats.totalReports} denúncias no total`}>
                  {stats.totalReports}
                </p>
                <p className="text-xs text-gray-500 mt-1">Todas as denúncias registradas</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">⏳ Pendentes</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900" aria-label={`${stats.pendingReports} denúncias pendentes`}>
                  {stats.pendingReports}
                </p>
                <p className="text-xs text-gray-500 mt-1">Aguardando análise ou resolução</p>
              </div>
            </div>
          </div>          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600">✅ Resolvidas</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900" aria-label={`${stats.completedReports} denúncias resolvidas`}>
                  {stats.completedReports}
                </p>
                <p className="text-xs text-gray-500 mt-1">Problemas solucionados</p>
              </div>
            </div>
          </div>

          {user?.role === 'USER' && (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                  <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">👤 Minhas Denúncias</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900" aria-label={`${stats.myReports || 0} suas denúncias`}>
                    {stats.myReports || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Denúncias que você criou</p>
                </div>
              </div>
            </div>
          )}
        </div>        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUpIcon className="w-5 h-5 mr-2 text-blue-600" />
            ⚡ Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">            <button
              onClick={() => router.push('/reports/new')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-all transform hover:scale-105 text-left focus:ring-2 focus:ring-blue-300"
              aria-label="Criar nova denúncia"
            >
              <div className="flex items-center mb-2 sm:mb-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <PlusCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="ml-3">
                  <h3 className="text-base sm:text-lg font-semibold">📝 Nova Denúncia</h3>
                  <p className="text-xs sm:text-sm opacity-90">Reporte um problema</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/reports')}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-all transform hover:scale-105 text-left focus:ring-2 focus:ring-green-300"
              aria-label="Ver todas as denúncias"
            >
              <div className="flex items-center mb-2 sm:mb-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <EyeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="ml-3">
                  <h3 className="text-base sm:text-lg font-semibold">👀 Ver Denúncias</h3>
                  <p className="text-xs sm:text-sm opacity-90">Acompanhe o progresso</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/map')}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-all transform hover:scale-105 text-left focus:ring-2 focus:ring-purple-300"
              aria-label="Ver mapa de denúncias"
            >
              <div className="flex items-center mb-2 sm:mb-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <MapPinIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="ml-3">
                  <h3 className="text-base sm:text-lg font-semibold">🗺️ Ver no Mapa</h3>
                  <p className="text-xs sm:text-sm opacity-90">Localização dos problemas</p>
                </div>
              </div>            </button>

            <button
              onClick={() => router.push('/evaluation')}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-all transform hover:scale-105 text-left focus:ring-2 focus:ring-indigo-300"
              aria-label="Avaliação trimestral"
            >
              <div className="flex items-center mb-2 sm:mb-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="ml-3">
                  <h3 className="text-base sm:text-lg font-semibold">📊 Avaliação</h3>
                  <p className="text-xs sm:text-sm opacity-90">Avalie os serviços</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/help')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-all transform hover:scale-105 text-left focus:ring-2 focus:ring-orange-300"
              aria-label="Central de ajuda"
            >
              <div className="flex items-center mb-2 sm:mb-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <MessageSquareIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="ml-3">
                  <h3 className="text-base sm:text-lg font-semibold">❓ Ajuda</h3>
                  <p className="text-xs sm:text-sm opacity-90">Como usar a plataforma</p>
                </div>
              </div>
            </button>
          </div>        </div>        {/* Calendar and Recent Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-1">
            <ActivityCalendar />
          </div>
          
          <div className="lg:col-span-2">
            {/* Recent Reports */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2 text-gray-600" />
                  📋 Denúncias Recentes
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {recentReports.length > 0 ? (
                  recentReports.map((report) => (
                    <div key={report.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{report.title}</h3>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <span className="mr-2">🏷️</span>
                            {report.category}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <span className="mr-2">📅</span>
                            {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <AccessibleStatusBadge 
                            status={report.status} 
                            size="md"
                            showIcon={true}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center">
                    <div className="text-gray-400 mb-2">
                      <MessageSquareIcon className="w-12 h-12 mx-auto" />
                    </div>
                    <p className="text-gray-500 font-medium">📋 Nenhuma denúncia encontrada</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Quando você ou outros usuários criarem denúncias, elas aparecerão aqui
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
