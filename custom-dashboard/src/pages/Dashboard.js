import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { 
  FiActivity, 
  FiLayers, 
  FiWifi, 
  FiDatabase,
  FiTrendingUp,
  FiAlertTriangle
} from 'react-icons/fi';

const DashboardContainer = styled.div`
  padding: 0;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    color: white;
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
  }
  
  .stat-number {
    font-size: 2rem;
    font-weight: bold;
    color: ${props => props.theme.text};
    margin-bottom: 0.5rem;
  }
  
  .stat-label {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .stat-change {
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 4px;
    
    &.positive {
      color: #27ae60;
    }
    
    &.negative {
      color: #e74c3c;
    }
  }
`;

const ChartSection = styled.div`
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

const RecentActivity = styled.div`
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

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  .activity-icon {
    width: 35px;
    height: 35px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: white;
  }
  
  .activity-content {
    flex: 1;
    
    .activity-title {
      font-weight: 500;
      margin-bottom: 2px;
    }
    
    .activity-time {
      font-size: 0.8rem;
      color: #666;
    }
  }
`;

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      activeDevices: 1247,
      totalChannels: 89,
      messagesProcessed: 45623,
      dataVolume: 2.4
    },
    chartData: [],
    recentActivity: []
  });

  useEffect(() => {
    const generateChartData = () => {
      const data = [];
      for (let i = 0; i < 24; i++) {
        data.push({
          time: `${i}:00`,
          messages: Math.floor(Math.random() * 1000) + 500,
          devices: Math.floor(Math.random() * 50) + 200,
          throughput: Math.floor(Math.random() * 100) + 50
        });
      }
      return data;
    };

    const activity = [
      {
        id: 1,
        title: 'New device connected',
        time: '2 minutes ago',
        type: 'device',
        icon: 'device'
      },
      {
        id: 2,
        title: 'Channel threshold exceeded',
        time: '15 minutes ago',
        type: 'alert',
        icon: 'alert'
      },
      {
        id: 3,
        title: 'Data export completed',
        time: '1 hour ago',
        type: 'data',
        icon: 'data'
      },
      {
        id: 4,
        title: 'System backup finished',
        time: '3 hours ago',
        type: 'system',
        icon: 'system'
      }
    ];

    setDashboardData(prev => ({
      ...prev,
      chartData: generateChartData(),
      recentActivity: activity
    }));
  }, []);

  const getActivityIcon = (type) => {
    const iconProps = { size: 16 };
    switch (type) {
      case 'device': return <FiLayers {...iconProps} />;
      case 'alert': return <FiAlertTriangle {...iconProps} />;
      case 'data': return <FiDatabase {...iconProps} />;
      default: return <FiActivity {...iconProps} />;
    }
  };

  const getActivityIconBg = (type) => {
    switch (type) {
      case 'device': return '#3498db';
      case 'alert': return '#e74c3c';
      case 'data': return '#2ecc71';
      default: return '#9b59b6';
    }
  };

  return (
    <DashboardContainer>
      <PageHeader>
        <h1>IoT Dashboard</h1>
        <p>Monitor your connected devices and data streams in real-time</p>
      </PageHeader>

      <StatsGrid>
        <StatCard>
          <div className="stat-header">
            <div>
              <div className="stat-number">{dashboardData.stats.activeDevices.toLocaleString()}</div>
              <div className="stat-label">Active Devices</div>
              <div className="stat-change positive">
                <FiTrendingUp size={12} />
                +12% from last month
              </div>
            </div>
            <div className="stat-icon" style={{ background: 'linear-gradient(45deg, #3498db, #2980b9)' }}>
              <FiLayers />
            </div>
          </div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div>
              <div className="stat-number">{dashboardData.stats.totalChannels}</div>
              <div className="stat-label">Active Channels</div>
              <div className="stat-change positive">
                <FiTrendingUp size={12} />
                +5% from last week
              </div>
            </div>
            <div className="stat-icon" style={{ background: 'linear-gradient(45deg, #2ecc71, #27ae60)' }}>
              <FiWifi />
            </div>
          </div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div>
              <div className="stat-number">{dashboardData.stats.messagesProcessed.toLocaleString()}</div>
              <div className="stat-label">Messages Today</div>
              <div className="stat-change positive">
                <FiTrendingUp size={12} />
                +8% from yesterday
              </div>
            </div>
            <div className="stat-icon" style={{ background: 'linear-gradient(45deg, #e74c3c, #c0392b)' }}>
              <FiActivity />
            </div>
          </div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div>
              <div className="stat-number">{dashboardData.stats.dataVolume} GB</div>
              <div className="stat-label">Data Volume</div>
              <div className="stat-change positive">
                <FiTrendingUp size={12} />
                +15% from last week
              </div>
            </div>
            <div className="stat-icon" style={{ background: 'linear-gradient(45deg, #9b59b6, #8e44ad)' }}>
              <FiDatabase />
            </div>
          </div>
        </StatCard>
      </StatsGrid>

      <ChartSection>
        <ChartCard>
          <h3>Message Throughput (24h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboardData.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="messages" 
                stroke="#667eea" 
                fill="url(#colorGradient)" 
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <RecentActivity>
          <h3>Recent Activity</h3>
          {dashboardData.recentActivity.map((activity) => (
            <ActivityItem key={activity.id}>
              <div 
                className="activity-icon" 
                style={{ background: getActivityIconBg(activity.type) }}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="activity-content">
                <div className="activity-title">{activity.title}</div>
                <div className="activity-time">{activity.time}</div>
              </div>
            </ActivityItem>
          ))}
        </RecentActivity>
      </ChartSection>
    </DashboardContainer>
  );
};

export default Dashboard;