/**
 * Modelo para usuários do sistema
 * 
 * Este modelo define a estrutura dos usuários que podem acessar
 * o painel administrativo e outras áreas restritas.
 * 
 * @module models/userModel
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Schema para usuários do sistema
 */
const userSchema = new mongoose.Schema({
  // Nome completo do usuário
  name: {
    type: String,
    required: true
  },
  
  // Email do usuário (usado para login)
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  // Senha do usuário (armazenada com hash)
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Papel do usuário no sistema
  role: {
    type: String,
    enum: ['user', 'admin', 'manager'],
    default: 'user'
  },
  
  // Status da conta
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Data de criação da conta
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // Data da última atualização
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Middleware para hash da senha antes de salvar
 */
userSchema.pre('save', async function(next) {
  // Só faz hash da senha se ela foi modificada ou é nova
  if (!this.isModified('password')) return next();
  
  try {
    // Gera um salt com fator 10
    const salt = await bcrypt.genSalt(10);
    
    // Gera o hash da senha com o salt
    this.password = await bcrypt.hash(this.password, salt);
    
    // Atualiza a data de atualização
    this.updatedAt = Date.now();
    
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Método para comparar senha fornecida com a senha armazenada
 * 
 * @param {String} candidatePassword - Senha fornecida para comparação
 * @returns {Promise<Boolean>} Resultado da comparação
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Método para gerar um objeto seguro do usuário (sem senha)
 * 
 * @returns {Object} Objeto com dados seguros do usuário
 */
userSchema.methods.toSafeObject = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Criação do modelo a partir do schema
const User = mongoose.model('User', userSchema);

module.exports = User;
