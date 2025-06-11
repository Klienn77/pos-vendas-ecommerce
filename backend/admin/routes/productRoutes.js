/**
 * Rotas para gerenciamento de produtos
 * 
 * Este arquivo define os endpoints da API relacionados ao gerenciamento
 * de produtos do e-commerce através do painel administrativo.
 * 
 * @module admin/routes/productRoutes
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAdmin } = require('../../middleware/authMiddleware');

/**
 * @route POST /api/admin/products
 * @desc Cria um novo produto
 * @access Private (apenas administradores)
 * 
 * Esta rota utiliza o middleware de upload de imagens do Multer.
 * O corpo da requisição deve ser enviado como form-data para permitir o upload de arquivos.
 * 
 * Campos do form-data:
 * - name: Nome do produto
 * - description: Descrição detalhada do produto
 * - price: Preço base do produto
 * - category: Categoria do produto
 * - subcategory: Subcategoria do produto (opcional)
 * - images: Arquivos de imagem do produto (máximo 5)
 * - has3dModel: Indica se o produto possui modelo 3D (true/false)
 * - model3dUrl: URL do modelo 3D (opcional)
 * - customizationOptions: Opções de personalização em formato JSON (opcional)
 * - stock: Quantidade em estoque
 * - isActive: Indica se o produto está ativo (true/false)
 * - isFeatured: Indica se o produto está em destaque (true/false)
 * - tags: Tags para busca e filtragem (string separada por vírgulas)
 */
router.post('/', isAdmin, productController.uploadImages, productController.createProduct);

/**
 * @route GET /api/admin/products
 * @desc Lista todos os produtos com filtros e paginação
 * @access Private (apenas administradores)
 * 
 * Parâmetros de consulta:
 * - page: Número da página (padrão: 1)
 * - limit: Número de produtos por página (padrão: 10)
 * - category: Filtro por categoria (opcional)
 * - search: Termo de busca (opcional)
 * - sort: Campo para ordenação (padrão: createdAt)
 * - order: Direção da ordenação (asc/desc, padrão: desc)
 * 
 * Exemplo: GET /api/admin/products?page=2&limit=20&category=Calçados&sort=price&order=asc
 */
router.get('/', isAdmin, productController.getAllProducts);

/**
 * @route GET /api/admin/products/stats
 * @desc Obtém estatísticas de produtos
 * @access Private (apenas administradores)
 * 
 * Retorna estatísticas como:
 * - Total de produtos
 * - Produtos ativos
 * - Produtos em destaque
 * - Produtos com modelo 3D
 * - Contagem por categoria
 * - Estoque total
 */
router.get('/stats', isAdmin, productController.getProductStats);

/**
 * @route GET /api/admin/products/:id
 * @desc Obtém um produto pelo ID
 * @access Private (apenas administradores)
 */
router.get('/:id', isAdmin, productController.getProductById);

/**
 * @route PUT /api/admin/products/:id
 * @desc Atualiza um produto
 * @access Private (apenas administradores)
 * 
 * Esta rota utiliza o middleware de upload de imagens do Multer.
 * O corpo da requisição deve ser enviado como form-data para permitir o upload de arquivos.
 * 
 * Campos do form-data (todos opcionais):
 * - name: Nome do produto
 * - description: Descrição detalhada do produto
 * - price: Preço base do produto
 * - category: Categoria do produto
 * - subcategory: Subcategoria do produto
 * - images: Arquivos de imagem do produto (máximo 5)
 * - keepImages: Indica se deve manter as imagens existentes (true/false)
 * - has3dModel: Indica se o produto possui modelo 3D (true/false)
 * - model3dUrl: URL do modelo 3D
 * - customizationOptions: Opções de personalização em formato JSON
 * - stock: Quantidade em estoque
 * - isActive: Indica se o produto está ativo (true/false)
 * - isFeatured: Indica se o produto está em destaque (true/false)
 * - tags: Tags para busca e filtragem (string separada por vírgulas)
 */
router.put('/:id', isAdmin, productController.uploadImages, productController.updateProduct);

/**
 * @route DELETE /api/admin/products/:id
 * @desc Exclui um produto
 * @access Private (apenas administradores)
 */
router.delete('/:id', isAdmin, productController.deleteProduct);

module.exports = router;
