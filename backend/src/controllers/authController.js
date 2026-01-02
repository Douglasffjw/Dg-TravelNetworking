// Importa o Prisma Client no lugar do node-pg
const prisma = require('../config/prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Prisma } = require('@prisma/client');
require('dotenv').config();

// --- FUNÇÃO DE CADASTRO (Refatorada com Proteção de Admin) ---
const register = async (req, res) => {
  // Extrai role e adminKey do corpo da requisição
  const { nome, email, senha, role, adminKey } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
  }

  try {
    // 1. Definição de Papel (Role) com Segurança
    let userRole = 'participante'; // Padrão

    if (role === 'admin') {
      // Se tentar criar admin, exige a chave mestra do .env
      if (adminKey !== process.env.ADMIN_REGISTRATION_KEY) {
        return res.status(403).json({ error: 'Chave de administrador inválida ou ausente.' });
      }
      userRole = 'admin';
    }

    // 2. Verificar se o e-mail já existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    }

    // 3. Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // 4. Criar o usuário usando o Prisma
    const newUser = await prisma.usuario.create({
      data: {
        nome: nome,
        email: email,
        senha: senhaHash,
        role: userRole, // Usa a role definida pela lógica de segurança
        ativo: true,
      },
      // 5. Selecionar os campos para retornar
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true
      }
    });

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      user: newUser,
    });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    }
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// --- LOGIN (Refatorado) ---
const login = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }
  try {
    // 1. Encontrar o usuário com Prisma
    const user = await prisma.usuario.findUnique({
      where: { email: email }
    });

    // 2. Validar usuário e senha
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    if (!user.ativo) {
      return res.status(403).json({ error: 'Este usuário está inativo.' });
    }
    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Payload
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };

    // 1. GERAR ACCESS TOKEN
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
    );

    // 2. GERAR REFRESH TOKEN
    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
    );

    // 3. ENVIAR REFRESH TOKEN COMO HttpOnly COOKIE
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    // 4. ENVIAR ACCESS TOKEN E DADOS DO USUÁRIO NO JSON
    res.json({
      message: 'Login bem-sucedido!',
      accessToken: accessToken,
      user: payload.user
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// --- REFRESH TOKEN (Sem alteração) ---
const refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Nenhum token de renovação.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    const payload = { user: decoded.user };
    
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
    );
    
    res.json({
      message: 'Token de acesso renovado!',
      accessToken: accessToken,
      user: decoded.user
    });

  } catch (error) {
    res.status(403).json({ error: 'Token de renovação inválido ou expirado. Faça login novamente.' });
  }
};

// --- LOGOUT (Sem alteração) ---
const logout = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(200).json({ message: 'Logout bem-sucedido.' });
};

// --- GET ME (Refatorado) ---
const getMe = async (req, res) => {
  try {
    // O ID vem do 'authMiddleware' que já rodou
    const userId = req.user.id; 

    // 1. Buscar usuário e incluir seu perfil
    const userWithProfile = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        perfil: true,
      },
    });

    if (!userWithProfile) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // 2. Achatar o objeto
    const { perfil, ...usuarioBase } = userWithProfile;
    const response = { ...usuarioBase, ...(perfil || {}) };
    
    // Remove a senha da resposta por segurança
    delete response.senha;

    res.json(response);

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
};