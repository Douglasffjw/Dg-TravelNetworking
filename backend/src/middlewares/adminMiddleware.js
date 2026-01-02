// Este middleware deve ser usado depois do authMiddleware

const checkAdmin = (req, res, next) => {
    // O authMiddleware já nos deu o req.user
    const userRole = req.user.role; 
  
    if (userRole === 'admin') {
      // Se for admin, continue
      next();
    } else {
      // Se não for, bloqueie
      res.status(403).json({ error: 'Acesso negado. Esta rota é restrita a administradores.' });
    }
  };
  
  module.exports = checkAdmin;