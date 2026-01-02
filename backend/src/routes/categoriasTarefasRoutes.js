const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasTarefasController');

// 🛑 CORREÇÃO: Importe APENAS as funções específicas 'authenticate' e 'checkRole'
// Removemos a importação do objeto 'authMiddleware' e do 'checkAdmin' separado.
const { authenticate, checkRole } = require('../middlewares/authMiddleware');

// Define o role necessário para rotas de gerenciamento
const ADMIN_ROLE = ['admin'];

// --- ROTAS PÚBLICAS (Leitura para todos) ---

/**
 * GET /api/categorias-tarefas
 * Lista todas as categorias de tarefas
 */
router.get('/', categoriasController.getAllCategorias);

/**
 * GET /api/categorias-tarefas/:id
 * Busca uma categoria pelo ID
 */
router.get('/:id', categoriasController.getCategoriaById);


// --- ROTAS PROTEGIDAS (Admin) ---

/**
 * POST /api/categorias-tarefas
 * (Admin) Cria uma nova categoria
 */
// 🛑 CORREÇÃO: Usa a função 'authenticate' e 'checkRole'
router.post('/', authenticate, checkRole(ADMIN_ROLE), categoriasController.createCategoria);

/**
 * PUT /api/categorias-tarefas/:id
 * (Admin) Atualiza uma categoria
 */
// 🛑 CORREÇÃO: Usa a função 'authenticate' e 'checkRole'
router.put('/:id', authenticate, checkRole(ADMIN_ROLE), categoriasController.updateCategoria);

/**
 * DELETE /api/categorias-tarefas/:id
 * (Admin) Remove uma categoria
 */
// 🛑 CORREÇÃO: Usa a função 'authenticate' e 'checkRole'
router.delete('/:id', authenticate, checkRole(ADMIN_ROLE), categoriasController.deleteCategoria);

module.exports = router;
