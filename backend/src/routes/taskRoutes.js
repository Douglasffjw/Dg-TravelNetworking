const express = require('express');
// Importante: { mergeParams: true } permite acessar :missionId da rota pai
const router = express.Router({ mergeParams: true });
const prisma = require('../config/prismaClient');
const { authenticate } = require('../middlewares/authMiddleware');

// Imports adicionados conforme solicitado
const taskController = require('../controllers/taskController');
// Verifique se este middleware existe ou ajuste para o authMiddleware se o checkAdmin estiver lá
const checkAdmin = require('../middlewares/adminMiddleware'); 
const multer = require('multer');

// Configuração do Multer para uploads locais (se necessário futuramente)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Certifique-se que esta pasta existe ou use '/tmp'
    cb(null, 'uploads/evidences'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split('.').pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// --- ROTAS PADRÃO DE TAREFAS (CRUD) ---

/**
 * @route   GET /api/missions/:missionId/tasks
 * @desc    Listar todas as tarefas ativas de uma missão
 */
router.get('/', taskController.getTasksByMissionId);

/**
 * @route   POST /api/missions/:missionId/tasks
 * @desc    (Admin) Criar uma nova tarefa para uma missão
 */
router.post('/', checkAdmin, taskController.createTaskForMission);

/**
 * @route   GET /api/missions/:missionId/tasks/:taskId
 * @desc    (Usuário) Buscar uma tarefa específica pelo ID
 */
router.get('/:taskId', taskController.getTaskById);


// --- ROTA DE SUBMISSÃO (LÓGICA CUSTOMIZADA PARA SUPABASE) ---

/**
 * @route   POST /api/missions/:missionId/tasks/:taskId/submit
 * @desc    (Usuário) Submeter uma tarefa para validação
 */
router.post('/:taskId/submit', authenticate, async (req, res) => {
    const taskId = parseInt(req.params.taskId);
    const userId = req.user.id;
    // Recebe fileUrl (do Supabase) ou evidence (link social)
    const { type, fileUrl, evidence } = req.body;

    try {
        // Busca a tarefa para saber os pontos
        const task = await prisma.tarefa.findUnique({ where: { id: taskId } });
        if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' });

        // Atualiza ou Cria o registro de conclusão
        // A lógica de "upsert" garante que não duplique se o usuário clicar duas vezes
        const submission = await prisma.usuarioTarefa.upsert({
            where: {
                usuario_id_tarefa_id: {
                    usuario_id: userId,
                    tarefa_id: taskId
                }
            },
            update: {
                concluida: true,
                pontos_obtidos: task.pontos,
                evidencias: { type, url: fileUrl || evidence, date: new Date() },
                data_conclusao: new Date()
            },
            create: {
                usuario_id: userId,
                tarefa_id: taskId,
                concluida: true,
                pontos_obtidos: task.pontos,
                evidencias: { type, url: fileUrl || evidence, date: new Date() },
                data_conclusao: new Date()
            }
        });

        // Credita pontos no perfil do usuário (Otimista/Automático)
        await prisma.usuario.update({
            where: { id: userId },
            data: { 
                pontos: { increment: task.pontos },
                pontos_totais: { increment: task.pontos }
            }
        });

        // Simulação de envio de email para tarefas documentais
        if (type === 'document') {
            console.log(`[SIMULAÇÃO EMAIL] Enviando documento ${fileUrl} para samuell.alves@aluno.uece.br`);
        }

        res.json({ success: true, points: task.pontos });

    } catch (error) {
        console.error("Erro na submissão:", error);
        res.status(500).json({ error: 'Erro ao processar tarefa' });
    }
});

router.post(
    '/:taskId/quiz',
    authenticate,
    checkAdmin,
    taskController.createQuizForTask
  );

router.put('/:taskId', checkAdmin, taskController.updateTask);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Tarefas
 *   description: Endpoints relacionados às tarefas das missões
 */

/**
 * @swagger
 * /missions/{missionId}/tasks:
 *   get:
 *     summary: Listar todas as tarefas ativas de uma missão
 *     tags: [Tarefas]
 *     parameters:
 *       - in: path
 *         name: missionId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID da missão
 *     responses:
 *       200:
 *         description: Lista de tarefas retornada com sucesso
 *       400:
 *         description: ID inválido
 *       500:
 *         description: Erro interno
 */

/**
 * @swagger
 * /missions/{missionId}/tasks/{taskId}:
 *   get:
 *     summary: Buscar uma tarefa específica pelo ID
 *     tags: [Tarefas]
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tarefa encontrada com sucesso
 *       400:
 *         description: IDs inválidos
 *       404:
 *         description: Tarefa não encontrada
 *       500:
 *         description: Erro interno
 */

/**
 * @swagger
 * /missions/{missionId}/tasks/{taskId}/submit:
 *   post:
 *     summary: Submeter uma tarefa para validação
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - evidencias
 *             properties:
 *               evidencias:
 *                 type: string
 *                 example: "URL da foto, vídeo ou texto enviado pelo usuário"
 *     responses:
 *       201:
 *         description: Tarefa submetida com sucesso
 *       400:
 *         description: Dados inválidos ou campos obrigatórios ausentes
 *       403:
 *         description: Usuário não inscrito na missão ou tarefa não pertence à missão
 *       409:
 *         description: Tarefa já concluída anteriormente
 *       500:
 *         description: Erro interno
 */

/**
 * @swagger
 * /missions/{missionId}/tasks:
 *   post:
 *     summary: (Admin) Criar uma nova tarefa para uma missão
 *     tags: [Admin - Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da missão à qual a tarefa pertence
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - pontos
 *               - tipo
 *               - dificuldade
 *             properties:
 *               categoria_id:
 *                 type: integer
 *                 nullable: true
 *               titulo:
 *                 type: string
 *                 example: "Tarefa Nubank"
 *               descricao:
 *                 type: string
 *                 nullable: true
 *                 example: "Descrição da tarefa Nubank"
 *               instrucoes:
 *                 type: string
 *                 nullable: true
 *                 example: "Instruções para  a tarefa Nubank"
 *               pontos:
 *                 type: integer
 *                 example: 10
 *               tipo:
 *                 type: string
 *                 example: "conhecimento"
 *               dificuldade:
 *                 type: string
 *                 example: "medio"
 *               ordem:
 *                 type: integer
 *                 nullable: true
 *               requisitos:
 *                 type: object
 *                 nullable: true
 *               tarefa_anterior_id:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 *       400:
 *         description: Campos obrigatórios faltando
 *       404:
 *         description: Missão ou categoria não encontrada
 *       401:
 *         description: Token inválido ou sem permissão
 *       500:
 *         description: Erro interno
 */

