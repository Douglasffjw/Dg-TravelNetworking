const express = require('express');
const router = express.Router();
const adminEnrollmentsController = require('../controllers/adminEnrollmentsController');

// Nota: Middlewares de Auth/Admin já estão no adminRoutes.js (pai)

/**
 * @route   GET /api/admin/enrollments
 * @route   POST /api/admin/enrollments (Não implementado, inscrição é feita pelo usuário)
 */
router.route('/')
  .get(adminEnrollmentsController.getAllEnrollments);

/**
 * @route   GET /api/admin/enrollments/:id
 * @route   PATCH /api/admin/enrollments/:id
 * @route   DELETE /api/admin/enrollments/:id
 */
router.route('/:id')
  .get(adminEnrollmentsController.getEnrollmentById)
  .patch(adminEnrollmentsController.updateEnrollment)
  .delete(adminEnrollmentsController.deleteEnrollment);

module.exports = router;