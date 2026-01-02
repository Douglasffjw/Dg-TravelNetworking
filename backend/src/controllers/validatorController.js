const prisma = require('../config/prismaClient');

/**
 * @route   GET /api/validations/pending
 * @desc    (Validador) Listar validações pendentes de `usuarios_tarefas`
 * @query   ?tarefa_id=&usuario_id=&page=&limit=
 * @access  Validador/Admin
 */
const getPendingValidations = async (req, res) => {
  try {
    const { tarefa_id, usuario_id, page = 1, limit = 50 } = req.query;

    const where = {
      concluida: true,
      validado_por: null
    };

    if (tarefa_id) where.tarefa_id = parseInt(tarefa_id, 10);
    if (usuario_id) where.usuario_id = parseInt(usuario_id, 10);

    const take = Math.min(parseInt(limit, 10) || 50, 200);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

    const pending = await prisma.usuarioTarefa.findMany({
      where,
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        tarefa: { select: { id: true, titulo: true } }
      },
      orderBy: { data_criacao: 'desc' },
      skip,
      take
    });

    // Total count for pagination
    const total = await prisma.usuarioTarefa.count({ where });

    res.json({ data: pending, meta: { total, page: parseInt(page, 10), limit: take } });
  } catch (error) {
    console.error('Erro ao listar validações pendentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  getPendingValidations
};
