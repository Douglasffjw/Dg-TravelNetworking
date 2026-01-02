// authMiddleware.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

// 1. Middleware de AUTENTICAÇÃO (Verifica Token e anexa req.user)
const authenticate = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acesso negado. Token ausente ou mal formatado ("Bearer <token>").' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};

// 2. Middleware de AUTORIZAÇÃO (Verifica Role)
// Recebe um array de roles permitidos e retorna um middleware.
const checkRole = (allowedRoles) => (req, res, next) => {
    // A autenticação já anexou o user, precisamos apenas checar o role
    if (!req.user || !req.user.role) {
        // Isso não deve acontecer se authenticate for executado antes, mas é uma boa proteção
        return res.status(401).json({ error: 'Não autorizado. Informações de usuário ausentes.' });
    }

    const userRole = req.user.role;

    // Verifica se o role do usuário está na lista de roles permitidos
    if (allowedRoles.includes(userRole)) {
        next(); // Autorizado: Prossiga
    } else {
        // 🛑 Retorna 403 Forbidden
        return res.status(403).json({ error: 'Acesso negado. Você não possui as permissões necessárias.' });
    }
};

module.exports = {
    authenticate,
    checkRole,
};