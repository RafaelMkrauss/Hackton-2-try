'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { api } from '@/lib/api'
import { REPORT_CATEGORIES, CATEGORY_CONFIG } from '@/lib/constants/categories'
import { 
  Star, 
  CheckCircle, 
  ArrowLeft, 
  InfoIcon,
  MessageSquareIcon,
  StarIcon,
  EyeIcon,
  SendIcon,
  SettingsIcon
} from 'lucide-react'
import toast from 'react-hot-toast'
import { AccessibleRating } from '@/components/forms/AccessibleRating'

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

export default function AccessibleEvaluationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentSemester, setCurrentSemester] = useState<CurrentSemester | null>(null)
  const [existingEvaluation, setExistingEvaluation] = useState<CurrentEvaluation | null>(null)
  const [ratings, setRatings] = useState<CategoryRating[]>([])
  const [generalComment, setGeneralComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showAccessibilityHelp, setShowAccessibilityHelp] = useState(false)
  const [ratingMethod, setRatingMethod] = useState<'stars' | 'buttons'>('stars')
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)

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
      // Fallback to current date
      const now = new Date()
      setCurrentSemester({
        year: now.getFullYear(),
        semester: now.getMonth() < 6 ? 1 : 2
      })
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
        initializeEmptyRatings()
      }
    } catch (error) {
      initializeEmptyRatings()
    }
  }

  const initializeEmptyRatings = () => {
    setRatings(REPORT_CATEGORIES.map(category => ({
      category,
      rating: 0,
      comment: ''
    })))
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
    
    const unratedCategories = ratings.filter(r => r.rating === 0)
    if (unratedCategories.length > 0) {
      toast.error(`Por favor, avalie todas as categorias. Faltam: ${unratedCategories.map(r => r.category).join(', ')}`)
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
        toast.success('✅ Avaliação atualizada com sucesso!')
      } else {
        await api.post('/evaluations', evaluationData)
        toast.success('🎉 Avaliação enviada com sucesso!')
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

  const handleKeyNavigation = (event: React.KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          setCurrentCategoryIndex(prev => Math.max(0, prev - 1))
          break
        case 'ArrowDown':
          event.preventDefault()
          setCurrentCategoryIndex(prev => Math.min(REPORT_CATEGORIES.length - 1, prev + 1))
          break
      }
    }
  }

  if (!currentSemester) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">⭐ Carregando avaliação...</p>
        </div>
      </div>
    )
  }

  if (isSubmitted && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">🎉 Avaliação Concluída!</h1>
          <p className="text-gray-600 mb-4">
            Obrigado por dedicar seu tempo para avaliar os serviços públicos. 
            Sua opinião é fundamental para melhorar nossa cidade!
          </p>
          <p className="text-sm text-gray-500">Redirecionando para o dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" onKeyDown={handleKeyNavigation}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 focus:ring-2 focus:ring-blue-300 rounded-lg p-2 transition-colors"
            aria-label="Voltar ao dashboard"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <StarIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    ⭐ Avaliação Semestral - {currentSemester.semester}º Semestre {currentSemester.year}
                  </h1>
                  <p className="text-gray-600">
                    📊 Avalie a qualidade dos serviços públicos da sua região. Sua opinião é fundamental para melhorar a cidade!
                  </p>
                </div>
              </div>
              
              {/* Accessibility Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAccessibilityHelp(!showAccessibilityHelp)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-300 transition-colors"
                  aria-label="Mostrar ajuda de acessibilidade"
                  aria-expanded={showAccessibilityHelp}
                >
                  <EyeIcon className="w-5 h-5" />
                </button>
                <div className="bg-gray-100 rounded-lg p-1 flex">
                  <button
                    onClick={() => setRatingMethod('stars')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors focus:ring-2 focus:ring-blue-300 ${
                      ratingMethod === 'stars'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    aria-pressed={ratingMethod === 'stars'}
                  >
                    ⭐ Estrelas
                  </button>
                  <button
                    onClick={() => setRatingMethod('buttons')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors focus:ring-2 focus:ring-blue-300 ${
                      ratingMethod === 'buttons'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    aria-pressed={ratingMethod === 'buttons'}
                  >
                    🔘 Botões
                  </button>
                </div>
              </div>
            </div>
            
            {/* Accessibility Help Panel */}
            {showAccessibilityHelp && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <InfoIcon className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <h3 className="font-medium mb-2">♿ Como usar esta página:</h3>
                    <ul className="space-y-1">
                      <li>• <strong>Navegação:</strong> Use Tab para navegar entre elementos, Enter para selecionar</li>
                      <li>• <strong>Avaliação:</strong> Escolha entre estrelas ou botões usando o controle acima</li>
                      <li>• <strong>Estrelas:</strong> Clique ou use o mouse para avaliar de 1 a 5 estrelas</li>
                      <li>• <strong>Botões:</strong> Mais acessível para leitores de tela e navegação por teclado</li>
                      <li>• <strong>Atalhos:</strong> Ctrl+↑/↓ para navegar entre categorias rapidamente</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {existingEvaluation && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">
                    {isSubmitted ? '✅ Você já respondeu esta avaliação' : '📝 Editando avaliação existente'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Evaluation Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <SettingsIcon className="w-5 h-5 mr-2 text-gray-600" />
                📋 Avalie cada categoria de serviço público
              </h2>
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {ratings.filter(r => r.rating > 0).length}/{REPORT_CATEGORIES.length} avaliadas
              </div>
            </div>
            
            <div className="space-y-8">
              {REPORT_CATEGORIES.map((category, index) => {
                const rating = ratings.find(r => r.category === category)
                const categoryConfig = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]
                const isFocused = index === currentCategoryIndex
                
                return (
                  <div 
                    key={category} 
                    className={`border-b border-gray-200 pb-8 last:border-b-0 transition-all ${
                      isFocused ? 'bg-blue-50 -m-4 p-4 rounded-lg border-blue-200' : ''
                    }`}
                  >
                    <AccessibleRating
                      category={category}
                      currentRating={rating?.rating || 0}
                      onRatingChange={(newRating) => updateRating(category, newRating)}
                      method={ratingMethod}
                      disabled={isSubmitted}
                      categoryConfig={categoryConfig}
                    />
                    
                    {/* Optional Comment */}
                    <div className="mt-4">
                      <label 
                        htmlFor={`comment-${category}`}
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        💬 Comentário adicional (opcional)
                      </label>
                      <textarea
                        id={`comment-${category}`}
                        value={rating?.comment || ''}
                        onChange={(e) => updateComment(category, e.target.value)}
                        disabled={isSubmitted}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder={`Compartilhe sua experiência específica com ${category.toLowerCase()}...`}
                        aria-describedby={`comment-help-${category}`}
                      />
                      <p id={`comment-help-${category}`} className="text-xs text-gray-500 mt-1">
                        💡 Conte detalhes sobre problemas ou elogios específicos
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* General Comment */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MessageSquareIcon className="w-5 h-5 mr-2 text-gray-600" />
              💭 Comentário Geral (opcional)
            </h3>
            <textarea
              value={generalComment}
              onChange={(e) => setGeneralComment(e.target.value)}
              disabled={isSubmitted}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Compartilhe suas impressões gerais sobre os serviços públicos da sua região, sugestões de melhoria ou qualquer observação adicional..."
              aria-describedby="general-comment-help"
            />
            <p id="general-comment-help" className="text-sm text-gray-500 mt-2">
              ✨ Use este espaço para comentários gerais, sugestões ou observações que não se enquadram nas categorias específicas
            </p>
          </div>

          {/* Submit Button */}
          {!isSubmitted && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  📝 {ratings.filter(r => r.rating > 0).length} de {REPORT_CATEGORIES.length} categorias avaliadas
                </div>
                <button
                  type="submit"
                  disabled={isLoading || ratings.filter(r => r.rating > 0).length !== REPORT_CATEGORIES.length}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center focus:ring-2 focus:ring-purple-300 transition-colors font-medium"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <SendIcon className="w-5 h-5 mr-2" />
                      🚀 Enviar Avaliação
                    </>
                  )}
                </button>
              </div>
              {ratings.filter(r => r.rating > 0).length !== REPORT_CATEGORIES.length && (
                <p className="text-sm text-amber-600 mt-2 flex items-center">
                  <span className="mr-2">⚠️</span>
                  Avalie todas as categorias para poder enviar a avaliação
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
