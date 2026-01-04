# 🌍 DG Travel Networking

O **DG Travel Networking** é um projeto inovador que transforma viagens em experiências interativas por meio da **gamificação**.  
Cada viagem é tratada como uma **missão**, onde os participantes realizam tarefas, acumulam pontos e competem em rankings, promovendo **engajamento, aprendizado e networking estratégico** entre profissionais e empresas parceiras.



## 🎯 Objetivos do Projeto

- Incentivar a compra de passagens/viagens para destinos ou empresas específicas  
- Promover networking entre empreendedores, profissionais e empresas parceiras  
- Permitir que os participantes conheçam processos, cultura e funcionalidades das empresas visitadas  
- Transformar viagens em experiências interativas por meio da gamificação  
- Estimular competitividade saudável através de pontuação e ranking por missão  


## 🕹️ Como Funciona

### 🧭 Missões
- Cada viagem é uma missão (ex.: *Missão São Paulo*, *Missão Empresa X*).

### ✅ Tarefas
- Visitar empresas parceiras  
- Responder quizzes  
- Publicar conteúdos e cards  
- Realizar atividades presenciais  
- Enviar evidências (fotos, links, feedbacks)  

### ⭐ Pontuação & Ranking
- Cada tarefa concluída gera pontos  
- Os usuários competem dentro da missão  
- O objetivo é alcançar a maior pontuação no ranking  



## 👥 Tipos de Usuários

### 👤 Usuário (Participante)
- Criar conta e fazer login  
- Participar de missões  
- Executar tarefas e enviar evidências  
- Acumular pontos e acompanhar ranking  

### 🛠️ Admin (Administrador)
- Criar e gerenciar missões  
- Criar tarefas, categorias e quizzes  
- Validar tarefas dos usuários  
- Gerenciar ranking e pontuação  
- Administrar usuários e conteúdos  

🔐 **Cadastro como Administrador**  
Para se cadastrar como Admin, é necessário informar a chave de segurança da empresa:

```env
ADMIN_REGISTRATION_KEY="ChaveSuperSecreta@2026"
```

## 🧰 Tecnologias Utilizadas

### 🎨 Frontend
- **React**  
- **Vite**  
- **Tailwind CSS**  
- **Framer Motion**  

### ⚙️ Backend
- **Node.js**  
- **Express** (API personalizada)  
- **API REST**  
- **JWT** para autenticação  
- **Swagger** para documentação da API  

### 🗄️ Banco de Dados & Armazenamento
- **PostgreSQL**  
- **Supabase** (armazenamento e gerenciamento de dados)  

### 🔗 ORM
- **Prisma**  

### ☁️ Cloud & DevOps
- **AWS S3** (upload e armazenamento de arquivos)  
- **Docker** (containerização do backend)  
- **Git & GitHub / Bitbucket**  



## ⚙️ Configuração & Variáveis de Ambiente

Crie um arquivo `.env` dentro da pasta `backend/` com as seguintes variáveis:

```env
# Chave Secreta para Admin
ADMIN_REGISTRATION_KEY="ChaveSuperSecreta@2026"

# Supabase
SUPABASE_URL="https://<seu-supabase>.supabase.co"
SUPABASE_KEY="<sua-supabase-key>"

# PostgreSQL
PGDATABASE=umbrella_db
PGUSER=seu_usuario_postgres
PGPASSWORD=135798642
PGHOST=localhost
PGPORT=5432

# JWT
JWT_SECRET=sua_chave_secreta_jwt
```


## ▶️ Como Rodar o Projeto Localmente

### 1️⃣ Backend
```bash
cd backend
npm install
npm run dev

API disponível em: http://localhost:3000
Swagger (documentação da API): http://localhost:3000/api-docs
```

### 2️⃣ Frontend
```bash
cd frontend
npm install
npm run dev

Frontend disponível em: http://localhost:5173
```



## 🔐 Autenticação & Uso

### 👤 Usuário
- Registro normal pela tela de cadastro  
- Login para acessar missões  
- Inscrever-se em missões, executar tarefas e acumular pontos  
- Acompanhar progresso e ranking  

---

### 🛠️ Administrador
- Registro utilizando a variável `ADMIN_REGISTRATION_KEY`  
- Após login, acesso ao **Painel Administrativo**  
- Criar e editar missões  
- Criar tarefas, categorias e quizzes  
- Validar tarefas dos usuários  
- Acompanhar métricas e ranking  



## 🧭 Fluxo de Uso (Tutorial Rápido)

### 👤 Usuário
1. Registrar-se como usuário e fazer login  
2. Navegar até a seção **Missões**  
3. Escolher uma missão disponível e clicar em **Iniciar Missão**  
4. Visualizar as tarefas associadas  
5. Concluir tarefas para acumular pontos  
6. Acompanhar o progresso pela barra de progresso  
7. Consultar o ranking da missão  



### 🛠️ Administrador
1. Registrar-se utilizando a `ADMIN_REGISTRATION_KEY`  
2. Fazer login como administrador  
3. Acessar o **Painel Admin**  
4. Criar e editar missões  
5. Criar tarefas, categorias e quizzes  
6. Validar tarefas dos usuários  
7. Acompanhar métricas e ranking  


## 🗄️ Banco de Dados (PostgreSQL / Supabase)

O projeto utiliza **Supabase (PostgreSQL gerenciado)** por padrão, mas também pode ser configurado localmente.

### Exemplo de configuração local:
```env
PGDATABASE=umbrella_db
PGUSER=postgres
PGPASSWORD=135798642
PGHOST=localhost
PGPORT=5432
```
###  Executando migrações do Prisma
**Após configurar o banco, execute as migrações para criar as tabelas:**
```env
bash
cd backend
npx prisma migrate deploy 
```
### ➕ Como Criar Outros Administradores

A aplicação valida a variável **ADMIN_REGISTRATION_KEY**.

Para permitir que outro usuário se torne admin:
Informe a chave no formulário de registro admin no frontend
ou
Crie o usuário diretamente via API respeitando as validações do backend.


## ✅ Boas Práticas Adotadas

- Centralização de cores e tokens no `tailwind.config.js` para facilitar manutenção  
- Padronização de ambiente com **Docker**  
- Documentação de API com **Swagger**  
- Separação clara entre **frontend** e **backend**  
- Uso de **ORM (Prisma)** para segurança e produtividade  
- Versionamento com **GitHub** e **Bitbucket**  


## 🚀 Considerações Finais

O **DG Travel Networking** une **tecnologia, gamificação e networking**, transformando viagens em oportunidades reais de aprendizado, conexão profissional e crescimento pessoal.  

Este projeto foi desenvolvido com foco em:  
- **Inovação**: transformar viagens em missões interativas  
- **Engajamento**: estimular participação ativa dos usuários  
- **Networking**: aproximar profissionais e empresas parceiras  
- **Competitividade saudável**: ranking e pontuação por missão  

Com isso, o DG Travel Networking se posiciona como uma solução moderna para unir **experiência de viagem + aprendizado + conexão estratégica** em um só lugar.

