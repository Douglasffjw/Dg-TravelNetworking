const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client'); // Importante para tratar erros do Prisma

// Lista de valores válidos para o enum TipoTarefa conforme schema.prisma
const VALID_TASK_TYPES = ['administrativa', 'conhecimento', 'engajamento', 'social', 'feedback'];

// Listar todas as tarefas
const getAllTasks = async (req, res) => {
    try {
        const tasks = await prisma.tarefa.findMany({
            // where: { ativa: true }, // Se quiser listar inativas também, remova ou ajuste
            include: {
                categoria: true,
                quiz: {
                    include: { perguntas: true }
                }
            },
            orderBy: { id: 'desc' }
        });
        res.json(tasks);
    } catch (error) {
        console.error("Erro ao listar tarefas:", error);
        res.status(500).json({ error: "Erro interno." });
    }
};

// Buscar tarefa por ID
const getTaskById = async (req, res) => {
    const { id } = req.params;
    try {
        const task = await prisma.tarefa.findUnique({
            where: { id: parseInt(id) },
            include: {
                categoria: true,
                quiz: {
                    include: { perguntas: true }
                }
            }
        });
        if (!task) return res.status(404).json({ error: "Tarefa não encontrada" });
        res.json(task);
    } catch (error) {
        console.error("Erro ao buscar tarefa:", error);
        res.status(500).json({ error: "Erro interno." });
    }
};

// Criar Tarefa
const createTask = async (req, res) => {
    const { 
        missao_id, categoria_id, titulo, descricao, instrucoes, 
        pontos, tipo, dificuldade, ordem, requisitos, quiz 
    } = req.body;

    // Sanitização do Tipo: O Prisma explode se receber string fora do Enum.
    // Se vier "comum" ou qualquer coisa inválida, forçamos null.
    const sanitizedTipo = VALID_TASK_TYPES.includes(tipo) ? tipo : null;

    try {
        const result = await prisma.$transaction(async (tx) => {
            const newTask = await tx.tarefa.create({
                data: {
                    missao_id: parseInt(missao_id),
                    categoria_id: categoria_id ? parseInt(categoria_id) : null,
                    titulo,
                    descricao,
                    instrucoes,
                    pontos: pontos ? parseInt(pontos) : 0,
                    tipo: sanitizedTipo, // <--- CORREÇÃO AQUI
                    dificuldade: ['facil', 'medio', 'dificil'].includes(dificuldade) ? dificuldade : 'facil',
                    ordem: ordem ? parseInt(ordem) : 0,
                    requisitos: requisitos || null,
                    ativa: true
                }
            });

            if (quiz && quiz.perguntas && quiz.perguntas.length > 0) {
                await tx.quiz.create({
                    data: {
                        tarefa_id: newTask.id,
                        titulo: quiz.titulo || `Quiz: ${titulo}`,
                        descricao: quiz.descricao || "",
                        perguntas: {
                            create: quiz.perguntas.map((p, idx) => ({
                                enunciado: p.enunciado,
                                opcoes: p.opcoes,
                                resposta_correta: p.resposta_correta,
                                ordem: idx
                            }))
                        }
                    }
                });
            }

            return newTask;
        });

        res.status(201).json({ message: "Tarefa criada com sucesso", task: result });

    } catch (error) {
        console.error("Erro ao criar tarefa:", error);
        // Retorna detalhes do erro para facilitar debug se for PrismaValidationError
        res.status(500).json({ error: "Erro ao criar tarefa.", details: error.message });
    }
};

// Atualizar Tarefa
const updateTask = async (req, res) => {
    const { id } = req.params;
    const { 
        missao_id, categoria_id, titulo, descricao, instrucoes, 
        pontos, tipo, dificuldade, ordem, requisitos, quiz, ativa
    } = req.body;

    try {
        await prisma.$transaction(async (tx) => {
            // Prepara objeto de dados, validando o tipo se ele vier
            const dataToUpdate = {
                missao_id: missao_id ? parseInt(missao_id) : undefined,
                categoria_id: categoria_id ? parseInt(categoria_id) : undefined,
                titulo,
                descricao,
                instrucoes,
                pontos: pontos !== undefined ? parseInt(pontos) : undefined,
                dificuldade,
                ordem: ordem !== undefined ? parseInt(ordem) : undefined,
                requisitos,
                ativa // Permite ativar/desativar
            };

            // Se 'tipo' foi enviado, valida. Se for inválido (ex: "comum"), define como null.
            if (tipo !== undefined) {
                dataToUpdate.tipo = VALID_TASK_TYPES.includes(tipo) ? tipo : null;
            }

            await tx.tarefa.update({
                where: { id: parseInt(id) },
                data: dataToUpdate
            });

            // Atualização de Quiz (Lógica Simplificada: Recriação)
            if (quiz) {
                const existingQuiz = await tx.quiz.findUnique({ where: { tarefa_id: parseInt(id) } });
                
                if (existingQuiz) {
                    // Atualiza título/descrição
                    await tx.quiz.update({
                        where: { id: existingQuiz.id },
                        data: { titulo: quiz.titulo || undefined, descricao: quiz.descricao || undefined }
                    });

                    // Se vieram perguntas novas, substitui as antigas
                    if (quiz.perguntas && Array.isArray(quiz.perguntas)) {
                        await tx.perguntaQuiz.deleteMany({ where: { quiz_id: existingQuiz.id } });
                        if (quiz.perguntas.length > 0) {
                            await tx.perguntaQuiz.createMany({
                                data: quiz.perguntas.map((p, idx) => ({
                                    quiz_id: existingQuiz.id,
                                    enunciado: p.enunciado,
                                    opcoes: p.opcoes,
                                    resposta_correta: p.resposta_correta,
                                    ordem: idx
                                }))
                            });
                        }
                    }
                } else if (quiz.perguntas && quiz.perguntas.length > 0) {
                    // Cria quiz novo se não existia
                    await tx.quiz.create({
                        data: {
                            tarefa_id: parseInt(id),
                            titulo: quiz.titulo || `Quiz: ${titulo || 'Tarefa'}`,
                            descricao: quiz.descricao || "",
                            perguntas: {
                                create: quiz.perguntas.map((p, idx) => ({
                                    enunciado: p.enunciado,
                                    opcoes: p.opcoes,
                                    resposta_correta: p.resposta_correta,
                                    ordem: idx
                                }))
                            }
                        }
                    });
                }
            }
        });

        const updated = await prisma.tarefa.findUnique({
            where: { id: parseInt(id) },
            include: { quiz: { include: { perguntas: true } } }
        });
        
        res.json({ message: "Tarefa atualizada", task: updated });

    } catch (error) {
        console.error("Erro ao atualizar tarefa:", error);
        res.status(500).json({ error: "Erro ao atualizar." });
    }
};

// Deletar Tarefa
const deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        // Soft delete
        await prisma.tarefa.update({
            where: { id: parseInt(id) },
            data: { ativa: false } 
        });
        res.json({ message: "Tarefa removida." });
    } catch (error) {
        console.error("Erro ao deletar tarefa:", error);
        res.status(500).json({ error: "Erro ao deletar." });
    }
};

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};