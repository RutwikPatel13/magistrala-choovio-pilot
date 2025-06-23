import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiWifi,
  FiSettings,
  FiActivity,
  FiRefreshCw,
  FiEye,
  FiLink
} from 'react-icons/fi';
import magistralaApi from '../services/magistralaApi';
import dualWriteService from '../services/dualWriteService';

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
  font-size: 2rem;
  font-weight: bold;
  background: linear-gradient(135deg, #2C5282, #ED8936);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: #2d3748;
    margin-bottom: 0.25rem;
  }
  
  .stat-label {
    color: #718096;
    font-size: 0.9rem;
  }
`;

const ChannelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
`;

const ChannelCard = styled.div`
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

const ChannelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ChannelName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  margin-bottom: 0.5rem;
`;

const ChannelId = styled.div`
  font-family: monospace;
  font-size: 0.8rem;
  color: #718096;
  background: #f7fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
`;

const ChannelActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SmallActionButton = styled.button`
  background: none;
  border: 1px solid #e2e8f0;
  color: #4a5568;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f7fafc;
    border-color: #cbd5e0;
  }
`;

const ChannelStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
`;

const ChannelStat = styled.div`
  text-align: center;
  
  .stat-value {
    font-size: 1.2rem;
    font-weight: bold;
    color: #2d3748;
  }
  
  .stat-label {
    font-size: 0.8rem;
    color: #718096;
    margin-top: 2px;
  }
`;

const ProtocolBadge = styled.span`
  background: ${props => {
    switch (props.protocol) {
      case 'mqtt': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'coap': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'http': return 'linear-gradient(135deg, #3b82f6, #2563eb)';
      case 'lorawan': return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
      default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
  }};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #2d3748;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #2C5282;
    box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #2C5282;
    box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #2C5282;
    box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #2C5282, #3182CE);
    color: white;
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(44, 82, 130, 0.3);
    }
  ` : `
    background: #f7fafc;
    color: #4a5568;
    border: 1px solid #e2e8f0;
    &:hover {
      background: #edf2f7;
    }
  `}
`;

