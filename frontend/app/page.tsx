'use client'

import { useRouter } from 'next/navigation'
import { MapPinIcon } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MapPinIcon className="w-8 h-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">CidadeReport</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/login')}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Entrar
              </button>
              <button 
                onClick={() => router.push('/register')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Transforme sua cidade
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Reporte problemas urbanos de forma rápida e acompanhe o progresso das soluções em tempo real.
          </p>          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => router.push('/reports/new')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Fazer Denúncia
            </button>
            <button 
              onClick={() => router.push('/evaluation')}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Avaliação Semestral
            </button>
            <button 
              onClick={() => router.push('/map')}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Ver Mapa
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
