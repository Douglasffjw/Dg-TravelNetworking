// Importa o Prisma Client de forma segura
const prismaModule = require("../config/prismaClient");
const prisma = prismaModule.prisma || prismaModule.default || prismaModule;

/**
 * @route   GET /api/ranking
 * @desc    Busca o ranking global de usuários
 * @access  Privado (requer token)
 */
const getGlobalRanking = async (req, res) => {
  try {
    if (!prisma) throw new Error("Prisma não inicializado.");

    // Detecção automática do modelo (usuario/users/etc) para robustez
    const keys = Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_'));
    const userModelKey = keys.find(k => /^(user|users|usuario|usuarios)$/i.test(k)) || 
                         keys.find(k => typeof prisma[key]?.findMany === 'function');

    if (!userModelKey) throw new Error("Tabela de usuários não encontrada no Prisma.");

    const usuarioModel = prisma[userModelKey];

    // Busca dados
    const usuariosRaw = await usuarioModel.findMany({
      take: 100,
      orderBy: { pontos_totais: 'desc' } // Ranking geral usa pontos_totais (soma de todas as missões)
    });

    // Processamento e normalização
    const ranking = usuariosRaw
        .filter(u => u.ativo !== false) // Filtra inativos se a coluna existir
        .map((user) => {
            const nome = user.nome || user.name || "Sem Nome";
            const pontos = Number(user.pontos_totais || user.pontos || user.points || 0);
            const foto = user.foto_url || user.photo_url || user.avatar || null;
            const depto = user.departamento || user.department || user.role || "Geral";
            
            // Iniciais
            const nomeLimpo = String(nome).trim();
            const partes = nomeLimpo.split(" ");
            const initials = partes.length >= 2
                ? (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
                : nomeLimpo.slice(0, 2).toUpperCase();

            return {
                id: user.id,
                name: nomeLimpo,
                initials: initials,
                photo: foto,
                points: pontos,
                department: depto,
                variation: 0, 
            };
        })
        .sort((a, b) => b.points - a.points); // Garante a ordenação final

    res.json(ranking);

  } catch (error) {
    console.error("Erro no Ranking:", error.message);
    res.status(500).json({ error: "Erro ao buscar ranking." });
  }
};

module.exports = {
  getGlobalRanking,
};