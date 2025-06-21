'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function TestPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/reports/public')
        setReports(response.data.reports || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page - Reports</h1>
      <p className="mb-4">Found {reports.length} reports</p>
      <div className="space-y-2">
        {reports.map((report: any) => (
          <div key={report.id} className="p-4 border rounded">
            <h3 className="font-semibold">{report.title || report.category}</h3>
            <p className="text-gray-600">{report.description}</p>
            <p className="text-sm text-gray-500">Status: {report.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
