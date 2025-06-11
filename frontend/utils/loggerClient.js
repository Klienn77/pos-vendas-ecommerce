/**
 * Utilitário para integração de logs no e-commerce
 * 
 * Este módulo fornece funções para registrar eventos e logs
 * do e-commerce, facilitando a análise de comportamento do usuário.
 * 
 * @module utils/loggerClient
 */

/**
 * Cliente de logging para o e-commerce
 * 
 * Esta classe fornece métodos para registrar diferentes tipos de eventos
 * que ocorrem durante a navegação e uso do e-commerce.
 */
class LoggerClient {
  /**
   * Cria uma instância do cliente de logging
   * 
   * @param {Object} options - Opções de configuração
   * @param {String} options.apiUrl - URL base da API de logs
   * @param {Boolean} options.debug - Ativa o modo de depuração
   * @param {Function} options.errorHandler - Função para tratamento de erros
   */
  constructor(options = {}) {
    // URL base da API de logs a partir das variáveis de ambiente
    const baseApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    this.apiUrl = options.apiUrl || `${baseApiUrl}/api/logs`;
    
    // Modo de depuração
    this.debug = options.debug || false;
    
    // Função para tratamento de erros
    this.errorHandler = options.errorHandler || console.error;
    
    // Informações da sessão
    this.sessionId = this._generateSessionId();
    
    // Informações do usuário
    this.userId = null;
    
    // Fila de eventos para envio em lote
    this.eventQueue = [];
    
    // Intervalo para envio automático de eventos (em ms)
    this.flushInterval = options.flushInterval || 10000; // 10 segundos
    
    // Inicia o envio automático de eventos
    this._startAutoFlush();
    
    // Log de inicialização
    if (this.debug) {
      console.log('LoggerClient inicializado', {
        sessionId: this.sessionId,
        apiUrl: this.apiUrl
      });
    }
  }
  
  /**
   * Gera um ID de sessão único
   * 
   * @returns {String} ID de sessão
   * @private
   */
  _generateSessionId() {
    return 'sess_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Inicia o envio automático de eventos em intervalos regulares
   * 
   * @private
   */
  _startAutoFlush() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
    
    // Também envia eventos quando o usuário sai da página
    window.addEventListener('beforeunload', () => {
      this.flush(true);
    });
  }
  
  /**
   * Define o ID do usuário atual
   * 
   * @param {String} userId - ID do usuário
   */
  setUserId(userId) {
    this.userId = userId;
    
    if (this.debug) {
      console.log('ID do usuário definido:', userId);
    }
  }
  
