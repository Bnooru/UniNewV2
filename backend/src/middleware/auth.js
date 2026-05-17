const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'uninew_secret';

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
}

function requirePerfil(...perfis) {
  return (req, res, next) => {
    if (!perfis.includes(req.user?.perfil)) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    next();
  };
}

module.exports = { requireAuth, requirePerfil };
