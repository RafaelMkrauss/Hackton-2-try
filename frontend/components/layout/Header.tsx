'use client'

import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { LogOutIcon, HomeIcon, MapIcon, FileTextIcon, StarIcon } from 'lucide-react'

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
  }

  // Don't show header on login/register pages or landing page
  if (!user || pathname === '/login' || pathname === '/register' || pathname === '/') {
    return null
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Denúncias', href: '/reports', icon: FileTextIcon },
    { name: 'Mapa', href: '/map', icon: MapIcon },
    { name: 'Avaliação', href: '/evaluation', icon: StarIcon },
  ]

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-blue-600">CidadeReport</h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Olá, <span className="font-medium">{user.name || user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              <LogOutIcon className="w-4 h-4 mr-2" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
