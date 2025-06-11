/**
 * Rotas principais do painel administrativo
 * 
 * Este arquivo define os endpoints principais da API do painel administrativo,
 * integrando as rotas de usuários, produtos e outras funcionalidades.
 * 
 * @module admin/routes/adminRoutes
 */

const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const { isAdmin } = require('../../middleware/authMiddleware');

// Rota raiz do painel administrativo
router.get('/', isAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'API do Painel Administrativo',
    version: '1.0.0',
    endpoints: [
      '/api/admin/users',
      '/api/admin/products',
      '/api/admin/dashboard',
      '/api/admin/orders'
    ]
  });
});

// Integração das rotas de usuários
router.use('/users', userRoutes);

// Integração das rotas de produtos
router.use('/products', productRoutes);

// Rota para obter dados do dashboard administrativo
router.get('/dashboard', isAdmin, (req, res) => {
  // Dados fictícios para demonstração
  res.json({
    success: true,
    dashboardData: {
      summary: {
        totalSales: 15780.50,
        totalOrders: 127,
        averageOrderValue: 124.25,
        conversionRate: 3.2
      },
      recentOrders: [
        { id: 'ORD-001', customer: 'João Silva', total: 245.90, status: 'Entregue', date: '2025-05-30' },
        { id: 'ORD-002', customer: 'Maria Oliveira', total: 189.50, status: 'Em processamento', date: '2025-05-31' },
        { id: 'ORD-003', customer: 'Pedro Santos', total: 312.75, status: 'Enviado', date: '2025-06-01' }
      ],
      topProducts: [
        { id: 'PROD-001', name: 'Tênis Esportivo', sales: 42, revenue: 4200.00 },
        { id: 'PROD-002', name: 'Camiseta Casual', sales: 38, revenue: 1520.00 },
        { id: 'PROD-003', name: 'Relógio Inteligente', sales: 25, revenue: 3750.00 }
      ],
      lowStock: [
        { id: 'PROD-004', name: 'Boné Esportivo', stock: 3 },
        { id: 'PROD-005', name: 'Mochila Aventura', stock: 2 },
        { id: 'PROD-006', name: 'Tênis Casual', stock: 5 }
      ]
    }
  });
});

// Rota para obter dados de pedidos (fictícios para demonstração)
router.get('/orders', isAdmin, (req, res) => {
  res.json({
    success: true,
    orders: [
      {
        id: 'ORD-001',
        customer: {
          id: 'USR-001',
          name: 'João Silva',
          email: 'joao@exemplo.com'
        },
        items: [
          { productId: 'PROD-001', name: 'Tênis Esportivo', quantity: 1, price: 199.90 },
          { productId: 'PROD-003', name: 'Meias Esportivas', quantity: 2, price: 29.90 }
        ],
        total: 259.70,
        status: 'Entregue',
        paymentMethod: 'Cartão de Crédito',
        shippingAddress: 'Rua Exemplo, 123 - São Paulo, SP',
        createdAt: '2025-05-30T14:30:00Z',
        updatedAt: '2025-05-31T10:15:00Z'
      },
      {
        id: 'ORD-002',
        customer: {
          id: 'USR-002',
          name: 'Maria Oliveira',
          email: 'maria@exemplo.com'
        },
        items: [
          { productId: 'PROD-002', name: 'Camiseta Casual', quantity: 3, price: 49.90 },
          { productId: 'PROD-004', name: 'Boné Esportivo', quantity: 1, price: 39.90 }
        ],
        total: 189.60,
        status: 'Em processamento',
        paymentMethod: 'Boleto Bancário',
        shippingAddress: 'Av. Exemplo, 456 - Rio de Janeiro, RJ',
        createdAt: '2025-05-31T09:45:00Z',
        updatedAt: '2025-05-31T09:45:00Z'
      }
    ],
    pagination: {
      total: 127,
      page: 1,
      limit: 10,
      totalPages: 13
    }
  });
});

module.exports = router;
