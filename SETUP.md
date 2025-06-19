# 🚀 Sistema de Relatórios - Guia de Instalação e Execução

## 📋 Resumo do Projeto

Este é um sistema completo de gerenciamento de relatórios urbanos construído com as melhores tecnologias modernas:

### 🛠️ Stack Tecnológica

**Backend (NestJS)**

- **Framework**: NestJS + TypeScript
- **Banco de Dados**: SQLite + Prisma ORM
- **Autenticação**: JWT com bcryptjs
- **Real-time**: WebSockets (Socket.io)
- **Upload**: Multer para imagens
- **Validação**: class-validator + class-transformer

**Frontend (Next.js)**

- **Framework**: Next.js 14 + React 18 + TypeScript
- **Estilização**: TailwindCSS + componentes customizados
- **Maps**: Google Maps API (@react-google-maps/api)
- **Estado**: React Query + Context API
- **Forms**: React Hook Form
- **Notificações**: React Hot Toast

## 🏗️ Arquitetura do Sistema

### Backend (Porto 3001)

```
/api
├── /auth          # Autenticação (login, register, anonymous)
├── /users         # Perfil e estatísticas do usuário
├── /reports       # CRUD de relatórios + mapa
├── /staff         # Dashboard administrativo
├── /uploads       # Upload de imagens
└── /notifications # Sistema de notificações
```

### Frontend (Porto 3003)

```
/
├── /                 # Landing page
├── /login-user       # Login de usuários
├── /login-staff      # Login de staff
├── /dashboard-user   # Dashboard do usuário
├── /dashboard-staff  # Dashboard administrativo
├── /denunciar        # Criar relatório
├── /mapa            # Visualização no mapa
├── /ranking         # Ranking de problemas
└── /retornos        # Feedback/retornos
```

## 📊 Modelos de Dados

### User

- **id**: Identificador único (cuid)
- **email**: Email único (nullable para usuários anônimos)
- **password**: Senha criptografada (bcrypt)
- **name**: Nome do usuário
- **role**: "USER" | "STAFF" | "ADMIN"
- **isActive**: Status ativo/inativo

### Report

- **id**: Identificador único
- **userId**: Referência ao usuário (nullable para anônimos)
- **photoUrl**: URL da foto
- **category**: Categoria do problema
- **description**: Descrição detalhada
- **latitude/longitude**: Coordenadas geográficas
- **address**: Endereço formatado
- **status**: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED"
- **priority**: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
- **comment**: Comentário do staff
- **staffId**: ID do staff que atendeu

### Notification

- **id**: Identificador único
- **userId**: Usuário destinatário
- **title**: Título da notificação
- **message**: Mensagem
- **read**: Status de leitura
- **type**: Tipo da notificação

## 🚀 Como Executar

### 1. Pré-requisitos

- Node.js 18+
- npm ou yarn
- Chave da API do Google Maps (opcional)

### 2. Instalação

```bash
# Clonar o repositório
git clone <url-do-repo>
cd Hackton-2-try

# Instalar dependências
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configuração do Backend

```bash
cd backend

# Copiar arquivo de ambiente
cp .env.example .env

# Configurar banco de dados
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Configuração do Frontend

```bash
cd frontend

# Copiar arquivo de ambiente
cp .env.example .env.local

# Adicionar chave do Google Maps (opcional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua-chave-aqui
```

### 5. Executar o Sistema

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**URLs de Acesso:**

- Frontend: http://localhost:3003
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api

## 👤 Usuários de Teste

O sistema já vem com usuários de teste configurados:

**Staff/Admin:**

- Email: `staff@hackaton.com`
- Senha: `staff123`

**Usuário Regular:**

- Email: `user@hackaton.com`
- Senha: `user123`

## 🎯 Funcionalidades Principais

### Para Usuários

- ✅ Registro/Login de conta
- ✅ Criação de relatórios com localização
- ✅ Upload de fotos
- ✅ Acompanhamento de status
- ✅ Dashboard pessoal
- ✅ Notificações em tempo real

### Para Staff

- ✅ Dashboard administrativo
- ✅ Visualização de todos os relatórios
- ✅ Atualização de status
- ✅ Comentários em relatórios
- ✅ Estatísticas e analytics
- ✅ Mapa administrativo

### Recursos Técnicos

- ✅ Autenticação JWT segura
- ✅ Upload de imagens
- ✅ WebSockets para tempo real
- ✅ API REST completa
- ✅ Interface responsiva
- ✅ Dark mode (planejado)
- ✅ Localização com Google Maps

## 🔧 Estrutura de Pastas

```
Hackton-2-try/
├── backend/
│   ├── src/
│   │   ├── auth/           # Módulo de autenticação
│   │   ├── users/          # Módulo de usuários
│   │   ├── reports/        # Módulo de relatórios
│   │   ├── staff/          # Módulo administrativo
│   │   ├── uploads/        # Módulo de upload
│   │   ├── notifications/  # Módulo de notificações
│   │   ├── websocket/      # Módulo WebSocket
│   │   └── prisma/         # Serviço Prisma
│   ├── prisma/
│   │   ├── schema.prisma   # Schema do banco
│   │   └── seed.ts         # Dados iniciais
│   └── uploads/            # Arquivos enviados
├── frontend/
│   ├── app/                # App Router (Next.js 14)
│   ├── components/         # Componentes reutilizáveis
│   ├── lib/                # Utilitários e configurações
│   └── public/             # Arquivos públicos
└── README.md
```

## 🔐 Segurança

- **Autenticação**: JWT com expiração configurável
- **Senhas**: Hash bcrypt com salt rounds 12
- **CORS**: Configurado para frontend específico
- **Validação**: Validação completa de dados de entrada
- **Rate Limiting**: Implementado para uploads

## 📱 API Endpoints

### Autenticação

- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/anonymous` - Usuário anônimo

### Relatórios

- `GET /api/reports` - Listar (staff only)
- `POST /api/reports` - Criar
- `GET /api/reports/:id` - Detalhes
- `PUT /api/reports/:id/status` - Atualizar status (staff)
- `GET /api/reports/map` - Dados para mapa
- `GET /api/reports/my-reports` - Meus relatórios

### Upload

- `POST /api/uploads/image` - Upload de imagem

### Usuários

- `GET /api/users/profile` - Perfil
- `PUT /api/users/profile` - Atualizar perfil
- `GET /api/users/stats` - Estatísticas

### Staff

- `GET /api/staff/dashboard` - Dashboard
- `GET /api/staff/analytics` - Analytics
- `GET /api/staff/map-data` - Dados completos do mapa

## 🌐 Deploy (Próximos Passos)

Para deploy em produção:

1. **Backend**: Vercel, Railway, ou VPS
2. **Frontend**: Vercel ou Netlify
3. **Banco**: PostgreSQL (migração automática via Prisma)
4. **Arquivos**: AWS S3 ou similar

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja LICENSE para detalhes.

---

**Desenvolvido para o Hackaton 2025** 🏆
