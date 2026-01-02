const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');

// Nota: Middlewares de Auth/Admin já estão no adminRoutes.js (pai)

/**
 * @route   GET /api/admin/users
 * @route   POST /api/admin/users
 */
router.route('/')
  .get(adminUserController.getAllUsers)
  .post(adminUserController.createUser);

/**
 * @route   GET /api/admin/users/:id
 * @route   PUT /api/admin/users/:id
 * @route   DELETE /api/admin/users/:id
 */
router.route('/:id')
  .get(adminUserController.getUserById)
  .put(adminUserController.updateUser) // CORREÇÃO: Alterado de .patch para .put para casar com o frontend
  .delete(adminUserController.deleteUser);

module.exports = router;