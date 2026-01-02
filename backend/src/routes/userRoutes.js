const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Se a equipe atualizou o middleware para exportar { authenticate }, mantemos assim:
const { authenticate } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

/**
 * @route   GET /api/users/me
 * @desc    Retorna os dados do usuário logado
 * @access  Privado
 */
router.get('/me', authenticate, userController.getMyProfile);

/**
 * @route   PUT /api/users/me
 * @desc    Atualiza os dados do perfil do usuário logado (com suporte a upload de imagem)
 * @access  Privado
 */
// O middleware upload.single('file') processa a imagem antes do controller
router.put('/me', authenticate, upload.single('file'), userController.updateMyProfile);

/**
 * @route   GET /api/users/:id/profile
 * @desc    Busca o perfil público de OUTRO usuário
 * @access  Privado (Autenticado)
 */
router.get('/:id/profile', authenticate, userController.getUserProfileById);

module.exports = router;