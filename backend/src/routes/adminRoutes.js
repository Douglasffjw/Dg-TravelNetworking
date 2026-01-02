const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");

// 🛑 IMPORTAÇÃO ESSENCIAL:
// Precisamos das funções de autenticação e autorização do seu middleware
const { authenticate, checkRole } = require("../middlewares/authMiddleware");

// --- SUBROTAS ADMINISTRATIVAS ---
const adminMissionRoutes = require("./adminMissionRoutes");
const adminAwardsRoutes = require("./adminAwardsRoutes");
const adminQuizRoutes = require("./adminQuizRoutes");
const adminCardsRoutes = require("./adminCardsRoutes");
const adminUserRoutes = require("./adminUserRoutes");
const adminEnrollmentsRoutes = require("./adminEnrollmentsRoutes");
const adminTaskRoutes = require('./adminTaskRoutes');

// --- PROTEÇÃO GLOBAL ---
// Aplicar estas regras a TODAS as rotas e sub-rotas que vêm a seguir

// 1. Verifica se o usuário está autenticado via JWT
router.use(authenticate); 

// 2. Verifica se o usuário tem role === 'admin'
router.use(checkRole(['admin'])); 

// --- ROTAS DE DASHBOARD ---
/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Obter estatísticas gerais do sistema
 * @access  Admin
 */
router.get("/dashboard/stats", adminController.getDashboardStats);

// --- VALIDAÇÃO DE SUBMISSÕES ---
/**
 * @route   POST /api/admin/submissions/:submissionId/validate
 * @desc    Aprovar ou reprovar uma submissão de tarefa
 * @access  Admin
 */
router.post(
  "/submissions/:submissionId/validate",
  adminController.validateTaskSubmission
);

// --- SUBROTAS ADMINISTRATIVAS ---
// O router.use já aplica os middlewares acima para todas estas rotas
router.use("/enrollments", adminEnrollmentsRoutes);
router.use("/missions", adminMissionRoutes);
router.use("/users", adminUserRoutes);
router.use("/quizzes", adminQuizRoutes);
router.use("/awards", adminAwardsRoutes);
router.use("/cards", adminCardsRoutes);
router.use('/tasks', adminTaskRoutes);
// router.use('/tasks', adminTaskRoutes); // Descomente se criar rotas específicas de tarefas admin

module.exports = router;