  /**
   * Registra um evento genérico
   * 
   * @param {String} eventType - Tipo do evento
   * @param {Object} data - Dados adicionais do evento
   * @param {String} severity - Severidade do evento (info, warning, error)
   */
  logEvent(eventType, data = {}, severity = 'info') {
    // Cria o objeto de evento
    const event = {
      eventType,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: new Date().toISOString(),
      severity,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    // Adiciona à fila de eventos
    this.eventQueue.push(event);
    
    if (this.debug) {
      console.log('Evento registrado:', event);
    }
    
    // Se for um erro, envia imediatamente
    if (severity === 'error') {
      this.flush();
    }
  }
  
  /**
   * Registra visualização de página
   * 
   * @param {String} pageTitle - Título da página
   * @param {Object} additionalData - Dados adicionais
   */
  logPageView(pageTitle, additionalData = {}) {
    this.logEvent('page_view', {
      pageTitle,
      ...additionalData
    });
  }
  
  /**
   * Registra visualização de produto
   * 
   * @param {String} productId - ID do produto
   * @param {String} productName - Nome do produto
   * @param {Object} additionalData - Dados adicionais
   */
  logProductView(productId, productName, additionalData = {}) {
    this.logEvent('product_view', {
      productId,
      productName,
      ...additionalData
    });
  }
  
  /**
   * Registra adição de produto ao carrinho
   * 
   * @param {String} productId - ID do produto
   * @param {String} productName - Nome do produto
   * @param {Number} quantity - Quantidade
   * @param {Number} price - Preço
   * @param {Object} additionalData - Dados adicionais
   */
  logAddToCart(productId, productName, quantity, price, additionalData = {}) {
    this.logEvent('add_to_cart', {
      productId,
      productName,
      quantity,
      price,
      ...additionalData
    });
  }
  
  /**
   * Registra remoção de produto do carrinho
   * 
   * @param {String} productId - ID do produto
   * @param {String} productName - Nome do produto
   * @param {Number} quantity - Quantidade
   * @param {Object} additionalData - Dados adicionais
   */
  logRemoveFromCart(productId, productName, quantity, additionalData = {}) {
    this.logEvent('remove_from_cart', {
      productId,
      productName,
      quantity,
      ...additionalData
    });
  }
  
  /**
   * Registra início de checkout
   * 
   * @param {Array} items - Itens no carrinho
   * @param {Number} total - Valor total
   * @param {Object} additionalData - Dados adicionais
   */
  logCheckout(items, total, additionalData = {}) {
    this.logEvent('checkout', {
      items,
      total,
      ...additionalData
    });
  }
  
  /**
   * Registra compra finalizada
   * 
   * @param {String} orderId - ID do pedido
   * @param {Array} items - Itens comprados
   * @param {Number} total - Valor total
   * @param {Object} additionalData - Dados adicionais
   */
  logPurchase(orderId, items, total, additionalData = {}) {
    this.logEvent('purchase', {
      orderId,
      items,
      total,
      ...additionalData
    });
  }
  
  /**
   * Registra personalização de produto
   * 
   * @param {String} productId - ID do produto
   * @param {String} productName - Nome do produto
   * @param {Object} customizations - Personalizações aplicadas
   * @param {Object} additionalData - Dados adicionais
   */
  logCustomization(productId, productName, customizations, additionalData = {}) {
    this.logEvent('customization', {
      productId,
      productName,
      customizations,
      ...additionalData
    });
  }
  
  /**
   * Registra erro na aplicação
   * 
   * @param {String} errorMessage - Mensagem de erro
   * @param {Object} errorDetails - Detalhes do erro
   */
  logError(errorMessage, errorDetails = {}) {
    this.logEvent('error', {
      message: errorMessage,
      ...errorDetails
    }, 'error');
  }
  
  /**
   * Envia os eventos da fila para o servidor
   * 
   * @param {Boolean} sync - Se verdadeiro, usa requisição síncrona (para beforeunload)
   * @returns {Promise} Promessa resolvida quando os eventos são enviados
   */
  async flush(sync = false) {
    // Se não há eventos na fila, não faz nada
    if (this.eventQueue.length === 0) {
      return Promise.resolve();
    }
    
    // Copia os eventos da fila
    const events = [...this.eventQueue];
    
    // Limpa a fila
    this.eventQueue = [];
    
    try {
      // Configuração da requisição
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events })
      };
      
      // Se for síncrono (para beforeunload)
      if (sync && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify({ events })], {
          type: 'application/json'
        });
        return navigator.sendBeacon(this.apiUrl + '/batch', blob);
      }
      
      // Envia os eventos para o servidor
      const response = await fetch(this.apiUrl + '/batch', requestOptions);
      
      // Verifica se a requisição foi bem-sucedida
      if (!response.ok) {
        throw new Error(`Erro ao enviar eventos: ${response.status}`);
      }
      
      if (this.debug) {
        console.log(`${events.length} eventos enviados com sucesso`);
      }
      
      return response.json();
    } catch (error) {
      // Em caso de erro, coloca os eventos de volta na fila
      this.eventQueue = [...events, ...this.eventQueue];
      
      // Chama o manipulador de erros
      this.errorHandler('Erro ao enviar eventos:', error);
      
      return Promise.reject(error);
    }
  }
}

// Exporta o cliente de logging
export default LoggerClient;

/**
 * Exemplo de uso:
 * 
 * // Importa o cliente de logging
 * import LoggerClient from './utils/loggerClient';
 * 
 * // Cria uma instância
 * const logger = new LoggerClient({
 *   apiUrl: 'https://seu-ecommerce.com/api/logs',
 *   debug: true
 * });
 * 
 * // Define o ID do usuário quando ele fizer login
 * logger.setUserId('user_123');
 * 
 * // Registra visualização de página
 * logger.logPageView('Página Inicial');
 * 
 * // Registra visualização de produto
 * logger.logProductView('prod_456', 'Tênis Esportivo');
 * 
 * // Registra adição ao carrinho
 * logger.logAddToCart('prod_456', 'Tênis Esportivo', 1, 199.90);
 * 
 * // Registra personalização
 * logger.logCustomization('prod_456', 'Tênis Esportivo', {
 *   color: 'Azul',
 *   size: '42',
 *   material: 'Couro'
 * });
 * 
 * // Registra erro
 * try {
 *   // Alguma operação que pode falhar
 * } catch (error) {
 *   logger.logError('Falha ao processar operação', {
 *     errorName: error.name,
 *     errorStack: error.stack
 *   });
 * }
 */
