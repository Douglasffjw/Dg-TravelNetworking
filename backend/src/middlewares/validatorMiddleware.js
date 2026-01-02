// permite acesso a validadores e administradores
const checkValidator = (req, res, next) => {
  const userRole = req.user && req.user.role;
  if (userRole === 'validador' || userRole === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Acesso negado. Esta rota é restrita a validadores.' });
};

module.exports = checkValidator;
