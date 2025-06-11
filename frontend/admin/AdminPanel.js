/**
 * Componente principal do Painel Administrativo
 * 
 * Este componente React implementa o painel administrativo para
 * gerenciamento de produtos, pedidos e visualização de estatísticas.
 * 
 * @module frontend/admin/AdminPanel
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Link, Redirect } from 'react-router-dom';
import axios from 'axios';

// Componentes do painel administrativo
import Dashboard from './Dashboard';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import OrderList from './OrderList';
import OrderDetail from './OrderDetail';
import Login from './Login';

/**
 * Painel Administrativo
 * 
 * @returns {JSX.Element} Componente React
 */
const AdminPanel = () => {
  // Estado para controle de autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  /**
   * Verifica se o usuário está autenticado
   */
  const checkAuth = async () => {
    try {
      // Obtém o token do localStorage
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }
      
      // Configura o cabeçalho de autorização
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Faz a requisição para obter o perfil do usuário
      const response = await axios.get('/api/admin/users/profile');
      
      // Atualiza o estado com os dados do usuário
      setIsAuthenticated(true);
      setUser(response.data.user);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      
      // Remove o token inválido
      localStorage.removeItem('adminToken');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Realiza o login do usuário
   * 
   * @param {String} email - Email do usuário
   * @param {String} password - Senha do usuário
   * @returns {Promise<Object>} Resultado do login
   */
  const login = async (email, password) => {
    try {
      // Faz a requisição de login
      const response = await axios.post('/api/admin/users/login', {
        email,
        password
      });
      
      // Armazena o token no localStorage
      localStorage.setItem('adminToken', response.data.token);
      
      // Configura o cabeçalho de autorização
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      // Atualiza o estado
      setIsAuthenticated(true);
      setUser(response.data.user);
      
      return {
        success: true,
        message: 'Login realizado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer login'
      };
    }
  };
  
  /**
   * Realiza o logout do usuário
   */
  const logout = () => {
    // Remove o token do localStorage
    localStorage.removeItem('adminToken');
    
    // Remove o cabeçalho de autorização
    delete axios.defaults.headers.common['Authorization'];
    
    // Atualiza o estado
    setIsAuthenticated(false);
    setUser(null);
  };
  
  // Efeito para verificar autenticação quando o componente é montado
  useEffect(() => {
    checkAuth();
  }, []);
  
  // Renderiza um indicador de carregamento
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Carregando painel administrativo...</p>
      </div>
    );
  }
  
  // Renderiza o painel administrativo
  return (
    <Router>
      <div className="admin-panel">
        {isAuthenticated ? (
          <div className="admin-container">
            {/* Barra lateral */}
            <div className="admin-sidebar">
              <div className="admin-logo">
                <h2>E-commerce Admin</h2>
              </div>
              
              <div className="admin-user">
                <div className="user-avatar">
                  {user.name.charAt(0)}
                </div>
                <div className="user-info">
                  <p className="user-name">{user.name}</p>
                  <p className="user-role">{user.role}</p>
                </div>
              </div>
              
              <nav className="admin-nav">
                <ul>
                  <li>
                    <Link to="/admin/dashboard">
                      <i className="icon-dashboard"></i>
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/products">
                      <i className="icon-products"></i>
                      Produtos
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/orders">
                      <i className="icon-orders"></i>
                      Pedidos
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/stats">
                      <i className="icon-stats"></i>
                      Estatísticas
                    </Link>
                  </li>
                </ul>
              </nav>
              
              <div className="admin-logout">
                <button onClick={logout}>
                  <i className="icon-logout"></i>
                  Sair
                </button>
              </div>
            </div>
            
            {/* Conteúdo principal */}
            <div className="admin-content">
              <Switch>
                <Route path="/admin/dashboard" component={Dashboard} />
                <Route exact path="/admin/products" component={ProductList} />
                <Route path="/admin/products/new" component={() => <ProductForm isNew={true} />} />
                <Route path="/admin/products/edit/:id" component={() => <ProductForm isNew={false} />} />
                <Route exact path="/admin/orders" component={OrderList} />
                <Route path="/admin/orders/:id" component={OrderDetail} />
                <Route path="/admin/stats" component={() => <h2>Estatísticas em desenvolvimento</h2>} />
                <Redirect from="/admin" to="/admin/dashboard" />
              </Switch>
            </div>
          </div>
        ) : (
          <Switch>
            <Route path="/admin/login" render={() => <Login onLogin={login} />} />
            <Redirect to="/admin/login" />
          </Switch>
        )}
      </div>
    </Router>
  );
};

export default AdminPanel;
