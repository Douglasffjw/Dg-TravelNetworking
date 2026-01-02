const express = require('express');
const router = express.Router();
const adminQuizController = require('../controllers/adminQuizController');

// --- ROTAS /api/admin/quizzes ---

router.route('/')
  .post(adminQuizController.createQuiz)
  .get(adminQuizController.getAllQuizzes);

router.route('/:quizId')
  .get(adminQuizController.getQuizById)
  .put(adminQuizController.updateQuiz)
  .delete(adminQuizController.deleteQuiz);

// --- ROTAS ANINHADAS DE PERGUNTAS ---
// /api/admin/quizzes/:quizId/questions

router.route('/:quizId/questions')
  .post(adminQuizController.createQuestionForQuiz)
  .get(adminQuizController.getQuestionsForQuiz);

router.route('/:quizId/questions/:questionId')
  .put(adminQuizController.updateQuestion)
  .delete(adminQuizController.deleteQuestion);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Admin - Quizzes
 *   description: Gerenciamento de quizzes pelo administrador
 */

/**
 * @swagger
 * /admin/quizzes:
 *   post:
 *     summary: Criar um novo quiz
 *     tags: [Admin - Quizzes]
 *     description: Cria um quiz e conecta a uma tarefa já existente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "Quiz Avançado Nubank"
 *               descricao:
 *                 type: string
 *                 example: "Perguntas avançadas sobre operações financeiras."
 *               ativa:
 *                 type: boolean
 *                 example: true
 *               tarefaId:
 *                 type: number
 *                 example: 3
 *     responses:
 *       201:
 *         description: Quiz criado com sucesso
 *       400:
 *         description: Erro de validação
 */

/**
 * @swagger
 * /admin/quizzes:
 *   get:
 *     summary: Listar todos os quizzes
 *     tags: [Admin - Quizzes]
 *     responses:
 *       200:
 *         description: Lista de quizzes
 */

/**
 * @swagger
 * /admin/quizzes/{quizId}:
 *   get:
 *     summary: Buscar um quiz pelo ID
 *     tags: [Admin - Quizzes]
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Quiz encontrado
 *       404:
 *         description: Quiz não encontrado
 *
 *   put:
 *     summary: Atualizar um quiz
 *     tags: [Admin - Quizzes]
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               ativa:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Quiz atualizado
 *       404:
 *         description: Quiz não encontrado
 *
 *   delete:
 *     summary: Deletar um quiz
 *     tags: [Admin - Quizzes]
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       204:
 *         description: Quiz removido
 *       404:
 *         description: Quiz não encontrado
 */

/**
 * @swagger
 * /admin/quizzes/{quizId}/questions:
 *   post:
 *     summary: Criar uma nova pergunta para um quiz
 *     tags: [Admin - Quizzes]
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enunciado:
 *                 type: string
 *                 example: "O que é o Nubank?"
 *               alternativas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Banco digital", "Empresa de cosméticos", "Rede social", "Plataforma de saúde"]
 *               respostaCorreta:
 *                 type: number
 *                 example: 0
 *     responses:
 *       201:
 *         description: Pergunta criada com sucesso
 *       404:
 *         description: Quiz não encontrado
 *
 *   get:
 *     summary: Listar todas as perguntas de um quiz
 *     tags: [Admin - Quizzes]
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Lista de perguntas
 *       404:
 *         description: Quiz não encontrado
 */

/**
 * @swagger
 * /admin/quizzes/{quizId}/questions/{questionId}:
 *   put:
 *     summary: Atualizar uma pergunta
 *     tags: [Admin - Quizzes]
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: number
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enunciado:
 *                 type: string
 *               alternativas:
 *                 type: array
 *                 items:
 *                   type: string
 *               respostaCorreta:
 *                 type: number
 *     responses:
 *       200:
 *         description: Pergunta atualizada
 *       404:
 *         description: Quiz ou pergunta não encontrados
 *
 *   delete:
 *     summary: Deletar uma pergunta
 *     tags: [Admin - Quizzes]
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: number
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       204:
 *         description: Pergunta removida
 *       404:
 *         description: Quiz ou pergunta não encontrados
 */
