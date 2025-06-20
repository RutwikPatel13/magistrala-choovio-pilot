import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { FiDownload, FiCalendar, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const AnalyticsContainer = styled.div`
  padding: 0;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h1 {
    color: white;
    font-size: 2rem;
  }
  
  .header-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
`;

const TimeRangeSelect = styled.select`
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  outline: none;
  
  &:focus {
    background: white;
  }
`;

const ExportButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: white;
    transform: translateY(-2px);
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  
  .metric-header {
    display: flex;
    justify-content: between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
  
  .metric-title {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.5rem;
  }
  
  .metric-value {
    font-size: 2rem;
    font-weight: bold;
    color: ${props => props.theme.text};
    margin-bottom: 0.5rem;
  }
  
  .metric-change {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.8rem;
    
    &.positive {
      color: #27ae60;
    }
    
    &.negative {
      color: #e74c3c;
    }
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  
  h3 {
    margin-bottom: 1rem;
    color: ${props => props.theme.text};
  }
`;

const FullWidthChart = styled(ChartCard)`
  grid-column: 1 / -1;
`;

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [analyticsData, setAnalyticsData] = useState({
    metrics: {
      totalMessages: 125847,
      messageChange: 12.5,
      avgThroughput: 87.3,
      throughputChange: -2.1,
      errorRate: 0.8,
      errorChange: -15.3,
      responseTime: 145,
      responseChange: 8.7
    },
    timeSeriesData: [],
    deviceTypeData: [],
    protocolData: []
  });

  useEffect(() => {
    const generateTimeSeriesData = (hours) => {
      const data = [];
      for (let i = 0; i < hours; i++) {
        data.push({
          time: `${i}:00`,
          messages: Math.floor(Math.random() * 2000) + 1000,
          errors: Math.floor(Math.random() * 50) + 10,
          responseTime: Math.floor(Math.random() * 100) + 100
        });
      }
      return data;
    };

    const deviceTypes = [
      { name: 'Sensors', value: 45, color: '#3498db' },
      { name: 'Actuators', value: 25, color: '#2ecc71' },
      { name: 'Gateways', value: 20, color: '#e74c3c' },
      { name: 'Controllers', value: 10, color: '#f39c12' }
    ];

    const protocols = [
      { name: 'MQTT', messages: 45000, color: '#667eea' },
      { name: 'HTTP', messages: 32000, color: '#764ba2' },
      { name: 'CoAP', messages: 18000, color: '#f093fb' },
      { name: 'WebSocket', messages: 12000, color: '#4facfe' }
    ];

    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
    
    setAnalyticsData(prev => ({
      ...prev,
      timeSeriesData: generateTimeSeriesData(hours),
      deviceTypeData: deviceTypes,
      protocolData: protocols
    }));
  }, [timeRange]);

  const handleExport = () => {
    const csvData = analyticsData.timeSeriesData.map(item => 
      `${item.time},${item.messages},${item.errors},${item.responseTime}`
    ).join('\n');
    
    const blob = new Blob([`Time,Messages,Errors,Response Time\n${csvData}`], 
      { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}.csv`;
    a.click();
  };

  const COLORS = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12'];

  return (
    <AnalyticsContainer>
      <PageHeader>
        <h1>Analytics & Insights</h1>
        <div className="header-controls">
          <TimeRangeSelect 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </TimeRangeSelect>
          <ExportButton onClick={handleExport}>
            <FiDownload size={16} />
            Export Data
          </ExportButton>
        </div>
      </PageHeader>

      <MetricsGrid>
        <MetricCard>
          <div className="metric-title">Total Messages</div>
          <div className="metric-value">{analyticsData.metrics.totalMessages.toLocaleString()}</div>
          <div className={`metric-change ${analyticsData.metrics.messageChange > 0 ? 'positive' : 'negative'}`}>
            {analyticsData.metrics.messageChange > 0 ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
            {Math.abs(analyticsData.metrics.messageChange)}% vs last period
          </div>
        </MetricCard>

        <MetricCard>
          <div className="metric-title">Avg Throughput (msg/s)</div>
          <div className="metric-value">{analyticsData.metrics.avgThroughput}</div>
          <div className={`metric-change ${analyticsData.metrics.throughputChange > 0 ? 'positive' : 'negative'}`}>
            {analyticsData.metrics.throughputChange > 0 ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
            {Math.abs(analyticsData.metrics.throughputChange)}% vs last period
          </div>
        </MetricCard>

        <MetricCard>
          <div className="metric-title">Error Rate (%)</div>
          <div className="metric-value">{analyticsData.metrics.errorRate}</div>
          <div className={`metric-change ${analyticsData.metrics.errorChange > 0 ? 'negative' : 'positive'}`}>
            {analyticsData.metrics.errorChange > 0 ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
            {Math.abs(analyticsData.metrics.errorChange)}% vs last period
          </div>
        </MetricCard>

        <MetricCard>
          <div className="metric-title">Avg Response Time (ms)</div>
          <div className="metric-value">{analyticsData.metrics.responseTime}</div>
          <div className={`metric-change ${analyticsData.metrics.responseChange > 0 ? 'negative' : 'positive'}`}>
            {analyticsData.metrics.responseChange > 0 ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
            {Math.abs(analyticsData.metrics.responseChange)}% vs last period
          </div>
        </MetricCard>
      </MetricsGrid>

      <FullWidthChart>
        <h3>Message Volume & Performance Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={analyticsData.timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" stroke="#666" />
            <YAxis yAxisId="left" stroke="#666" />
            <YAxis yAxisId="right" orientation="right" stroke="#666" />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="messages" 
              stroke="#667eea" 
              strokeWidth={3}
              name="Messages"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="responseTime" 
              stroke="#e74c3c" 
              strokeWidth={2}
              name="Response Time (ms)"
            />
          </LineChart>
        </ResponsiveContainer>
      </FullWidthChart>

      <ChartsGrid>
        <ChartCard>
          <h3>Protocol Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.protocolData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Bar dataKey="messages" fill="#667eea" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <h3>Device Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.deviceTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.deviceTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>
    </AnalyticsContainer>
  );
};

export default Analytics;