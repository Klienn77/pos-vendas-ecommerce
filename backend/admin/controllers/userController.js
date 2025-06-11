/**
 * Controlador para gerenciamento de usuários
 * 
 * Este controlador fornece métodos para autenticação, registro e
 * gerenciamento de usuários do sistema administrativo.
 * 
 * @module admin/controllers/userController
 */

const User = require('../../models/userModel');
const jwt = require('jsonwebtoken');

/**
 * Objeto que contém os métodos do controlador de usuários
 */
const userController = {
  /**
   * Registra um novo usuário no sistema
   * 
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com o usuário registrado ou mensagem de erro
   */
  register: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      
      // Verifica se o email já está em uso
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Este email já está em uso'
        });
      }
      
      // Cria um novo usuário
      const user = new User({
        name,
        email,
        password,
        role: role || 'user' // Define 'user' como padrão se não for especificado
      });
      
      // Salva o usuário no banco de dados
      await user.save();
      
      // Retorna sucesso com os dados do usuário (sem a senha)
      return res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        user: user.toSafeObject()
      });
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao registrar usuário',
        error: error.message
      });
    }
  },
  
  /**
   * Autentica um usuário e gera um token JWT
   * 
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com o token JWT ou mensagem de erro
   */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Busca o usuário pelo email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha inválidos'
        });
      }
      
      // Verifica se a conta está ativa
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Conta desativada. Entre em contato com o administrador.'
        });
      }
      
      // Verifica se a senha está correta
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha inválidos'
        });
      }
      
      // Gera um token JWT
      const token = jwt.sign(
        {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET || 'seu_jwt_secret',
        { expiresIn: '24h' } // Token válido por 24 horas
      );
      
      // Retorna sucesso com o token e dados do usuário
      return res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        token,
        user: user.toSafeObject()
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao fazer login',
        error: error.message
      });
    }
  },
  
  /**
   * Obtém o perfil do usuário autenticado
   * 
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com os dados do usuário ou mensagem de erro
   */
  getProfile: async (req, res) => {
    try {
      // Busca o usuário pelo ID (disponível após autenticação)
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }
      
      // Retorna sucesso com os dados do usuário
      return res.status(200).json({
        success: true,
        user: user.toSafeObject()
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar perfil',
        error: error.message
      });
    }
  },
  
  /**
   * Lista todos os usuários (apenas para administradores)
   * 
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com a lista de usuários ou mensagem de erro
   */
  getAllUsers: async (req, res) => {
    try {
      // Busca todos os usuários
      const users = await User.find();
      
      // Converte para objetos seguros (sem senhas)
      const safeUsers = users.map(user => user.toSafeObject());
      
      // Retorna sucesso com a lista de usuários
      return res.status(200).json({
        success: true,
        count: safeUsers.length,
        users: safeUsers
      });
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao listar usuários',
        error: error.message
      });
    }
  },
  
  /**
   * Atualiza os dados de um usuário
   * 
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com o usuário atualizado ou mensagem de erro
   */
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, role, isActive } = req.body;
      
      // Verifica se o usuário existe
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }
      
      // Atualiza os campos fornecidos
      if (name) user.name = name;
      if (email) user.email = email;
      if (role) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
      
      // Salva as alterações
      await user.save();
      
      // Retorna sucesso com os dados atualizados
      return res.status(200).json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        user: user.toSafeObject()
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar usuário',
        error: error.message
      });
    }
  },
  
  /**
   * Altera a senha de um usuário
   * 
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com mensagem de sucesso ou erro
   */
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Busca o usuário pelo ID (disponível após autenticação)
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }
      
      // Verifica se a senha atual está correta
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Senha atual incorreta'
        });
      }
      
      // Atualiza a senha
      user.password = newPassword;
      
      // Salva as alterações
      await user.save();
      
      // Retorna sucesso
      return res.status(200).json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao alterar senha',
        error: error.message
      });
    }
  }
};

module.exports = userController;
