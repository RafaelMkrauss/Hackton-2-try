# BrasílIA Segura - Sistema de Denúncias Urbanas

## Como usar o sistema

### 1. Acesso

- Frontend: http://localhost:3003
- Backend: http://localhost:3002

### 2. Credenciais de Teste

- **Usuário comum**: user@hackaton.com / user123
- **Staff/Admin**: staff@hackaton.com / staff123

### 3. Funcionalidades Testadas

#### ✅ Logout

- Clique no botão "Sair" no header ou dashboard
- O sistema irá limpar os dados e redirecionar para a página inicial

#### ✅ Denúncias (Reports)

1. Faça login com as credenciais de teste
2. Acesse "Denúncias" > "Nova Denúncia"
3. Preencha os dados:
   - Título
   - Descrição
   - Categoria (selecione uma das opções)
   - Localização (pode usar o botão de GPS)
   - Imagens (opcional, até 5)
4. Clique em "Enviar Denúncia"

#### ✅ Avaliação Semestral

1. Faça login com as credenciais de teste
2. Acesse "Avaliação" no menu
3. Avalie cada categoria de 1 a 5 estrelas
4. Adicione comentários opcionais
5. Adicione um comentário geral
6. Clique em "Enviar Avaliação"

### 4. Problemas Resolvidos

#### Logout

- ✅ Funcionalidade implementada e testada
- ✅ Limpa cookies, localStorage e headers de autenticação
- ✅ Redireciona automaticamente para a página inicial
- ✅ Botão disponível no header em todas as páginas autenticadas

#### Denúncias

- ✅ Formulário completo com validação
- ✅ Upload de imagens funcionando
- ✅ Geolocalização implementada
- ✅ Categorias compartilhadas entre frontend e backend
- ✅ Redirecionamento após criação

#### Avaliação Semestral

- ✅ Sistema de avaliação por categorias
- ✅ Interface intuitiva com estrelas
- ✅ Validação de campos obrigatórios
- ✅ Prevenção de avaliações duplicadas
- ✅ Comentários por categoria e geral

### 5. Como testar

1. **Inicie os servidores** (se não estiverem rodando):

   ```bash
   # Backend
   cd backend
   npm run start:dev

   # Frontend (em outro terminal)
   cd frontend
   npm run dev
   ```

2. **Acesse o sistema**: http://localhost:3003

3. **Faça login** com: user@hackaton.com / user123

4. **Teste as funcionalidades**:
   - Criar uma denúncia
   - Fazer uma avaliação semestral
   - Fazer logout

### 6. Dados de Teste

O sistema já vem com dados de exemplo criados automaticamente:

- Usuários de teste
- Denúncias de exemplo
- Categorias predefinidas

### 7. Navegação

O header principal possui links para:

- Dashboard
- Denúncias
- Mapa
- Avaliação
- Logout

Todas as funcionalidades principais estão funcionando corretamente!
