'use client'

import { useJsApiLoader } from '@react-google-maps/api'
import { useEffect, useState } from 'react'

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ['places']

interface GoogleMapsProviderProps {
  children: React.ReactNode
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (info: string) => {
    console.log(`[GoogleMapsProvider] ${info}`)
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
  }

  // Debug: Log the API key (remove in production)
  useEffect(() => {
    addDebugInfo(`API Key: ${apiKey ? `${apiKey.substring(0, 15)}...` : 'Not found'}`)
  }, [apiKey])

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
    libraries,
    language: 'pt-BR',
    region: 'BR',
    version: 'weekly' // Try using a specific version
  })

  useEffect(() => {
    if (isLoaded) {
      addDebugInfo('Google Maps loaded successfully via @react-google-maps/api')
    }
  }, [isLoaded])

  useEffect(() => {
    if (loadError) {
      addDebugInfo(`Load error: ${loadError.message}`)
      console.error('Google Maps load error details:', loadError)
    }
  }, [loadError])

  if (loadError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-medium">❌ Erro ao carregar Google Maps</p>
        <p className="text-red-600 text-sm mt-1">
          {loadError.message || 'Verifique sua chave de API e configurações.'}
        </p>
        <details className="mt-2">
          <summary className="text-red-600 text-sm cursor-pointer">Detalhes técnicos e Debug</summary>
          <div className="text-xs text-red-500 mt-1 bg-red-100 p-2 rounded space-y-1">
            <p><strong>Chave API:</strong> {apiKey ? `${apiKey.substring(0, 15)}...` : 'Não encontrada'}</p>
            <p><strong>Erro:</strong> {loadError.message}</p>
            <div className="mt-2">
              <strong>Debug Log:</strong>
              <ul className="list-disc list-inside ml-2 space-y-1">
                {debugInfo.map((info, index) => (
                  <li key={index}>{info}</li>
                ))}
              </ul>
            </div>
            <p><strong>Possíveis soluções:</strong></p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Verifique se a API Key está correta</li>
              <li>Ative as APIs necessárias (Maps JavaScript, Places, Geocoding)</li>
              <li>Verifique as restrições de domínio da API Key (deve permitir localhost:3001)</li>
              <li>Ative faturamento na Google Cloud Console</li>
              <li>Verifique se a quota não foi excedida</li>
            </ul>
          </div>
        </details>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando Google Maps...</p>
          {!apiKey && (
            <p className="text-red-600 text-sm mt-2">
              ⚠️ Chave API do Google Maps não encontrada
            </p>
          )}
          {debugInfo.length > 0 && (
            <details className="mt-2 text-left">
              <summary className="text-gray-600 text-sm cursor-pointer">Debug Info</summary>
              <div className="text-xs text-gray-500 mt-1 bg-gray-100 p-2 rounded">
                <ul className="space-y-1">
                  {debugInfo.map((info, index) => (
                    <li key={index}>{info}</li>
                  ))}
                </ul>
              </div>
            </details>
          )}
        </div>
      </div>
    )
  }

  return <>{children}</>
}
