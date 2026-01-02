const express = require("express");
const router = express.Router();
const rankingController = require("../controllers/rankingController");

// Protege a rota de ranking (comente se quiser deixar pública temporariamente)

/**
 * @route   GET /api/ranking
 * @desc    Busca o ranking global de usuários
 */
router.get("/", rankingController.getGlobalRanking);

module.exports = router;