import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { Header } from '@/components/layout/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CidadeReport - Sistema de Denúncias Urbanas Acessível',
  description: 'Sistema completo e acessível para gerenciamento de denúncias urbanas com localização e acompanhamento em tempo real. Projetado para todos os usuários, incluindo pessoas com deficiência.',
  keywords: 'denúncias, urbano, cidade, relatórios, gestão, acessibilidade, inclusivo, PCD',
  openGraph: {
    title: 'CidadeReport - Denúncias Urbanas Acessíveis',
    description: 'Plataforma inclusiva para reportar problemas urbanos',
    type: 'website',
  },
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#2563eb" />
        
        {/* Google Maps API - Loaded globally to avoid React timing issues */}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=pt-BR&region=BR`}
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>
        {/* Skip to content link for screen readers */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium z-50 focus:ring-2 focus:ring-blue-300"
        >
          Pular para o conteúdo principal
        </a>
        
        <Providers>
          <Header />
          <main id="main-content" className="focus:outline-none" tabIndex={-1}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
