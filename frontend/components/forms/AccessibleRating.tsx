'use client'

import { useState } from 'react'
import { 
  Star, 
  ThumbsUpIcon, 
  ThumbsDownIcon,
  SmileIcon,
  FrownIcon,
  MehIcon,
  Heart,
  AlertTriangle
} from 'lucide-react'

interface AccessibleRatingProps {
  category: string
  currentRating: number
  onRatingChange: (rating: number) => void
  method: 'stars' | 'buttons'
  disabled?: boolean
  categoryConfig?: {
    icon: string
    emoji: string
    color: string
    description: string
    examples: readonly string[]
  }
}

export function AccessibleRating({
  category,
  currentRating,
  onRatingChange,
  method,
  disabled = false,
  categoryConfig
}: AccessibleRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const ratingLabels = {
    1: { label: 'Muito Ruim', emoji: '😞', description: 'Serviço muito insatisfatório' },
    2: { label: 'Ruim', emoji: '😕', description: 'Serviço insatisfatório' },
    3: { label: 'Regular', emoji: '😐', description: 'Serviço adequado' },
    4: { label: 'Bom', emoji: '😊', description: 'Serviço satisfatório' },
    5: { label: 'Excelente', emoji: '😍', description: 'Serviço excepcional' }
  }

  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 1: return 'text-red-500'
      case 2: return 'text-orange-500'
      case 3: return 'text-yellow-500'
      case 4: return 'text-blue-500'
      case 5: return 'text-green-500'
      default: return 'text-gray-300'
    }
  }

  const getRatingIcon = (rating: number) => {
    switch (rating) {
      case 1: return FrownIcon
      case 2: return FrownIcon
      case 3: return MehIcon
      case 4: return SmileIcon
      case 5: return Heart
      default: return MehIcon
    }
  }

  if (method === 'stars') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {categoryConfig && (
              <span className="text-2xl mr-2" aria-hidden="true">
                {categoryConfig.emoji}
              </span>
            )}
            <div>
              <h3 className="text-lg font-medium text-gray-900">{category}</h3>
              {categoryConfig && (
                <p className="text-sm text-gray-600">{categoryConfig.description}</p>
              )}
            </div>
          </div>
          {currentRating > 0 && (
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {ratingLabels[currentRating as keyof typeof ratingLabels].emoji} {ratingLabels[currentRating as keyof typeof ratingLabels].label}
            </div>
          )}
        </div>

        <div 
          className="flex items-center space-x-1"
          role="radiogroup"
          aria-labelledby={`rating-label-${category}`}
          aria-describedby={`rating-help-${category}`}
        >
          <span id={`rating-label-${category}`} className="sr-only">
            Avaliação para {category}
          </span>
          {[1, 2, 3, 4, 5].map((star) => {
            const isActive = star <= (hoverRating || currentRating)
            const IconComponent = getRatingIcon(star)
            
            return (
              <button
                key={star}
                type="button"
                onClick={() => onRatingChange(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                disabled={disabled}
                className={`p-2 rounded-lg transition-all focus:ring-2 focus:ring-blue-300 disabled:opacity-50 hover:scale-110 ${
                  isActive ? getRatingColor(star) : 'text-gray-300 hover:text-gray-400'
                }`}
                aria-pressed={star === currentRating}
                aria-label={`${star} estrela${star > 1 ? 's' : ''} - ${ratingLabels[star as keyof typeof ratingLabels].label}`}
                title={`${star} estrela${star > 1 ? 's' : ''} - ${ratingLabels[star as keyof typeof ratingLabels].description}`}
                role="radio"
                aria-checked={star === currentRating}
              >
                <Star 
                  className={`w-8 h-8 ${isActive ? 'fill-current' : ''}`}
                  aria-hidden="true"
                />
              </button>
            )
          })}
        </div>

        <div id={`rating-help-${category}`} className="text-xs text-gray-500">
          {hoverRating > 0 ? (
            <span className="flex items-center">
              <span className="mr-1">{ratingLabels[hoverRating as keyof typeof ratingLabels].emoji}</span>
              {ratingLabels[hoverRating as keyof typeof ratingLabels].description}
            </span>
          ) : (
            'Clique nas estrelas para avaliar este serviço'
          )}
        </div>
      </div>
    )
  }

  // Button method for better accessibility
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        {categoryConfig && (
          <span className="text-2xl mr-2" aria-hidden="true">
            {categoryConfig.emoji}
          </span>
        )}
        <div>
          <h3 className="text-lg font-medium text-gray-900">{category}</h3>
          {categoryConfig && (
            <p className="text-sm text-gray-600">{categoryConfig.description}</p>
          )}
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="sr-only">Avalie {category}</legend>
        
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((rating) => {
            const ratingInfo = ratingLabels[rating as keyof typeof ratingLabels]
            const isSelected = rating === currentRating
            
            return (
              <button
                key={rating}
                type="button"
                onClick={() => onRatingChange(rating)}
                disabled={disabled}
                className={`p-3 rounded-lg border-2 transition-all focus:ring-2 focus:ring-blue-300 disabled:opacity-50 ${
                  isSelected
                    ? `${getRatingColor(rating).replace('text-', 'border-')} bg-opacity-10 ${getRatingColor(rating).replace('text-', 'bg-')}`
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                aria-pressed={isSelected}
                aria-describedby={`rating-desc-${rating}`}
              >
                <div className="text-center">
                  <div className={`text-2xl mb-1 ${isSelected ? getRatingColor(rating) : 'text-gray-400'}`}>
                    {ratingInfo.emoji}
                  </div>
                  <div className={`text-sm font-medium ${isSelected ? getRatingColor(rating) : 'text-gray-600'}`}>
                    {ratingInfo.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {rating} estrela{rating > 1 ? 's' : ''}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="text-xs text-gray-500 text-center">
          💡 Escolha a opção que melhor representa sua experiência com este serviço
        </div>
      </fieldset>

      {categoryConfig && categoryConfig.examples.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">💭 Exemplos para considerar:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            {categoryConfig.examples.map((example, index) => (
              <li key={index} className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                {example}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
