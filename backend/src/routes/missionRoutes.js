const express = require("express");
const router = express.Router();
const missionController = require("../controllers/missionController");

// Importa as funções de autenticação e autorização
const { authenticate, checkRole } = require("../middlewares/authMiddleware");

// 1. Importar as rotas de tarefas
const taskRoutes = require("./taskRoutes"); 

// Definição dos Roles permitidos para visualização (usado apenas nas rotas privadas agora)
const PARTICIPANT_ROLES = ['admin', 'participante']; 

// --- ROTAS DE SUB-MÓDULO (Aninhamento) ---

// 2. Aninhar as rotas de tarefas, aplicando autenticação e permissão de acesso
// Qualquer requisição para /api/missions/:missionId/tasks
router.use(
    "/:missionId/tasks", 
    authenticate, 
    checkRole(PARTICIPANT_ROLES), // Permite participante e admin
    taskRoutes
);


// --- ROTAS DE VISUALIZAÇÃO DE MISSÕES ---

/**
 * @route   GET /api/missions
 * @desc    Listar todas as missões ativas
 * @access  Público (Alterado para exibir na Home)
 */
router.get("/", missionController.getAllActiveMissions);

/**
 * @route   GET /api/missions/:missionId
 * @desc    Buscar detalhes de uma missão específica
 * @access  Público (Alterado para exibir detalhes básicos)
 */
router.get("/:missionId", missionController.getMissionById);

/**
 * @route   GET /api/missions/:missionId/full
 * @desc    Retorna os dados completos de uma missão (tarefas, inscritos, logs, contagens)
 * @access  Privado (Participante e Admin)
 */
router.get("/:missionId/full", authenticate, checkRole(PARTICIPANT_ROLES), missionController.getMissionFullById);


// --- ROTAS DE AÇÃO (INSCRIÇÃO/DESINSCRIÇÃO) ---

/**
 * @route   POST /api/missions/:missionId/join
 * @desc    Inscrever o usuário logado em uma missão
 * @access  Privado (Apenas Participante deve se inscrever)
 */
router.post("/:missionId/join", authenticate, checkRole(['participante']), missionController.joinMission); 

/**
 * @route   DELETE /api/missions/:missionId/join
 * @desc    Sair (desvincular) da missão
 * @access  Privado (Apenas Participante)
 */
router.delete("/:missionId/join", authenticate, checkRole(['participante']), missionController.leaveMission);

module.exports = router;