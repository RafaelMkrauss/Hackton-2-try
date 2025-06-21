'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { REPORT_CATEGORIES } from '@/lib/constants/categories'
import { LocationPicker } from '@/components/maps/LocationPicker'
import { WorkingLocationPicker } from '@/components/maps/WorkingLocationPicker'
import { AccessibleCategorySelector } from '@/components/forms/AccessibleCategorySelector'
import { 
  MapPinIcon, 
  CameraIcon, 
  XIcon, 
  LoaderIcon,
  CheckCircleIcon,
  EditIcon,
  MessageSquareIcon,
  MapIcon,
  ImageIcon,
  AlertCircleIcon
} from 'lucide-react'

interface FormData {
  title: string
  description: string
  category: string
  location: string
  latitude?: number
  longitude?: number
}

export default function NewReportPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    location: ''
  })
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 5) {
      setError('Máximo de 5 imagens permitidas')
      return
    }

    setImages(prev => [...prev, ...files])
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.category || !formData.location) {
        setError('Por favor, preencha todos os campos obrigatórios')
        return
      }

      if (!formData.latitude || !formData.longitude) {
        setError('Por favor, selecione uma localização no mapa')
        return
      }      // Create the report data
      const reportData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        address: formData.location,
        photoUrl: null // For now, we'll handle file upload separately if needed
      }

      const response = await api.post('/reports', reportData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err: any) {
      console.error('Error creating report:', err)
      setError(err.response?.data?.message || 'Erro ao criar denúncia')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircleIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Denúncia criada com sucesso!</h1>
          <p className="text-gray-600">Redirecionando para o dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <EditIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nova Denúncia</h1>
                <p className="text-gray-600">📝 Reporte um problema urbano de forma simples</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-700 focus:ring-2 focus:ring-gray-300 rounded-lg p-2 transition-colors"
              aria-label="Cancelar e voltar ao dashboard"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-8">
          {/* Progress indicator */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <EditIcon className="w-5 h-5 text-blue-600 mr-2" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-blue-900">Preencha os dados da sua denúncia</h2>
                <p className="text-sm text-blue-700">Quanto mais detalhes, melhor será o atendimento</p>
              </div>
            </div>
          </div>

          {/* Título */}
          <div>
            <label htmlFor="title" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <EditIcon className="w-4 h-4 mr-2 text-gray-500" />
              Título da Denúncia *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="Ex: Buraco na rua principal"
              aria-describedby="title-help"
              required
            />
            <p id="title-help" className="text-sm text-gray-500 mt-1">
              💡 Seja claro e específico sobre o problema
            </p>
          </div>          {/* Categoria */}
          <div>
            <label htmlFor="category" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <AlertCircleIcon className="w-4 h-4 mr-2 text-gray-500" />
              Categoria * 
              <span className="text-gray-500 text-xs ml-2">(Use as setas ↑↓ para navegar)</span>
            </label>
            <AccessibleCategorySelector
              selectedCategory={formData.category}
              onCategorySelect={(category) => setFormData(prev => ({ ...prev, category }))}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              🎯 Escolha a categoria que melhor descreve o problema
            </p>
          </div>          {/* Descrição */}
          <div>
            <label htmlFor="description" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MessageSquareIcon className="w-4 h-4 mr-2 text-gray-500" />
              Descrição *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              placeholder="Descreva o problema em detalhes... Exemplo: O buraco tem aproximadamente 1 metro de diâmetro e está causando problemas para carros e pedestres."
              aria-describedby="description-help"
              required
            />
            <p id="description-help" className="text-sm text-gray-500 mt-1">
              📝 Inclua detalhes como tamanho, localização exata, quando começou o problema, e como afeta as pessoas
            </p>
          </div>          {/* Localização */}
          <div>
            <label htmlFor="location" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MapPinIcon className="w-4 h-4 mr-2 text-gray-500" />
              Localização *
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 text-base"
              placeholder="Digite o endereço ou descrição do local (ex: Rua das Flores, 123)"
              aria-describedby="location-help"
              required
            />
            <p id="location-help" className="text-sm text-gray-500 mb-4">
              📍 Digite o endereço e depois marque o local exato no mapa abaixo
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center">
                <MapIcon className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-blue-900">Localização do Problema</h3>
              </div>              
              {/* Working LocationPicker */}

          
              
              {/* Fallback LocationPicker for comparison */}
         
               
                <div className="mt-2 p-4 bg-gray-50 rounded">
                  <LocationPicker
                    onLocationSelect={(location) => {
                      setFormData(prev => ({
                        ...prev,
                        latitude: location.lat,
                        longitude: location.lng,
                        location: location.address || prev.location
                      }))
                    }}
                    initialLocation={
                      formData.latitude && formData.longitude 
                        ? { lat: formData.latitude, lng: formData.longitude }
                        : undefined
                    }
                  />
                </div>
             
            </div>            
            {formData.latitude && formData.longitude && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                  <p className="text-sm text-green-700">
                    ✅ Localização confirmada: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Imagens */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="w-4 h-4 mr-2 text-gray-500" />
              Imagens (opcional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="images"
                aria-describedby="images-help"
              />
              <label
                htmlFor="images"
                className="cursor-pointer flex flex-col items-center"
              >
                <CameraIcon className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-gray-600 font-medium">📸 Clique para adicionar fotos</span>
                <span className="text-sm text-gray-500 mt-1">Fotos ajudam muito a resolver o problema mais rápido</span>
              </label>
            </div>
            <p id="images-help" className="text-sm text-gray-500 mt-2">
              📷 Máximo 5 imagens, até 10MB cada. Tire fotos que mostrem bem o problema.
            </p>            {/* Preview das imagens */}
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  📸 Imagens selecionadas ({imagePreviews.length}/5):
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Foto do problema ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:ring-2 focus:ring-red-300 transition-colors"
                        aria-label={`Remover imagem ${index + 1}`}
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>          {/* Erro */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex">
                <AlertCircleIcon className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-800 font-medium">Ops! Algo deu errado</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="bg-gray-50 border-t p-6 -mx-6 -mb-6 rounded-b-lg">
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 transition-colors"
              >
                ← Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.title || !formData.category || !formData.description || !formData.location}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center focus:ring-2 focus:ring-blue-300 transition-colors font-medium"
              >
                {isSubmitting ? (
                  <>
                    <LoaderIcon className="w-5 h-5 animate-spin mr-2" />
                    Enviando denúncia...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Criar Denúncia
                  </>
                )}
              </button>
            </div>
            {(!formData.title || !formData.category || !formData.description || !formData.location) && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                ⚠️ Preencha todos os campos obrigatórios (*) para continuar
              </p>
            )}
          </div>
        </form>
      </main>
    </div>
  )
}
