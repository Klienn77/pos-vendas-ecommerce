/**
 * Componente principal do Dashboard de Estatísticas
 * 
 * Este componente React implementa o dashboard de estatísticas para
 * visualização de dados de vendas, engajamento e comportamento do usuário.
 * 
 * @module frontend/dashboard/Dashboard
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [dateRange, setDateRange] = useState('30d');

  

const fetchDashboardData = useCallback(async () => {
  try {
    setLoading(true);
    const response = await axios.get('/api/stats/dashboard', {
      params: { period: dateRange }
    });
    setDashboardData(response.data.dashboardData);
    setError(null);
  } catch (err) {
    console.error('Erro ao buscar dados do dashboard:', err);
    setError('Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.');
  } finally {
    setLoading(false);
  }
}, [dateRange]); // agora a função é atualizada só quando dateRange mudar

useEffect(() => {
  fetchDashboardData();
}, [fetchDashboardData]); 



  const handlePeriodChange = (e) => {
    setDateRange(e.target.value);
  };

  const prepareSalesChartData = () => {
    if (!dashboardData?.dailySales) return null;
    const labels = dashboardData.dailySales.map((item) => item.date);
    const salesData = dashboardData.dailySales.map((item) => item.amount);
    return {
      labels,
      datasets: [
        {
          label: 'Vendas Diárias',
          data: salesData,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.3,
        },
      ],
    };
  };

  const prepareCategoryChartData = () => {
    if (!dashboardData?.salesByCategory) return null;
    const labels = dashboardData.salesByCategory.map((item) => item.category);
    const salesData = dashboardData.salesByCategory.map((item) => item.sales);
    const backgroundColors = [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
    ];
    return {
      labels,
      datasets: [
        {
          label: 'Vendas por Categoria',
          data: salesData,
          backgroundColor: backgroundColors,
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareDeviceChartData = () => {
    if (!dashboardData?.deviceUsage) return null;
    const labels = dashboardData.deviceUsage.map((item) => item.device);
    const data = dashboardData.deviceUsage.map((item) => item.percentage);
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 206, 86, 0.6)',
          ],
          borderColor: [
            'rgb(54, 162, 235)',
            'rgb(255, 99, 132)',
            'rgb(255, 206, 86)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false },
    },
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Carregando dados do dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Erro</h2>
        <p>{error}</p>
        <button onClick={fetchDashboardData}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard de Estatísticas</h1>
        <div className="period-selector">
          <label htmlFor="period">Período: </label>
          <select id="period" value={dateRange} onChange={handlePeriodChange}>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
        </div>
      </div>

      {dashboardData && (
        <>
          <div className="metrics-cards">
            <div className="metric-card">
              <h3>Receita Total</h3>
              <p className="metric-value">R$ {parseFloat(dashboardData.metrics.totalRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="metric-card">
              <h3>Valor Médio do Pedido</h3>
              <p className="metric-value">R$ {parseFloat(dashboardData.metrics.averageOrderValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="metric-card">
              <h3>Taxa de Devolução</h3>
              <p className="metric-value">{dashboardData.metrics.returnRate}%</p>
            </div>
            <div className="metric-card">
              <h3>Satisfação do Cliente</h3>
              <p className="metric-value">{dashboardData.metrics.customerSatisfaction}/5</p>
            </div>
          </div>

          <div className="chart-container">
            <h2>Vendas Diárias</h2>
            <div className="chart">
              {prepareSalesChartData() && <Line data={prepareSalesChartData()} options={chartOptions} height={300} />}
            </div>
          </div>

          <div className="charts-row">
            <div className="chart-container half-width">
              <h2>Vendas por Categoria</h2>
              <div className="chart">
                {prepareCategoryChartData() && <Bar data={prepareCategoryChartData()} options={chartOptions} height={300} />}
              </div>
            </div>

            <div className="chart-container half-width">
              <h2>Uso por Dispositivo</h2>
              <div className="chart">
                {prepareDeviceChartData() && <Pie data={prepareDeviceChartData()} options={chartOptions} height={300} />}
              </div>
            </div>
          </div>

          <div className="table-container">
            <h2>Personalizações Mais Populares</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Contagem</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.popularCustomizations.map((item, index) => (
                  <tr key={index}>
                    <td>{item.type}</td>
                    <td>{item.value}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;