-- CreateEnum
CREATE TYPE "Role" AS ENUM ('participante', 'admin', 'validador');

-- CreateEnum
CREATE TYPE "TipoTarefa" AS ENUM ('administrativa', 'conhecimento', 'engajamento', 'social', 'feedback');

-- CreateEnum
CREATE TYPE "Dificuldade" AS ENUM ('facil', 'medio', 'dificil');

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('pendente', 'pago', 'cancelado', 'reembolsado');

-- CreateEnum
CREATE TYPE "StatusParticipacao" AS ENUM ('inscrito', 'confirmado', 'concluido', 'cancelado');

-- CreateEnum
CREATE TYPE "TipoCard" AS ENUM ('empresa', 'destino', 'lider');

-- CreateEnum
CREATE TYPE "Raridade" AS ENUM ('comum', 'raro', 'epico');

-- CreateEnum
CREATE TYPE "TipoPremiacao" AS ENUM ('consultoria', 'gadget', 'certificado', 'outro');

-- CreateEnum
CREATE TYPE "TipoPergunta" AS ENUM ('multipla_escolha', 'verdadeiro_falso', 'texto');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "empresa" TEXT,
    "role" "Role" NOT NULL DEFAULT 'participante',
    "pontos" INTEGER NOT NULL DEFAULT 0,
    "foto_url" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfis" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "curiosidades" TEXT,
    "linkedin_url" TEXT,
    "website" TEXT,
    "interesses" TEXT,
    "data_nascimento" DATE,
    "telefone" TEXT,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perfis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missoes" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "destino" TEXT,
    "data_inicio" DATE,
    "data_fim" DATE,
    "preco" DECIMAL(10,2),
    "vagas_disponiveis" INTEGER,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "missao_anterior_id" INTEGER,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "missoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_tarefas" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "icone" TEXT,
    "cor" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "categorias_tarefas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarefas" (
    "id" SERIAL NOT NULL,
    "missao_id" INTEGER NOT NULL,
    "categoria_id" INTEGER,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "instrucoes" TEXT,
    "pontos" INTEGER NOT NULL DEFAULT 0,
    "tipo" "TipoTarefa",
    "dificuldade" "Dificuldade" NOT NULL DEFAULT 'facil',
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "requisitos" JSONB,
    "tarefa_anterior_id" INTEGER,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tarefas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarefas_padrao" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "instrucoes" TEXT,
    "pontos" INTEGER NOT NULL DEFAULT 0,
    "tipo" "TipoTarefa",
    "dificuldade" "Dificuldade" NOT NULL DEFAULT 'facil',
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "requisitos" JSONB,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tarefas_padrao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_missoes" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "missao_id" INTEGER NOT NULL,
    "valor_pago" DECIMAL(10,2) DEFAULT 0.00,
    "forma_pagamento" TEXT,
    "status_pagamento" "StatusPagamento" NOT NULL DEFAULT 'pendente',
    "codigo_transacao" TEXT,
    "data_compra" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status_participacao" "StatusParticipacao" NOT NULL DEFAULT 'inscrito',

    CONSTRAINT "usuarios_missoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_tarefas" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "tarefa_id" INTEGER NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "pontos_obtidos" INTEGER NOT NULL DEFAULT 0,
    "evidencias" JSONB,
    "data_conclusao" TIMESTAMP(3),
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "validado_por" INTEGER,
    "data_validacao" TIMESTAMP(3),
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_tarefas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" SERIAL NOT NULL,
    "tarefa_id" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perguntas_quiz" (
    "id" SERIAL NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "enunciado" TEXT NOT NULL,
    "tipo" "TipoPergunta" NOT NULL DEFAULT 'multipla_escolha',
    "opcoes" JSONB,
    "resposta_correta" TEXT NOT NULL,
    "explicacao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perguntas_quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respostas_quizzes" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "pergunta_id" INTEGER NOT NULL,
    "resposta" TEXT NOT NULL,
    "correta" BOOLEAN NOT NULL DEFAULT false,
    "pontos_obtidos" INTEGER NOT NULL DEFAULT 0,
    "data_resposta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "respostas_quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "TipoCard" NOT NULL,
    "imagem_url" TEXT,
    "empresa_nome" TEXT,
    "cargo" TEXT,
    "pais" TEXT,
    "cidade" TEXT,
    "curiosidades" TEXT[],
    "tarefa_requerida" INTEGER,
    "raridade" "Raridade" NOT NULL DEFAULT 'comum',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_cards" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "card_id" INTEGER NOT NULL,
    "data_desbloqueio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "premiacoes" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "TipoPremiacao" NOT NULL,
    "posicao_ranking" INTEGER,
    "pontos_necessarios" INTEGER,
    "quantidade_disponivel" INTEGER NOT NULL DEFAULT 1,
    "imagem_url" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "premiacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_premiacoes" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "premiacao_id" INTEGER NOT NULL,
    "data_premiacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entregue" BOOLEAN NOT NULL DEFAULT false,
    "data_entrega" TIMESTAMP(3),

    CONSTRAINT "usuarios_premiacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_pontos" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "tarefa_id" INTEGER,
    "missao_id" INTEGER,
    "validador_id" INTEGER,
    "pontos" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pontos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "perfis_usuario_id_key" ON "perfis"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_missoes_usuario_id_missao_id_key" ON "usuarios_missoes"("usuario_id", "missao_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_tarefas_usuario_id_tarefa_id_key" ON "usuarios_tarefas"("usuario_id", "tarefa_id");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_tarefa_id_key" ON "quizzes"("tarefa_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cards_usuario_id_card_id_key" ON "usuarios_cards"("usuario_id", "card_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_premiacoes_usuario_id_premiacao_id_key" ON "usuarios_premiacoes"("usuario_id", "premiacao_id");

-- AddForeignKey
ALTER TABLE "perfis" ADD CONSTRAINT "perfis_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missoes" ADD CONSTRAINT "missoes_missao_anterior_id_fkey" FOREIGN KEY ("missao_anterior_id") REFERENCES "missoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_missao_id_fkey" FOREIGN KEY ("missao_id") REFERENCES "missoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_tarefas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_tarefa_anterior_id_fkey" FOREIGN KEY ("tarefa_anterior_id") REFERENCES "tarefas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_missoes" ADD CONSTRAINT "usuarios_missoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_missoes" ADD CONSTRAINT "usuarios_missoes_missao_id_fkey" FOREIGN KEY ("missao_id") REFERENCES "missoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_tarefas" ADD CONSTRAINT "usuarios_tarefas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_tarefas" ADD CONSTRAINT "usuarios_tarefas_tarefa_id_fkey" FOREIGN KEY ("tarefa_id") REFERENCES "tarefas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_tarefas" ADD CONSTRAINT "usuarios_tarefas_validado_por_fkey" FOREIGN KEY ("validado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_tarefa_id_fkey" FOREIGN KEY ("tarefa_id") REFERENCES "tarefas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perguntas_quiz" ADD CONSTRAINT "perguntas_quiz_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_quizzes" ADD CONSTRAINT "respostas_quizzes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_quizzes" ADD CONSTRAINT "respostas_quizzes_pergunta_id_fkey" FOREIGN KEY ("pergunta_id") REFERENCES "perguntas_quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_tarefa_requerida_fkey" FOREIGN KEY ("tarefa_requerida") REFERENCES "tarefas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_cards" ADD CONSTRAINT "usuarios_cards_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_cards" ADD CONSTRAINT "usuarios_cards_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_premiacoes" ADD CONSTRAINT "usuarios_premiacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_premiacoes" ADD CONSTRAINT "usuarios_premiacoes_premiacao_id_fkey" FOREIGN KEY ("premiacao_id") REFERENCES "premiacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_pontos" ADD CONSTRAINT "logs_pontos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_pontos" ADD CONSTRAINT "logs_pontos_tarefa_id_fkey" FOREIGN KEY ("tarefa_id") REFERENCES "tarefas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_pontos" ADD CONSTRAINT "logs_pontos_missao_id_fkey" FOREIGN KEY ("missao_id") REFERENCES "missoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_pontos" ADD CONSTRAINT "logs_pontos_validador_id_fkey" FOREIGN KEY ("validador_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
