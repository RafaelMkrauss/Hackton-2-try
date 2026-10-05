# Relatos urbanos: hackathon da Campus Party 2025 (4º lugar)

Aplicação web para moradores relatarem problemas da cidade, como iluminação pública, buracos na via e limpeza urbana, com foto e localização no mapa. A equipe responsável acompanha os relatos em um painel e atualiza o status de cada um. A foto enviada passa por um modelo YOLOv5 que identifica o problema, e os moradores também podem avaliar os serviços públicos da sua região por categoria.

Projeto desenvolvido em equipe no hackathon da Campus Party, em junho de 2025, onde ficamos em 4º lugar.

## Minha parte

- Integração com o Google Maps: visualização dos relatos no mapa e escolha da localização ao criar um relato.
- Partes da interface visual do front-end.

## 🚀 Tecnologias Utilizadas

### Frontend

- **React** + **Next.js** (App Router)
- **TypeScript**
- **TailwindCSS** (com dark mode e acessibilidade)
- **@react-google-maps/api** para renderização de mapas
- Interface completamente em português

### Backend

- **NestJS** para API REST
- **JWT Authentication** com @nestjs/jwt
- **WebSockets** para atualizações em tempo real
- **Multer** para upload de arquivos
- Controle de acesso baseado em roles (User vs Staff)
- **YOLOv5** (PyTorch) para identificar o problema na foto, chamado por um script Python

### Banco de Dados

- **SQLite** como banco de dados
- **Prisma ORM** para gerenciamento de dados
- Schema para users, reports, comments, roles, notifications

### Funcionalidades

- 🗺️ **Integração com Google Maps** - Visualização de relatórios no mapa
- 🔐 **Autenticação JWT** - Login para usuários e staff
- 📱 **Interface responsiva** - Funciona em desktop e mobile
- 🔄 **Atualizações em tempo real** - WebSockets para updates instantâneos
- 📊 **Dashboard administrativo** - Painel para staff gerenciar relatórios
- 🎨 **Design moderno** - Interface bonita com TailwindCSS

## 📁 Estrutura do Projeto

```
/
├── frontend/           # Next.js + React + TailwindCSS
│   ├── app/
│   │   ├── login-user/     # Login de usuários
│   │   ├── login-staff/    # Login de staff
│   │   ├── dashboard-user/ # Dashboard do usuário
│   │   ├── dashboard-staff/# Dashboard do staff
│   │   ├── denunciar/      # Formulário de relatório
│   │   ├── mapa/           # Visualização do mapa
│   │   ├── ranking/        # Ranking de relatórios
│   │   └── retornos/       # Retornos/feedback
│   └── components/     # Componentes reutilizáveis
├── backend/            # NestJS + Prisma + SQLite
│   ├── src/
│   │   ├── auth/       # Autenticação JWT
│   │   ├── users/      # Gerenciamento de usuários
│   │   ├── reports/    # Relatórios
│   │   ├── staff/      # Funcionalidades do staff
│   │   └── uploads/    # Upload de arquivos
│   └── prisma/         # Schema do banco de dados
└── package.json        # Configuração do monorepo
```

## 🛠️ Instalação e Execução

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Chave da API do Google Maps

### 1. Clone o repositório

```bash
git clone <url-do-repo>
cd Hackton-2-try
```

### 2. Instale as dependências

```bash
npm run install:all
```

### 3. Configure as variáveis de ambiente

Crie os arquivos `.env` no frontend e backend (veja os exemplos `.env.example`)

### 4. Configure o banco de dados

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### 5. Execute o projeto

```bash
# Na raiz do projeto
npm run dev
```

Acesse:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 📊 Modelos de Dados

### User

- `id`: Identificador único
- `email`: Email do usuário
- `password`: Senha criptografada
- `role`: USER ou STAFF
- `reports`: Relatórios criados pelo usuário

### Report

- `id`: Identificador único
- `photoUrl`: URL da foto do relatório
- `category`: Categoria do problema
- `description`: Descrição detalhada
- `location`: Localização (coordenadas)
- `status`: PENDING, IN_PROGRESS, RESOLVED
- `comment`: Comentário do staff

## 🔑 Funcionalidades Principais

### Para Usuários

- ✅ Criar relatórios com foto e localização
- ✅ Visualizar relatórios no mapa
- ✅ Acompanhar status dos próprios relatórios
- ✅ Ver ranking de problemas mais reportados

### Para Staff

- ✅ Dashboard administrativo
- ✅ Gerenciar todos os relatórios
- ✅ Atualizar status e adicionar comentários
- ✅ Filtros avançados no mapa
- ✅ Estatísticas e relatórios

### Recursos Técnicos

- ✅ Autenticação JWT segura
- ✅ Upload de imagens
- ✅ Integração com Google Maps
- ✅ WebSockets para tempo real
- ✅ Interface responsiva
- ✅ Dark mode
- ✅ Acessibilidade (a11y)

## 🧪 Próximos Passos

- [ ] PWA (Progressive Web App)
- [ ] Push notifications
- [ ] Rate limiting para relatórios anônimos
- [ ] Sistema de moderação
- [ ] Testes unitários e e2e
- [ ] Deploy automatizado

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.
