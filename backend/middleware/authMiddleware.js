/**
 * Middleware de autenticação e autorização
 * 
 * Este middleware verifica se o usuário está autenticado e se possui
 * as permissões necessárias para acessar recursos protegidos.
 * 
 * @module middleware/authMiddleware
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar se o usuário está autenticado
 * 
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @param {Function} next - Função para passar para o próximo middleware
 * @returns {void}
 */
const isAuthenticated = (req, res, next) => {
  try {
    // Obtém o token do cabeçalho Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acesso não autorizado. Token não fornecido.'
      });
    }
    
    // Extrai o token do cabeçalho
    const token = authHeader.split(' ')[1];
    
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_jwt_secret');
    
    // Adiciona os dados do usuário à requisição
    req.user = decoded;
    
    // Passa para o próximo middleware
    next();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    return res.status(401).json({
      success: false,
      message: 'Acesso não autorizado. Token inválido ou expirado.'
    });
  }
};

/**
 * Middleware para verificar se o usuário é administrador
 * 
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @param {Function} next - Função para passar para o próximo middleware
 * @returns {void}
 */
const isAdmin = (req, res, next) => {
  // Primeiro verifica se o usuário está autenticado
  isAuthenticated(req, res, () => {
    // Verifica se o usuário tem papel de administrador
    if (req.user && req.user.role === 'admin') {
      next(); // Permite acesso
    } else {
      return res.status(403).json({
        success: false,
        message: 'Acesso proibido. Permissões de administrador necessárias.'
      });
    }
  });
};

module.exports = {
  isAuthenticated,
  isAdmin
};
