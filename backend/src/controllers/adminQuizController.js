// src/controllers/adminQuizController.js
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');

/**
 * @route   POST /api/admin/quizzes
 * @desc    Criar um novo quiz
 * @access  Admin
 */
const createQuiz = async (req, res) => {
  const { titulo, descricao, ativo, tarefa_id } = req.body;

  if (!titulo) {
    return res.status(400).json({ error: 'O título do quiz é obrigatório.' });
  }

  if (!tarefa_id) {
    return res.status(400).json({ error: 'O ID da tarefa é obrigatório para vincular o quiz.' });
  }

  try {
    const novoQuiz = await prisma.quiz.create({
      data: {
        titulo,
        descricao: descricao || '',
        ativo: ativo ?? true,
        tarefa_id: Number(tarefa_id),
      },
    });

    // Tentar manter a referência bidirecional (preencher Tarefa.quizId)
    try {
      await prisma.tarefa.update({ where: { id: Number(tarefa_id) }, data: { quizId: novoQuiz.id } });
    } catch (err) {
      // Não falhar se a atualização não for possível; o fallback de leitura lida com isso.
      console.warn('adminQuizController.createQuiz - falha ao setar tarefa.quizId (não crítico):', err?.message || err);
    }

    res.status(201).json({
      message: 'Quiz criado e vinculado à tarefa com sucesso!',
      quiz: novoQuiz,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'A tarefa informada não existe.' });
    }

    console.error('Erro ao criar quiz:', error);
    res.status(500).json({ error: 'Erro interno ao criar quiz.' });
  }
};

/**
 * @route   GET /api/admin/quizzes
 * @desc    Listar todos os quizzes
 * @access  Admin
 */
const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        perguntas: true,
      },
      orderBy: { id: 'asc' },
    });

    res.json(quizzes);
  } catch (error) {
    console.error('Erro ao buscar quizzes:', error);
    res.status(500).json({ error: 'Erro interno ao buscar quizzes.' });
  }
};

/**
 * @route   GET /api/admin/quizzes/:quizId
 * @desc    Buscar quiz por ID
 * @access  Admin
 */
const getQuizById = async (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);

  if (isNaN(quizId)) {
    return res.status(400).json({ error: 'ID de quiz inválido.' });
  }

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { perguntas: true },
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz não encontrado.' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Erro ao buscar quiz por ID:', error);
    res.status(500).json({ error: 'Erro interno ao buscar quiz.' });
  }
};

/**
 * @route   PUT /api/admin/quizzes/:quizId
 * @desc    Atualizar quiz
 * @access  Admin
 */
const updateQuiz = async (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);
  const { titulo, descricao, ativo, tarefa_id } = req.body;

  console.log('=== updateQuiz chamado ===');
  console.log('quizId:', quizId);
  console.log('req.body:', req.body);

  if (isNaN(quizId)) {
    return res.status(400).json({ error: 'ID de quiz inválido.' });
  }

  try {
    // Busca o quiz atual para verificar tarefa_id
    const quizAtual = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    console.log('quizAtual encontrado:', quizAtual);

    if (!quizAtual) {
      return res.status(404).json({ error: 'Quiz não encontrado para atualizar.' });
    }

    const data = {};
    
    if (titulo !== undefined) data.titulo = titulo;
    if (descricao !== undefined) data.descricao = descricao;
    if (ativo !== undefined) data.ativo = ativo;
    
    // Só atualiza tarefa_id se for diferente da atual (devido à constraint unique)
    if (tarefa_id !== undefined && Number(tarefa_id) !== quizAtual.tarefa_id) {
      data.tarefa_id = Number(tarefa_id);
    }

    console.log('data a atualizar:', data);

    const quizAtualizado = await prisma.quiz.update({
      where: { id: quizId },
      data,
      include: { perguntas: true },
    });

    console.log('Quiz atualizado com sucesso');

    res.json({
      message: 'Quiz atualizado com sucesso!',
      quiz: quizAtualizado,
    });
  } catch (error) {
    console.error('ERRO DETALHADO ao atualizar quiz:', error);
    console.error('Tipo de erro:', error.constructor.name);
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Quiz não encontrado para atualizar.' });
      }
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Esta tarefa já está vinculada a outro quiz.' });
      }
    }

    console.error('Erro ao atualizar quiz:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar quiz.', details: error.message });
  }
};

/**
 * @route   DELETE /api/admin/quizzes/:quizId
 * @desc    Deletar (ou desativar) quiz
 * @access  Admin
 */
