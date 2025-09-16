# Reuse Next

Uma plataforma moderna para troca de produtos entre usuários, construída com Next.js, TypeScript e uma arquitetura de contextos robusta.

## Desenvolvimento NextJS

### Telas Desenvolvidas

#### **Página Inicial** (`src/app/page.tsx`)
- **Objetivo**: Tela de boas-vindas e apresentação da plataforma
- **Funcionalidades**: 
  - Apresentação dos benefícios da plataforma
  - Call-to-action para registro/login
  - Design responsivo e atrativo

#### **Registro de Usuário** (`src/app/register/page.tsx`)
- **Objetivo**: Permitir que novos usuários se cadastrem na plataforma
- **Funcionalidades**:
  - Formulário de cadastro com validação
  - Integração com API de autenticação
  - Redirecionamento automático após sucesso

#### **Swipe Principal** (`src/app/swipe/page.tsx`)
- **Objetivo**: Interface principal onde usuários navegam por produtos
- **Funcionalidades**:
  - Sistema de swipe similar ao Tinder
  - Ações de like, dislike e superlike
  - Carregamento dinâmico de produtos
  - Modais de match e superlike

#### **Seleção de Categorias** (`src/app/onboarding/categories/page.tsx`)
- **Objetivo**: Permitir que usuários selecionem categorias de interesse
- **Funcionalidades**:
  - Lista de categorias disponíveis
  - Seleção múltipla de interesses
  - Validação de seleção mínima
  - Persistência das preferências

#### **Termos de Uso** (`src/app/onboarding/terms/page.tsx`)
- **Objetivo**: Apresentar termos e condições da plataforma
- **Funcionalidades**:
  - Exibição dos termos de uso
  - Aceite obrigatório para continuar
  - Design responsivo para leitura

#### **Meus Produtos** (`src/app/my-products/page.tsx`)
- **Objetivo**: Gerenciar produtos cadastrados pelo usuário
- **Funcionalidades**:
  - Listagem de produtos do usuário
  - Opções de edição e exclusão
  - Adição de novos produtos
  - Status dos produtos (ativo/inativo)

#### **Adicionar Produto** (`src/app/products/add/page.tsx`)
- **Objetivo**: Interface para cadastro de novos produtos
- **Funcionalidades**:
  - Formulário completo de cadastro
  - Upload de imagens
  - Seleção de categoria
  - Validação de dados

#### **Matches** (`src/app/matches/page.tsx`)
- **Objetivo**: Exibir matches realizados entre usuários
- **Funcionalidades**:
  - Lista de matches ativos
  - Informações dos produtos envolvidos
  - Acesso direto ao chat
  - Filtros e busca

#### **Chat** (`src/app/chat/[matchId]/page.tsx`)
- **Objetivo**: Interface de conversa entre usuários que fizeram match
- **Funcionalidades**:
  - Chat em tempo real
  - Histórico de mensagens
  - Informações do match
  - Interface responsiva

## Prisma ORM

### Aplicação do Prisma nas Telas

#### **Autenticação e Usuários**
- **Contexto**: Gerenciamento de dados de usuários e autenticação
- **Implementação**: 
  - Modelo `User` para armazenar informações dos usuários
  - Validação de credenciais durante login/registro
  - Persistência de dados de perfil

#### **Gestão de Produtos**
- **Contexto**: CRUD completo de produtos na plataforma
- **Implementação**:
  - Modelo `Product` com relacionamentos com `User` e `Category`
  - Operações de criação, leitura, atualização e exclusão
  - Filtros por categoria e usuário
  - Validação de dados antes da persistência

#### **Sistema de Categorias**
- **Contexto**: Organização e classificação de produtos
- **Implementação**:
  - Modelo `Category` para categorização
  - Relacionamento many-to-many com usuários (interesses)
  - Filtros dinâmicos baseados em categorias

#### **Sistema de Matches**
- **Contexto**: Gerenciamento de conexões entre usuários
- **Implementação**:
  - Modelo `Match` para relacionar usuários
  - Modelo `Like` para registrar interações
  - Modelo `SuperLike` para interações especiais
  - Lógica de criação automática de matches

#### **Sistema de Chat**
- **Contexto**: Comunicação entre usuários que fizeram match
- **Implementação**:
  - Modelo `Message` para armazenar conversas
  - Relacionamento com `Match` para contexto
  - Timestamps para ordenação cronológica
  - Status de leitura das mensagens

## Banco de Dados

### Tabelas Criadas e Seus Objetivos

#### **users** (Usuários)
- **Objetivo**: Armazenar informações dos usuários da plataforma
- **Campos Principais**:
  - `id`: Identificador único
  - `nome`: Nome completo do usuário
  - `email`: Email único para login
  - `senha`: Senha criptografada
  - `telefone`: Contato opcional
- **Relacionamentos**: Base para todos os outros dados da plataforma

#### **categories** (Categorias)
- **Objetivo**: Classificar produtos em categorias específicas
- **Campos Principais**:
  - `id`: Identificador único
  - `nome`: Nome da categoria (ex: "Eletrônicos", "Roupas")
- **Relacionamentos**: Usado para filtrar produtos e interesses dos usuários

#### **products** (Produtos)
- **Objetivo**: Armazenar informações dos produtos disponíveis para troca
- **Campos Principais**:
  - `id`: Identificador único
  - `nome`: Nome do produto
  - `descricao`: Descrição detalhada
  - `preco`: Valor estimado do produto
  - `idUsuario`: Referência ao dono do produto
  - `idCategoria`: Categoria do produto
- **Relacionamentos**: Conecta usuários, categorias e interações

#### **likes** (Curtidas)
- **Objetivo**: Registrar quando um usuário curte um produto
- **Campos Principais**:
  - `id`: Identificador único
  - `idUsuario`: Usuário que curtiu
  - `idProduto`: Produto curtido
- **Relacionamentos**: Base para criação de matches

#### **super_likes** (Super Curtidas)
- **Objetivo**: Registrar interações especiais com mensagem personalizada
- **Campos Principais**:
  - `id`: Identificador único
  - `mensagem`: Mensagem personalizada
  - `idUsuario`: Usuário que fez super like
  - `idProduto`: Produto que recebeu super like
- **Relacionamentos**: Interação especial que pode gerar matches

#### **matches** (Matches)
- **Objetivo**: Registrar quando dois usuários se interessam mutuamente
- **Campos Principais**:
  - `id`: Identificador único
  - `idUsuario1` e `idUsuario2`: Usuários que fizeram match
  - `idProduto1` e `idProduto2`: Produtos envolvidos no match
- **Relacionamentos**: Permite comunicação entre usuários

#### **messages** (Mensagens)
- **Objetivo**: Armazenar conversas entre usuários que fizeram match
- **Campos Principais**:
  - `id`: Identificador único
  - `conteudo`: Texto da mensagem
  - `idMatch`: Referência ao match
  - `idUsuario`: Usuário que enviou a mensagem
- **Relacionamentos**: Histórico de conversas

#### **user_interests** (Interesses do Usuário)
- **Objetivo**: Registrar categorias de interesse de cada usuário
- **Campos Principais**:
  - `id`: Identificador único
  - `idUsuario`: Usuário
  - `idCategoria`: Categoria de interesse
- **Relacionamentos**: Personalização da experiência do usuário