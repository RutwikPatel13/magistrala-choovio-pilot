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
  FiRefreshCw,
  FiCpu,
  FiBarChart,
  FiGlobe,
  FiEdit,
  FiTrash2,
  FiEye,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiMap,
  FiDatabase,
  FiZap
} from 'react-icons/fi';
import magistralaApi from '../services/magistralaApi';
import dualWriteService from '../services/dualWriteService';
import LoRaWANService from '../services/lorawanService';

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
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.primary ? 
    'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 
    'white'};
  color: ${props => props.primary ? 'white' : '#4a5568'};
  border: ${props => props.primary ? 'none' : '1px solid #e2e8f0'};
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
`;

const Tab = styled.button`
  padding: 1rem 2rem;
  background: ${props => props.active ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  border: none;
  border-radius: 8px 8px 0 0;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : '#f7fafc'};
  }
`;

const NetworkOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const OverviewCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.color || 'linear-gradient(135deg, #8b5cf6, #7c3aed)'};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #4a5568;
  margin: 0;
`;

const CardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.color || 'linear-gradient(135deg, #8b5cf6, #7c3aed)'};
  color: white;
`;

const CardValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 0.5rem;
`;

const CardSubtext = styled.div`
  font-size: 0.875rem;
  color: #718096;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ContentArea = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
  border: 1px solid #e2e8f0;
`;

const DeviceTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DeviceCard = styled.div`
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
    transform: translateY(-1px);
  }
`;

const DeviceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const DeviceName = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DeviceStatus = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => {
    switch(props.status) {
      case 'online': return '#48bb78';
      case 'idle': return '#ed8936';
      case 'offline': return '#e53e3e';
      default: return '#718096';
    }
  }};
  color: white;
`;

const DeviceDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const DeviceMetric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const MetricLabel = styled.span`
  font-size: 0.8rem;
  color: #718096;
  font-weight: 500;
`;

const MetricValue = styled.span`
  font-size: 0.9rem;
  color: #2d3748;
  font-weight: 600;
`;

const DeviceActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
`;

const ActionIcon = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f7fafc;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
    color: #2d3748;
  }
`;

const NetworkMap = styled.div`
  height: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  margin: 1rem 0;
`;

const ConfigSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const ConfigCard = styled.div`
  background: #f7fafc;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
`;

const ConfigTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ConfigOption = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`;

const ConfigLabel = styled.span`
  font-weight: 500;
  color: #4a5568;
`;

const ConfigValue = styled.span`
  color: #2d3748;
  font-family: monospace;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #8b5cf6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #718096;
  
  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  .title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .description {
    margin-bottom: 2rem;
  }
`;

const LoRaWANManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [networkStats, setNetworkStats] = useState({});
  const [devices, setDevices] = useState([]);
  const [gateways, setGateways] = useState([]);
  const [configuration, setConfiguration] = useState({});
  const [lorawanService, setLorawanService] = useState(null);

  useEffect(() => {
    initializeLoRaWANService();
  }, []);

  useEffect(() => {
    if (lorawanService) {
      loadLoRaWANData();
    }
  }, [lorawanService, activeTab]);

  const initializeLoRaWANService = () => {
    try {
      console.log('🔄 Initializing LoRaWAN Service with dual-write support...');
      const service = new LoRaWANService(dualWriteService);
      setLorawanService(service);
      console.log('✅ LoRaWAN Service initialized with dual-write support');
    } catch (error) {
      console.error('❌ Failed to initialize LoRaWAN Service:', error);
    }
  };

  const loadLoRaWANData = async () => {
    if (!lorawanService) return;
    
    setLoading(true);
    try {
      console.log('🔍 Loading LoRaWAN data...');
      
      switch (activeTab) {
        case 'overview':
          const [stats, deviceList, gatewayList] = await Promise.all([
            lorawanService.getLoRaWANNetworkStats(),
            lorawanService.getLoRaWANDevices(0, 10),
            lorawanService.getLoRaWANGateways()
          ]);
          setNetworkStats(stats);
          setDevices(deviceList.devices || []);
          setGateways(gatewayList || []);
          break;
          
        case 'devices':
          const fullDeviceList = await lorawanService.getLoRaWANDevices(0, 100);
          setDevices(fullDeviceList.devices || []);
          break;
          
        case 'gateways':
          const fullGatewayList = await lorawanService.getLoRaWANGateways();
          setGateways(fullGatewayList || []);
          break;
          
        case 'configuration':
          const config = await lorawanService.getLoRaWANConfiguration();
          setConfiguration(config);
          break;
      }
      
      console.log('✅ LoRaWAN data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading LoRaWAN data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadLoRaWANData();
  };

  const handleAddDevice = () => {
    // TODO: Open add device modal
    console.log('Add LoRaWAN device clicked');
  };

  const handleAddGateway = () => {
    // TODO: Open add gateway modal
    console.log('Add LoRaWAN gateway clicked');
  };

  const renderOverview = () => (
    <>
      <NetworkOverview>
        <OverviewCard color="linear-gradient(135deg, #48bb78, #38a169)">
          <CardHeader>
            <CardTitle>Total Devices</CardTitle>
            <CardIcon color="linear-gradient(135deg, #48bb78, #38a169)">
              <FiRadio size={20} />
            </CardIcon>
          </CardHeader>
          <CardValue>{networkStats.totalDevices || 0}</CardValue>
          <CardSubtext>
            <FiCheckCircle size={14} />
            {networkStats.activeDevices || 0} active
          </CardSubtext>
        </OverviewCard>

        <OverviewCard color="linear-gradient(135deg, #667eea, #764ba2)">
          <CardHeader>
            <CardTitle>Network Gateways</CardTitle>
            <CardIcon color="linear-gradient(135deg, #667eea, #764ba2)">
              <FiWifi size={20} />
            </CardIcon>
          </CardHeader>
          <CardValue>{networkStats.totalGateways || 0}</CardValue>
          <CardSubtext>
            <FiActivity size={14} />
            {networkStats.activeGateways || 0} online
          </CardSubtext>
        </OverviewCard>

        <OverviewCard color="linear-gradient(135deg, #ed8936, #dd6b20)">
          <CardHeader>
            <CardTitle>Network Coverage</CardTitle>
            <CardIcon color="linear-gradient(135deg, #ed8936, #dd6b20)">
              <FiGlobe size={20} />
            </CardIcon>
          </CardHeader>
          <CardValue>{Math.round(networkStats.networkCoverage || 0)}%</CardValue>
          <CardSubtext>
            <FiMapPin size={14} />
            Regional coverage
          </CardSubtext>
        </OverviewCard>

        <OverviewCard color="linear-gradient(135deg, #8b5cf6, #7c3aed)">
          <CardHeader>
            <CardTitle>Total Messages</CardTitle>
            <CardIcon>
              <FiBarChart size={20} />
            </CardIcon>
          </CardHeader>
          <CardValue>{networkStats.totalMessages || 0}</CardValue>
          <CardSubtext>
            <FiClock size={14} />
            Last 24 hours
          </CardSubtext>
        </OverviewCard>
      </NetworkOverview>

      <ContentArea>
        <CardTitle style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>
          <FiMap style={{ marginRight: '0.5rem' }} />
          Network Topology
        </CardTitle>
        <NetworkMap>
          <div>
            <FiMapPin size={24} style={{ marginRight: '0.5rem' }} />
            Interactive LoRaWAN Network Map
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
              Gateways: {gateways.length} | Coverage: {Math.round(networkStats.networkCoverage || 0)}%
            </div>
          </div>
        </NetworkMap>
      </ContentArea>
    </>
  );

  const renderDevices = () => (
    <ContentArea>
      <CardHeader style={{ marginBottom: '1.5rem' }}>
        <CardTitle style={{ fontSize: '1.2rem' }}>
          <FiRadio style={{ marginRight: '0.5rem' }} />
          LoRaWAN Devices ({devices.length})
        </CardTitle>
      </CardHeader>

      {devices.length === 0 ? (
        <EmptyState>
          <div className="icon">
            <FiRadio />
          </div>
          <div className="title">No LoRaWAN Devices Found</div>
          <div className="description">
            Add your first LoRaWAN device to start monitoring your network
          </div>
        </EmptyState>
      ) : (
        <DeviceTable>
          {devices.map((device) => (
            <DeviceCard key={device.id}>
              <DeviceHeader>
                <DeviceName>
                  <FiRadio size={18} />
                  {device.name}
                </DeviceName>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <DeviceStatus status={device.status}>
                    {device.status === 'online' && <FiCheckCircle size={12} />}
                    {device.status === 'idle' && <FiClock size={12} />}
                    {device.status === 'offline' && <FiAlertTriangle size={12} />}
                    {device.status}
                  </DeviceStatus>
                  <DeviceActions>
                    <ActionIcon>
                      <FiEye size={14} />
                    </ActionIcon>
                    <ActionIcon>
                      <FiEdit size={14} />
                    </ActionIcon>
                    <ActionIcon>
                      <FiTrash2 size={14} />
                    </ActionIcon>
                  </DeviceActions>
                </div>
              </DeviceHeader>
              
              <DeviceDetails>
                <DeviceMetric>
                  <MetricLabel>Device EUI</MetricLabel>
                  <MetricValue>{device.devEUI || 'Not configured'}</MetricValue>
                </DeviceMetric>
                <DeviceMetric>
                  <MetricLabel>Region</MetricLabel>
                  <MetricValue>{device.region}</MetricValue>
                </DeviceMetric>
                <DeviceMetric>
                  <MetricLabel>Class</MetricLabel>
                  <MetricValue>Class {device.deviceClass}</MetricValue>
                </DeviceMetric>
                <DeviceMetric>
                  <MetricLabel>Data Rate</MetricLabel>
                  <MetricValue>{device.dataRate}</MetricValue>
                </DeviceMetric>
                <DeviceMetric>
                  <MetricLabel>Signal Strength</MetricLabel>
                  <MetricValue>{device.signalStrength ? `${device.signalStrength} dBm` : 'Unknown'}</MetricValue>
                </DeviceMetric>
                <DeviceMetric>
                  <MetricLabel>Last Seen</MetricLabel>
                  <MetricValue>{device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'Never'}</MetricValue>
                </DeviceMetric>
              </DeviceDetails>
            </DeviceCard>
          ))}
        </DeviceTable>
      )}
    </ContentArea>
  );

  const renderGateways = () => (
    <ContentArea>
      <CardHeader style={{ marginBottom: '1.5rem' }}>
        <CardTitle style={{ fontSize: '1.2rem' }}>
          <FiWifi style={{ marginRight: '0.5rem' }} />
          LoRaWAN Gateways ({gateways.length})
        </CardTitle>
        <ActionButton primary onClick={handleAddGateway}>
          <FiPlus size={16} />
          Add Gateway
        </ActionButton>
      </CardHeader>

      {gateways.length === 0 ? (
        <EmptyState>
          <div className="icon">
            <FiWifi />
          </div>
          <div className="title">No LoRaWAN Gateways Found</div>
          <div className="description">
            Add gateways to provide network coverage for your LoRaWAN devices
          </div>
          <ActionButton primary onClick={handleAddGateway}>
            <FiPlus size={16} />
            Add LoRaWAN Gateway
          </ActionButton>
        </EmptyState>
      ) : (
        <DeviceTable>
          {gateways.map((gateway) => (
            <DeviceCard key={gateway.id}>
              <DeviceHeader>
                <DeviceName>
                  <FiWifi size={18} />
                  {gateway.name}
                </DeviceName>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <DeviceStatus status={gateway.status}>
                    {gateway.status === 'online' && <FiCheckCircle size={12} />}
                    {gateway.status === 'offline' && <FiAlertTriangle size={12} />}
                    {gateway.status}
                  </DeviceStatus>
                  <DeviceActions>
                    <ActionIcon>
                      <FiEye size={14} />
                    </ActionIcon>
                    <ActionIcon>
                      <FiEdit size={14} />
                    </ActionIcon>
                    <ActionIcon>
                      <FiTrash2 size={14} />
                    </ActionIcon>
                  </DeviceActions>
                </div>
              </DeviceHeader>
              
              <DeviceDetails>
                <DeviceMetric>
                  <MetricLabel>Gateway EUI</MetricLabel>
                  <MetricValue>{gateway.gatewayEUI || 'Not configured'}</MetricValue>
                </DeviceMetric>
                <DeviceMetric>
                  <MetricLabel>Region</MetricLabel>
                  <MetricValue>{gateway.region}</MetricValue>
                </DeviceMetric>
                <DeviceMetric>
                  <MetricLabel>Location</MetricLabel>
                  <MetricValue>
                    {gateway.location ? 
                      `${gateway.location.latitude}, ${gateway.location.longitude}` : 
                      'Not set'
                    }
                  </MetricValue>
                </DeviceMetric>
                <DeviceMetric>
                  <MetricLabel>Connected Devices</MetricLabel>
                  <MetricValue>{gateway.connectedDevices || 0}</MetricValue>
                </DeviceMetric>
                <DeviceMetric>
                  <MetricLabel>Throughput</MetricLabel>
                  <MetricValue>{gateway.throughput}</MetricValue>
                </DeviceMetric>
                <DeviceMetric>
                  <MetricLabel>Network IP</MetricLabel>
                  <MetricValue>{gateway.networkSettings?.ip || 'DHCP'}</MetricValue>
                </DeviceMetric>
              </DeviceDetails>
            </DeviceCard>
          ))}
        </DeviceTable>
      )}
    </ContentArea>
  );

  const renderConfiguration = () => (
    <ContentArea>
      <CardTitle style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>
        <FiSettings style={{ marginRight: '0.5rem' }} />
        LoRaWAN Configuration
      </CardTitle>

      <ConfigSection>
        <ConfigCard>
          <ConfigTitle>
            <FiCpu />
            Adapter Status
          </ConfigTitle>
          <ConfigOption>
            <ConfigLabel>LoRa Adapter</ConfigLabel>
            <ConfigValue 
              style={{ 
                color: configuration.adapterStatus === 'running' ? '#48bb78' : '#e53e3e',
                background: configuration.adapterStatus === 'running' ? '#f0fff4' : '#fed7d7'
              }}
            >
              {configuration.adapterStatus || 'Unknown'}
            </ConfigValue>
          </ConfigOption>
          <ConfigOption>
            <ConfigLabel>MQTT Broker</ConfigLabel>
            <ConfigValue>{configuration.networkServer?.mqttBroker || 'Not configured'}</ConfigValue>
          </ConfigOption>
          <ConfigOption>
            <ConfigLabel>Adapter URL</ConfigLabel>
            <ConfigValue>{configuration.networkServer?.adapterURL || 'Not configured'}</ConfigValue>
          </ConfigOption>
        </ConfigCard>

        <ConfigCard>
          <ConfigTitle>
            <FiGlobe />
            Regional Settings
          </ConfigTitle>
          {Object.entries(configuration.supportedRegions || {}).map(([key, region]) => (
            <ConfigOption key={key}>
              <ConfigLabel>{region.name}</ConfigLabel>
              <ConfigValue>{key}</ConfigValue>
            </ConfigOption>
          ))}
        </ConfigCard>

        <ConfigCard>
          <ConfigTitle>
            <FiZap />
            Device Classes
          </ConfigTitle>
          {Object.entries(configuration.deviceClasses || {}).map(([key, deviceClass]) => (
            <ConfigOption key={key}>
              <ConfigLabel>{deviceClass.name}</ConfigLabel>
              <ConfigValue>{deviceClass.description}</ConfigValue>
            </ConfigOption>
          ))}
        </ConfigCard>

        <ConfigCard>
          <ConfigTitle>
            <FiDatabase />
            Default Settings
          </ConfigTitle>
          <ConfigOption>
            <ConfigLabel>Default Region</ConfigLabel>
            <ConfigValue>{configuration.defaultSettings?.region || 'EU868'}</ConfigValue>
          </ConfigOption>
          <ConfigOption>
            <ConfigLabel>Default Class</ConfigLabel>
            <ConfigValue>Class {configuration.defaultSettings?.deviceClass || 'A'}</ConfigValue>
          </ConfigOption>
          <ConfigOption>
            <ConfigLabel>Data Rate</ConfigLabel>
            <ConfigValue>{configuration.defaultSettings?.dataRate || 'SF7BW125'}</ConfigValue>
          </ConfigOption>
          <ConfigOption>
            <ConfigLabel>TX Power</ConfigLabel>
            <ConfigValue>{configuration.defaultSettings?.txPower || 14} dBm</ConfigValue>
          </ConfigOption>
          <ConfigOption>
            <ConfigLabel>ADR Enabled</ConfigLabel>
            <ConfigValue>{configuration.defaultSettings?.adrEnabled ? 'Yes' : 'No'}</ConfigValue>
          </ConfigOption>
        </ConfigCard>
      </ConfigSection>
    </ContentArea>
  );

  return (
    <Container>
      <Header>
        <Title>
          <FiRadio />
          LoRaWAN Network Management
        </Title>
        <HeaderActions>
          <ActionButton onClick={handleRefresh}>
            <FiRefreshCw size={16} />
            Refresh
          </ActionButton>
        </HeaderActions>
      </Header>

      <TabContainer>
        <Tab 
          active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')}
        >
          <FiBarChart style={{ marginRight: '0.5rem' }} />
          Overview
        </Tab>
        <Tab 
          active={activeTab === 'devices'} 
          onClick={() => setActiveTab('devices')}
        >
          <FiRadio style={{ marginRight: '0.5rem' }} />
          Devices
        </Tab>
        <Tab 
          active={activeTab === 'gateways'} 
          onClick={() => setActiveTab('gateways')}
        >
          <FiWifi style={{ marginRight: '0.5rem' }} />
          Gateways
        </Tab>
        <Tab 
          active={activeTab === 'configuration'} 
          onClick={() => setActiveTab('configuration')}
        >
          <FiSettings style={{ marginRight: '0.5rem' }} />
          Configuration
        </Tab>
      </TabContainer>

      {loading ? (
        <LoadingSpinner>
          <div className="spinner"></div>
        </LoadingSpinner>
      ) : (
        <>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'devices' && renderDevices()}
          {activeTab === 'gateways' && renderGateways()}
          {activeTab === 'configuration' && renderConfiguration()}
        </>
      )}
    </Container>
  );
};

export default LoRaWANManagement;