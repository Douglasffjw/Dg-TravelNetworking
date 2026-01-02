const express = require('express');
const router = express.Router();
const adminCardsController = require('../controllers/adminCardsController');
/**
 * @swagger
 * tags:
 *   name: Admin - Cards
 *   description: Rotas administrativas para gerenciar os cards
 */

/**
 * @swagger
 * /admin/cards:
 *   post:
 *     summary: Cria um novo card
 *     tags: [Admin - Cards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "Card de Missão"
 *               descricao:
 *                 type: string
 *                 example: "Complete a missão para ganhar pontos."
 *               imagemUrl:
 *                 type: string
 *                 example: "https://exemplo.com/imagem.jpg"
 *     responses:
 *       201:
 *         description: Card criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 *
 *   get:
 *     summary: Lista todos os cards
 *     tags: [Admin - Cards]
 *     responses:
 *       200:
 *         description: Lista de cards retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   titulo:
 *                     type: string
 *                   descricao:
 *                     type: string
 *                   imagemUrl:
 *                     type: string
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /admin/cards/{cardId}:
 *   get:
 *     summary: Busca um card pelo ID
 *     tags: [Admin - Cards]
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do card
 *     responses:
 *       200:
 *         description: Card encontrado
 *       404:
 *         description: Card não encontrado
 *       401:
 *         description: Não autorizado
 *
 *   put:
 *     summary: Atualiza um card existente
 *     tags: [Admin - Cards]
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do card
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
 *               imagemUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Card atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Card não encontrado
 *       401:
 *         description: Não autorizado
 *
 *   delete:
 *     summary: Exclui um card pelo ID
 *     tags: [Admin - Cards]
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do card
 *     responses:
 *       200:
 *         description: Card excluído com sucesso
 *       404:
 *         description: Card não encontrado
 *       401:
 *         description: Não autorizado
 */

// Nota: Middlewares de Auth/Admin já estão no adminRoutes.js (pai)

/**
 * @route   POST /api/admin/cards
 * @route   GET /api/admin/cards
 */
router.route('/')
  .post(adminCardsController.createCard)
  .get(adminCardsController.getAllCards);

/**
 * @route   GET /api/admin/cards/:cardId
 * @route   PUT /api/admin/cards/:cardId
 * @route   DELETE /api/admin/cards/:cardId
 */
router.route('/:cardId')
  .get(adminCardsController.getCardById)
  .put(adminCardsController.updateCard)
  .delete(adminCardsController.deleteCard);

module.exports = router;

