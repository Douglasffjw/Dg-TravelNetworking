// Importa o Prisma Client
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client'); // Para tratamento de erro

/**
 * @route   GET /api/admin/enrollments
 * @desc    (Admin) Listar todas as inscrições (com filtros)
 * @query   ?usuario_id=1&missao_id=2
 * @access  Admin
 */
const getAllEnrollments = async (req, res) => {
  const { usuario_id, missao_id } = req.query;

  let where = {};
  if (usuario_id) {
    where.usuario_id = parseInt(usuario_id, 10);
  }
  if (missao_id) {
    where.missao_id = parseInt(missao_id, 10);
  }

  try {
    const enrollments = await prisma.usuarioMissao.findMany({
      where: where,
      include: { // Inclui dados do usuário e da missão para contexto
        usuario: {
          select: { id: true, nome: true, email: true }
        },
        missao: {
          select: { id: true, titulo: true }
        }
      },
      orderBy: {
        data_criacao: 'desc'
      }
    });
    res.json(enrollments);
  } catch (error) {
    console.error('Erro ao buscar inscrições:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/admin/enrollments/:id
 * @desc    (Admin) Buscar uma inscrição específica
 * @access  Admin
 */
const getEnrollmentById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID da inscrição inválido.' });
    }

    const enrollment = await prisma.usuarioMissao.findUnique({
      where: { id: id },
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        missao: { select: { id: true, titulo: true } }
      }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Inscrição não encontrada.' });
    }
    res.json(enrollment);
  } catch (error) {
    console.error('Erro ao buscar inscrição por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   PATCH /api/admin/enrollments/:id
 * @desc    (Admin) Atualizar uma inscrição (ex: status de pagamento)
 * @access  Admin
 */
const updateEnrollment = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID da inscrição inválido.' });
    }

    // Campos que o admin pode atualizar
    const { 
      valor_pago, 
      status_pagamento, 
      status_participacao 
    } = req.body;

    const updatedEnrollment = await prisma.usuarioMissao.update({
      where: { id: id },
      data: {
        valor_pago: valor_pago ? parseFloat(valor_pago) : undefined,
        status_pagamento: status_pagamento,
        status_participacao: status_participacao
        // Prisma ignora campos 'undefined'
      }
    });

    res.json({ message: 'Inscrição atualizada com sucesso!', enrollment: updatedEnrollment });

  } catch (error) {
    // Erro se a inscrição não for encontrada
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Inscrição não encontrada para atualizar.' });
    }
    console.error('Erro ao atualizar inscrição:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   DELETE /api/admin/enrollments/:id
 * @desc    (Admin) Deletar uma inscrição (Hard Delete)
 * @access  Admin
 */
const deleteEnrollment = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID da inscrição inválido.' });
    }

    // Deleta o registro da tabela 'usuarios_missao'
    await prisma.usuarioMissao.delete({
      where: { id: id }
    });
    
    res.status(200).json({ message: 'Inscrição deletada com sucesso.' });

  } catch (error) {
    // Erro se a inscrição não for encontrada
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Inscrição não encontrada para deletar.' });
    }
    console.error('Erro ao deletar inscrição:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};


module.exports = {
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollment,
  deleteEnrollment,
};