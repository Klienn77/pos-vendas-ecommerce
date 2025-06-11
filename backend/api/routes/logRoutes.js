/**
 * Rotas para registro e consulta de logs de eventos
 * 
 * Este arquivo define os endpoints da API relacionados ao sistema de logs,
 * permitindo registrar eventos de interação do usuário e consultar estatísticas.
 * 
 * @module api/routes/logRoutes
 */

const express = require('express');
const router = express.Router();
const logController = require('../../logs/logController');

/**
 * @route POST /api/logs/event
 * @desc Registra um novo evento de interação do usuário
 * @access Public
 * 
 * Exemplo de uso no frontend:
 * 
 * fetch('/api/logs/event', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     eventType: 'product_view',
 *     sessionId: 'abc123',
 *     eventData: {
 *       productId: '123',
 *       productName: 'Tênis Esportivo',
 *       category: 'calçados'
 *     }
 *   })
 * });
 */
router.post('/event', logController.logEvent);

/**
 * @route GET /api/logs/events/:type
 * @desc Obtém eventos por tipo em um período específico
 * @access Private (apenas administradores)
 * 
 * Parâmetros de consulta:
 * - startDate: Data inicial (formato ISO)
 * - endDate: Data final (formato ISO)
 * - limit: Número máximo de resultados (padrão: 100)
 * 
 * Exemplo: GET /api/logs/events/product_view?startDate=2025-05-01&endDate=2025-05-31&limit=50
 */
router.get('/events/:type', logController.getEventsByType);

/**
 * @route GET /api/logs/counts
 * @desc Obtém contagem de eventos agrupados por tipo
 * @access Private (apenas administradores)
 * 
 * Parâmetros de consulta:
 * - startDate: Data inicial (formato ISO)
 * - endDate: Data final (formato ISO)
 * 
 * Exemplo: GET /api/logs/counts?startDate=2025-05-01&endDate=2025-05-31
 */
router.get('/counts', logController.getEventCounts);

/**
 * @route GET /api/logs/most-viewed
 * @desc Obtém os produtos mais visualizados
 * @access Private (apenas administradores)
 * 
 * Parâmetros de consulta:
 * - limit: Número máximo de resultados (padrão: 10)
 * - startDate: Data inicial (formato ISO)
 * - endDate: Data final (formato ISO)
 * 
 * Exemplo: GET /api/logs/most-viewed?limit=5&startDate=2025-05-01&endDate=2025-05-31
 */
router.get('/most-viewed', logController.getMostViewedProducts);

/**
 * @route GET /api/logs/funnel
 * @desc Obtém dados para análise de funil de conversão
 * @access Private (apenas administradores)
 * 
 * Parâmetros de consulta:
 * - startDate: Data inicial (formato ISO)
 * - endDate: Data final (formato ISO)
 * 
 * Exemplo: GET /api/logs/funnel?startDate=2025-05-01&endDate=2025-05-31
 */
router.get('/funnel', logController.getFunnelData);

module.exports = router;
