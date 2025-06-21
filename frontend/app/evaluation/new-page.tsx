'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { api } from '@/lib/api'
import { REPORT_CATEGORIES, CATEGORY_DESCRIPTIONS } from '@/lib/constants/categories'
import { 
  Star, 
  CheckCircle, 
  ArrowLeft, 
  InfoIcon,
  MessageSquareIcon,
  ClipboardCheckIcon,
  CalendarIcon,
  TrendingUpIcon,
  AlertCircleIcon,
  Loader2Icon
} from 'lucide-react'
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
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [currentSemester, setCurrentSemester] = useState<CurrentSemester | null>(null)
  const [existingEvaluation, setExistingEvaluation] = useState<CurrentEvaluation | null>(null)
  const [ratings, setRatings] = useState<CategoryRating[]>([])
  const [generalComment, setGeneralComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showAccessibilityHelp, setShowAccessibilityHelp] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }
    
    if (user) {
      initializeEvaluation()
    }
  }, [user, loading, router])

  const initializeEvaluation = async () => {
    try {
      await fetchCurrentSemester()
      await fetchCurrentEvaluation()
    } catch (error) {
      console.error('Erro ao inicializar avaliação:', error)
      setHasError(true)
      setErrorMessage('Erro ao carregar dados da avaliação')
    }
  }

  const fetchCurrentSemester = async () => {
    try {
      const response = await api.get('/evaluations/current-semester')
      setCurrentSemester(response.data)
    } catch (error) {
      console.error('Erro ao buscar semestre atual:', error)
      // Fallback: Calculate current semester locally
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const semester = month <= 6 ? 1 : 2;
      setCurrentSemester({ year, semester });
    }
  }

  const fetchCurrentEvaluation = async () => {
    try {
      if (!currentSemester) return;
      
      const response = await api.get(`/evaluations/current?year=${currentSemester.year}&semester=${currentSemester.semester}`)
      
      if (response.data) {
        setExistingEvaluation(response.data)
        setRatings(response.data.ratings || [])
        setGeneralComment(response.data.generalComment || '')
        setIsSubmitted(true)
      } else {
        // Initialize empty ratings for each category
        const initialRatings = REPORT_CATEGORIES.map(category => ({
          category,
          rating: 0,
          comment: ''
        }))
        setRatings(initialRatings)
      }
    } catch (error) {
      console.error('Erro ao buscar avaliação atual:', error)
      // Initialize empty ratings for each category
      const initialRatings = REPORT_CATEGORIES.map(category => ({
        category,
        rating: 0,
        comment: ''
      }))
      setRatings(initialRatings)
    }
  }

  const handleRatingChange = (category: string, rating: number) => {
    setRatings(prev => prev.map(r => 
      r.category === category ? { ...r, rating } : r
    ))
  }

  const handleCommentChange = (category: string, comment: string) => {
    setRatings(prev => prev.map(r => 
      r.category === category ? { ...r, comment } : r
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentSemester) {
      toast.error('Erro: semestre atual não definido')
      return
    }

    // Validate that all categories have ratings
    const unratedCategories = ratings.filter(r => r.rating === 0)
    if (unratedCategories.length > 0) {
      toast.error('Por favor, avalie todas as categorias')
      return
    }

    setIsLoading(true)

    try {
      const evaluationData = {
        year: currentSemester.year,
        semester: currentSemester.semester,
        ratings: ratings.filter(r => r.rating > 0),
        generalComment
      }

      if (existingEvaluation) {
        await api.put(`/evaluations/${existingEvaluation.id}`, evaluationData)
        toast.success('Avaliação atualizada com sucesso!')
      } else {
        await api.post('/evaluations', evaluationData)
        toast.success('Avaliação enviada com sucesso!')
      }

      setIsSubmitted(true)
      
      // Refresh evaluation data
      await fetchCurrentEvaluation()
      
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error)
      toast.error('Erro ao enviar avaliação. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStarRating = (category: string, currentRating: number) => {
    return (
      <div className="flex items-center space-x-1" role="radiogroup" aria-labelledby={`rating-${category}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={currentRating >= star}
            aria-label={`${star} estrela${star > 1 ? 's' : ''} para ${category}`}
            onClick={() => handleRatingChange(category, star)}
            className={`focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm transition-colors ${
              currentRating >= star 
                ? 'text-yellow-400 hover:text-yellow-500' 
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {currentRating > 0 ? `${currentRating}/5` : 'Não avaliado'}
        </span>
      </div>
    )
  }

  // Loading state
  if (loading || !currentSemester) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2Icon className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Carregando...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar avaliação</h1>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  const completedRatings = ratings.filter(r => r.rating > 0).length
  const totalRatings = ratings.length
  const progressPercentage = (completedRatings / totalRatings) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                aria-label="Voltar ao dashboard"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Avaliação Semestral
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  <CalendarIcon className="w-4 h-4 inline mr-1" />
                  {currentSemester.semester}º Semestre de {currentSemester.year}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowAccessibilityHelp(!showAccessibilityHelp)}
              className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
              aria-label="Ajuda de acessibilidade"
            >
              <InfoIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progresso da avaliação</span>
              <span>{completedRatings} de {totalRatings} categorias avaliadas</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${Math.round(progressPercentage)}% da avaliação concluída`}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Accessibility Help */}
      {showAccessibilityHelp && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-4 mt-4 rounded-r-lg">
          <div className="flex">
            <InfoIcon className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Ajuda de Acessibilidade</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Use Tab para navegar entre elementos</li>
                  <li>Use Space ou Enter para ativar botões</li>
                  <li>Use as setas ← → para navegar entre estrelas</li>
                  <li>Leitores de tela anunciarão a categoria e rating atual</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isSubmitted && existingEvaluation && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Avaliação já enviada
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Você pode atualizar sua avaliação a qualquer momento.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Categories */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <ClipboardCheckIcon className="w-5 h-5 mr-2" />
                Avalie os Serviços Públicos
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Avalie de 1 a 5 estrelas cada categoria de serviço público
              </p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {ratings.map((rating) => (
                <div key={rating.category} className="px-6 py-6">
                  <div className="space-y-4">
                    <div>
                      <h3 
                        id={`rating-${rating.category}`}
                        className="text-base font-medium text-gray-900 mb-2"
                      >
                        {rating.category}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {CATEGORY_DESCRIPTIONS[rating.category as keyof typeof CATEGORY_DESCRIPTIONS]}
                      </p>
                      {renderStarRating(rating.category, rating.rating)}
                    </div>
                    
                    <div>
                      <label 
                        htmlFor={`comment-${rating.category}`}
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Comentário adicional (opcional)
                      </label>
                      <textarea
                        id={`comment-${rating.category}`}
                        value={rating.comment || ''}
                        onChange={(e) => handleCommentChange(rating.category, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Compartilhe sua experiência com ${rating.category.toLowerCase()}...`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Comment */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquareIcon className="w-5 h-5 mr-2" />
              Comentário Geral
            </h2>
            <div>
              <label htmlFor="general-comment" className="block text-sm font-medium text-gray-700 mb-2">
                Compartilhe sua opinião geral sobre os serviços públicos (opcional)
              </label>
              <textarea
                id="general-comment"
                value={generalComment}
                onChange={(e) => setGeneralComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descreva sua experiência geral, sugestões de melhoria ou qualquer feedback adicional..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || completedRatings < totalRatings}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="w-5 h-5 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <span>
                  {existingEvaluation ? 'Atualizar Avaliação' : 'Enviar Avaliação'}
                </span>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
