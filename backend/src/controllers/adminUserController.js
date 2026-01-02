// Importa o Prisma Client
const prisma = require("../config/prismaClient");
const { Prisma } = require("@prisma/client");
const bcrypt = require("bcryptjs");

/**
 * @route   GET /api/admin/users
 * @desc    (Admin) Listar todos os usuários com filtros dinâmicos
 * @query   ?ativo=true&perfil=user&busca=samuel
 * @access  Admin
 */
const getAllUsers = async (req, res) => {
  const { ativo, perfil, busca } = req.query;

  const where = {};
  if (ativo) where.ativo = ativo === "true";
  if (perfil) where.role = perfil;
  if (busca) {
    where.OR = [
      { nome: { contains: busca, mode: "insensitive" } },
      { email: { contains: busca, mode: "insensitive" } },
    ];
  }

  try {
    const users = await prisma.usuario.findMany({
      where,
      select: {
        id: true,
        nome: true,
        email: true,
        empresa: true,
        role: true,
        ativo: true,
        pontos: true,
        foto_url: true,
        data_criacao: true, // Importante para a tabela do frontend
      },
      orderBy: { nome: "asc" },
    });

    res.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

/**
 * @route   POST /api/admin/users
 * @desc    (Admin) Criar um novo usuário manualmente
 * @access  Admin
 */
const createUser = async (req, res) => {
  const { nome, email, senha, empresa, role, ativo, pontos } = req.body;

  if (!nome || !email || !senha) {
    return res
      .status(400)
      .json({ error: "Nome, email e senha são obrigatórios." });
  }

  const allowedRoles = ["participante", "admin", "validador"];
  const finalRole = allowedRoles.includes(role) ? role : "participante";

  try {
    const existingUser = await prisma.usuario.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Este e-mail já está cadastrado." });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const newUser = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        empresa: empresa || null,
        role: finalRole,
        ativo: ativo ?? true,
        pontos: pontos ? parseInt(pontos) : 0,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        empresa: true,
        role: true,
        ativo: true,
        pontos: true,
      },
    });

    res
      .status(201)
      .json({ message: "Usuário criado com sucesso!", user: newUser });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({ error: "Este e-mail já está cadastrado." });
    }
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

/**
 * @route   GET /api/admin/users/:id
 * @desc    (Admin) Buscar um usuário específico
 * @access  Admin
 */
const getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id))
      return res.status(400).json({ error: "ID de usuário inválido." });

    const user = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        empresa: true,
        role: true,
        ativo: true,
        pontos: true,
        foto_url: true,
      },
    });

    if (!user)
      return res.status(404).json({ error: "Usuário não encontrado." });
    res.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário por ID:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

/**
 * @route   PUT /api/admin/users/:id
 * @desc    (Admin) Atualizar dados de um usuário
 * @access  Admin
 */
const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id))
      return res.status(400).json({ error: "ID de usuário inválido." });

    const { nome, email, foto_url, role, ativo, pontos, empresa, senha } = req.body;

    const allowedRoles = ["participante", "admin", "validador"];
    // Se o role não for enviado ou for inválido, não atualiza esse campo (undefined)
    const finalRole = allowedRoles.includes(role) ? role : undefined;

    const dataToUpdate = {
        nome,
        email,
        foto_url,
        role: finalRole,
        ativo,
        pontos: pontos !== undefined ? parseInt(pontos) : undefined,
        empresa,
        data_atualizacao: new Date(),
    };

    if (senha && senha.trim() !== "") {
        const salt = await bcrypt.genSalt(10);
        dataToUpdate.senha = await bcrypt.hash(senha, salt);
    }

    const updatedUser = await prisma.usuario.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        nome: true,
        email: true,
        empresa: true,
        role: true,
        ativo: true,
        pontos: true,
        foto_url: true,
      },
    });

    res.json({ message: "Usuário atualizado com sucesso!", user: updatedUser });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res
          .status(409)
          .json({ error: "Este e-mail já está em uso por outro usuário." });
      }
      if (error.code === "P2025") {
        return res
          .status(404)
          .json({ error: "Usuário não encontrado para atualizar." });
      }
    }
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    (Admin) Desativar um usuário (Soft Delete)
 * @access  Admin
 */
const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id))
      return res.status(400).json({ error: "ID de usuário inválido." });

    // Estamos usando Soft Delete (apenas desativar) ou Hard Delete?
    // Se for Hard Delete (excluir do banco):
    await prisma.usuario.delete({ where: { id } });
    
    // Se for Soft Delete (desativar), use o código comentado abaixo:
    /*
    const deletedUser = await prisma.usuario.update({
      where: { id },
      data: { ativo: false, data_atualizacao: new Date() },
      select: { id: true, ativo: true },
    });
    */

    res.json({ message: "Usuário removido com sucesso!" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res
        .status(404)
        .json({ error: "Usuário não encontrado para deletar." });
    }
    console.error("Erro ao deletar usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};