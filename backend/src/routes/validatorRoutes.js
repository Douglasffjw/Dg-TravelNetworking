const express = require('express');
const router = express.Router();
const validatorController = require('../controllers/validatorController');

// 🛑 CORREÇÃO: Importa as funções específicas 'authenticate' e 'checkRole'
const { authenticate, checkRole } = require('../middlewares/authMiddleware');

// Define os roles que podem atuar como validadores
const VALIDATOR_ROLES = ['admin', 'validator']; 

// 🛑 Removemos o 'validatorMiddleware' se ele apenas checa o role.
// Se ele tem outra função, adicione-o separadamente.
// Por clareza, assumimos que ele era apenas a checagem de role.


// ✅ MIDDLEWARES DE PROTEÇÃO GLOBAL
// 1. Garante que o usuário está logado (JWT)
// 🛑 CORREÇÃO: Usa a função 'authenticate' em vez do objeto 'authMiddleware'
router.use(authenticate);

// 2. Garante que o usuário tem o role de Validador ou Admin
// 🛑 CORREÇÃO: Usa a função checkRole para verificar o acesso
router.use(checkRole(VALIDATOR_ROLES));


/**
 * @route   GET /api/validations/pending
 * @desc    Lista validações pendentes de usuários_tarefas
 * @access  Restrito (Admin, Validator)
 */
router.get('/pending', validatorController.getPendingValidations);

// Você pode adicionar mais rotas aqui, como:
// router.post('/approve/:submissionId', validatorController.approveSubmission);
// router.post('/reject/:submissionId', validatorController.rejectSubmission);


module.exports = router;
