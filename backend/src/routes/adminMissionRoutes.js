const express = require('express');
const router = express.Router();

// Controller de ADMIN (CRUD da missão)
const adminMissionController = require('../controllers/adminMissionController');
// Controller GERAL (Gestão de participantes e lógica de negócio)
const missionController = require('../controllers/missionController');

// --- ROTAS DE CRUD DE MISSÃO (ADMIN) ---

/**
 * @route   POST /api/admin/missions
 * @desc    Criar missão
 */
router.post('/', adminMissionController.createMission);

/**
 * @route   GET /api/admin/missions
 * @desc    Listar missões
 */
router.get('/', adminMissionController.getAllMissions);

/**
 * @route   GET /api/admin/missions/:missionId
 * @desc    Detalhes da missão
 */
router.get('/:missionId', adminMissionController.getMissionById);

/**
 * @route   PUT /api/admin/missions/:missionId
 * @desc    Atualizar missão
 */
router.put('/:missionId', adminMissionController.updateMission);

/**
 * @route   DELETE /api/admin/missions/:missionId
 * @desc    Soft delete da missão
 */
router.delete('/:missionId', adminMissionController.softDeleteMission);


// --- ROTAS DE PARTICIPANTES (ESSENCIAIS PARA O MODAL) ---

/**
 * @route   GET /api/admin/missions/:missionId/participants
 * @desc    Listar participantes da missão
 */
router.get('/:missionId/participants', missionController.getMissionParticipants);

/**
 * @route   POST /api/admin/missions/:missionId/participants
 * @desc    Vincular participante manualmente
 */
router.post('/:missionId/participants', missionController.addParticipantToMission);

/**
 * @route   DELETE /api/admin/missions/:missionId/participants/:userId
 * @desc    Remover participante
 */
router.delete('/:missionId/participants/:userId', missionController.removeParticipantFromMission);


module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Admin - Missões
 *   description: Rotas administrativas para gerenciamento de missões
 */

/**
 * @swagger
 * /admin/missions:
 *   post:
 *     summary: Cria uma nova missão
 *     tags: [Admin - Missões]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "Missão Nubank"
 *               descricao:
 *                 type: string
 *                 example: "Nesta missão vamos a sede da Nubank em São Paulo."
 *               foto_url:
 *                 type: string
 *                 example: "imagem.com"
 *               destino:
 *                 type: string
 *                 example: "São Paulo"
 *               data_inicio:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-20"
 *               data_fim:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-30"
 *               preco:
 *                 type: number
 *                 example: 1500.50
 *               vagas_disponiveis:
 *                 type: integer
 *                 example: 20
 *               ativo:
 *                 type: boolean
 *                 example: true
 *               missao_anterior_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *     responses:
 *       201:
 *         description: Missão criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 * 
 * 
 *   get:
 *     summary: Lista todas as missões
 *     tags: [Admin - Missões]
 *     responses:
 *       200:
 *         description: Lista de missões retornada com sucesso
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
 *                   pontuacao:
 *                     type: integer
 *                   ativa:
 *                     type: boolean
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /admin/missions/{missionId}:
 *   get:
 *     summary: Busca uma missão pelo ID
 *     tags: [Admin - Missões]
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da missão
 *     responses:
 *       200:
 *         description: Missão encontrada
 *       404:
 *         description: Missão não encontrada
 *       401:
 *         description: Não autorizado
 *
 *   put:
 *     summary: Atualiza uma missão existente
 *     tags: [Admin - Missões]
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da missão
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "Missão Atualizada"
 *               descricao:
 *                 type: string
 *                 example: "Nova descrição da missão"
 *               preco:
 *                 type: integer
 *                 example: 1500
 *               ativa:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Missão atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Missão não encontrada
 *       401:
 *         description: Não autorizado
 *
 *   delete:
 *     summary: Desativa (soft delete) uma missão
 *     tags: [Admin - Missões]
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da missão
 *     responses:
 *       200:
 *         description: Missão desativada com sucesso
 *       404:
 *         description: Missão não encontrada
 *       401:
 *         description: Não autorizado
 */
