const express = require('express');
const router = express.Router();
const awardsController = require('../controllers/adminAwardsController');

// 🛑 CORREÇÃO: Importe as funções específicas 'authenticate' e 'checkRole'
const { authenticate, checkRole } = require('../middlewares/authMiddleware');

// Define os roles que podem visualizar as premiações
const PARTICIPANT_ROLES = ['admin', 'participante']; 

// 1. Aplica o middleware de autenticação em todas as rotas
// 🛑 CORREÇÃO: Substitua 'authMiddleware' pela função 'authenticate'
router.use(authenticate);

// 2. Aplica o middleware de autorização em todas as rotas (Opcional, mas seguro)
// Se todas as rotas são para o usuário visualizar, aplique a regra global.
router.use(checkRole(PARTICIPANT_ROLES));


/**
 * @route   GET /api/awards
 * @desc    (Usuário) Listar todas as premiações ativas
 * @access  Privado (Participante e Admin)
 */
// A autenticação e autorização já foram aplicadas via router.use()
router.get('/', awardsController.listAvailableAwards);

module.exports = router;