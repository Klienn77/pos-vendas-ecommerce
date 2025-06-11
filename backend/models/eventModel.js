/**
 * Modelo para eventos de log
 * 
 * Este modelo define a estrutura dos eventos de interação do usuário
 * que serão armazenados no MongoDB para análise posterior.
 * 
 * @module models/eventModel
 */

const mongoose = require('mongoose');

/**
 * Schema para eventos de interação do usuário
 * 
 * Cada evento representa uma ação do usuário no e-commerce, como
 * visualizar um produto, personalizar um item, adicionar ao carrinho, etc.
 */
const eventSchema = new mongoose.Schema({
  // Tipo do evento (ex: product_view, product_customize, cart_add)
  eventType: {
    type: String,
    required: true,
    index: true // Indexado para consultas mais rápidas por tipo de evento
  },
  
  // ID do usuário que realizou a ação (pode ser anônimo)
  userId: {
    type: String,
    required: true,
    index: true // Indexado para consultas por usuário
  },
  
  // Indica se o usuário está autenticado ou é anônimo
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  
  // ID da sessão para rastrear usuários anônimos
  sessionId: {
    type: String,
    required: true
  },
  
  // Dados específicos do evento (varia conforme o tipo)
  // Armazenado como objeto flexível para acomodar diferentes tipos de eventos
  eventData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Informações do dispositivo e navegador
  userAgent: {
    type: String
  },
  
  // Endereço IP (armazenado de forma segura)
  ipAddress: {
    type: String
  },
  
  // URL onde o evento ocorreu
  pageUrl: {
    type: String
  },
  
  // Referência (de onde o usuário veio)
  referrer: {
    type: String
  },
  
  // Data e hora do evento
  timestamp: {
    type: Date,
    default: Date.now,
    index: true // Indexado para consultas por período
  }
});

/**
 * Métodos estáticos para consultas comuns
 */
eventSchema.statics = {
  /**
   * Encontra eventos por tipo em um período específico
   * 
   * @param {String} eventType - Tipo do evento a ser buscado
   * @param {Date} startDate - Data inicial do período
   * @param {Date} endDate - Data final do período
   * @returns {Promise<Array>} Lista de eventos encontrados
   */
  findByTypeAndPeriod: function(eventType, startDate, endDate) {
    return this.find({
      eventType,
      timestamp: {
        $gte: startDate,
        $lte: endDate || new Date()
      }
    }).sort({ timestamp: -1 });
  },
  
  /**
   * Conta eventos agrupados por tipo em um período
   * 
   * @param {Date} startDate - Data inicial do período
   * @param {Date} endDate - Data final do período
   * @returns {Promise<Array>} Contagem de eventos por tipo
   */
  countByType: function(startDate, endDate) {
    return this.aggregate([
      {
        $match: {
          timestamp: {
            $gte: startDate,
            $lte: endDate || new Date()
          }
        }
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
  },
  
  /**
   * Encontra os produtos mais visualizados
   * 
   * @param {Number} limit - Número máximo de resultados
   * @param {Date} startDate - Data inicial do período
   * @param {Date} endDate - Data final do período
   * @returns {Promise<Array>} Lista dos produtos mais visualizados
   */
  findMostViewedProducts: function(limit = 10, startDate, endDate) {
    return this.aggregate([
      {
        $match: {
          eventType: 'product_view',
          timestamp: {
            $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás por padrão
            $lte: endDate || new Date()
          }
        }
      },
      {
        $group: {
          _id: '$eventData.productId',
          productName: { $first: '$eventData.productName' },
          views: { $sum: 1 }
        }
      },
      {
        $sort: { views: -1 }
      },
      {
        $limit: limit
      }
    ]);
  }
};

// Criação do modelo a partir do schema
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
