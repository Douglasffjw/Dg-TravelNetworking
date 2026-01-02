const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// 🛑 CORREÇÃO: Importe as funções específicas 'authenticate' e 'checkRole'
const { authenticate, checkRole } = require('../middlewares/authMiddleware');

// Define os roles que podem interagir com os quizzes
const PARTICIPANT_ROLES = ['admin', 'participante']; 

// ✅ MIDDLEWARES DE PROTEÇÃO
// 1. Garante que o usuário está logado
// 🛑 CORREÇÃO: Usa a função 'authenticate' em vez do objeto 'authMiddleware'
router.use(authenticate);

// 2. Garante que o usuário tem permissão para acessar quizzes
router.use(checkRole(PARTICIPANT_ROLES));


/**
 * @route   GET /api/quizzes/task/:taskId
 * @desc    (Usuário) Listar quizzes associados a uma tarefa
 * @access  Privado (Participante e Admin)
 */
router.get('/task/:taskId', quizController.getQuizzesByTask);

/**
 * @route   GET /api/quizzes/:quizId
 * @desc    (Usuário) Buscar um quiz e suas perguntas (sem respostas)
 * @access  Privado (Participante e Admin)
 */
router.get('/:quizId', quizController.getQuizForUser);

/**
 * @route   POST /api/quizzes/:quizId/submit
 * @desc    (Usuário) Submeter respostas de um quiz
 * @access  Privado (Participante e Admin)
 */
router.post('/:quizId/submit', quizController.submitQuiz);

module.exports = router;


/**
 * @swagger
 * tags:
 *   name: Quiz
 *   description: Rotas para resposta do quiz
 */

/**
 * @swagger
 * /quizzes/{quizId}/submit:
 *   post:
 *     summary: Responde um quiz
 *     tags: [Quiz]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuario_id:
 *                 type: int
 *                 example: 1
 *               pergunta_id:
 *                 type: int
 *                 example: 2
 *               resposta:
 *                 type: text
 *                 example: A resposta do usuário
 *               correta:
 *                 type: boolean
 *                 example: True
 *     responses:
 *       201:
 *         description: Quiz submentido com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */                                        

/**
 * @swagger
 * /quizzes/{quizId}:
 *   get:
 *     summary: Retorna os quizzes
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do quiz respondido
 *       401:
 *         description: Token inválido ou expirado
 */