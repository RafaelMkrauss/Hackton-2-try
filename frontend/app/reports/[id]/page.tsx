'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { 
  MapPinIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  AlertTriangleIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  MessageSquareIcon,
  ArrowLeftIcon
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
  author: {
    id: string
    name: string
    email: string
  }
  images?: string[]
  comments?: Comment[]
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    name: string
    role: string
  }
}

export default function ReportDetailPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [report, setReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user && params.id) {
      fetchReport()
    }
  }, [user, loading, router, params.id])

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      const response = await api.get(`/reports/${params.id}`)
      setReport(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar denúncia')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await api.patch(`/reports/${params.id}/status`, { status: newStatus })
      setReport(prev => prev ? { ...prev, status: newStatus } : null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar status')
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmittingComment(true)
    try {
      const response = await api.post(`/reports/${params.id}/comments`, {
        content: newComment
      })
      
      setReport(prev => prev ? {
        ...prev,
        comments: [...(prev.comments || []), response.data]
      } : null)
      
      setNewComment('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao adicionar comentário')
    } finally {
      setIsSubmittingComment(false)
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

  if (error && !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/reports')}
            className="text-blue-600 hover:text-blue-700"
          >
            Voltar às denúncias
          </button>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Denúncia não encontrada</h1>
          <button
            onClick={() => router.push('/reports')}
            className="text-blue-600 hover:text-blue-700"
          >
            Voltar às denúncias
          </button>
        </div>
      </div>
    )
  }

  const canUpdateStatus = user?.role === 'STAFF' || user?.role === 'ADMIN'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-700 mr-4"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-1" />
              Voltar
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Detalhes da Denúncia</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Report Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                  {getStatusIcon(report.status)}
                  <span className="ml-2">{report.status.replace('_', ' ')}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <TagIcon className="w-5 h-5 mr-2" />
                  <span>{report.category}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  <span>{new Date(report.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <UserIcon className="w-5 h-5 mr-2" />
                  <span>{report.author.name}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  <span>{report.location}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Descrição</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{report.description}</p>
              </div>

              {/* Images */}
              {report.images && report.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Imagens</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {report.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Imagem ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90"
                        onClick={() => window.open(image, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update (Staff only) */}
              {canUpdateStatus && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Atualizar Status</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate('PENDENTE')}
                      disabled={report.status === 'PENDENTE'}
                      className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Pendente
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('EM_PROGRESSO')}
                      disabled={report.status === 'EM_PROGRESSO'}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Em Progresso
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('RESOLVIDO')}
                      disabled={report.status === 'RESOLVIDO'}
                      className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Resolvido
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MessageSquareIcon className="w-5 h-5 mr-2" />
                Comentários ({report.comments?.length || 0})
              </h3>

              {/* Add Comment */}
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Adicionar um comentário..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingComment ? 'Enviando...' : 'Adicionar Comentário'}
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {report.comments && report.comments.length > 0 ? (
                  report.comments.map((comment) => (
                    <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">{comment.author.name}</span>
                          {comment.author.role !== 'USER' && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {comment.author.role}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">Nenhum comentário ainda</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Map */}
            {report.latitude && report.longitude && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Localização</h3>
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPinIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Mapa será carregado aqui</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Lat: {report.latitude.toFixed(6)}<br />
                      Lng: {report.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informações</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">ID da Denúncia:</span>
                  <p className="font-mono text-sm">{report.id}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Criada em:</span>
                  <p className="text-sm">{new Date(report.createdAt).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Última atualização:</span>
                  <p className="text-sm">{new Date(report.updatedAt).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </main>
    </div>
  )
}
