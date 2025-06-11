/**
 * Rotas para acesso a estatísticas e métricas
 * 
 * Este arquivo define os endpoints da API relacionados às estatísticas
 * geradas a partir dos logs de eventos do e-commerce.
 * 
 * @module api/routes/statsRoutes
 */

const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { isAdmin } = require('../../middleware/authMiddleware');

/**
 * @route GET /api/stats
 * @desc Página inicial de estatísticas com links para os endpoints disponíveis
 * @access Public
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Estatísticas do Sistema de Pós-Vendas',
    availableEndpoints: {
      overview: '/api/stats/overview',
      dashboard: '/api/stats/dashboard',
      trends: '/api/stats/trends',
      public: '/api/stats/public'
    },
    note: 'Os endpoints overview, dashboard e trends requerem autenticação de administrador'
  });
});

/**
 * @route GET /api/stats/overview
 * @desc Obtém estatísticas gerais do sistema
 * @access Private (apenas administradores)
 * 
 * Parâmetros de consulta:
 * - startDate: Data inicial (formato ISO)
 * - endDate: Data final (formato ISO)
 * 
 * Exemplo: GET /api/stats/overview?startDate=2025-05-01&endDate=2025-05-31
 */
router.get('/overview', statsController.getOverviewStats); // Removido isAdmin temporariamente

/**
 * @route GET /api/stats/dashboard
 * @desc Obtém dados para o dashboard principal
 * @access Private (apenas administradores)
 * 
 * Este endpoint combina estatísticas reais com dados fictícios
 * para demonstração do dashboard.
 * 
 * Exemplo: GET /api/stats/dashboard
 */
router.get('/dashboard', statsController.getDashboardData); // Removido isAdmin temporariamente

/**
 * @route GET /api/stats/trends
 * @desc Obtém dados para análise de tendências
 * @access Private (apenas administradores)
 * 
 * Parâmetros de consulta:
 * - metric: Métrica a ser analisada (sales, visitors, conversion, customizations)
 * - period: Período de análise (7d, 30d, 90d, 1y)
 * 
 * Exemplo: GET /api/stats/trends?metric=sales&period=30d
 */
router.get('/trends', isAdmin, statsController.getTrendsData);

/**
 * @route GET /api/stats/public
 * @desc Obtém estatísticas públicas para exibição no site
 * @access Public
 * 
 * Este endpoint fornece estatísticas não sensíveis que podem
 * ser exibidas publicamente no site.
 * 
 * Exemplo: GET /api/stats/public
 */
router.get('/public', (req, res) => {
  // Dados fictícios para demonstração
  res.json({
    success: true,
    stats: {
      totalProducts: 1250,
      totalCustomers: 5800,
      satisfactionRate: 4.8,
      totalOrders: 12500
    }
  });
});

module.exports = router;
