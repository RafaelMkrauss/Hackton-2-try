'use client'

import { useEffect, useRef, useState } from 'react'

export function SimpleTestMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState('Iniciando...')

  useEffect(() => {
    let attempts = 0
    const maxAttempts = 50

    const tryCreateMap = () => {
      attempts++
      setStatus(`Tentativa ${attempts}/${maxAttempts}`)

      if (!mapRef.current) {
        setStatus('Container não encontrado')
        return
      }

      if (!(window as any).google?.maps?.Map) {
        if (attempts < maxAttempts) {
          setTimeout(tryCreateMap, 100)
        } else {
          setStatus('Google Maps não carregou')
        }
        return
      }

      try {
        console.log('=== TESTE SIMPLES DO MAPA ===')
        console.log('Container:', mapRef.current)
        console.log('Google Maps:', (window as any).google.maps)
        
        // Force container size
        const container = mapRef.current
        container.style.width = '100%'
        container.style.height = '400px'
        container.style.backgroundColor = '#e0e0e0'
        container.style.border = '2px solid red'
        
        console.log('Container preparado, criando mapa...')
        
        const map = new (window as any).google.maps.Map(container, {
          center: { lat: -15.7942, lng: -47.8822 }, // Brasília
          zoom: 10,
          mapTypeId: 'roadmap'
        })
        
        console.log('Mapa criado:', map)
        setStatus('✅ Mapa criado com sucesso!')
        
        // Add a simple marker
        const marker = new (window as any).google.maps.Marker({
          position: { lat: -15.7942, lng: -47.8822 }, // Brasília
          map: map,
          title: 'Teste'
        })
        
        console.log('Marker adicionado:', marker)

      } catch (error) {
        console.error('Erro ao criar mapa:', error)
        setStatus(`❌ Erro: ${error}`)
      }
    }

    tryCreateMap()
  }, [])

  return (
    <div className="p-4 border-2 border-blue-500 rounded">
      <h3 className="text-lg font-bold mb-2">🧪 Teste Simples do Mapa</h3>
      <div className="mb-2 text-sm">Status: {status}</div>
      <div 
        ref={mapRef}
        style={{
          width: '100%',
          height: '400px',
          backgroundColor: '#f0f0f0',
          border: '2px solid #333',
          borderRadius: '8px'
        }}
      />
      <div className="mt-2 text-xs text-gray-600">
        Se você ver um mapa aqui, o problema é no componente principal.
        Se não ver, o problema é na configuração do Google Maps.
      </div>
    </div>
  )
}
