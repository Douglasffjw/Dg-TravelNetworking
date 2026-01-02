const express = require('express');
const router = express.Router();
const adminTaskController = require('../controllers/adminTaskController');

// Observação: os middlewares de `auth`/`admin` são aplicados no roteador pai (adminRoutes.js)

/**
 * GET /api/admin/tasks
 * Lista todas as tarefas (admin)
 */
router.get('/', adminTaskController.getAllTasks);

/**
 * GET /api/admin/tasks/:id
 * Busca uma tarefa pelo ID (admin)
 */
router.get('/:id', adminTaskController.getTaskById);

/**
 * POST /api/admin/tasks
 * (Admin) Cria uma tarefa
 */
router.post('/', adminTaskController.createTask);

/**
 * PUT /api/admin/tasks/:id
 * (Admin) Atualiza uma tarefa
 */
router.put('/:id', adminTaskController.updateTask);

/**
 * DELETE /api/admin/tasks/:id
 * (Admin) Desativa uma tarefa (soft delete)
 */
router.delete('/:id', adminTaskController.deleteTask);

module.exports = router;