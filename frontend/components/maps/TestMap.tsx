'use client'

import { useEffect, useState } from 'react'

export function TestMap() {
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    // Test if Google Maps is loaded
    const testGoogleMaps = () => {
      console.log('Testing Google Maps...')
      console.log('window.google:', typeof window.google)
      console.log('window.google.maps:', typeof window.google?.maps)
      
      if (window.google && window.google.maps) {
        setStatus('loaded')
        console.log('✅ Google Maps loaded successfully')
      } else {
        setError('Google Maps não foi carregado')
        setStatus('error')
        console.log('❌ Google Maps not loaded')
      }
    }

    // Test immediately
    testGoogleMaps()

    // Also test after a delay
    const timeout = setTimeout(testGoogleMaps, 2000)

    return () => clearTimeout(timeout)
  }, [])

  if (status === 'loading') {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-700">🔄 Carregando Google Maps...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">❌ {error}</p>
        <div className="mt-2 text-sm text-red-600">
          <p>Chave API: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? '✅ Definida' : '❌ Não encontrada'}</p>
          <p>window.google: {typeof window.google}</p>
          <p>window.google.maps: {typeof (window as any).google?.maps}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-green-700">✅ Google Maps carregado com sucesso!</p>
      <div className="mt-2 text-sm text-green-600">
        <p>API está funcionando corretamente</p>
      </div>
    </div>
  )
}
