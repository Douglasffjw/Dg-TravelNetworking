const prisma = require("../config/prismaClient");
const supabase = require("../config/supabaseClient");

/**
 * @route   GET /api/users/me
 * @desc    Retorna os dados do usuário logado e seus dados de perfil (flattened)
 * @access  Privado
 */
const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // CORREÇÃO: Alterado de 'usuarios' para 'usuario' (singular)
        const user = await prisma.usuario.findUnique({
            where: { id: userId },
            select: {
                id: true,
                nome: true,
                email: true,
                role: true,
                pontos: true,
                foto_url: true,
                perfil: {
                    select: {
                        curiosidades: true,
                        linkedin_url: true,
                        website: true,
                        interesses: true,
                        data_nascimento: true,
                        telefone: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        // Achata o objeto para que o frontend leia 'curiosidades' diretamente
        const { perfil, ...usuarioBase } = user;

        const response = {
            ...usuarioBase,
            ...(perfil || {}),
            // Formata a data para string simples se existir
            data_nascimento: perfil?.data_nascimento
                ? new Date(perfil.data_nascimento).toISOString().split('T')[0]
                : null,
        };

        res.json(response);
    } catch (error) {
        console.error("Erro ao buscar perfil do usuário logado:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

// -----------------------------------------------------------------------

/**
 * @route   PUT /api/users/me
 * @desc    Atualiza os dados do perfil do usuário logado (Suporta JSON e Multipart)
 * @access  Privado
 */
const updateMyProfile = async (req, res) => {
    const userId = req.user.id;
    
    // RESTAURAÇÃO: Pega o arquivo do Multer se ele existir
    const file = req.file;

    // Dados da tabela 'usuarios'
    const { nome, email } = req.body;
    let { foto_url } = req.body; // Pode vir string do frontend ou ser gerada pelo upload

    // Dados da tabela 'perfis'
    const {
        curiosidades,
        linkedin_url,
        website,
        interesses,
        data_nascimento,
        telefone,
    } = req.body;

    try {
        // 1. LÓGICA DE UPLOAD SUPABASE (Reinserida para não quebrar seu frontend)
        if (file) {
            const fileExt = file.mimetype.split('/')[1] || 'jpg';
            // Padronizei para pasta 'avatars' para organização
            const fileName = `avatars/${userId}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase
                .storage
                .from('images') // Nome correto do bucket
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    upsert: true
                });

            if (uploadError) {
                console.error("Erro Supabase:", uploadError);
                // Não interrompe, tenta salvar os dados de texto
            } else {
                const { data: urlData } = supabase
                    .storage
                    .from('images')
                    .getPublicUrl(fileName);
                
                foto_url = urlData.publicUrl;
            }
        }

        // 2. Transação Prisma (CORRIGIDO: Nomes no Singular)
        await prisma.$transaction(async (tx) => {
            // Atualiza o usuário (tabela 'usuario')
            await tx.usuario.update({
                where: { id: userId },
                data: {
                    ...(nome && { nome }),
                    ...(email && { email }),
                    ...(foto_url && { foto_url }), // Atualiza URL se houver nova
                    data_atualizacao: new Date(),
                },
            });

            // Dados preparados para o upsert do perfil
            const profileData = {
                curiosidades,
                linkedin_url,
                website,
                interesses,
                // Converte string para Date, se válida
                data_nascimento: data_nascimento && data_nascimento !== 'null' 
                    ? new Date(data_nascimento) 
                    : undefined,
                telefone,
            };

            // Remove chaves undefined
            Object.keys(profileData).forEach(key => profileData[key] === undefined && delete profileData[key]);

            if (Object.keys(profileData).length > 0) {
                // Atualiza ou cria perfil (tabela 'perfil')
                await tx.perfil.upsert({
                    where: { usuario_id: userId },
                    update: {
                        ...profileData,
                        data_atualizacao: new Date(),
                    },
                    create: {
                        ...profileData,
                        usuario_id: userId,
                        data_criacao: new Date(),
                        data_atualizacao: new Date(),
                    },
                });
            }
        });

        // 3. Retorna os dados atualizados
        const updatedUserRaw = await prisma.usuario.findUnique({
             where: { id: userId },
             include: { perfil: true }
        });
        
        const { perfil, ...uBase } = updatedUserRaw;
        const response = { ...uBase, ...(perfil || {}) };

        return res.json(response);

    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        // Trata erro de email duplicado
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "O email fornecido já está em uso." });
        }
        res.status(500).json({ error: "Erro interno do servidor: " + error.message });
    }
};

// -----------------------------------------------------------------------

/**
 * @route   PUT /api/users/me/upload-foto
 * @desc    Rota dedicada para upload de foto (Implementação da Equipe - Corrigida)
 * @access  Privado
 */
const uploadProfilePhoto = async (req, res) => {
    const userId = req.user.id;
    const file = req.file;
    // Ajuste: Força o nome 'images' se a var de ambiente falhar
    const BUCKET_NAME = process.env.SUPABASE_BUCKET_PERFIL || 'images'; 

    if (!file) {
        return res.status(400).json({ error: "Nenhum arquivo de imagem fornecido." });
    }

    try {
        const fileExtension = file.originalname.split('.').pop();
        const filename = `avatars/${userId}-${Date.now()}.${fileExtension}`;

        // Envia para o Supabase
        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filename, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });

        if (uploadError) {
            console.error("Erro no upload do Supabase:", uploadError);
            return res.status(500).json({ error: "Falha ao enviar a imagem para o storage." });
        }

        // Obtém URL pública
        const { data: publicUrlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filename);

        const foto_url = publicUrlData.publicUrl;

        // CORREÇÃO: prisma.usuario.update (singular)
        await prisma.usuario.update({
            where: { id: userId },
            data: {
                foto_url: foto_url,
                data_atualizacao: new Date(),
            },
        });

        return res.json({
            message: "Foto de perfil atualizada com sucesso!",
            foto_url: foto_url,
        });

    } catch (error) {
        console.error("Erro ao fazer upload da foto:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

// -----------------------------------------------------------------------

/**
 * @route   GET /api/users/:id/profile
 * @desc    Busca o perfil público de outro usuário
 * @access  Público/Privado
 */
const getUserProfileById = async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ error: "ID de usuário inválido." });
        }

        // CORREÇÃO: prisma.usuario (singular)
        const user = await prisma.usuario.findFirst({
            where: {
                id: userId,
                ativo: true,
                // role: "participante", // Descomente se quiser restringir a busca
            },
            select: {
                id: true,
                nome: true,
                foto_url: true,
                pontos: true,
                perfil: {
                    select: {
                        curiosidades: true,
                        linkedin_url: true,
                        website: true,
                        interesses: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: "Perfil não encontrado." });
        }

        const { perfil, ...usuarioBase } = user;
        const response = {
            ...usuarioBase,
            ...(perfil || {}),
        };

        res.json(response);
    } catch (error) {
        console.error("Erro ao buscar perfil público:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

module.exports = {
    updateMyProfile,
    getUserProfileById,
    getMyProfile,
    uploadProfilePhoto, 
};