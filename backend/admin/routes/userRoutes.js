/**
 * Rotas para gerenciamento de usuários
 * 
 * Este arquivo define os endpoints da API relacionados à autenticação
 * e gerenciamento de usuários do sistema administrativo.
 * 
 * @module admin/routes/userRoutes
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../../middleware/authMiddleware');

/**
 * @route POST /api/admin/users/register
 * @desc Registra um novo usuário no sistema
 * @access Private (apenas administradores)
 * 
 * Corpo da requisição:
 * - name: Nome completo do usuário
 * - email: Email do usuário
 * - password: Senha do usuário
 * - role: Papel do usuário (opcional, padrão: 'user')
 * 
 * Exemplo:
 * {
 *   "name": "João Silva",
 *   "email": "joao@exemplo.com",
 *   "password": "senha123",
 *   "role": "admin"
 * }
 */
router.post('/register', isAdmin, userController.register);

/**
 * @route POST /api/admin/users/login
 * @desc Autentica um usuário e gera um token JWT
 * @access Public
 * 
 * Corpo da requisição:
 * - email: Email do usuário
 * - password: Senha do usuário
 * 
 * Exemplo:
 * {
 *   "email": "joao@exemplo.com",
 *   "password": "senha123"
 * }
 */
router.post('/login', userController.login);

/**
 * @route GET /api/admin/users/profile
 * @desc Obtém o perfil do usuário autenticado
 * @access Private
 */
router.get('/profile', isAuthenticated, userController.getProfile);

/**
 * @route GET /api/admin/users
 * @desc Lista todos os usuários
 * @access Private (apenas administradores)
 */
router.get('/', isAdmin, userController.getAllUsers);

/**
 * @route PUT /api/admin/users/:id
 * @desc Atualiza os dados de um usuário
 * @access Private (apenas administradores)
 * 
 * Corpo da requisição:
 * - name: Nome completo do usuário (opcional)
 * - email: Email do usuário (opcional)
 * - role: Papel do usuário (opcional)
 * - isActive: Status da conta (opcional)
 * 
 * Exemplo:
 * {
 *   "name": "João Silva Atualizado",
 *   "role": "manager",
 *   "isActive": true
 * }
 */
router.put('/:id', isAdmin, userController.updateUser);

/**
 * @route POST /api/admin/users/change-password
 * @desc Altera a senha do usuário autenticado
 * @access Private
 * 
 * Corpo da requisição:
 * - currentPassword: Senha atual
 * - newPassword: Nova senha
 * 
 * Exemplo:
 * {
 *   "currentPassword": "senha123",
 *   "newPassword": "novaSenha456"
 * }
 */
router.post('/change-password', isAuthenticated, userController.changePassword);

module.exports = router;
