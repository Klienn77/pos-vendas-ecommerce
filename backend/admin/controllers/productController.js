/**
 * Controlador para gerenciamento de produtos
 * 
 * Este controlador fornece métodos para criar, listar, atualizar e excluir
 * produtos do e-commerce através do painel administrativo.
 * 
 * @module admin/controllers/productController
 */

const Product = require('../../models/productModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Configuração do Multer para upload de imagens
 */
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/products');
    
    // Cria o diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Gera um nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

/**
 * Filtro para permitir apenas imagens
 */
const fileFilter = (req, file, cb) => {
  // Aceita apenas imagens
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas'), false);
  }
};

/**
 * Configuração do upload
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5MB
  },
  fileFilter: fileFilter
});

/**
 * Objeto que contém os métodos do controlador de produtos
 */
const productController = {
  /**
   * Middleware para upload de imagens
   */
  uploadImages: upload.array('images', 5), // Máximo de 5 imagens por produto
  
  /**
   * Cria um novo produto
   * 
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com o produto criado ou mensagem de erro
   */
  createProduct: async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        category,
        subcategory,
        has3dModel,
        model3dUrl,
        customizationOptions,
        stock,
        isActive,
        isFeatured,
        tags
      } = req.body;
      
      // Verifica se os campos obrigatórios foram fornecidos
      if (!name || !description || !price || !category) {
        return res.status(400).json({
          success: false,
          message: 'Campos obrigatórios não fornecidos'
        });
      }
      
      // Processa as imagens enviadas
      const images = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          // Gera URL relativa para a imagem
          const imageUrl = `/uploads/products/${file.filename}`;
          images.push(imageUrl);
        });
      }
      
      // Processa as tags
      const processedTags = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : [];
      
      // Processa as opções de personalização
      let parsedCustomizationOptions = {};
      if (customizationOptions) {
        // Se for uma string JSON, converte para objeto
        if (typeof customizationOptions === 'string') {
          parsedCustomizationOptions = JSON.parse(customizationOptions);
        } else {
          parsedCustomizationOptions = customizationOptions;
        }
      }
      
      // Cria um novo produto
      const product = new Product({
        name,
        description,
        price: parseFloat(price),
        category,
        subcategory: subcategory || '',
        images,
        model3dUrl: model3dUrl || null,
        has3dModel: has3dModel === 'true' || has3dModel === true,
        customizationOptions: parsedCustomizationOptions,
        stock: parseInt(stock) || 0,
        isActive: isActive === 'true' || isActive === true,
        isFeatured: isFeatured === 'true' || isFeatured === true,
        tags: processedTags
      });
      
      // Salva o produto no banco de dados
      await product.save();
      
      // Retorna sucesso com o produto criado
      return res.status(201).json({
        success: true,
        message: 'Produto criado com sucesso',
        product
      });
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar produto',
        error: error.message
      });
    }
  },
  
  /**
   * Lista todos os produtos
   * 
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com a lista de produtos ou mensagem de erro
   */
  getAllProducts: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category, 
        search,
        sort = 'createdAt',
        order = 'desc'
      } = req.query;
      
      // Constrói o filtro
      const filter = {};
      if (category) filter.category = category;
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        filter.$or = [
          { name: searchRegex },
          { description: searchRegex },
          { tags: searchRegex }
        ];
      }
      
      // Constrói a ordenação
      const sortOption = {};
      sortOption[sort] = order === 'asc' ? 1 : -1;
      
      // Calcula o número de documentos a pular
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Busca os produtos com paginação
      const products = await Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit));
      
      // Conta o total de produtos que correspondem ao filtro
      const total = await Product.countDocuments(filter);
      
      // Calcula o total de páginas
      const totalPages = Math.ceil(total / parseInt(limit));
      
      // Retorna sucesso com a lista de produtos e informações de paginação
      return res.status(200).json({
        success: true,
        count: products.length,
        total,
        totalPages,
        currentPage: parseInt(page),
        products
      });
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao listar produtos',
        error: error.message
      });
    }
  },
  
  /**
   * Obtém um produto pelo ID
   * 
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com o produto encontrado ou mensagem de erro
   */
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Busca o produto pelo ID
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }
      
      // Retorna sucesso com o produto encontrado
      return res.status(200).json({
        success: true,
        product
      });
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar produto',
        error: error.message
      });
    }
  },
  
  /**
   * Atualiza um produto
   * 
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com o produto atualizado ou mensagem de erro
   */
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Busca o produto pelo ID
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }
      
      // Processa as imagens enviadas
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
        
        // Se updateData.keepImages for true, mantém as imagens existentes
        if (updateData.keepImages === 'true' || updateData.keepImages === true) {
          updateData.images = [...product.images, ...newImages];
        } else {
          updateData.images = newImages;
        }
      }
      
      // Processa as tags
      if (updateData.tags) {
        updateData.tags = Array.isArray(updateData.tags) 
          ? updateData.tags 
          : updateData.tags.split(',').map(tag => tag.trim());
      }
      
      // Processa as opções de personalização
      if (updateData.customizationOptions) {
        if (typeof updateData.customizationOptions === 'string') {
          updateData.customizationOptions = JSON.parse(updateData.customizationOptions);
        }
      }
      
      // Converte valores booleanos
      if (updateData.has3dModel !== undefined) {
        updateData.has3dModel = updateData.has3dModel === 'true' || updateData.has3dModel === true;
      }
      
      if (updateData.isActive !== undefined) {
        updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;
      }
      
      if (updateData.isFeatured !== undefined) {
        updateData.isFeatured = updateData.isFeatured === 'true' || updateData.isFeatured === true;
      }
      
      // Converte valores numéricos
      if (updateData.price !== undefined) {
        updateData.price = parseFloat(updateData.price);
      }
      
      if (updateData.stock !== undefined) {
        updateData.stock = parseInt(updateData.stock);
      }
      
      // Atualiza o produto
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      
      // Retorna sucesso com o produto atualizado
      return res.status(200).json({
        success: true,
        message: 'Produto atualizado com sucesso',
        product: updatedProduct
      });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar produto',
        error: error.message
      });
    }
  },
  
  /**
   * Exclui um produto
   * 
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com mensagem de sucesso ou erro
   */
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Busca o produto pelo ID
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }
      
      // Exclui o produto
      await Product.findByIdAndDelete(id);
      
      // Retorna sucesso
      return res.status(200).json({
        success: true,
        message: 'Produto excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao excluir produto',
        error: error.message
      });
    }
  },
  
  /**
   * Obtém estatísticas de produtos
   * 
   * @param {Object} req - Objeto de requisição Express
   * @param {Object} res - Objeto de resposta Express
   * @returns {Object} Resposta com estatísticas de produtos ou mensagem de erro
   */
  getProductStats: async (req, res) => {
    try {
      // Conta o total de produtos
      const totalProducts = await Product.countDocuments();
      
      // Conta produtos ativos
      const activeProducts = await Product.countDocuments({ isActive: true });
      
      // Conta produtos em destaque
      const featuredProducts = await Product.countDocuments({ isFeatured: true });
      
      // Conta produtos com modelo 3D
      const products3D = await Product.countDocuments({ has3dModel: true });
      
      // Conta produtos por categoria
      const categoryCounts = await Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      // Calcula o estoque total
      const stockResult = await Product.aggregate([
        { $group: { _id: null, totalStock: { $sum: '$stock' } } }
      ]);
      const totalStock = stockResult.length > 0 ? stockResult[0].totalStock : 0;
      
      // Retorna sucesso com as estatísticas
      return res.status(200).json({
        success: true,
        stats: {
          totalProducts,
          activeProducts,
          featuredProducts,
          products3D,
          categoryCounts,
          totalStock
        }
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas de produtos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas de produtos',
        error: error.message
      });
    }
  }
};

module.exports = productController;
