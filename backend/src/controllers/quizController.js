// Importa o Prisma Client
const prisma = require('../config/prismaClient');

/**
 * @route   GET /api/quizzes/:quizId
 * @desc    (Usuário) Buscar um quiz e suas perguntas (sem as respostas)
 * @access  Privado
 */
const getQuizForUser = async (req, res) => {
  try {
    const quizId = parseInt(req.params.quizId, 10);
    if (isNaN(quizId)) {
      return res.status(400).json({ error: 'ID do Quiz inválido.' });
    }

    // 1. Buscar o Quiz e suas perguntas (substitui as 2 queries)
    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, ativo: true },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        perguntas: {
          select: {
            id: true,
            enunciado: true,
            tipo: true,
            ordem: true,
            opcoes: true
          },
          orderBy: { ordem: 'asc' }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz não encontrado ou inativo.' });
    }

    // 2. Remover a chave 'isCorrect' de cada opção
    const filteredQuestions = quiz.perguntas.map(q => {
      const filteredOptions = q.opcoes.map(option => {
        const { isCorrect, ...rest } = option;
        return rest;
      });
      return { ...q, opcoes: filteredOptions };
    });

    const response = { ...quiz, perguntas: filteredQuestions };
    res.json(response);

  } catch (error) {
    console.error('Erro ao buscar quiz:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/quizzes/task/:taskId
 * @desc    (Usuário) Listar quizzes associados a uma tarefa (pelo id da tarefa)
 * @access  Privado
 */
const getQuizzesByTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId, 10);
    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'ID da tarefa inválido.' });
    }

    const quiz = await prisma.quiz.findFirst({
      where: { tarefa_id: taskId, ativo: true },
      include: {
        perguntas: {
          orderBy: { ordem: 'asc' }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Nenhum quiz encontrado para esta tarefa.' });
    }

    const perguntas = quiz.perguntas.map(p => {
      const opcoes = Array.isArray(p.opcoes)
        ? p.opcoes.map(({ isCorrect, ...rest }) => rest)
        : [];
      return { ...p, opcoes };
    });

    res.json({ ...quiz, perguntas });

  } catch (error) {
    console.error('Erro ao buscar quiz por tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   POST /api/quizzes/:quizId/submit
 * @desc    (Usuário) Submeter respostas de um quiz
 * @access  Privado
 * @body    { "answers": [{ "pergunta_id": 1, "resposta": "texto da resposta" }] }
 */
const submitQuiz = async (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);
  if (isNaN(quizId)) {
    return res.status(400).json({ error: 'ID do Quiz inválido.' });
  }

  const userId = req.user.id;
  const { answers } = req.body;

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'O array "answers" é obrigatório.' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.findFirstOrThrow({
        where: { id: quizId, ativo: true },
        select: { id: true, tarefa_id: true }
      });
      const { tarefa_id } = quiz;

      const questions = await tx.perguntaQuiz.findMany({
        where: { quiz_id: quizId },
        select: { id: true, opcoes: true }
      });

      const correctAnswersMap = new Map();
      questions.forEach(q => {
        const correctOption = q.opcoes.find(opt => opt.isCorrect === true);
        correctAnswersMap.set(q.id, correctOption ? correctOption.text : null);
      });

      let taskPoints = 0;
      if (tarefa_id) {
        const tarefa = await tx.tarefa.findUnique({
          where: { id: tarefa_id },
          select: { pontos: true }
        });
        taskPoints = tarefa ? tarefa.pontos : 0;

        const existingSub = await tx.usuarioTarefa.findUnique({
          where: {
            usuario_id_tarefa_id: { usuario_id: userId, tarefa_id }
          },
          select: { concluida: true }
        });

        if (existingSub && existingSub.concluida) {
          throw new Error('Você já completou este quiz/tarefa.');
        }
      }

      let totalCorrect = 0;
      const submissionResults = [];

      for (const answer of answers) {
        const { pergunta_id, resposta } = answer;
        const isCorrect = correctAnswersMap.get(pergunta_id) === resposta;
        if (isCorrect) totalCorrect++;

        const newAnswer = await tx.respostaQuiz.create({
          data: {
            usuario_id: userId,
            pergunta_id,
            resposta,
            correta: isCorrect
          },
          select: { id: true, pergunta_id: true, resposta: true, correta: true }
        });
        submissionResults.push(newAnswer);
      }

      let finalMessage = `Quiz submetido. Você acertou ${totalCorrect} de ${correctAnswersMap.size}.`;

      if (tarefa_id && totalCorrect === correctAnswersMap.size) {
        finalMessage = `Parabéns! Você acertou todas e ganhou ${taskPoints} pontos!`;

        await tx.usuarioTarefa.upsert({
          where: {
            usuario_id_tarefa_id: { usuario_id: userId, tarefa_id }
          },
          create: {
            usuario_id: userId,
            tarefa_id,
            concluida: true,
            pontos_obtidos: taskPoints,
            data_conclusao: new Date()
          },
          update: {
            concluida: true,
            pontos_obtidos: taskPoints,
            data_conclusao: new Date()
          }
        });

        await tx.usuario.update({
          where: { id: userId },
          data: { 
            pontos: { increment: taskPoints },
            pontos_totais: { increment: taskPoints }
          }
        });

        await tx.logsPontos.create({
          data: {
            usuario_id: userId,
            tarefa_id,
            pontos: taskPoints,
            tipo: 'ganho_quiz',
            descricao: 'Quiz concluído com 100% de acerto.'
          }
        });
      }

      return {
        message: finalMessage,
        score: {
          correct: totalCorrect,
          total: correctAnswersMap.size
        },
        results: submissionResults
      };
    });

    res.status(200).json(result);

  } catch (error) {
    if (error.message.includes('Quiz não encontrado') || error.message.includes('Você já completou')) {
      return res.status(409).json({ error: error.message });
    }

    console.error('Erro ao submeter quiz:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  getQuizForUser,
  getQuizzesByTask,
  submitQuiz
};