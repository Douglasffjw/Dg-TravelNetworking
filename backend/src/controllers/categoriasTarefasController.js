const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client');

/**
 * Listar todas as categorias de tarefas (ordenadas por 'ordem')
 */
const getAllCategorias = async (req, res) => {
  try {
    const categorias = await prisma.categoriaTarefa.findMany({
      orderBy: { ordem: 'asc' },
      include: {
        tarefas: {
          where: { ativa: true },
          orderBy: { ordem: 'asc' }
        }
      }
    });
    res.json(categorias);
  } catch (error) {
    console.error('Erro ao listar categorias de tarefas:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * Buscar categoria por ID
 */
const getCategoriaById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

    const categoria = await prisma.categoriaTarefa.findUnique({
      where: { id },
      include: {
        tarefas: {
          where: { ativa: true },
          orderBy: { ordem: 'asc' }
        }
      }
    });
    if (!categoria) return res.status(404).json({ error: 'Categoria não encontrada.' });

    res.json(categoria);
  } catch (error) {
    console.error('Erro ao buscar categoria por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * Criar nova categoria (Admin)
 */
const createCategoria = async (req, res) => {
  try {
    const { nome, descricao, icone, cor, ordem } = req.body;
    if (!nome) return res.status(400).json({ error: 'O campo "nome" é obrigatório.' });

    const newCategoria = await prisma.categoriaTarefa.create({
      data: {
        nome,
        descricao: descricao || null,
        icone: icone || null,
        cor: cor || null,
        ordem: ordem ? parseInt(ordem, 10) : 0,
      },
    });

    res.status(201).json({ message: 'Categoria criada com sucesso!', categoria: newCategoria });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * Atualizar categoria (Admin)
 */
const updateCategoria = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

    const { nome, descricao, icone, cor, ordem } = req.body;
    const data = {};
    if (nome !== undefined) data.nome = nome;
    if (descricao !== undefined) data.descricao = descricao;
    if (icone !== undefined) data.icone = icone;
    if (cor !== undefined) data.cor = cor;
    if (ordem !== undefined) data.ordem = parseInt(ordem, 10);

    const updated = await prisma.categoriaTarefa.update({ where: { id }, data });
    res.json({ message: 'Categoria atualizada com sucesso!', categoria: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Categoria não encontrada.' });
    }
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * Remover categoria (Admin)
 */
const deleteCategoria = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

    const deleted = await prisma.categoriaTarefa.delete({ where: { id } });
    res.json({ message: 'Categoria removida com sucesso!', categoria: deleted });
  } catch (error) {
    // P2003 = constraint failure (foreign key), P2025 = record not found
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return res.status(409).json({ error: 'Não é possível remover: existem tarefas vinculadas a esta categoria.' });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Categoria não encontrada.' });
    }
    console.error('Erro ao remover categoria:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  getAllCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
};
