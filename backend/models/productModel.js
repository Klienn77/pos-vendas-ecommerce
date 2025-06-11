/**
 * Modelo para produtos do e-commerce
 * 
 * Este modelo define a estrutura dos produtos que serão gerenciados
 * pelo painel administrativo e exibidos no e-commerce.
 * 
 * @module models/productModel
 */

const mongoose = require('mongoose');

/**
 * Schema para produtos do e-commerce
 */
const productSchema = new mongoose.Schema({
  // Nome do produto
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Descrição detalhada do produto
  description: {
    type: String,
    required: true
  },
  
  // Preço base do produto
  price: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Categoria do produto
  category: {
    type: String,
    required: true,
    index: true // Indexado para consultas por categoria
  },
  
  // Subcategoria do produto
  subcategory: {
    type: String,
    default: ''
  },
  
  // URLs das imagens do produto
  images: [{
    type: String
  }],
  
  // URL do modelo 3D (se disponível)
  model3dUrl: {
    type: String,
    default: null
  },
  
  // Indica se o produto possui modelo 3D
  has3dModel: {
    type: Boolean,
    default: false
  },
  
  // Opções de personalização disponíveis
  customizationOptions: {
    // Cores disponíveis
    colors: [{
      name: String,
      hexCode: String,
      additionalPrice: {
        type: Number,
        default: 0
      }
    }],
    
    // Materiais disponíveis
    materials: [{
      name: String,
      additionalPrice: {
        type: Number,
        default: 0
      }
    }],
    
    // Componentes personalizáveis
    components: [{
      name: String,
      options: [{
        name: String,
        additionalPrice: {
          type: Number,
          default: 0
        }
      }]
    }]
  },
  
  // Quantidade em estoque
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  
  // Indica se o produto está ativo (visível na loja)
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Indica se o produto está em destaque
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Tags para busca e filtragem
  tags: [{
    type: String
  }],
  
  // Avaliações do produto
  ratings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Média das avaliações
  averageRating: {
    type: Number,
    default: 0
  },
  
  // Data de criação do produto
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
 * Middleware para atualizar a data de atualização antes de salvar
 */
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Middleware para calcular a média das avaliações antes de salvar
 */
productSchema.pre('save', function(next) {
  if (this.ratings && this.ratings.length > 0) {
    const sum = this.ratings.reduce((total, rating) => total + rating.rating, 0);
    this.averageRating = parseFloat((sum / this.ratings.length).toFixed(1));
  } else {
    this.averageRating = 0;
  }
  next();
});

/**
 * Métodos estáticos para consultas comuns
 */
productSchema.statics = {
  /**
   * Encontra produtos por categoria
   * 
   * @param {String} category - Categoria a ser buscada
   * @param {Object} options - Opções de consulta (limit, skip, sort)
   * @returns {Promise<Array>} Lista de produtos encontrados
   */
  findByCategory: function(category, options = {}) {
    return this.find({ category, isActive: true })
      .limit(options.limit || 20)
      .skip(options.skip || 0)
      .sort(options.sort || { createdAt: -1 });
  },
  
  /**
   * Encontra produtos em destaque
   * 
   * @param {Number} limit - Número máximo de resultados
   * @returns {Promise<Array>} Lista de produtos em destaque
   */
  findFeatured: function(limit = 10) {
    return this.find({ isFeatured: true, isActive: true })
      .limit(limit)
      .sort({ createdAt: -1 });
  },
  
  /**
   * Busca produtos por termo de pesquisa
   * 
   * @param {String} query - Termo de pesquisa
   * @param {Object} options - Opções de consulta (limit, skip)
   * @returns {Promise<Array>} Lista de produtos encontrados
   */
  search: function(query, options = {}) {
    const searchRegex = new RegExp(query, 'i');
    
    return this.find({
      isActive: true,
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { subcategory: searchRegex },
        { tags: searchRegex }
      ]
    })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
  },
  
  /**
   * Encontra produtos relacionados
   * 
   * @param {String} productId - ID do produto de referência
   * @param {Number} limit - Número máximo de resultados
   * @returns {Promise<Array>} Lista de produtos relacionados
   */
  findRelated: async function(productId, limit = 5) {
    // Busca o produto de referência
    const product = await this.findById(productId);
    if (!product) return [];
    
    // Busca produtos da mesma categoria
    return this.find({
      _id: { $ne: productId }, // Exclui o próprio produto
      category: product.category,
      isActive: true
    })
    .limit(limit);
  }
};

// Criação do modelo a partir do schema
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
