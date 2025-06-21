'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SemestralEvaluationPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Avaliação Semestral - Teste
        </h1>
        <p className="text-gray-600">
          Esta é uma página de teste para verificar se o componente React está funcionando.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Voltar ao Dashboard
        </button>
      </div>
    </div>
  )
}