const deleteQuiz = async (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);

  if (isNaN(quizId)) {
    return res.status(400).json({ error: 'ID de quiz inválido.' });
  }

  try {
    await prisma.quiz.delete({ where: { id: quizId } });

    res.json({ message: 'Quiz deletado com sucesso!' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Quiz não encontrado para deletar.' });
    }

    console.error('Erro ao deletar quiz:', error);
    res.status(500).json({ error: 'Erro interno ao deletar quiz.' });
  }
};

/**
 * @route   POST /api/admin/quizzes/:quizId/questions
 * @desc    Criar uma nova pergunta para um quiz
 * @access  Admin
 */
const createQuestionForQuiz = async (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);
  const { enunciado, alternativas, resposta_correta } = req.body;

  if (isNaN(quizId)) {
    return res.status(400).json({ error: 'ID de quiz inválido.' });
  }

  if (!enunciado || !Array.isArray(alternativas) || alternativas.length < 2) {
    return res.status(400).json({ error: 'A pergunta precisa de enunciado e pelo menos duas alternativas.' });
  }

  if (!resposta_correta || !alternativas.includes(resposta_correta)) {
    return res.status(400).json({ error: 'A resposta correta deve estar entre as alternativas.' });
  }

  try {
    const novaPergunta = await prisma.perguntaQuiz.create({
      data: {
        enunciado,
        opcoes: alternativas,
        resposta_correta,
        quiz: { connect: { id: quizId } },
      },
    });

    res.status(201).json({
      message: 'Pergunta criada com sucesso!',
      pergunta: novaPergunta,
    });
  } catch (error) {
    console.error('Erro ao criar pergunta:', error);
    res.status(500).json({ error: 'Erro interno ao criar pergunta.' });
  }
};

/**
 * @route   GET /api/admin/quizzes/:quizId/questions
 * @desc    Listar perguntas de um quiz
 * @access  Admin
 */
const getQuestionsForQuiz = async (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);

  if (isNaN(quizId)) {
    return res.status(400).json({ error: 'ID de quiz inválido.' });
  }

  try {
    const perguntas = await prisma.perguntaQuiz.findMany({
      where: { quiz_id: quizId },
      orderBy: { id: 'asc' },
    });

    res.json(perguntas);
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    res.status(500).json({ error: 'Erro interno ao buscar perguntas.' });
  }
};

/**
 * @route   PUT /api/admin/quizzes/:quizId/questions/:questionId
 * @desc    Atualizar pergunta de um quiz
 * @access  Admin
 */
const updateQuestion = async (req, res) => {
  const questionId = parseInt(req.params.questionId, 10);
  const { enunciado, alternativas, resposta_correta } = req.body;

  if (isNaN(questionId)) {
    return res.status(400).json({ error: 'ID de pergunta inválido.' });
  }

  if (!enunciado || !Array.isArray(alternativas) || alternativas.length < 2) {
    return res.status(400).json({ error: 'A pergunta precisa de enunciado e pelo menos duas alternativas.' });
  }

  if (!resposta_correta || !alternativas.includes(resposta_correta)) {
    return res.status(400).json({ error: 'A resposta correta deve estar entre as alternativas.' });
  }

  try {
    const perguntaAtualizada = await prisma.perguntaQuiz.update({
      where: { id: questionId },
      data: { enunciado, opcoes: alternativas, resposta_correta },
    });

    res.json({
      message: 'Pergunta atualizada com sucesso!',
      pergunta: perguntaAtualizada,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Pergunta não encontrada para atualizar.' });
    }

    console.error('Erro ao atualizar pergunta:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar pergunta.' });
  }
};

/**
 * @route   DELETE /api/admin/quizzes/:quizId/questions/:questionId
 * @desc    Deletar pergunta de um quiz
 * @access  Admin
 */
const deleteQuestion = async (req, res) => {
  const questionId = parseInt(req.params.questionId, 10);

  if (isNaN(questionId)) {
    return res.status(400).json({ error: 'ID de pergunta inválido.' });
  }

  try {
    await prisma.perguntaQuiz.delete({ where: { id: questionId } });
    res.json({ message: 'Pergunta deletada com sucesso!' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Pergunta não encontrada para deletar.' });
    }

    console.error('Erro ao deletar pergunta:', error);
    res.status(500).json({ error: 'Erro interno ao deletar pergunta.' });
  }
};

module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  createQuestionForQuiz,
  getQuestionsForQuiz,
  updateQuestion,
  deleteQuestion,
};
