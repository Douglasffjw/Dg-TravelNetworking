// Importa o Prisma Client
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client'); // Para capturar erros

/**
 * @route   GET /api/missions/:missionId/tasks
 * @desc    Listar todas as tarefas ativas de uma missão específica
 * @access  Privado
 */
const getTasksByMissionId = async (req, res) => {
  try {
    const missionId = parseInt(req.params.missionId, 10);
    if (isNaN(missionId)) {
      return res.status(400).json({ error: 'ID da missão inválido.' });
    }

    // Busca as tarefas daquela missão, ordenadas pela coluna 'ordem'
    const tarefas = await prisma.tarefa.findMany({
      where: {
        missao_id: missionId,
        ativa: true,
      },
      orderBy: {
        ordem: 'asc',
      },
      // INCLUI o Quiz e as Perguntas para o frontend consumir
      include: {
        quiz: {
          include: {
            perguntas: {
              orderBy: { ordem: 'asc' }
            }
          }
        }
      }
    });

    // Tratamento de segurança: Se 'requisitos' vier como string do banco, fazemos o parse.
    const tarefasProcessadas = tarefas.map(t => {
      if (t.requisitos && typeof t.requisitos === 'string') {
        try { 
            t.requisitos = JSON.parse(t.requisitos); 
        } catch(e) {
            console.error(`Erro ao parsear requisitos da tarefa ${t.id}`, e);
        }
      }
      return t;
    });

    res.json(tarefasProcessadas);
  } catch (error) {
    console.error('Erro ao buscar tarefas da missão:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   POST /api/missions/:missionId/tasks/:taskId/submit
 * @desc    Submeter uma tarefa para validação (Agora com lógica de Quiz)
 * @access  Privado
 */
const submitTask = async (req, res) => {
  const missionId = parseInt(req.params.missionId, 10);
  const taskId = parseInt(req.params.taskId, 10);
  const userId = req.user.id;
  const { evidencias } = req.body;

  if (!evidencias) {
    return res.status(400).json({ error: 'O campo "evidencias" é obrigatório.' });
  }
  if (isNaN(missionId) || isNaN(taskId)) {
    return res.status(400).json({ error: 'IDs de missão ou tarefa inválidos.' });
  }

  try {
    const submissionResult = await prisma.$transaction(async (tx) => {
      // 1️⃣ Buscar tarefa e quiz
      const task = await tx.tarefa.findFirst({
        where: { id: taskId, missao_id: missionId, ativa: true },
        include: {
            quiz: {
                include: {
                    perguntas: true
                }
            }
        }
      });
      if (!task) {
        throw new Error('Tarefa não encontrada, inativa ou não pertence a esta missão.');
      }

      // 2️⃣ Validar inscrição do usuário
      const enrollment = await tx.usuarioMissao.findFirst({
        where: {
          usuario_id: userId,
          missao_id: missionId,
          status_participacao: 'inscrito',
        },
      });
      if (!enrollment) {
        throw new Error('Você não está inscrito nesta missão ou sua inscrição não está ativa.');
      }

      // 3️⃣ Verificar se já existe submissão concluída
      const existingSubmission = await tx.usuarioTarefa.findUnique({
        where: {
          usuario_id_tarefa_id: { usuario_id: userId, tarefa_id: taskId },
        },
      });

      if (existingSubmission && existingSubmission.concluida) {
        throw new Error('Esta tarefa já foi concluída e validada.');
      }
      
      let pontosObtidos = 0;
      let isConcluida = false;

      // 💥 LÓGICA DE VALIDAÇÃO DE QUIZ (Regra de Três Simples)
      if (task.tipo === 'conhecimento' && task.quiz && evidencias.type === 'quiz' && evidencias.answers) {
          const respostasCorretasDoBD = task.quiz.perguntas;
          const respostasDoUsuario = evidencias.answers;
          
          const totalPerguntas = respostasCorretasDoBD.length;
          let acertos = 0;

          if (totalPerguntas > 0) {
              for (const pergunta of respostasCorretasDoBD) {
                  const respostaUsuario = respostasDoUsuario[pergunta.id];
                  
                  // Assumimos que a resposta_correta está preenchida no BD
                  if (respostaUsuario && String(respostaUsuario) === String(pergunta.resposta_correta)) {
                      acertos++;
                  }
              }

              // Regra de Três: PontosTotais * (Acertos / TotalPerguntas)
              pontosObtidos = Math.round((task.pontos * acertos) / totalPerguntas);
              
              // Se obteve qualquer pontuação, consideramos concluída (se for o requisito do quiz)
              if (pontosObtidos > 0) {
                  isConcluida = true;
              }
              
              console.log(`[QUIZ RESULT] Acertos: ${acertos}/${totalPerguntas}. Pontos Ganhos: ${pontosObtidos}`);
          }
      }
      // FIM DA LÓGICA DE VALIDAÇÃO DE QUIZ

      // 4️⃣ Preparar dados de submissão
      const submissionData = {
        usuario_id: userId,
        tarefa_id: taskId,
        evidencias,
        concluida: isConcluida, // Usar resultado da validação
        pontos_obtidos: pontosObtidos, // Usar pontos calculados
        data_conclusao: isConcluida ? new Date() : null,
        validado_por: isConcluida ? 'SISTEMA_QUIZ' : null, // Marca como validado pelo sistema
        tentativas: existingSubmission ? existingSubmission.tentativas + 1 : 1,
      };

      // 5️⃣ Upsert (cria ou atualiza)
      const result = await tx.usuarioTarefa.upsert({
        where: { usuario_id_tarefa_id: { usuario_id: userId, tarefa_id: taskId } },
        update: submissionData,
        create: submissionData,
      });

      return result;
    });

    // Resposta final que reflete se a tarefa foi concluída ou não
    res.status(201).json({
      message: submissionResult.concluida ? `Tarefa concluída! Você ganhou ${submissionResult.pontos_obtidos} pontos.` : 'Tarefa submetida para validação.',
      submission: submissionResult,
    });
  } catch (error) {
    if (error.message.includes('Tarefa não encontrada') || error.message.includes('Você não está inscrito')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('já foi concluída')) {
      return res.status(409).json({ error: error.message });
    }

    console.error('Erro ao submeter tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/missions/:missionId/tasks/:taskId
 * @desc    Buscar uma tarefa específica pelo ID
 * @access  Privado
 */
const getTaskById = async (req, res) => {
  try {
    const missionId = parseInt(req.params.missionId, 10);
    const taskId = parseInt(req.params.taskId, 10);

    if (isNaN(missionId) || isNaN(taskId)) {
      return res.status(400).json({ error: 'IDs de missão ou tarefa inválidos.' });
    }

    const tarefa = await prisma.tarefa.findFirst({
      where: {
        id: Number(taskId),
        missao_id: Number(missionId),
      },
      include: {
        quiz: {
          include: {
            perguntas: {
                orderBy: { ordem: 'asc' }
            },
          },
        },
      },
    });
    

    if (!tarefa) {
      return res.status(404).json({ error: 'Tarefa não encontrada ou não pertence a esta missão.' });
    }

    // Verificando se os dados do JSON de 'requisitos' estão corretos
    try {
      if (tarefa.requisitos) {
        if (typeof tarefa.requisitos === 'string') {
          tarefa.requisitos = JSON.parse(tarefa.requisitos);
        }
      }
    } catch (err) {
      console.error("Erro ao parsear requisitos:", err);
    }

    res.json(tarefa);
  } catch (error) {
    console.error('Erro ao buscar tarefa por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


// --- (ADMIN) ---
/**
 * @route   POST /api/missions/:missionId/tasks
 * @desc    Criar uma nova tarefa para uma missão e gera o quiz se necessário
 * @access  Admin
 */
const createTaskForMission = async (req, res) => {
  try {
    const missionId = parseInt(req.params.missionId, 10);
    if (isNaN(missionId)) {
      return res.status(400).json({ error: 'ID da missão inválido.' });
    }

    const missaoExistente = await prisma.missao.findUnique({ where: { id: missionId } });
    if (!missaoExistente) {
      return res.status(404).json({ error: 'Missão não encontrada.' });
    }

    const {
      categoria_id, titulo, descricao, instrucoes, pontos, tipo, dificuldade, ordem,
      requisitos, // JSON legado ou backup
      quiz,       // Objeto de Quiz enviado pelo Frontend
      tarefa_anterior_id,
    } = req.body;

    if (!titulo || !pontos || !tipo || !dificuldade) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    // Transaction para garantir que cria tarefa e quiz atomicamente
    const result = await prisma.$transaction(async (tx) => {
        // 1. Cria a Tarefa
        const newTask = await tx.tarefa.create({
            data: {
                missao_id: missionId,
                categoria_id: categoria_id ? parseInt(categoria_id, 10) : null,
                titulo,
                descricao: descricao || null,
                instrucoes: instrucoes || null,
                pontos: parseInt(pontos, 10),
                tipo,
                dificuldade,
                ativa: true,
                ordem: ordem ? parseInt(ordem, 10) : 0,
                requisitos: requisitos || Prisma.JsonNull,
                tarefa_anterior_id: tarefa_anterior_id ? parseInt(tarefa_anterior_id, 10) : null,
            },
        });

        // 2. Se for Quiz, cria as estruturas relacionais
        if (tipo === 'conhecimento' && quiz && quiz.perguntas && quiz.perguntas.length > 0) {
            
            // A. Criar o Quiz na tabela 'quizzes'
            const newQuiz = await tx.quiz.create({
                data: {
                    tarefa_id: newTask.id,
                    titulo: `Quiz: ${titulo}`,
                    descricao: 'Responda corretamente para pontuar.',
                    ativa: true
                }
            });

            // B. Criar Perguntas na tabela 'PerguntaQuiz'
            for (let i = 0; i < quiz.perguntas.length; i++) {
                const q = quiz.perguntas[i];
                await tx.perguntaQuiz.create({
                    data: {
                        quiz_id: newQuiz.id,
                        enunciado: q.enunciado,
                        tipo: 'multipla_escolha',
                        opcoes: q.opcoes || [],
                        resposta_correta: q.resposta_correta,
                        ordem: i
                    }
                });
            }

            // C. VINCULA O QUIZ À TAREFA (O fio que faltava)
            await tx.tarefa.update({
                where: { id: newTask.id },
                data: { quizId: newQuiz.id } // Preenche a coluna que vinha null
            });

            // Retorna a tarefa completa para o front
            return await tx.tarefa.findUnique({
                where: { id: newTask.id },
                include: { quiz: { include: { perguntas: true } } }
            });
        }

        return newTask;
    });

    res.status(201).json({
      message: 'Tarefa criada com sucesso!',
      task: result,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return res.status(404).json({ error: 'ID da missão ou da categoria é inválido.' });
    }
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   PUT /api/missions/:missionId/tasks/:taskId
 * @desc    Atualizar uma tarefa existente (Incluindo Quiz e Relacionamentos)
 * @access  Admin
 */
const updateTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId, 10);
    const missionId = req.params.missionId ? parseInt(req.params.missionId, 10) : null;

    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'ID da tarefa inválido.' });
    }

    const {
      categoria_id, titulo, descricao, instrucoes, pontos, tipo, dificuldade, ordem,
      requisitos, 
      quiz, // Dados do Quiz para update
      tarefa_anterior_id, ativa
    } = req.body;

    const result = await prisma.$transaction(async (tx) => {
        // 1. Atualizar dados básicos
        const dataToUpdate = {};
        if (categoria_id !== undefined) dataToUpdate.categoria_id = categoria_id ? parseInt(categoria_id, 10) : null;
        if (titulo !== undefined) dataToUpdate.titulo = titulo;
        if (descricao !== undefined) dataToUpdate.descricao = descricao;
        if (instrucoes !== undefined) dataToUpdate.instrucoes = instrucoes;
        if (pontos !== undefined) dataToUpdate.pontos = parseInt(pontos, 10);
        if (tipo !== undefined) dataToUpdate.tipo = tipo;
        if (dificuldade !== undefined) dataToUpdate.dificuldade = dificuldade;
        if (ordem !== undefined) dataToUpdate.ordem = parseInt(ordem, 10);
        if (ativa !== undefined) dataToUpdate.ativa = ativa;
        if (tarefa_anterior_id !== undefined) dataToUpdate.tarefa_anterior_id = tarefa_anterior_id ? parseInt(tarefa_anterior_id, 10) : null;
        if (requisitos !== undefined) dataToUpdate.requisitos = requisitos; 

        await tx.tarefa.update({
            where: { id: taskId },
            data: dataToUpdate,
        });

        // 2. Atualizar Quiz (se aplicável)
        if (tipo === 'conhecimento' && quiz && quiz.perguntas) {
            
            // Verifica se já existe quiz ligado a esta tarefa
            let existingQuiz = await tx.quiz.findFirst({ where: { tarefa_id: taskId } });

            // Se não existe, cria do zero e vincula
            if (!existingQuiz) {
                existingQuiz = await tx.quiz.create({
                    data: {
                        tarefa_id: taskId,
                        titulo: `Quiz: ${titulo || 'Atualizado'}`,
                        ativa: true
                    }
                });
                // VINCULA
                await tx.tarefa.update({
                    where: { id: taskId },
                    data: { quizId: existingQuiz.id }
                });
            }

            // Remove perguntas antigas para inserir as novas (limpeza total para evitar conflitos de ordem)
            await tx.perguntaQuiz.deleteMany({ where: { quiz_id: existingQuiz.id } });

            // Recria perguntas
            for (let i = 0; i < quiz.perguntas.length; i++) {
                const q = quiz.perguntas[i];
                await tx.perguntaQuiz.create({
                    data: {
                        quiz_id: existingQuiz.id,
                        enunciado: q.enunciado,
                        tipo: 'multipla_escolha',
                        opcoes: q.opcoes || [],
                        resposta_correta: q.resposta_correta,
                        ordem: i
                    }
                });
            }
        }

        // Retorna a tarefa atualizada com os novos dados de quiz
        return await tx.tarefa.findUnique({
            where: { id: taskId },
            include: { quiz: { include: { perguntas: { orderBy: { ordem: 'asc' } } } } }
        });
    });

    res.json({
      message: 'Tarefa atualizada com sucesso!',
      task: result,
    });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar tarefa.' });
  }
};

/** * @route   POST /api/missions/:missionId/tasks/:taskId/evidences
 * @desc    Upload de evidências
 * @access  Private
 */
const uploadEvidence = async (req, res) => {
  try {
    const missionId = parseInt(req.params.missionId, 10);
    const taskId = parseInt(req.params.taskId, 10);
    const userId = req.user.id;

    if (isNaN(missionId) || isNaN(taskId)) {
      return res.status(400).json({ error: 'IDs inválidos.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const evidencias = req.files.map(file => {
      return {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `${req.protocol}://${req.get('host')}/uploads/evidences/${file.filename}`
      };
    });

    const existingSubmission = await prisma.usuarioTarefa.findUnique({
      where: { usuario_id_tarefa_id: { usuario_id: userId, tarefa_id: taskId } }
    });

    const submissionPayload = {
      usuario_id: userId,
      tarefa_id: taskId,
      evidencias: evidencias,
      concluida: false,
      pontos_obtidos: existingSubmission ? existingSubmission.pontos_obtidos : 0,
      data_conclusao: existingSubmission ? existingSubmission.data_conclusao : null,
      validado_por: existingSubmission ? existingSubmission.validado_por : null,
      tentativas: existingSubmission ? existingSubmission.tentativas + 1 : 1,
      data_criacao: existingSubmission ? existingSubmission.data_criacao : undefined
    };

    const result = await prisma.usuarioTarefa.upsert({
      where: { usuario_id_tarefa_id: { usuario_id: userId, tarefa_id: taskId } },
      update: submissionPayload,
      create: submissionPayload
    });

    return res.status(201).json({ message: 'Evidências recebidas.', submission: result });

  } catch (error) {
    console.error('Erro ao receber evidências:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

const createQuizForTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId, 10);
    if (isNaN(taskId)) {
      return res.status(400).json({ error: 'ID da tarefa inválido.' });
    }

    const { titulo, descricao, perguntas } = req.body;

    if (!titulo || !Array.isArray(perguntas) || perguntas.length === 0) {
      return res.status(400).json({ error: 'Título e perguntas são obrigatórios.' });
    }

    const quiz = await prisma.$transaction(async (tx) => {
      const tarefa = await tx.tarefa.findUnique({
        where: { id: taskId },
        include: { quiz: true }
      });

      if (!tarefa) throw new Error('Tarefa não encontrada.');
      if (tarefa.quiz) throw new Error('Esta tarefa já possui um quiz.');

      const createdQuiz = await tx.quiz.create({
        data: {
          tarefa_id: taskId,
          titulo,
          descricao: descricao || null
        }
      });

      for (let i = 0; i < perguntas.length; i++) {
        const p = perguntas[i];

        await tx.perguntaQuiz.create({
          data: {
            quiz_id: createdQuiz.id,
            enunciado: p.enunciado,
            tipo: p.tipo || 'multipla_escolha',
            opcoes: p.opcoes || [],
            resposta_correta: p.resposta_correta,
            explicacao: p.explicacao || null,
            ordem: i
          }
        });
      }
      
      // Vincula na tarefa também
      await tx.tarefa.update({
          where: { id: taskId },
          data: { quizId: createdQuiz.id }
      });

      return createdQuiz;
    });

    res.status(201).json({ message: 'Quiz criado com sucesso.', quiz });

  } catch (error) {
    if (error.message.includes('já possui')) {
      return res.status(409).json({ error: error.message });
    }
    console.error('Erro ao criar quiz:', error);
    res.status(500).json({ error: 'Erro interno ao criar quiz.' });
  }
};

module.exports = {
  getTasksByMissionId,
  submitTask,
  getTaskById,
  createTaskForMission,
  updateTask,
  uploadEvidence,
  createQuizForTask
};