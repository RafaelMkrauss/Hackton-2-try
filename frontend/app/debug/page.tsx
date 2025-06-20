'use client'

import { TestMap } from '@/components/maps/TestMap'

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Google Maps Debug</h1>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <div className="space-y-2 text-sm">
              <p><strong>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:</strong> {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? `${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.substring(0, 15)}...` : 'Not found'}</p>
              <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
              <p><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Google Maps Test</h2>
            <TestMap />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Browser Information</h2>
            <div className="space-y-2 text-sm">
              <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server-side'}</p>
              <p><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server-side'}</p>
              <p><strong>Protocol:</strong> {typeof window !== 'undefined' ? window.location.protocol : 'Server-side'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Links</h2>
            <div className="space-y-2">
              <a href="/test-maps.html" target="_blank" className="block text-blue-600 hover:text-blue-800">
                📄 Test HTML Page (Direct API)
              </a>
              <a href="/map" className="block text-blue-600 hover:text-blue-800">
                🗺️ React Map Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
