// Importa o Prisma Client
const prisma = require('../config/prismaClient');

/**
 * @route   GET /api/awards
 * @desc    (Usuário) Listar todas as premiações ativas
 * @access  Privado
 */
const listAvailableAwards = async (req, res) => {
  try {
    const awards = await prisma.premiacoes.findMany({
      where: {
        ativo: true,
        posicao_ranking: { not: null } // Apenas prêmios com posição no ranking
      },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        tipo: true,
        posicao_ranking: true,
        imagem_url: true
      },
      orderBy: {
        posicao_ranking: 'asc'
      }
    });

    res.json(awards);
  } catch (error) {
    console.error('Erro ao listar premiações:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  listAvailableAwards
};
