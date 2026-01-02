// Importa o Prisma Client de forma segura
const prismaModule = require("../config/prismaClient");
const prisma = prismaModule.prisma || prismaModule.default || prismaModule;
const { Prisma } = require('@prisma/client'); 

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Retorna estatísticas gerais para o dashboard com dados reais de XP
 */
const getDashboardStats = async (req, res) => {
  try {
    // 1. Total de Usuários (Participantes ativos)
    const totalUsers = await prisma.usuario.count({
      where: { 
        role: 'participante', 
        ativo: true 
      }
    });

    // 2. Total de Missões Ativas
    const totalMissions = await prisma.missao.count({
      where: { ativa: true }
    });

    // 3. Total de Tarefas Concluídas
    const completedMissions = await prisma.usuarioTarefa.count({
        where: { concluida: true }
    });
    
    // 4. Top Usuário Global (Ranking Geral baseado em pontos_totais)
    const topUserQuery = await prisma.usuario.findFirst({
      where: { 
        role: 'participante', 
        ativo: true 
      },
      orderBy: { 
        pontos_totais: 'desc' 
      },
      select: {
        nome: true,
        pontos_totais: true,
        foto_url: true // IMPORTANTE: Trazer a foto para o card de destaque
      }
    });

    // 5. Ranking por Missão (Lógica Robusta via usuarios_tarefas)
    // Nota: Usamos usuarios_tarefas e somamos pontos_obtidos agrupados por missão.
    // Isso é mais preciso do que logs, pois reflete o estado atual das tarefas.
    const missionRankings = await prisma.$queryRaw`
      WITH UserMissionScores AS (
        SELECT
          m.id AS "missaoId",
          m.titulo AS "missionTitle",
          u.id AS "userId",
          u.nome AS "userName",
          u.foto_url AS "userAvatar",
          SUM(ut.pontos_obtidos) AS "totalPoints"
        FROM "usuarios_tarefas" ut
        JOIN "tarefas" t ON ut.tarefa_id = t.id
        JOIN "missoes" m ON t.missao_id = m.id
        JOIN "usuarios" u ON ut.usuario_id = u.id
        WHERE u.role = 'participante' 
          AND u.ativo = true
          AND ut.concluida = true
        GROUP BY m.id, m.titulo, u.id, u.nome, u.foto_url
      ),
      RankedScores AS (
        SELECT
          *,
          ROW_NUMBER() OVER(PARTITION BY "missaoId" ORDER BY "totalPoints" DESC) as rn
        FROM UserMissionScores
      )
      SELECT
        "missaoId",
        "missionTitle",
        "userId",
        "userName",
        "userAvatar",
        "totalPoints"
      FROM RankedScores
      WHERE rn = 1
      ORDER BY "totalPoints" DESC;
    `;
    
    // 6. Cálculo da Taxa de Conclusão
    let averageCompletion = 0;
    // Estimativa: (Tarefas Concluídas / (Usuários * Missões * Média de 3 tarefas por missão))
    const estimatedTasksTotal = (totalUsers * totalMissions * 3) || 1;
    averageCompletion = Math.round((completedMissions / estimatedTasksTotal) * 100); 
    if (averageCompletion > 100) averageCompletion = 100;

    // 7. Formatação e Normalização dos Dados
    const topUserFormatted = {
      name: topUserQuery?.nome || 'Nenhum usuário',
      points: Number(topUserQuery?.pontos_totais || 0), // Garante número
      avatar: topUserQuery?.foto_url || null
    };

    // Mapeamento seguro convertendo BigInt para Number
    const missionRankingsFormatted = missionRankings.map(r => ({
      id: r.missaoId,
      title: r.missionTitle,
      topUser: {
        name: r.userName,
        points: Number(r.totalPoints || 0),
        avatar: r.userAvatar || null
      }
    }));

    res.json({
      totalUsers,
      totalMissions,
      completedMissions, 
      averageCompletion,
      topUser: topUserFormatted,
      missionRankings: missionRankingsFormatted
    });

  } catch (error) {
    console.error("Erro no Dashboard Stats:", error);
    res.status(500).json({ error: "Erro ao carregar estatísticas." });
  }
};

/**
 * @route   POST /api/admin/submissions/:submissionId/validate
 * @desc    Validar submissão (Aprovar/Reprovar)
 */
const validateTaskSubmission = async (req, res) => {
  const submissionId = parseInt(req.params.submissionId, 10);
  const adminId = req.user?.id;
  const { approve, pontos_concedidos } = req.body;

  try {
    const submission = await prisma.usuarioTarefa.findUnique({
      where: { id: submissionId }
    });

    if (!submission) return res.status(404).json({ error: 'Submissão não encontrada.' });

    const pontos = pontos_concedidos || 0;

    if (approve) {
      await prisma.$transaction([
        prisma.usuarioTarefa.update({
          where: { id: submissionId },
          data: {
            concluida: true,
            pontos_obtidos: pontos,
            validado_por: adminId,
            data_validacao: new Date()
          }
        }),
        prisma.usuario.update({
          where: { id: submission.usuario_id },
          data: { 
            pontos: { increment: pontos },
            pontos_totais: { increment: pontos }
          } 
        }),
        // Gera Log de Pontos para auditoria
        prisma.logsPontos.create({
            data: {
                usuario_id: submission.usuario_id,
                tarefa_id: submission.tarefa_id,
                validador_id: adminId,
                pontos: pontos,
                tipo: 'tarefa_concluida',
                descricao: 'Tarefa validada pelo admin'
            }
        })
      ]);
      res.json({ message: 'Aprovado com sucesso.' });
    } else {
      await prisma.usuarioTarefa.update({
        where: { id: submissionId },
        data: {
          concluida: false,
          pontos_obtidos: 0,
          validado_por: adminId,
          data_validacao: new Date()
        }
      });
      res.json({ message: 'Reprovado.' });
    }
  } catch (error) {
    console.error('Erro na validação:', error);
    res.status(500).json({ error: 'Erro ao validar.' });
  }
};

/**
 * @route   GET /api/admin/users
 * @desc    Listar todos os usuários
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        foto_url: true,
        role: true,
        ativo: true
      },
      orderBy: { nome: 'asc' }
    });
    res.json(users);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    res.status(500).json({ error: "Erro ao buscar usuários." });
  }
};

module.exports = {
  getDashboardStats,
  validateTaskSubmission,
  getAllUsers
};