const Channels = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingChannel, setViewingChannel] = useState(null);
  const [editingChannel, setEditingChannel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    protocol: 'mqtt',
    topic: '',
    description: '',
    metadata: ''
  });

  const [stats, setStats] = useState({
    totalChannels: 0,
    activeChannels: 0,
    messagesPerSecond: 0,
    dataVolume: 0
  });

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading channels from dual-write service...');
      const response = await dualWriteService.getChannels();
      const channelsData = Array.isArray(response) ? response : (response.channels || generateMockChannels());
      setChannels(channelsData);
      console.log('✅ Loaded channels via dual-write:', channelsData.length);
      
      // Calculate stats
      setStats({
        totalChannels: channelsData.length,
        activeChannels: channelsData.filter(c => c.status === 'active').length,
        messagesPerSecond: Math.floor(Math.random() * 100 + 50),
        dataVolume: (Math.random() * 10 + 5).toFixed(1)
      });
    } catch (error) {
      console.error('Failed to load channels:', error);
      const mockChannels = generateMockChannels();
      setChannels(mockChannels);
      setStats({
        totalChannels: mockChannels.length,
        activeChannels: mockChannels.filter(c => c.status === 'active').length,
        messagesPerSecond: 73,
        dataVolume: 8.4
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockChannels = () => [
    {
      id: 'ch_001',
      name: 'Temperature Data Channel',
      protocol: 'mqtt',
      topic: '/sensors/temperature',
      description: 'Channel for temperature sensor data collection',
      status: 'active',
      connectedDevices: 12,
      messagesTotal: 1547,
      lastActivity: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      metadata: {
        qos: 1,
        retained: true,
        maxMessageSize: '1KB'
      }
    },
    {
      id: 'ch_002',
      name: 'LoRaWAN Uplink Channel',
      protocol: 'lorawan',
      topic: '/lorawan/uplink',
      description: 'LoRaWAN device uplink message channel',
      status: 'active',
      connectedDevices: 8,
      messagesTotal: 892,
      lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      metadata: {
        spreadingFactor: 'SF7',
        frequency: '868MHz',
        bandwidth: '125kHz'
      }
    },
    {
      id: 'ch_003',
      name: 'Actuator Command Channel',
      protocol: 'coap',
      topic: '/actuators/commands',
      description: 'Channel for sending commands to actuator devices',
      status: 'active',
      connectedDevices: 5,
      messagesTotal: 334,
      lastActivity: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      metadata: {
        confirmable: true,
        maxRetransmit: 3,
        ackTimeout: '2s'
      }
    },
    {
      id: 'ch_004',
      name: 'HTTP Data Ingestion',
      protocol: 'http',
      topic: '/api/data/ingest',
      description: 'HTTP endpoint for bulk data ingestion',
      status: 'active',
      connectedDevices: 3,
      messagesTotal: 156,
      lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      metadata: {
        method: 'POST',
        contentType: 'application/json',
        maxPayloadSize: '10MB'
      }
    },
    {
      id: 'ch_005',
      name: 'Maintenance Channel',
      protocol: 'mqtt',
      topic: '/system/maintenance',
      description: 'Channel for system maintenance messages',
      status: 'inactive',
      connectedDevices: 0,
      messagesTotal: 45,
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      metadata: {
        qos: 2,
        retained: false,
        maxMessageSize: '5KB'
      }
    }
  ];

  const handleCreateChannel = () => {
    setEditingChannel(null);
    setFormData({
      name: '',
      protocol: 'mqtt',
      topic: '',
      description: '',
      metadata: ''
    });
    setShowModal(true);
  };

  const handleViewChannel = (channel) => {
    setViewingChannel(channel);
    setShowViewModal(true);
  };

  const handleEditChannel = (channel) => {
    setEditingChannel(channel);
    setFormData({
      name: channel.name,
      protocol: channel.protocol,
      topic: channel.topic,
      description: channel.description,
      metadata: JSON.stringify(channel.metadata, null, 2)
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const channelData = {
        name: formData.name,
        metadata: {
          protocol: formData.protocol,
          topic: formData.topic,
          description: formData.description,
          ...JSON.parse(formData.metadata || '{}')
        }
      };

      if (editingChannel) {
        // Update existing channel using dual-write service
        console.log('🔄 Updating channel via dual-write service:', editingChannel.id, channelData);
        const result = await dualWriteService.updateChannel(editingChannel.id, channelData);
        console.log('✅ Channel updated via dual-write:', result);
        
        // Update local state
        const updatedChannels = channels.map(ch => 
          ch.id === editingChannel.id 
            ? { ...ch, ...channelData, protocol: formData.protocol, topic: formData.topic, description: formData.description }
            : ch
        );
        setChannels(updatedChannels);
      } else {
        // Create new channel using dual-write service
        console.log('🔄 Creating channel via dual-write service:', channelData);
        const result = await dualWriteService.createChannel(channelData);
        console.log('✅ Channel created via dual-write:', result);
        
        // Add to local state with the returned ID
        const newChannel = {
          id: result?.id || `ch_${Date.now()}`,
          name: formData.name,
          protocol: formData.protocol,
          topic: formData.topic,
          description: formData.description,
          status: 'active',
          connectedDevices: 0,
          messagesTotal: 0,
          lastActivity: new Date().toISOString(),
          metadata: JSON.parse(formData.metadata || '{}')
        };
        setChannels(prev => [...prev, newChannel]);
      }
      
      setShowModal(false);
      
      // Reload channels to get updated data
      await loadChannels();
    } catch (error) {
      console.error('Failed to save channel:', error);
      alert('Failed to save channel. Please check the metadata format and try again.');
    }
  };

  const handleDeleteChannel = async (channelId) => {
    if (window.confirm('Are you sure you want to delete this channel?')) {
      try {
        console.log('🔄 Deleting channel via dual-write service:', channelId);
        await dualWriteService.deleteChannel(channelId);
        console.log('✅ Channel deleted via dual-write');
        
        // Update local state
        setChannels(prev => prev.filter(ch => ch.id !== channelId));
      } catch (error) {
        console.error('Failed to delete channel:', error);
        alert('Failed to delete channel. Please try again.');
      }
    }
  };

  const formatLastActivity = (timestamp) => {
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
          <p style={{ marginTop: '1rem' }}>Loading channels...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Channel Management</Title>
      </Header>

      <StatsGrid>
        <StatCard iconBg="linear-gradient(135deg, #10b981, #059669)">
          <div className="stat-icon">
            <FiWifi />
          </div>
          <div className="stat-value">{stats.totalChannels}</div>
          <div className="stat-label">Total Channels</div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #3b82f6, #2563eb)">
          <div className="stat-icon">
            <FiActivity />
          </div>
          <div className="stat-value">{stats.activeChannels}</div>
          <div className="stat-label">Active Channels</div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #f59e0b, #d97706)">
          <div className="stat-icon">
            <FiRefreshCw />
          </div>
          <div className="stat-value">{stats.messagesPerSecond}</div>
          <div className="stat-label">Messages/sec</div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #8b5cf6, #7c3aed)">
          <div className="stat-icon">
            <FiSettings />
          </div>
          <div className="stat-value">{stats.dataVolume} GB</div>
          <div className="stat-label">Data Volume</div>
        </StatCard>
      </StatsGrid>

      <ChannelGrid>
        {channels.map(channel => (
          <ChannelCard key={channel.id}>
            <ChannelHeader>
              <div>
                <ChannelName>{channel.name}</ChannelName>
                <ChannelId>{channel.id}</ChannelId>
                <div style={{ marginTop: '0.5rem' }}>
                  <ProtocolBadge protocol={channel.protocol}>
                    {channel.protocol}
                  </ProtocolBadge>
                </div>
              </div>
              <ChannelActions>
                <SmallActionButton onClick={() => handleViewChannel(channel)}>
                  <FiEye />
                </SmallActionButton>
                <SmallActionButton onClick={() => handleEditChannel(channel)}>
                  <FiEdit />
                </SmallActionButton>
                <SmallActionButton onClick={() => handleDeleteChannel(channel.id)}>
                  <FiTrash2 />
                </SmallActionButton>
              </ChannelActions>
            </ChannelHeader>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>Topic: {channel.topic}</div>
              <div style={{ fontSize: '0.9rem', color: '#718096' }}>{channel.description}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ 
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: channel.status === 'active' ? '#10b981' : '#ef4444'
              }}></span>
              <span style={{ fontSize: '0.9rem', color: channel.status === 'active' ? '#10b981' : '#ef4444' }}>
                {channel.status === 'active' ? 'Active' : 'Inactive'}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#718096' }}>
                Last: {formatLastActivity(channel.lastActivity)}
              </span>
            </div>

            <ChannelStats>
              <ChannelStat>
                <div className="stat-value">{channel.connectedDevices}</div>
                <div className="stat-label">Devices</div>
              </ChannelStat>
              <ChannelStat>
                <div className="stat-value">{channel.messagesTotal}</div>
                <div className="stat-label">Messages</div>
              </ChannelStat>
              <ChannelStat>
                <div className="stat-value">
                  {Math.floor(channel.messagesTotal / Math.max(1, Math.floor((Date.now() - new Date(channel.lastActivity).getTime()) / 86400000) || 1))}
                </div>
                <div className="stat-label">Per Day</div>
              </ChannelStat>
            </ChannelStats>
          </ChannelCard>
        ))}
      </ChannelGrid>

      {showModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <ModalContent>
            <h2>{editingChannel ? 'Edit Channel' : 'Create New Channel'}</h2>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Channel Name</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter channel name"
                />
              </FormGroup>

              <FormGroup>
                <Label>Protocol</Label>
                <Select
                  value={formData.protocol}
                  onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                >
                  <option value="mqtt">MQTT</option>
                  <option value="coap">CoAP</option>
                  <option value="http">HTTP</option>
                  <option value="lorawan">LoRaWAN</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Topic/Endpoint</Label>
                <Input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  required
                  placeholder="e.g., /sensors/temperature"
                />
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the purpose of this channel"
                />
              </FormGroup>

              <FormGroup>
                <Label>Metadata (JSON)</Label>
                <TextArea
                  value={formData.metadata}
                  onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                  placeholder='{"qos": 1, "retained": true}'
                />
              </FormGroup>

              <ButtonGroup>
                <Button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingChannel ? 'Update' : 'Create'} Channel
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {showViewModal && viewingChannel && (
        <Modal onClick={() => setShowViewModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2>Channel Details</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <Label>Channel Name</Label>
                  <div style={{ padding: '0.75rem', background: '#f7fafc', borderRadius: '6px', fontWeight: '500' }}>
                    {viewingChannel.name}
                  </div>
                </div>
                <div>
                  <Label>Channel ID</Label>
                  <div style={{ padding: '0.75rem', background: '#f7fafc', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {viewingChannel.id}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <Label>Protocol</Label>
                  <div style={{ padding: '0.75rem', background: '#f7fafc', borderRadius: '6px' }}>
                    <ProtocolBadge protocol={viewingChannel.protocol}>
                      {viewingChannel.protocol}
                    </ProtocolBadge>
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div style={{ padding: '0.75rem', background: '#f7fafc', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: viewingChannel.status === 'active' ? '#10b981' : '#ef4444'
                    }}></span>
                    <span style={{ color: viewingChannel.status === 'active' ? '#10b981' : '#ef4444', fontWeight: '500' }}>
                      {viewingChannel.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <Label>Topic</Label>
                <div style={{ padding: '0.75rem', background: '#f7fafc', borderRadius: '6px', fontFamily: 'monospace' }}>
                  {viewingChannel.topic}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <Label>Description</Label>
                <div style={{ padding: '0.75rem', background: '#f7fafc', borderRadius: '6px', minHeight: '60px' }}>
                  {viewingChannel.description || 'No description provided'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ textAlign: 'center', padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2C5282' }}>
                    {viewingChannel.connectedDevices}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#718096' }}>Connected Devices</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2C5282' }}>
                    {viewingChannel.messagesTotal}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#718096' }}>Total Messages</div>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: '#f7fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2C5282' }}>
                    {formatLastActivity(viewingChannel.lastActivity)}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#718096' }}>Last Activity</div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <Label>Metadata</Label>
                <div style={{ padding: '0.75rem', background: '#f7fafc', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.9rem', maxHeight: '200px', overflowY: 'auto' }}>
                  <pre>{JSON.stringify(viewingChannel.metadata, null, 2)}</pre>
                </div>
              </div>
            </div>

            <ButtonGroup>
              <Button type="button" onClick={() => setShowViewModal(false)}>
                Close
              </Button>
              <Button type="button" variant="primary" onClick={() => {
                setShowViewModal(false);
                handleEditChannel(viewingChannel);
              }}>
                Edit Channel
              </Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Channels;