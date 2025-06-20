'use client'

import { useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon,
  KeyboardIcon,
  EyeIcon,
  VolumeXIcon,
  MousePointerIcon,
  SmartphoneIcon,
  AccessibilityIcon,
  HelpCircleIcon,
  BookOpenIcon,
  VideoIcon
} from 'lucide-react'

export default function AccessibilityHelpPage() {
  const router = useRouter()

  const accessibilityFeatures = [
    {
      icon: KeyboardIcon,
      emoji: '⌨️',
      title: 'Navegação por Teclado',
      description: 'Use as teclas Tab, Enter, Esc e setas para navegar sem mouse',
      tips: [
        'Tab: Avançar entre elementos',
        'Shift + Tab: Voltar entre elementos', 
        'Enter/Espaço: Ativar botões e links',
        'Esc: Fechar menus e janelas',
        '↑↓: Navegar em listas e menus'
      ]
    },
    {
      icon: EyeIcon,
      emoji: '👁️',
      title: 'Visual e Contraste',
      description: 'Design com cores contrastantes e ícones claros',
      tips: [
        'Ícones coloridos para cada categoria',
        'Texto grande e legível',
        'Cores com significado (verde = resolvido)',
        'Emojis para ajudar na compreensão'
      ]
    },
    {
      icon: VolumeXIcon,
      emoji: '🔊',
      title: 'Leitores de Tela',
      description: 'Compatível com tecnologias assistivas como NVDA, JAWS',
      tips: [
        'Textos alternativos em imagens',
        'Descrições em botões e links',
        'Navegação por marcos e regiões',
        'Anúncios de mudanças de estado'
      ]
    },
    {
      icon: MousePointerIcon,
      emoji: '🖱️',
      title: 'Controles Maiores',
      description: 'Botões e links grandes e fáceis de clicar',
      tips: [
        'Área de clique ampliada',
        'Espaçamento adequado entre elementos',
        'Feedback visual ao passar o mouse',
        'Foco visível nos elementos'
      ]
    },
    {
      icon: SmartphoneIcon,
      emoji: '📱',
      title: 'Mobile Responsivo',
      description: 'Funciona bem em celulares e tablets',
      tips: [
        'Layout adaptável ao tamanho da tela',
        'Texto legível em telas pequenas',
        'Botões grandes para touch',
        'Navegação simplificada no mobile'
      ]
    },
    {
      icon: AccessibilityIcon,
      emoji: '♿',
      title: 'Inclusão Total',
      description: 'Pensado para pessoas com diferentes necessidades',
      tips: [
        'Linguagem simples e direta',
        'Instruções claras em cada etapa',
        'Múltiplas formas de navegação',
        'Tolerante a erros do usuário'
      ]
    }
  ]

  const usageGuide = [
    {
      step: '1',
      emoji: '📝',
      title: 'Criar Denúncia',
      description: 'Clique em "Nova Denúncia" e preencha o formulário com detalhes do problema',
      tips: ['Use a categoria correta', 'Descreva bem o problema', 'Adicione fotos se possível']
    },
    {
      step: '2',
      emoji: '📍',
      title: 'Marcar Localização',
      description: 'Digite o endereço e marque o local exato no mapa interativo',
      tips: ['Seja específico no endereço', 'Use o mapa para precisão', 'Confirme a localização']
    },
    {
      step: '3',
      emoji: '📊',
      title: 'Acompanhar Status',
      description: 'Veja o progresso da sua denúncia no dashboard',
      tips: ['Status atualizado em tempo real', 'Notificações de mudanças', 'Histórico completo']
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <HelpCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Central de Ajuda</h1>
                <p className="text-gray-600">♿ Acessibilidade e Como Usar</p>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-700 focus:ring-2 focus:ring-blue-300 rounded-lg p-2 transition-colors"
              aria-label="Voltar à página anterior"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-1" />
              Voltar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <AccessibilityIcon className="w-8 h-8 text-blue-600 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-blue-900 mb-2">
                ♿ Plataforma Acessível para Todos
              </h2>
              <p className="text-blue-800 leading-relaxed">
                Esta plataforma foi desenvolvida pensando em <strong>todos os usuários</strong>, 
                incluindo pessoas com deficiência, idosos, e pessoas com pouca experiência em tecnologia. 
                Nosso objetivo é tornar o reporte de problemas urbanos simples e acessível para toda a comunidade.
              </p>
            </div>
          </div>
        </div>

        {/* Accessibility Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <EyeIcon className="w-6 h-6 mr-2 text-blue-600" />
            🎯 Recursos de Acessibilidade
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accessibilityFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-start">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      <span className="mr-2" aria-hidden="true">{feature.emoji}</span>
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{feature.description}</p>
                    <ul className="space-y-1">
                      {feature.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="text-sm text-gray-500 flex items-start">
                          <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Usage Guide */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <BookOpenIcon className="w-6 h-6 mr-2 text-green-600" />
            📚 Como Usar a Plataforma
          </h2>
          <div className="space-y-6">
            {usageGuide.map((guide, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-lg font-bold text-green-600">{guide.step}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      <span className="mr-2" aria-hidden="true">{guide.emoji}</span>
                      {guide.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{guide.description}</p>
                    <div className="bg-green-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-green-800 mb-2">💡 Dicas:</h4>
                      <ul className="space-y-1">
                        {guide.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="text-sm text-green-700 flex items-start">
                            <span className="text-green-500 mr-2 flex-shrink-0">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <KeyboardIcon className="w-6 h-6 mr-2 text-purple-600" />
            ⌨️ Atalhos de Teclado
          </h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Navegação Geral:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Próximo elemento:</span>
                    <kbd className="bg-gray-100 px-2 py-1 rounded">Tab</kbd>
                  </li>
                  <li className="flex justify-between">
                    <span>Elemento anterior:</span>
                    <kbd className="bg-gray-100 px-2 py-1 rounded">Shift + Tab</kbd>
                  </li>
                  <li className="flex justify-between">
                    <span>Ativar/Selecionar:</span>
                    <kbd className="bg-gray-100 px-2 py-1 rounded">Enter</kbd>
                  </li>
                  <li className="flex justify-between">
                    <span>Fechar/Cancelar:</span>
                    <kbd className="bg-gray-100 px-2 py-1 rounded">Esc</kbd>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Seletor de Categoria:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Categoria acima:</span>
                    <kbd className="bg-gray-100 px-2 py-1 rounded">↑</kbd>
                  </li>
                  <li className="flex justify-between">
                    <span>Categoria abaixo:</span>
                    <kbd className="bg-gray-100 px-2 py-1 rounded">↓</kbd>
                  </li>
                  <li className="flex justify-between">
                    <span>Selecionar categoria:</span>
                    <kbd className="bg-gray-100 px-2 py-1 rounded">Enter</kbd>
                  </li>
                  <li className="flex justify-between">
                    <span>Fechar seletor:</span>
                    <kbd className="bg-gray-100 px-2 py-1 rounded">Esc</kbd>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Support */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <VideoIcon className="w-6 h-6 mr-2 text-orange-600" />
            🆘 Precisa de Mais Ajuda?
          </h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircleIcon className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📞 Suporte Disponível
              </h3>
              <p className="text-gray-600 mb-6">
                Nossa equipe está pronta para ajudar você a usar a plataforma de forma eficiente.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900">📧 Email</h4>
                  <p className="text-blue-700 text-sm">suporte@denuncias.gov.br</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900">📞 Telefone</h4>
                  <p className="text-green-700 text-sm">(11) 0800-123-4567</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900">💬 Chat</h4>
                  <p className="text-purple-700 text-sm">Segunda a Sexta, 8h-18h</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
