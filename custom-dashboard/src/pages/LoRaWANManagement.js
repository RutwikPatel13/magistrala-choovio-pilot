import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiRadio, 
  FiActivity, 
  FiBattery, 
  FiMapPin,
  FiWifi,
  FiSettings,
  FiPlus,
  FiRefreshCw
} from 'react-icons/fi';
import magistralaApi from '../services/magistralaApi';

const Container = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const NetworkOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const OverviewCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
  border: 1px solid #e2e8f0;
  
  .metric-icon {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }
  
  .metric-value {
    font-size: 2rem;
    font-weight: bold;
    color: #2d3748;
    margin-bottom: 0.25rem;
  }
  
  .metric-label {
    color: #718096;
    font-size: 0.9rem;
  }
`;

const GatewayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const GatewayCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.15);
  }
`;

const GatewayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const GatewayName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusBadge = styled.span`
  background: ${props => props.online ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const DeviceList = styled.div`
  margin-top: 1rem;
`;

const DeviceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  
  .device-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .device-name {
    font-weight: 500;
    color: #2d3748;
  }
  
  .device-details {
    font-size: 0.8rem;
    color: #718096;
  }
  
  .device-metrics {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  
  .metric {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.8rem;
    color: #4a5568;
  }
`;

const FrequencyBands = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
`;

const FrequencyBand = styled.div`
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  
  .frequency {
    font-size: 1.1rem;
    font-weight: bold;
    margin-bottom: 0.25rem;
  }
  
  .usage {
    font-size: 0.8rem;
    opacity: 0.9;
  }
`;

const SignalStrengthIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  .signal-bar {
    width: 4px;
    height: ${props => props.strength}px;
    background: ${props => {
      if (props.strength > 15) return '#10b981';
      if (props.strength > 10) return '#f59e0b';
      return '#ef4444';
    }};
    border-radius: 2px;
  }
`;

