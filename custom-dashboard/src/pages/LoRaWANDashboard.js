import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FiRadio,
  FiActivity,
  FiMapPin,
  FiWifi,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiBarChart,
  FiBattery,
  FiThermometer,
  FiDroplet,
  FiNavigation,
  FiRefreshCw,
  FiSettings,
  FiPlus,
  FiFilter,
  FiDownload,
  FiZap,
  FiClock,
  FiGlobe
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import lorawanService from '../services/lorawanService';

const Container = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #2C5282, #ED8936);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #2C5282, #3182CE);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(44, 82, 130, 0.3);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  
  .stat-icon {
    background: ${props => props.iconBg || 'linear-gradient(135deg, #2C5282, #3182CE)'};
    color: white;
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }
  
  .stat-value {
    font-size: 2.5rem;
    font-weight: bold;
    color: #2d3748;
    margin-bottom: 0.25rem;
  }
  
  .stat-label {
    color: #718096;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .stat-change {
    font-size: 0.8rem;
    font-weight: 500;
    color: ${props => props.changePositive ? '#10b981' : '#ef4444'};
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  
  h3 {
    margin: 0 0 1rem 0;
    color: #2d3748;
    font-size: 1.2rem;
    font-weight: 600;
  }
`;

const DeviceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const DeviceCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const DeviceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const DeviceName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  margin-bottom: 0.5rem;
`;

const DeviceStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  
  .status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.online ? '#10b981' : '#ef4444'};
  }
  
  .status-text {
    font-weight: 500;
    color: ${props => props.online ? '#10b981' : '#ef4444'};
  }
`;

const DeviceMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
`;

const DeviceMetric = styled.div`
  text-align: center;
  
  .metric-icon {
    color: #718096;
    margin-bottom: 0.25rem;
  }
  
  .metric-value {
    font-size: 1.1rem;
    font-weight: bold;
    color: #2d3748;
  }
  
  .metric-label {
    font-size: 0.8rem;
    color: #718096;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #2C5282;
  }
`;

const COLORS = ['#2C5282', '#3182CE', '#ED8936', '#10b981', '#ef4444', '#8b5cf6'];

