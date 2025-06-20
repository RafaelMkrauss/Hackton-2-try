'use client'

import { useState } from 'react'
import { REPORT_CATEGORIES, CATEGORY_CONFIG, ReportCategory } from '@/lib/constants/categories'
import { ChevronDownIcon, CheckIcon } from 'lucide-react'

interface AccessibleCategorySelectorProps {
  selectedCategory: string
  onCategorySelect: (category: string) => void
  className?: string
}

export function AccessibleCategorySelector({
  selectedCategory,
  onCategorySelect,
  className = ""
}: AccessibleCategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setFocusedIndex(prev => 
          prev < REPORT_CATEGORIES.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : REPORT_CATEGORIES.length - 1
        )
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (focusedIndex >= 0) {
          onCategorySelect(REPORT_CATEGORIES[focusedIndex])
          setIsOpen(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setFocusedIndex(-1)
        break
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'crítica': return 'text-red-600 font-bold'
      case 'alta': return 'text-orange-600 font-semibold'
      case 'média': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const selectedConfig = selectedCategory ? CATEGORY_CONFIG[selectedCategory as ReportCategory] : null

  return (
    <div className={`relative ${className}`}>
      {/* Accessible Label */}
      <label 
        htmlFor="category-selector"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        <span className="flex items-center gap-2">
          📋 Categoria do Problema
          <span className="text-xs text-gray-500">(Obrigatório)</span>
        </span>
      </label>

      {/* Main Selector Button */}
      <button
        id="category-selector"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby="category-selector-label"
        className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-left shadow-sm hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          {selectedCategory ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl" role="img" aria-label={selectedConfig?.description}>
                {selectedConfig?.icon}
              </span>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{selectedCategory}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedConfig?.examples?.[0]} • Prioridade: 
                  <span className={`ml-1 ${getPriorityColor(selectedConfig?.priority || '')}`}>
                    {selectedConfig?.priority}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-gray-500">
              <span className="text-2xl">❓</span>
              <div>
                <div className="font-medium">Selecione uma categoria</div>
                <div className="text-xs mt-1">Escolha o tipo de problema que você quer reportar</div>
              </div>
            </div>
          )}
          <ChevronDownIcon 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
          role="listbox"
          aria-labelledby="category-selector-label"
        >
          {/* Header */}
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-700">
              💡 Escolha a categoria que melhor descreve o problema
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Use as setas ↑↓ para navegar, Enter para selecionar
            </div>
          </div>

          {/* Categories List */}
          <div className="p-2">
            {REPORT_CATEGORIES.map((category, index) => {
              const config = CATEGORY_CONFIG[category]
              const isSelected = category === selectedCategory
              const isFocused = index === focusedIndex

              return (
                <button
                  key={category}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onCategorySelect(category)
                    setIsOpen(false)
                    setFocusedIndex(-1)
                  }}
                  className={`w-full p-3 rounded-lg text-left transition-all duration-150 ${
                    isSelected 
                      ? 'bg-blue-100 border-2 border-blue-500' 
                      : isFocused
                      ? 'bg-gray-100 border-2 border-gray-400'
                      : 'border-2 border-transparent hover:bg-gray-50'
                  }`}
                  style={{
                    backgroundColor: isSelected || isFocused 
                      ? config.bgColor 
                      : undefined
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <span 
                        className="text-2xl block"
                        role="img" 
                        aria-label={config.description}
                      >
                        {config.icon}
                      </span>
                      <span 
                        className="text-lg block mt-1"
                        role="img"
                        aria-hidden="true"
                      >
                        {config.emoji}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {category}
                        </span>
                        {isSelected && (
                          <CheckIcon className="w-4 h-4 text-blue-600" />
                        )}
                        <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(config.priority)}`}>
                          {config.priority}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mt-1">
                        {config.description}
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-2">
                        <strong>Exemplos:</strong> {config.examples.join(', ')}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              💡 <strong>Dica:</strong> Não encontrou sua categoria? Escolha a mais próxima e descreva detalhadamente o problema.
            </div>
          </div>
        </div>
      )}

      {/* Screen Reader Instructions */}
      <div id="category-selector-label" className="sr-only">
        Seletor de categoria do problema. Use as setas para navegar pelas opções, Enter para selecionar, Escape para fechar.
      </div>

      {/* Validation Message */}
      {!selectedCategory && (
        <div className="mt-2 text-sm text-red-600" role="alert">
          ⚠️ Por favor, selecione uma categoria para continuar
        </div>
      )}
    </div>
  )
}
