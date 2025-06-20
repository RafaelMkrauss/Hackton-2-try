'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { api } from '@/lib/api'
import { REPORT_CATEGORIES, CATEGORY_DESCRIPTIONS } from '@/lib/constants/categories'
import { Star, CheckCircle, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

interface CategoryRating {
  category: string;
  rating: number;
  comment?: string;
}

interface CurrentEvaluation {
  id: string;
  semester: number;
  year: number;
  ratings: CategoryRating[];
  generalComment?: string;
}

interface CurrentSemester {
  year: number;
  semester: number;
}

export default function SemestralEvaluationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentSemester, setCurrentSemester] = useState<CurrentSemester | null>(null)
  const [existingEvaluation, setExistingEvaluation] = useState<CurrentEvaluation | null>(null)
  const [ratings, setRatings] = useState<CategoryRating[]>([])
  const [generalComment, setGeneralComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    fetchCurrentSemester()
    fetchCurrentEvaluation()
  }, [user])

  const fetchCurrentSemester = async () => {
    try {
      const response = await api.get('/evaluations/current-semester')
      setCurrentSemester(response.data)
    } catch (error) {
      console.error('Erro ao buscar semestre atual:', error)
    }
  }

  const fetchCurrentEvaluation = async () => {
    try {
      const response = await api.get('/evaluations/current')
      if (response.data) {
        setExistingEvaluation(response.data)
        setRatings(response.data.ratings)
        setGeneralComment(response.data.generalComment || '')
        setIsSubmitted(true)
      } else {
        // Initialize with empty ratings
        setRatings(REPORT_CATEGORIES.map(category => ({
          category,
          rating: 0,
          comment: ''
        })))
      }
    } catch (error) {
      // No existing evaluation, initialize empty
      setRatings(REPORT_CATEGORIES.map(category => ({
        category,
        rating: 0,
        comment: ''
      })))
    }
  }

  const updateRating = (category: string, rating: number) => {
    setRatings(prev => prev.map(r => 
      r.category === category ? { ...r, rating } : r
    ))
  }

  const updateComment = (category: string, comment: string) => {
    setRatings(prev => prev.map(r => 
      r.category === category ? { ...r, comment } : r
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate that all categories have ratings
    const unratedCategories = ratings.filter(r => r.rating === 0)
    if (unratedCategories.length > 0) {
      toast.error('Por favor, avalie todas as categorias')
      return
    }

    if (!currentSemester) {
      toast.error('Erro ao identificar semestre atual')
      return
    }

    setIsLoading(true)

    try {
      const evaluationData = {
        semester: currentSemester.semester,
        year: currentSemester.year,
        ratings: ratings.filter(r => r.rating > 0),
        generalComment: generalComment.trim() || undefined
      }

      if (existingEvaluation) {
        await api.patch(`/evaluations/${existingEvaluation.id}`, evaluationData)
        toast.success('Avaliação atualizada com sucesso!')
      } else {
        await api.post('/evaluations', evaluationData)
        toast.success('Avaliação enviada com sucesso!')
      }

      setIsSubmitted(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao enviar avaliação'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = (category: string, currentRating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => updateRating(category, star)}
            disabled={isSubmitted}
            className={`p-1 transition-colors ${
              isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
            }`}
          >
            <Star
              className={`w-6 h-6 ${
                star <= currentRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  if (!currentSemester) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Avaliação Semestral - {currentSemester.semester}º Semestre {currentSemester.year}
            </h1>
            <p className="text-gray-600">
              Avalie a qualidade dos serviços públicos da sua região nos últimos meses.
              Sua opinião é importante para melhorar a cidade!
            </p>
            
            {existingEvaluation && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-blue-800 font-medium">
                    {isSubmitted ? 'Você já respondeu esta avaliação' : 'Editando avaliação existente'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Evaluation Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Avalie cada categoria de 1 a 5 estrelas
            </h2>
            
            <div className="space-y-6">
              {REPORT_CATEGORIES.map((category) => {
                const rating = ratings.find(r => r.category === category)
                return (
                  <div key={category} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                      <div className="mb-3 sm:mb-0 sm:mr-6">
                        <h3 className="text-lg font-medium text-gray-900">{category}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {CATEGORY_DESCRIPTIONS[category]}
                        </p>
                      </div>
                      
                      <div className="flex-shrink-0">
                        {renderStars(category, rating?.rating || 0)}
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          {rating?.rating || 0}/5
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <textarea
                        placeholder="Comentário adicional (opcional)"
                        value={rating?.comment || ''}
                        onChange={(e) => updateComment(category, e.target.value)}
                        disabled={isSubmitted}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        rows={2}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* General Comment */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Comentário Geral
            </h3>
            <textarea
              placeholder="Compartilhe suas impressões gerais sobre a qualidade de vida na sua região..."
              value={generalComment}
              onChange={(e) => setGeneralComment(e.target.value)}
              disabled={isSubmitted}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={4}
            />
          </div>

          {/* Submit Button */}
          {!isSubmitted && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Enviando...' : existingEvaluation ? 'Atualizar Avaliação' : 'Enviar Avaliação'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
