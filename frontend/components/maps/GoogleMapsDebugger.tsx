'use client'

import { useEffect, useState } from 'react'

export function GoogleMapsDebugger() {
  const [debugInfo, setDebugInfo] = useState<{
    apiKey: string
    windowGoogle: string
    windowGoogleMaps: string
    scriptsFound: number
    lastCheck: string
  }>({
    apiKey: 'Checking...',
    windowGoogle: 'Checking...',
    windowGoogleMaps: 'Checking...',
    scriptsFound: 0,
    lastCheck: new Date().toLocaleTimeString()
  })

  const checkGoogleMapsStatus = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]')
    
    setDebugInfo({
      apiKey: apiKey ? `✅ ${apiKey.substring(0, 15)}...` : '❌ Não encontrada',
      windowGoogle: window.google ? (typeof window.google === 'object' ? '✅ Object disponível' : `✅ ${typeof window.google}`) : '❌ Não disponível',
      windowGoogleMaps: window.google?.maps ? (typeof window.google.maps === 'object' ? '✅ Object disponível' : `✅ ${typeof window.google.maps}`) : '❌ Não disponível',
      scriptsFound: scripts.length,
      lastCheck: new Date().toLocaleTimeString()
    })
  }

  useEffect(() => {
    // Check immediately
    checkGoogleMapsStatus()

    // Check every second for 10 seconds
    const interval = setInterval(checkGoogleMapsStatus, 1000)
    setTimeout(() => clearInterval(interval), 10000)

    return () => clearInterval(interval)
  }, [])

  const forceInitialize = () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      alert('API Key não encontrada!')
      return
    }

    // Try to manually initialize
    if (window.google?.maps?.Map) {
      try {
        const testDiv = document.createElement('div')
        testDiv.style.width = '100px'
        testDiv.style.height = '100px'
        document.body.appendChild(testDiv)

        const map = new google.maps.Map(testDiv, {
          center: { lat: -15.7942, lng: -47.8822 }, // Brasília
          zoom: 10
        })

        document.body.removeChild(testDiv)
        alert('✅ Google Maps funcionando perfeitamente!')
      } catch (error) {
        alert(`❌ Erro ao criar mapa: ${error instanceof Error ? error.message : String(error)}`)
      }
    } else {
      alert('❌ Google Maps não está carregado!')
    }
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-bold text-blue-800 mb-3">🔍 Google Maps Debug Info</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="font-medium">Chave API:</span>
          <span>{debugInfo.apiKey}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium">window.google:</span>
          <span>{debugInfo.windowGoogle}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium">window.google.maps:</span>
          <span>{debugInfo.windowGoogleMaps}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium">Scripts encontrados:</span>
          <span>{debugInfo.scriptsFound}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium">Última verificação:</span>
          <span>{debugInfo.lastCheck}</span>
        </div>
      </div>

      <div className="mt-4 space-x-2">
        <button
          onClick={checkGoogleMapsStatus}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          🔄 Atualizar
        </button>
        
        <button
          onClick={forceInitialize}
          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
        >
          🧪 Testar Mapa
        </button>
      </div>

      {window.google?.maps && (
        <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded text-sm">
          <strong>✅ Google Maps detectado!</strong>
          <br />
          APIs disponíveis: {Object.keys(window.google.maps).slice(0, 5).join(', ')}...
        </div>
      )}
    </div>
  )
}

// Extend window type
declare global {
  interface Window {
    googleMapsDebugger?: any
  }
}
