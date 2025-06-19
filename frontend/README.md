# Frontend - Sistema de Denúncias Urbanas

Este é o frontend da aplicação de denúncias urbanas, construído com Next.js 14, TypeScript, TailwindCSS e outras tecnologias modernas.

## 🚀 Tecnologias Utilizadas

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Framework CSS utilitário
- **React Query** - Gerenciamento de estado e cache
- **Lucide React** - Ícones
- **React Hot Toast** - Notificações
- **Axios** - Cliente HTTP

## 📁 Estrutura do Projeto

```
frontend/
├── app/                    # App Router (Next.js 13+)
│   ├── dashboard/         # Dashboard principal
│   ├── login/            # Página de login
│   ├── register/         # Página de registro
│   ├── reports/          # Páginas relacionadas a denúncias
│   │   ├── new/         # Formulário de nova denúncia
│   │   └── [id]/        # Detalhes da denúncia
│   ├── map/              # Mapa interativo
│   ├── globals.css       # Estilos globais
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Página inicial (landing)
├── components/
│   ├── landing/          # Componentes da página inicial
│   ├── providers/        # Context providers
│   └── ui/               # Componentes de interface
├── lib/                  # Bibliotecas e utilitários
│   ├── auth/            # Context e hooks de autenticação
│   ├── socket/          # Context de WebSocket
│   ├── theme/           # Provider de temas
│   └── api.ts           # Configuração do Axios
└── public/              # Arquivos estáticos
```

## 🎨 Páginas Implementadas

### 1. Landing Page (`/`)

- **Componente**: `app/page.tsx` + `components/landing/LandingPage.tsx`
- **Funcionalidade**: Página inicial com apresentação da plataforma
- **Recursos**:
  - Hero section com call-to-action
  - Seção de features e benefícios
  - Estatísticas da plataforma
  - Como funciona (passo a passo)
  - Footer completo
  - Navegação para login/registro

### 2. Login (`/login`)

- **Componente**: `app/login/page.tsx`
- **Funcionalidade**: Autenticação de usuários
- **Recursos**:
  - Formulário de login com email/senha
  - Validação de campos
  - Estados de loading e erro
  - Toggle para mostrar/ocultar senha
  - Redirecionamento automático após login
  - Link para registro

### 3. Registro (`/register`)

- **Componente**: `app/register/page.tsx`
- **Funcionalidade**: Cadastro de novos usuários
- **Recursos**:
  - Formulário completo (nome, email, senha, confirmar senha)
  - Validação de formulário
  - Confirmação de senha
  - Estados de loading e sucesso
  - Redirecionamento automático após registro

### 4. Dashboard (`/dashboard`)

- **Componente**: `app/dashboard/page.tsx`
- **Funcionalidade**: Painel principal do usuário
- **Recursos**:
  - Estatísticas de denúncias (cards com métricas)
  - Ações rápidas (nova denúncia, mapa, ver todas)
  - Lista de denúncias recentes
  - Diferenciação por role (USER/STAFF)
  - Header com navegação e notificações

### 5. Lista de Denúncias (`/reports`)

- **Componente**: `app/reports/page.tsx`
- **Funcionalidade**: Listagem e filtros de denúncias
- **Recursos**:
  - Filtros por categoria, status e localização
  - Busca por texto
  - Paginação
  - Cards informativos para cada denúncia
  - Status coloridos e ícones
  - Click para ver detalhes

### 6. Nova Denúncia (`/reports/new`)

- **Componente**: `app/reports/new/page.tsx`
- **Funcionalidade**: Formulário para criar denúncias
- **Recursos**:
  - Formulário completo (título, categoria, descrição, localização)
  - Upload de múltiplas imagens (até 5)
  - Preview de imagens
  - Geolocalização automática
  - Validação de campos obrigatórios
  - Estados de loading e sucesso

### 7. Detalhes da Denúncia (`/reports/[id]`)