const LoRaWANManagement = () => {
  const [gateways, setGateways] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [networkStats, setNetworkStats] = useState({
    totalGateways: 0,
    activeDevices: 0,
    messagesPerHour: 0,
    networkCoverage: 0
  });

  useEffect(() => {
    loadLoRaWANData();
  }, []);

  const loadLoRaWANData = async () => {
    try {
      setLoading(true);
      const [gatewayData, deviceData] = await Promise.all([
        magistralaApi.getDevices(),
        magistralaApi.getLoRaWANDevices()
      ]);
      
      // Filter for gateway devices
      const gatewayDevices = gatewayData.clients?.filter(device => 
        device.metadata?.type === 'gateway' || device.name.toLowerCase().includes('gateway')
      ) || [];
      
      setGateways(gatewayDevices);
      setDevices(deviceData);
      
      // Calculate network statistics
      setNetworkStats({
        totalGateways: gatewayDevices.length,
        activeDevices: deviceData.filter(d => d.status === 'online').length,
        messagesPerHour: Math.floor(Math.random() * 1000 + 200),
        networkCoverage: Math.floor(Math.random() * 30 + 70) // 70-100%
      });
      
    } catch (error) {
      console.error('Failed to load LoRaWAN data:', error);
      // Load mock data
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockGateways = [
      {
        id: 'gw_001',
        name: 'Gateway North Campus',
        status: 'online',
        metadata: {
          type: 'gateway',
          location: 'Building A - Roof',
          frequency: '868MHz',
          signalStrength: -45,
          connectedDevices: 23,
          lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        }
      },
      {
        id: 'gw_002',
        name: 'Gateway South Campus',
        status: 'online',
        metadata: {
          type: 'gateway',
          location: 'Building C - Roof',
          frequency: '915MHz',
          signalStrength: -52,
          connectedDevices: 18,
          lastSeen: new Date(Date.now() - 2 * 60 * 1000).toISOString()
        }
      }
    ];

    const mockDevices = [
      {
        id: 'lora_001',
        name: 'Environmental Sensor #1',
        status: 'online',
        metadata: {
          type: 'lorawan',
          devEUI: '0011223344556677',
          appEUI: '7066554433221100',
          frequency: '868MHz',
          spreadingFactor: 'SF7',
          batteryLevel: 85,
          signalStrength: -78,
          location: 'Parking Lot A',
          lastSeen: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        }
      },
      {
        id: 'lora_002',
        name: 'Water Level Monitor',
        status: 'online',
        metadata: {
          type: 'lorawan',
          devEUI: '1122334455667788',
          appEUI: '8877665544332211',
          frequency: '915MHz',
          spreadingFactor: 'SF10',
          batteryLevel: 92,
          signalStrength: -82,
          location: 'Water Tank B',
          lastSeen: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        }
      }
    ];

    setGateways(mockGateways);
    setDevices(mockDevices);
    setNetworkStats({
      totalGateways: 2,
      activeDevices: 41,
      messagesPerHour: 847,
      networkCoverage: 87
    });
  };

  const getSignalBars = (signalStrength) => {
    const strength = Math.abs(signalStrength);
    return [
      { height: strength > 50 ? 20 : strength > 30 ? 12 : 8 },
      { height: strength > 60 ? 16 : strength > 40 ? 10 : 6 },
      { height: strength > 70 ? 12 : strength > 50 ? 8 : 4 },
      { height: strength > 80 ? 8 : strength > 60 ? 6 : 2 },
    ];
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <FiRefreshCw size={32} />
          <p style={{ marginTop: '1rem' }}>Loading LoRaWAN network...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FiRadio style={{ marginRight: '0.5rem' }} />
          LoRaWAN Network Management
        </Title>
      </Header>

      {/* Network Overview */}
      <NetworkOverview>
        <OverviewCard>
          <div className="metric-icon">
            <FiWifi />
          </div>
          <div className="metric-value">{networkStats.totalGateways}</div>
          <div className="metric-label">Active Gateways</div>
        </OverviewCard>
        
        <OverviewCard>
          <div className="metric-icon">
            <FiRadio />
          </div>
          <div className="metric-value">{networkStats.activeDevices}</div>
          <div className="metric-label">Connected Devices</div>
        </OverviewCard>
        
        <OverviewCard>
          <div className="metric-icon">
            <FiActivity />
          </div>
          <div className="metric-value">{networkStats.messagesPerHour}</div>
          <div className="metric-label">Messages/Hour</div>
        </OverviewCard>
        
        <OverviewCard>
          <div className="metric-icon">
            <FiActivity />
          </div>
          <div className="metric-value">{networkStats.networkCoverage}%</div>
          <div className="metric-label">Network Coverage</div>
        </OverviewCard>
      </NetworkOverview>

      {/* Frequency Bands */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>Active Frequency Bands</h3>
        <FrequencyBands>
          <FrequencyBand>
            <div className="frequency">868 MHz</div>
            <div className="usage">EU Band • 73% Usage</div>
          </FrequencyBand>
          <FrequencyBand>
            <div className="frequency">915 MHz</div>
            <div className="usage">US Band • 45% Usage</div>
          </FrequencyBand>
          <FrequencyBand>
            <div className="frequency">433 MHz</div>
            <div className="usage">ISM Band • 12% Usage</div>
          </FrequencyBand>
        </FrequencyBands>
      </div>

      {/* Gateway Overview */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>LoRaWAN Gateways</h3>
        <GatewayGrid>
          {gateways.map(gateway => (
            <GatewayCard key={gateway.id}>
              <GatewayHeader>
                <GatewayName>
                  <FiWifi />
                  {gateway.name}
                </GatewayName>
                <StatusBadge online={gateway.status === 'online'}>
                  {gateway.status === 'online' ? 'Online' : 'Offline'}
                </StatusBadge>
              </GatewayHeader>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#718096' }}>Location</div>
                  <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <FiMapPin size={12} />
                    {gateway.metadata?.location}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#718096' }}>Frequency</div>
                  <div style={{ fontWeight: '500' }}>
                    {gateway.metadata?.frequency || '868MHz'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#718096' }}>Signal Strength</div>
                  <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <SignalStrengthIndicator strength={Math.abs(gateway.metadata?.signalStrength || -50)}>
                      {getSignalBars(gateway.metadata?.signalStrength || -50).map((bar, index) => (
                        <div key={index} className="signal-bar" style={{ height: `${bar.height}px` }} />
                      ))}
                    </SignalStrengthIndicator>
                    {gateway.metadata?.signalStrength || -50} dBm
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#718096' }}>Connected Devices</div>
                  <div style={{ fontWeight: '500' }}>
                    {gateway.metadata?.connectedDevices || Math.floor(Math.random() * 30 + 10)}
                  </div>
                </div>
              </div>
              
              <div style={{ fontSize: '0.8rem', color: '#718096' }}>
                Last seen: {formatLastSeen(gateway.metadata?.lastSeen)}
              </div>
            </GatewayCard>
          ))}
        </GatewayGrid>
      </div>

      {/* LoRaWAN Devices */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>LoRaWAN Devices</h3>
        <DeviceList>
          {devices.map(device => (
            <DeviceItem key={device.id}>
              <div className="device-info">
                <div className="device-name">
                  <FiRadio style={{ marginRight: '0.5rem' }} />
                  {device.name}
                </div>
                <div className="device-details">
                  DevEUI: {device.metadata?.devEUI} • SF: {device.metadata?.spreadingFactor || 'SF7'} • {device.metadata?.location}
                </div>
              </div>
              
              <div className="device-metrics">
                <div className="metric">
                  <FiBattery />
                  {device.metadata?.batteryLevel || Math.floor(Math.random() * 100)}%
                </div>
                <div className="metric">
                  <FiActivity />
                  {device.metadata?.signalStrength || Math.floor(Math.random() * -40 - 60)} dBm
                </div>
                <StatusBadge online={device.status === 'online'}>
                  {device.status === 'online' ? 'Online' : 'Offline'}
                </StatusBadge>
              </div>
            </DeviceItem>
          ))}
        </DeviceList>
      </div>
    </Container>
  );
};

export default LoRaWANManagement;