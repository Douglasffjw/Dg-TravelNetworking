// Importa o Prisma Client
const prisma = require('../config/prismaClient');
const { Prisma } = require('@prisma/client'); // Para tratamento de erro

/**
 * @route   POST /api/admin/cards
 * @desc    (Admin) Criar um novo selo (card)
 * @access  Admin
 */
const createCard = async (req, res) => {
  // Campos da tabela 'cards' 
  const {
    tarefa_id, // 
    titulo, // [cite: 167]
    descricao, // [cite: 168]
    ativo // 
  } = req.body;

  if (!titulo || !tarefa_id) { // [cite: 166, 167]
    return res.status(400).json({ error: 'Os campos "titulo" e "tarefa_id" são obrigatórios.' });
  }

  try {
    const newCard = await prisma.cards.create({
      data: {
        tarefa_id: parseInt(tarefa_id, 10), // 
        titulo: titulo, // [cite: 167]
        descricao: descricao || null, // [cite: 168]
        ativo: ativo || false // 
        // data_criacao é @default(now())
      }
    });
    res.status(201).json({ message: 'Selo (Card) criado com sucesso!', card: newCard });

  } catch (error) {
    // Erro de FK (tarefa_id não existe)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return res.status(404).json({ error: 'ID da tarefa (tarefa_id) é inválido.' });
    }
    console.error('Erro ao criar card:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/admin/cards
 * @desc    (Admin) Listar todos os selos (cards)
 * @access  Admin
 */
const getAllCards = async (req, res) => {
  try {
    const cards = await prisma.cards.findMany({
      orderBy: { data_criacao: 'desc' }
    });
    res.json(cards);
  } catch (error) {
    console.error('Erro ao buscar cards:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   GET /api/admin/cards/:cardId
 * @desc    (Admin) Buscar detalhes de um selo (card)
 * @access  Admin
 */
const getCardById = async (req, res) => {
  try {
    const cardId = parseInt(req.params.cardId, 10);
    if (isNaN(cardId)) {
      return res.status(400).json({ error: 'ID do Card inválido.' });
    }

    const card = await prisma.cards.findUnique({
      where: { id: cardId }
    });

    if (!card) {
      return res.status(404).json({ error: 'Selo (Card) não encontrado.' });
    }
    res.json(card);

  } catch (error) {
    console.error('Erro ao buscar card por ID:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   PUT /api/admin/cards/:cardId
 * @desc    (Admin) Atualizar um selo (card)
 * @access  Admin
 */
const updateCard = async (req, res) => {
  try {
    const cardId = parseInt(req.params.cardId, 10);
    if (isNaN(cardId)) {
      return res.status(400).json({ error: 'ID do Card inválido.' });
    }

    const { tarefa_id, titulo, descricao, ativo } = req.body; // 

    if (!titulo || !tarefa_id) { // [cite: 166, 167]
      return res.status(400).json({ error: 'Os campos "titulo" e "tarefa_id" são obrigatórios.' });
    }

    const updatedCard = await prisma.cards.update({
      where: { id: cardId },
      data: {
        tarefa_id: parseInt(tarefa_id, 10), // 
        titulo: titulo, // [cite: 167]
        descricao: descricao, // [cite: 168]
        ativo: ativo // 
      }
    });

    res.json({ message: 'Selo (Card) atualizado com sucesso!', card: updatedCard });

  } catch (error) {
    // Erro se o card não for encontrado
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Selo (Card) não encontrado para atualizar.' });
    }
    // Erro de FK (tarefa_id não existe)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return res.status(404).json({ error: 'ID da tarefa (tarefa_id) é inválido.' });
    }
    console.error('Erro ao atualizar card:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

/**
 * @route   DELETE /api/admin/cards/:cardId
 * @desc    (Admin) Desativar (soft delete) um selo (card)
 * @access  Admin
 */
const deleteCard = async (req, res) => {
  try {
    const cardId = parseInt(req.params.cardId, 10);
    if (isNaN(cardId)) {
      return res.status(400).json({ error: 'ID do Card inválido.' });
    }

    // Soft delete (apenas desativa)
    const deletedCard = await prisma.cards.update({
      where: { id: cardId },
      data: {
        ativo: false // 
      }
    });

    res.json({ message: 'Selo (Card) desativado (soft delete) com sucesso!', card: deletedCard });

  } catch (error) {
    // Erro se o card não for encontrado
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Selo (Card) não encontrado para deletar.' });
    }
    console.error('Erro ao deletar card:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  createCard,
  getAllCards,
  getCardById,
  updateCard,
  deleteCard,
};