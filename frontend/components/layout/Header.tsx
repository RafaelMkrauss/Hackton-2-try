'use client'

import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { 
  LogOutIcon, 
  HomeIcon, 
  MapIcon, 
  FileTextIcon, 
  StarIcon, 
  HelpCircleIcon,
  MenuIcon,
  XIcon,
  UserIcon
} from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
  }

  // Don't show header on login/register pages or landing page
  if (!user || pathname === '/login' || pathname === '/register' || pathname === '/') {
    return null
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, emoji: '🏠', description: 'Página inicial com resumo' },
    { name: 'Denúncias', href: '/reports', icon: FileTextIcon, emoji: '📋', description: 'Ver todas as denúncias' },
    { name: 'Mapa', href: '/map', icon: MapIcon, emoji: '🗺️', description: 'Localização dos problemas' },
    { name: 'Avaliação', href: '/evaluation', icon: StarIcon, emoji: '⭐', description: 'Avaliar serviços públicos' },
    { name: 'Ajuda', href: '/help', icon: HelpCircleIcon, emoji: '❓', description: 'Central de ajuda e acessibilidade' },
  ]

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity focus:ring-2 focus:ring-blue-300 rounded-lg p-1"
                aria-label="Ir para página inicial"
              >                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BS</span>
                </div>                <h1 className="text-xl font-bold text-blue-600">
                  Brasíl<span className="text-cyan-400">IA</span> Segura
                </h1>
              </button>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2" role="navigation" aria-label="Navegação principal">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-300 ${
                      isActive
                        ? 'text-blue-600 bg-blue-50 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    aria-label={`${item.name} - ${item.description}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="mr-2" aria-hidden="true">{item.emoji}</span>
                    <item.icon className="w-4 h-4 mr-2" aria-hidden="true" />
                    {item.name}
                  </button>
                )
              })}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:ring-2 focus:ring-blue-300"
              aria-expanded={mobileMenuOpen}
              aria-label="Menu de navegação"
            >
              {mobileMenuOpen ? (
                <XIcon className="w-6 h-6" aria-hidden="true" />
              ) : (
                <MenuIcon className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
              <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
              <span>👋 Olá, </span>
              <span className="font-medium ml-1">{user.name || user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors focus:ring-2 focus:ring-red-300"
              aria-label="Fazer logout da aplicação"
            >
              <LogOutIcon className="w-4 h-4 mr-2" aria-hidden="true" />
              Sair
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="px-2 pt-2 pb-3 space-y-1" role="navigation" aria-label="Navegação mobile">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      router.push(item.href)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center px-3 py-3 text-base font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-300 ${
                      isActive
                        ? 'text-blue-600 bg-blue-50 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    aria-label={`${item.name} - ${item.description}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="mr-3" aria-hidden="true">{item.emoji}</span>
                    <item.icon className="w-5 h-5 mr-3" aria-hidden="true" />
                    <div className="text-left">
                      <div>{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </button>
                )
              })}
              
              {/* Mobile User Info and Logout */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg mb-2">
                  <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                  <span>👋 {user.name || user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-3 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors focus:ring-2 focus:ring-red-300"
                  aria-label="Fazer logout da aplicação"
                >
                  <LogOutIcon className="w-5 h-5 mr-3" aria-hidden="true" />
                  Sair da Conta
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
