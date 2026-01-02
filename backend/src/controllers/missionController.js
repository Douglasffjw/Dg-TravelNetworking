// Importa o Prisma Client
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client'); 

/**
 * @route   GET /api/missions
 * @desc    Listar todas as missões ativas
 * @access  Privado (requer token)
 */
const getAllActiveMissions = async (req, res) => {
  try {
    const userId = req.user?.id; 

    const missoes = await prisma.missao.findMany({
      where: { ativa: true },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        destino: true,
        foto_url: true, 
        data_inicio: true,
        data_fim: true,
        preco: true,
        vagas_disponiveis: true,
      },
      orderBy: { data_inicio: 'asc' }
    });

    // Busca inscrições do usuário
    let joinedMissionIds = [];
    if (userId) {
        const inscricoes = await prisma.usuarioMissao.findMany({
            where: { usuario_id: userId },
            select: { missao_id: true }
        });
        joinedMissionIds = inscricoes.map(i => i.missao_id);
    }
    
    // Calcula soma de pontos das tarefas por missão
    const missionIds = missoes.map(m => m.id);
    const taskSums = await prisma.tarefa.groupBy({
      by: ['missao_id'],
      where: { missao_id: { in: missionIds }, ativa: true },
      _sum: { pontos: true }
    });
    const missionTotalPoints = {};
    taskSums.forEach(s => {
      missionTotalPoints[s.missao_id] = s._sum.pontos || 0;
    });

    // Se houver usuário logado, calcula os pontos já obtidos por missão
    const userPointsByMission = {};
    if (userId && missionIds.length) {
      const userTaskPoints = await prisma.usuarioTarefa.findMany({
        where: {
          usuario_id: userId,
          tarefa: { missao_id: { in: missionIds } }
        },
        select: {
          pontos_obtidos: true,
          tarefa: { select: { missao_id: true } }
        }
      });

      userTaskPoints.forEach(u => {
        const mid = u.tarefa.missao_id;
        userPointsByMission[mid] = (userPointsByMission[mid] || 0) + (u.pontos_obtidos || 0);
      });
    }

    // Formata retorno
    const formatted = missoes.map(m => ({
        ...m,
        preco: m.preco ? Number(m.preco) : 0,
        isJoined: joinedMissionIds.includes(m.id),
        totalPoints: missionTotalPoints[m.id] || 0,
        userPoints: userPointsByMission[m.id] || 0
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erro ao buscar missões:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/missions/:missionId
 * @desc    Buscar detalhes básicos de uma missão
 * @access  Privado
 */
const getMissionById = async (req, res) => {
  try {
    const missionId = parseInt(req.params.missionId, 10);
    if (isNaN(missionId)) return res.status(400).json({ error: 'ID inválido.' });

    const missao = await prisma.missao.findUnique({
      where: { id: missionId }
    });

    if (!missao) return res.status(404).json({ error: 'Missão não encontrada.' });
    // Calcula pontos totais da missão (soma das tarefas ativas)
    try {
      const pointsAgg = await prisma.tarefa.aggregate({
        where: { missao_id: missionId, ativa: true },
        _sum: { pontos: true }
      });
      missao.totalPoints = (pointsAgg && pointsAgg._sum && pointsAgg._sum.pontos) ? Number(pointsAgg._sum.pontos) : 0;
    } catch (e) {
      missao.totalPoints = 0;
    }

    res.json(missao);
  } catch (error) {
    console.error('Erro ao buscar missão:', error);
    res.status(500).json({ error: 'Erro interno.' });
  }
};

/**
 * @route   GET /api/missions/:missionId/full
 * @desc    Dados completos: Missão + Tarefas (com Quiz) + Contexto Usuário
 * @access  Privado
 */
const getMissionFullById = async (req, res) => {
  try {
    const missionId = parseInt(req.params.missionId, 10);
    const userId = req.user?.id; 

    if (isNaN(missionId)) return res.status(400).json({ error: 'ID inválido.' });

    // 1. Busca dados da missão e tarefas COM O QUIZ INCLUÍDO
    const missao = await prisma.missao.findUnique({
      where: { id: missionId },
      include: {
        tarefas: {
          where: { ativa: true },
          orderBy: { ordem: 'asc' },
          include: {
            categoria: true,
            // 🔥 O FIO RECONECTADO: Força o Prisma a buscar o Quiz e Perguntas
            quiz: {
              include: {
                perguntas: {
                  orderBy: { ordem: 'asc' }
                }
              }
            } 
          }
        },
        _count: { select: { usuarios: true, tarefas: true } }
      }
    });

    if (!missao) return res.status(404).json({ error: 'Missão não encontrada.' });

    // 🔥 CORREÇÃO DE DADOS: Garante que o JSON de 'requisitos' seja um objeto real, não string
    if (missao.tarefas) {
        missao.tarefas = missao.tarefas.map(t => {
            if (t.requisitos && typeof t.requisitos === 'string') {
                try {
                    t.requisitos = JSON.parse(t.requisitos);
                } catch (e) {
                    console.error(`Falha ao parsear requisitos da tarefa ${t.id}`, e);
                }
            }
            return t;
        });
    }

    // 2. Busca contexto do usuário (Inscrição)
    const inscricao = await prisma.usuarioMissao.findUnique({
      where: {
        usuario_id_missao_id: {
          usuario_id: userId,
          missao_id: missionId
        }
      }
    });

    let progressoUsuario = [];
    if (inscricao) {
      progressoUsuario = await prisma.usuarioTarefa.findMany({
        where: {
          usuario_id: userId,
          tarefa_id: { in: missao.tarefas.map(t => t.id) }
        },
        select: {
          tarefa_id: true,
          concluida: true,
          pontos_obtidos: true,
          validado_por: true
        }
      });
    }

    // 3. Calcula Ranking (Top 5)
    const topRankingRaw = await prisma.usuarioTarefa.groupBy({
      by: ['usuario_id'],
      where: {
        tarefa: { missao_id: missionId },
        concluida: true
      },
      _sum: { pontos_obtidos: true },
      orderBy: { _sum: { pontos_obtidos: 'desc' } },
      take: 5
    });

    const rankingIds = topRankingRaw.map(r => r.usuario_id);
    const usersInfo = await prisma.usuario.findMany({
      where: { id: { in: rankingIds } },
      select: { id: true, nome: true, foto_url: true }
    });

    const ranking = topRankingRaw.map(r => {
      const u = usersInfo.find(user => user.id === r.usuario_id);
      return {
        id: r.usuario_id,
        name: u ? u.nome : 'Usuário',
        avatar: u ? u.foto_url : null,
        points: r._sum.pontos_obtidos || 0,
        isCurrentUser: r.usuario_id === userId
      };
    });

    const myPoints = progressoUsuario.reduce((acc, curr) => acc + (curr.pontos_obtidos || 0), 0);
    
    // 4. Monta resposta final
    // Soma os pontos totais das tarefas da missão
    const missionTotalPoints = (missao.tarefas || []).reduce((acc, t) => acc + (t && t.pontos ? Number(t.pontos) : 0), 0);

    const response = {
      ...missao,
      preco: missao.preco ? Number(missao.preco) : 0,
      isJoined: !!inscricao,
      participationStatus: inscricao ? inscricao.status_participacao : null,
      totalPoints: missionTotalPoints,
      userProgress: {
        totalPoints: myPoints,
        completedTasksCount: progressoUsuario.filter(p => p.concluida).length,
        tasksStatus: progressoUsuario.reduce((acc, curr) => {
          acc[curr.tarefa_id] = { concluida: curr.concluida, validado: !!curr.validado_por };
          return acc;
        }, {})
      },
      ranking
    };

    res.json(response);

  } catch (error) {
    console.error('Erro ao buscar dados completos:', error);
    res.status(500).json({ error: 'Erro interno.' });
  }
};

/**
 * @route   POST /api/missions/:missionId/join
 * @desc    Inscrever usuário na missão
 */
const joinMission = async (req, res) => {
  const missionId = parseInt(req.params.missionId, 10);
  const userId = req.user.id;

  if (isNaN(missionId)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const mission = await tx.missao.findUnique({ where: { id: missionId } });
      if (!mission || !mission.ativa) throw new Error('Missão indisponível.');

      const exists = await tx.usuarioMissao.findUnique({
        where: { usuario_id_missao_id: { usuario_id: userId, missao_id: missionId } }
      });
      if (exists) throw new Error('Já inscrito.');

      return await tx.usuarioMissao.create({
        data: {
          usuario_id: userId,
          missao_id: missionId,
          valor_pago: mission.preco || 0,
          status_pagamento: Number(mission.preco) > 0 ? 'pendente' : 'pago',
          status_participacao: 'inscrito'
        }
      });
    });

    res.json({ message: 'Inscrição realizada!', subscription: result });

  } catch (error) {
    const status = error.message === 'Já inscrito.' ? 409 : 400;
    res.status(status).json({ error: error.message || 'Erro ao inscrever.' });
  }
};

/**
 * @route   DELETE /api/missions/:missionId/join
 * @desc    Cancelar inscrição (Sair da missão)
 */
const leaveMission = async (req, res) => {
  const missionId = parseInt(req.params.missionId, 10);
  const userId = req.user.id;

  if (isNaN(missionId)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const exists = await prisma.usuarioMissao.findUnique({
      where: { usuario_id_missao_id: { usuario_id: userId, missao_id: missionId } }
    });

    if (!exists) {
        return res.status(404).json({ error: 'Você não está inscrito nesta missão.' });
    }

    // ⚠️ CORREÇÃO: Usamos uma transação para garantir que ambas as operações sejam atômicas
    await prisma.$transaction([
        // 1. Remove a inscrição
        prisma.usuarioMissao.delete({
            where: { usuario_id_missao_id: { usuario_id: userId, missao_id: missionId } }
        }),
        
        // 2. Zera o progresso das tarefas do usuário nesta missão
        prisma.usuarioTarefa.deleteMany({
            where: { 
                usuario_id: userId, 
                // Filtra as tarefas que pertencem a esta missão
                tarefa: { 
                    missao_id: missionId 
                } 
            }
        })
    ]);

    res.json({ message: 'Inscrição cancelada com sucesso. Seu progresso na missão foi zerado.' });

  } catch (error) {
    console.error('Erro ao sair da missão:', error);
    res.status(500).json({ error: 'Erro ao cancelar inscrição.' });
  }
};

// Funções administrativas
const getMissionParticipants = async (req, res) => {
    const missionId = parseInt(req.params.missionId, 10);
    if (isNaN(missionId)) return res.status(400).json({ error: 'ID inválido.' });

    try {
        const participants = await prisma.usuarioMissao.findMany({
            where: { missao_id: missionId },
            include: {
                usuario: {
                    select: { id: true, nome: true, email: true, foto_url: true }
                }
            },
            orderBy: { data_compra: 'desc' }
        });
        
        const formatted = participants.map(p => ({
            id: p.id,
            userId: p.usuario.id,
            name: p.usuario.nome,
            email: p.usuario.email,
            avatar: p.usuario.foto_url,
            status: p.status_participacao,
            paymentStatus: p.status_pagamento,
            date: p.data_compra
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Erro ao buscar participantes:', error);
        res.status(500).json({ error: 'Erro ao buscar participantes.' });
    }
};

const addParticipantToMission = async (req, res) => {
    const missionId = parseInt(req.params.missionId, 10);
    const { userId } = req.body;

    if (isNaN(missionId) || !userId) return res.status(400).json({ error: 'Dados incompletos.' });

    try {
        const newSub = await prisma.usuarioMissao.create({
            data: {
                usuario_id: parseInt(userId),
                missao_id: missionId,
                status_participacao: 'confirmado',
                status_pagamento: 'pago',
                valor_pago: 0
            }
        });
        res.json(newSub);
    } catch (error) {
        if (error.code === 'P2002') return res.status(409).json({ error: 'Usuário já inscrito.' });
        console.error('Erro ao adicionar participante:', error);
        res.status(500).json({ error: 'Erro ao adicionar participante.' });
    }
};

const removeParticipantFromMission = async (req, res) => {
    const missionId = parseInt(req.params.missionId, 10);
    const userId = parseInt(req.params.userId, 10);

    if (isNaN(missionId) || isNaN(userId)) return res.status(400).json({ error: 'IDs inválidos.' });

    try {
        await prisma.usuarioMissao.delete({
            where: {
                usuario_id_missao_id: {
                    usuario_id: userId,
                    missao_id: missionId
                }
            }
        });
        res.json({ message: 'Participante removido com sucesso.' });
    } catch (error) {
        console.error('Erro ao remover participante:', error);
        res.status(500).json({ error: 'Erro ao remover participante.' });
    }
};

module.exports = {
  getAllActiveMissions,
  getMissionById,
  getMissionFullById,
  joinMission,
  leaveMission,
  getMissionParticipants,
  addParticipantToMission,
  removeParticipantFromMission
};