const LoRaWANDashboard = () => {
  const [networkStats, setNetworkStats] = useState(null);
  const [devices, setDevices] = useState([]);
  const [gateways, setGateways] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeRange, selectedFilter]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load network statistics
      const stats = await lorawanService.getNetworkStats();
      setNetworkStats(stats);
      
      // Load devices (demo data)
      const deviceList = await generateDemoDevices();
      setDevices(deviceList);
      
      // Load gateways (demo data)
      const gatewayList = await generateDemoGateways();
      setGateways(gatewayList);
      
      // Load recent messages
      const messages = await lorawanService.getRecentMessages(null, 20);
      setRecentMessages(messages);
      
    } catch (error) {
      console.error('Failed to load LoRaWAN dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDemoDevices = async () => {
    const devices = [];
    const deviceTypes = ['Temperature Sensor', 'GPS Tracker', 'Soil Moisture', 'Air Quality', 'Water Level'];
    
    for (let i = 0; i < 12; i++) {
      const devEUI = `70b3d5499${Math.random().toString(16).substr(2, 7)}`;
      const status = await lorawanService.getDeviceStatus(devEUI);
      
      devices.push({
        ...status,
        type: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
        application: 'Choovio IoT Network',
        last_data: {
          temperature: 15 + Math.random() * 25,
          humidity: 30 + Math.random() * 50,
          pressure: 1000 + Math.random() * 50
        }
      });
    }
    
    return devices;
  };

  const generateDemoGateways = async () => {
    const gateways = [];
    
    for (let i = 0; i < 6; i++) {
      const gatewayId = `gw_${Math.random().toString(16).substr(2, 8)}`;
      const status = await lorawanService.getGatewayStatus(gatewayId);
      gateways.push(status);
    }
    
    return gateways;
  };

  // Generate chart data
  const generateSignalStrengthData = () => {
    const data = [];
    for (let i = 0; i < 24; i++) {
      data.push({
        hour: `${i}:00`,
        rssi: -60 - Math.random() * 30,
        snr: Math.random() * 15 - 5,
        devices: Math.floor(Math.random() * 20) + 80
      });
    }
    return data;
  };

  const generateTrafficData = () => {
    const data = [];
    for (let i = 0; i < 7; i++) {
      data.push({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        uplink: Math.floor(Math.random() * 5000) + 2000,
        downlink: Math.floor(Math.random() * 1000) + 200,
        confirmed: Math.floor(Math.random() * 500) + 100
      });
    }
    return data;
  };

  const sfDistributionData = networkStats && networkStats.spreading_factor_distribution 
    ? Object.entries(networkStats.spreading_factor_distribution).map(([sf, percentage]) => ({
        name: sf,
        value: percentage,
        count: Math.floor(percentage * networkStats.total_devices / 100)
      })) 
    : [
        { name: 'SF7', value: 30, count: 30 },
        { name: 'SF8', value: 25, count: 25 },
        { name: 'SF9', value: 20, count: 20 },
        { name: 'SF10', value: 15, count: 15 },
        { name: 'SF11', value: 7, count: 7 },
        { name: 'SF12', value: 3, count: 3 }
      ];

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <FiRefreshCw size={32} />
          <p style={{ marginTop: '1rem' }}>Loading LoRaWAN dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FiRadio size={40} />
          LoRaWAN Network Dashboard
        </Title>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <ActionButton>
            <FiSettings /> Gateway Config
          </ActionButton>
        </div>
      </Header>

      <FilterBar>
        <FiFilter size={20} />
        <FilterSelect 
          value={selectedTimeRange} 
          onChange={(e) => setSelectedTimeRange(e.target.value)}
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </FilterSelect>
        
        <FilterSelect 
          value={selectedFilter} 
          onChange={(e) => setSelectedFilter(e.target.value)}
        >
          <option value="all">All Devices</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
          <option value="low_battery">Low Battery</option>
        </FilterSelect>
        
        <ActionButton style={{ marginLeft: 'auto' }}>
          <FiDownload /> Export Report
        </ActionButton>
      </FilterBar>

      {networkStats && (
        <StatsGrid>
          <StatCard iconBg="linear-gradient(135deg, #10b981, #059669)">
            <div className="stat-icon">
              <FiRadio />
            </div>
            <div className="stat-value">{networkStats.total_devices}</div>
            <div className="stat-label">Total LoRaWAN Devices</div>
            <div className="stat-change">+12 this week</div>
          </StatCard>
          
          <StatCard iconBg="linear-gradient(135deg, #3b82f6, #2563eb)">
            <div className="stat-icon">
              <FiCheckCircle />
            </div>
            <div className="stat-value">{networkStats.active_devices}</div>
            <div className="stat-label">Active Devices</div>
            <div className="stat-change">
              {((networkStats.active_devices / networkStats.total_devices) * 100).toFixed(1)}% online
            </div>
          </StatCard>
          
          <StatCard iconBg="linear-gradient(135deg, #f59e0b, #d97706)">
            <div className="stat-icon">
              <FiWifi />
            </div>
            <div className="stat-value">{networkStats.active_gateways}</div>
            <div className="stat-label">Active Gateways</div>
            <div className="stat-change">
              {((networkStats.active_gateways / networkStats.total_gateways) * 100).toFixed(1)}% uptime
            </div>
          </StatCard>
          
          <StatCard iconBg="linear-gradient(135deg, #8b5cf6, #7c3aed)">
            <div className="stat-icon">
              <FiActivity />
            </div>
            <div className="stat-value">{networkStats.total_messages_today.toLocaleString()}</div>
            <div className="stat-label">Messages Today</div>
            <div className="stat-change">+15% vs yesterday</div>
          </StatCard>
          
          <StatCard iconBg="linear-gradient(135deg, #ef4444, #dc2626)">
            <div className="stat-icon">
              <FiBarChart />
            </div>
            <div className="stat-value">{networkStats.average_rssi} dBm</div>
            <div className="stat-label">Average RSSI</div>
            <div className="stat-change">SNR: {networkStats.average_snr} dB</div>
          </StatCard>
          
          <StatCard iconBg="linear-gradient(135deg, #06b6d4, #0891b2)">
            <div className="stat-icon">
              <FiTrendingUp />
            </div>
            <div className="stat-value">{networkStats.packet_loss_rate}%</div>
            <div className="stat-label">Packet Loss Rate</div>
            <div className="stat-change">
              {networkStats.network_uptime}% network uptime
            </div>
          </StatCard>
        </StatsGrid>
      )}

      <DashboardGrid>
        <ChartCard>
          <h3>📡 Signal Strength Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={generateSignalStrengthData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="rssi" stroke="#2C5282" fill="#2C5282" fillOpacity={0.3} name="RSSI (dBm)" />
              <Area type="monotone" dataKey="snr" stroke="#ED8936" fill="#ED8936" fillOpacity={0.3} name="SNR (dB)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <h3>📊 Spreading Factor Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sfDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sfDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <h3>📈 Network Traffic</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={generateTrafficData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="uplink" fill="#2C5282" name="Uplink Messages" />
              <Bar dataKey="downlink" fill="#ED8936" name="Downlink Messages" />
              <Bar dataKey="confirmed" fill="#10b981" name="Confirmed Messages" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <h3>🔋 Device Health Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={generateSignalStrengthData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="devices" stroke="#2C5282" strokeWidth={3} name="Active Devices" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </DashboardGrid>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#2d3748', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiRadio /> LoRaWAN Devices
        </h2>
        <DeviceGrid>
          {devices.map((device, index) => (
            <DeviceCard key={device.dev_eui}>
              <DeviceHeader>
                <div>
                  <DeviceName>{device.name}</DeviceName>
                  <div style={{ fontSize: '0.9rem', color: '#718096', fontFamily: 'monospace' }}>
                    DevEUI: {device.dev_eui}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.25rem' }}>
                    {device.type} • {device.application}
                  </div>
                </div>
              </DeviceHeader>

              <DeviceStatus online={device.status === 'active'}>
                <div className="status-indicator"></div>
                <span className="status-text">{device.status === 'active' ? 'Online' : 'Offline'}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#718096' }}>
                  Last seen: {new Date(device.last_seen).toLocaleString()}
                </span>
              </DeviceStatus>

              <DeviceMetrics>
                <DeviceMetric>
                  <div className="metric-icon">
                    <FiBattery size={16} />
                  </div>
                  <div className="metric-value">{device.battery_level}%</div>
                  <div className="metric-label">Battery</div>
                </DeviceMetric>
                
                <DeviceMetric>
                  <div className="metric-icon">
                    <FiBarChart size={16} />
                  </div>
                  <div className="metric-value">{device.signal_strength} dBm</div>
                  <div className="metric-label">RSSI</div>
                </DeviceMetric>
                
                <DeviceMetric>
                  <div className="metric-icon">
                    <FiZap size={16} />
                  </div>
                  <div className="metric-value">SF{device.spreading_factor}</div>
                  <div className="metric-label">Spreading</div>
                </DeviceMetric>
                
                <DeviceMetric>
                  <div className="metric-icon">
                    <FiThermometer size={16} />
                  </div>
                  <div className="metric-value">{device.last_data?.temperature?.toFixed(1)}°C</div>
                  <div className="metric-label">Temperature</div>
                </DeviceMetric>
                
                <DeviceMetric>
                  <div className="metric-icon">
                    <FiDroplet size={16} />
                  </div>
                  <div className="metric-value">{device.last_data?.humidity?.toFixed(0)}%</div>
                  <div className="metric-label">Humidity</div>
                </DeviceMetric>
                
                <DeviceMetric>
                  <div className="metric-icon">
                    <FiMapPin size={16} />
                  </div>
                  <div className="metric-value">{device.location?.latitude?.toFixed(3)}</div>
                  <div className="metric-label">Latitude</div>
                </DeviceMetric>
              </DeviceMetrics>
            </DeviceCard>
          ))}
        </DeviceGrid>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#2d3748', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiWifi /> LoRaWAN Gateways
        </h2>
        <DeviceGrid>
          {gateways.map((gateway, index) => (
            <DeviceCard key={gateway.gateway_id}>
              <DeviceHeader>
                <div>
                  <DeviceName>{gateway.name}</DeviceName>
                  <div style={{ fontSize: '0.9rem', color: '#718096', fontFamily: 'monospace' }}>
                    Gateway ID: {gateway.gateway_id}
                  </div>
                </div>
              </DeviceHeader>

              <DeviceStatus online={gateway.status === 'online'}>
                <div className="status-indicator"></div>
                <span className="status-text">{gateway.status === 'online' ? 'Online' : 'Offline'}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#718096' }}>
                  Last seen: {new Date(gateway.last_seen).toLocaleString()}
                </span>
              </DeviceStatus>

              <DeviceMetrics>
                <DeviceMetric>
                  <div className="metric-icon">
                    <FiActivity size={16} />
                  </div>
                  <div className="metric-value">{gateway.rx_packets_received}</div>
                  <div className="metric-label">RX Packets</div>
                </DeviceMetric>
                
                <DeviceMetric>
                  <div className="metric-icon">
                    <FiTrendingUp size={16} />
                  </div>
                  <div className="metric-value">{gateway.tx_packets_emitted}</div>
                  <div className="metric-label">TX Packets</div>
                </DeviceMetric>
                
                <DeviceMetric>
                  <div className="metric-icon">
                    <FiClock size={16} />
                  </div>
                  <div className="metric-value">{Math.floor(gateway.uptime / 3600)}h</div>
                  <div className="metric-label">Uptime</div>
                </DeviceMetric>
                
                <DeviceMetric>
                  <div className="metric-icon">
                    <FiZap size={16} />
                  </div>
                  <div className="metric-value">{gateway.cpu_usage?.toFixed(1)}%</div>
                  <div className="metric-label">CPU</div>
                </DeviceMetric>
                
                <DeviceMetric>
                  <div className="metric-icon">
                    <FiThermometer size={16} />
                  </div>
                  <div className="metric-value">{gateway.temperature?.toFixed(1)}°C</div>
                  <div className="metric-label">Temperature</div>
                </DeviceMetric>
                
                <DeviceMetric>
                  <div className="metric-icon">
                    <FiMapPin size={16} />
                  </div>
                  <div className="metric-value">{gateway.location?.latitude?.toFixed(3)}</div>
                  <div className="metric-label">Latitude</div>
                </DeviceMetric>
              </DeviceMetrics>
            </DeviceCard>
          ))}
        </DeviceGrid>
      </div>
    </Container>
  );
};

export default LoRaWANDashboard;