- **Componente**: `app/reports/[id]/page.tsx`
- **Funcionalidade**: Visualização completa de uma denúncia
- **Recursos**:
  - Informações completas da denúncia
  - Galeria de imagens
  - Sistema de comentários
  - Atualização de status (para STAFF)
  - Sidebar com localização e informações
  - Breadcrumb de navegação

### 8. Mapa (`/map`)

- **Componente**: `app/map/page.tsx`
- **Funcionalidade**: Visualização geográfica das denúncias
- **Recursos**:
  - Sidebar com filtros e lista
  - Legendas por status
  - Seleção de denúncias no mapa
  - Popup com informações resumidas
  - Integração preparada para Google Maps

## 🔧 Componentes Principais

### Providers (`components/providers/Providers.tsx`)

- **React Query**: Cache e gerenciamento de estado
- **AuthProvider**: Contexto de autenticação
- **ThemeProvider**: Sistema de temas
- **SocketProvider**: WebSocket para tempo real
- **ToastProvider**: Sistema de notificações

### AuthContext (`lib/auth/AuthContext.tsx`)

- **Funcionalidades**:
  - Login/logout com JWT
  - Persistência com cookies
  - Estados de loading
  - Verificação de roles
  - Redirecionamentos automáticos

### Toast System (`components/ui/Toast.tsx`)

- **Tipos**: success, error, warning, info
- **Recursos**:
  - Auto-dismiss configurável
  - Animações de entrada/saída
  - Múltiplos toasts simultâneos
  - Remoção manual

## 🎯 Recursos Implementados

### ✅ Funcionalidades Completas

- [x] Sistema de autenticação (login/registro/logout)
- [x] Dashboard responsivo com estatísticas
- [x] CRUD completo de denúncias
- [x] Upload de múltiplas imagens
- [x] Sistema de filtros e busca
- [x] Paginação
- [x] Sistema de comentários
- [x] Atualização de status (STAFF)
- [x] Geolocalização
- [x] Sistema de notificações (Toast)
- [x] Estados de loading e erro
- [x] Design responsivo
- [x] Validação de formulários

### 🔄 Recursos Preparados/Estruturados

- [x] WebSocket context (estrutura pronta)
- [x] Sistema de temas (light/dark preparado)
- [x] Integração com Google Maps (estrutura pronta)
- [x] Sistema de notificações em tempo real (estrutura pronta)

## 🚀 Como Executar

```bash
# Navegar para a pasta frontend
cd frontend

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start
```

## 🔑 Variáveis de Ambiente

Crie um arquivo `.env.local` baseado no `.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_aqui
```

## 📱 Design Responsivo

O frontend foi desenvolvido com design mobile-first:

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

Todos os componentes são totalmente responsivos e seguem as melhores práticas de UX/UI.

## 🎨 Sistema de Design

### Cores Principais

- **Primary**: Blue (blue-600)
- **Success**: Green (green-600)
- **Warning**: Yellow (yellow-600)
- **Error**: Red (red-600)

### Tipografia

- **Font Family**: Inter (Tailwind default)
- **Escalas**: text-xs a text-6xl

### Espaçamento

- **Grid**: Sistema de 8px
- **Container**: max-w-7xl mx-auto

## 🔗 Integração com Backend

O frontend está configurado para integrar com a API backend:

- **Base URL**: `NEXT_PUBLIC_API_URL`
- **Autenticação**: JWT Bearer tokens
- **WebSocket**: Para atualizações em tempo real
- **Upload**: Formulários multipart para imagens

## 📊 Performance

- **Bundle Size**: Otimizado com Next.js
- **Images**: Componente Image do Next.js
- **Loading**: Lazy loading e code splitting
- **Cache**: React Query para cache inteligente

## 🔒 Segurança

- **XSS**: Sanitização automática do React
- **CSRF**: Tokens JWT
- **Validação**: Client-side e server-side
- **Cookies**: HttpOnly e Secure flags

Este frontend fornece uma experiência completa e moderna para o sistema de denúncias urbanas, com foco na usabilidade e performance.
