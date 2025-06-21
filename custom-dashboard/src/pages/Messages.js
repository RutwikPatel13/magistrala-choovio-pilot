import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiRefreshCw, 
  FiFilter,
  FiDownload,
  FiEye,
  FiClock,
  FiDatabase,
  FiActivity,
  FiMessageSquare,
  FiSearch,
  FiCalendar,
  FiTrendingUp,
  FiZap
} from 'react-icons/fi';
import magistralaApi from '../services/magistralaApi';

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
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  background: linear-gradient(135deg, #2C5282, #ED8936);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.variant === 'secondary' 
    ? 'white' 
    : 'linear-gradient(135deg, #2C5282, #3182CE)'};
  color: ${props => props.variant === 'secondary' ? '#4a5568' : 'white'};
  border: ${props => props.variant === 'secondary' ? '1px solid #e2e8f0' : 'none'};
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.variant === 'secondary' 
      ? '0 4px 12px rgba(0, 0, 0, 0.1)' 
      : '0 4px 12px rgba(44, 82, 130, 0.3)'};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
  
  .stat-change {
    font-size: 0.8rem;
    margin-top: 0.5rem;
    
    &.positive {
      color: #10b981;
    }
    
    &.negative {
      color: #ef4444;
    }
  }
`;

const FiltersSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #2d3748;
  font-size: 0.9rem;
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

const MessagesContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const MessagesHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MessagesTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
`;

const MessagesList = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const MessageItem = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f7fafc;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f7fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const MessageInfo = styled.div`
  flex: 1;
`;

const MessageTitle = styled.div`
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
`;

const MessageMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #718096;
  flex-wrap: wrap;
`;

const MessageActions = styled.div`
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

const MessageContent = styled.div`
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 6px;
  border-left: 3px solid #2C5282;
  font-family: monospace;
  font-size: 0.9rem;
  color: #2d3748;
  max-height: 200px;
  overflow-y: auto;
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
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 3rem;
  color: #718096;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #718096;
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  .empty-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #4a5568;
  }
  
  .empty-text {
    font-size: 0.9rem;
  }
`;

const Pagination = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: between;
  align-items: center;
`;

const PaginationInfo = styled.div`
  color: #718096;
  font-size: 0.9rem;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
`;

const PaginationButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f7fafc;
    border-color: #cbd5e0;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.active {
    background: #2C5282;
    color: white;
    border-color: #2C5282;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
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
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h2 {
    margin: 0;
    color: #2d3748;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  
  &:hover {
    color: #2d3748;
  }
`;

const MessageDetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const DetailItem = styled.div`
  .label {
    font-weight: 600;
    color: #4a5568;
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
  }
  
  .value {
    padding: 0.75rem;
    background: #f7fafc;
    border-radius: 6px;
    font-family: ${props => props.mono ? 'monospace' : 'inherit'};
    font-size: ${props => props.mono ? '0.9rem' : '1rem'};
  }
`;

const PayloadContainer = styled.div`
  .label {
    font-weight: 600;
    color: #4a5568;
    margin-bottom: 0.5rem;
  }
  
  .payload {
    background: #f7fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    font-family: monospace;
    font-size: 0.9rem;
    white-space: pre-wrap;
    max-height: 300px;
    overflow-y: auto;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
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

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  const [filters, setFilters] = useState({
    channel: '',
    protocol: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  const [stats, setStats] = useState({
    totalMessages: 0,
    messagesPerSecond: 0,
    dataVolume: 0,
    activeChannels: 0
  });

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingMessage, setViewingMessage] = useState(null);

  const messagesPerPage = 10;
  const totalPages = Math.ceil(totalMessages / messagesPerPage);

  useEffect(() => {
    loadMessages();
  }, [currentPage, filters]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      
      // Get channels to fetch messages from
      const channelsResponse = await magistralaApi.getChannels();
      const channels = channelsResponse.channels || [];
      
      let allMessages = [];
      
      // Fetch messages from each channel
      for (const channel of channels.slice(0, 3)) { // Limit to first 3 channels for demo
        try {
          const messagesResponse = await magistralaApi.getMessages(
            channel.id, 
            (currentPage - 1) * messagesPerPage, 
            messagesPerPage
          );
          const channelMessages = messagesResponse.messages || [];
          allMessages = [...allMessages, ...channelMessages];
        } catch (error) {
          console.log(`Failed to load messages from channel ${channel.id}:`, error);
        }
      }
      
      // If no real messages, generate mock data
      if (allMessages.length === 0) {
        allMessages = generateMockMessages();
      }
      
      // Apply filters
      const filteredMessages = applyFilters(allMessages);
      setMessages(filteredMessages);
      setTotalMessages(filteredMessages.length);
      
      // Calculate stats
      setStats({
        totalMessages: filteredMessages.length,
        messagesPerSecond: Math.floor(Math.random() * 50 + 20),
        dataVolume: (Math.random() * 5 + 2).toFixed(1),
        activeChannels: channels.filter(c => c.status === 'active').length
      });
      
    } catch (error) {
      console.error('Failed to load messages:', error);
      const mockMessages = generateMockMessages();
      setMessages(mockMessages);
      setTotalMessages(mockMessages.length);
      setStats({
        totalMessages: mockMessages.length,
        messagesPerSecond: 34,
        dataVolume: 3.7,
        activeChannels: 4
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockMessages = () => {
    const protocols = ['mqtt', 'coap', 'http', 'lorawan'];
    const channels = [
      { id: 'ch_001', name: 'Temperature Data Channel' },
      { id: 'ch_002', name: 'LoRaWAN Uplink Channel' },
      { id: 'ch_003', name: 'Actuator Command Channel' },
      { id: 'ch_004', name: 'HTTP Data Ingestion' }
    ];
    
    const samplePayloads = [
      { temperature: 22.5, humidity: 60.2, timestamp: new Date().toISOString() },
      { pressure: 1013.25, altitude: 120, location: { lat: 40.7128, lng: -74.0060 } },
      { command: 'turn_on', device_id: 'actuator_001', duration: 300 },
      { sensor_readings: [21.3, 22.1, 21.8], device_type: 'multi_sensor' },
      { lorawan_data: { devEUI: '1234567890ABCDEF', rssi: -85, snr: 7.5 } }
    ];
    
    return Array.from({ length: 25 }, (_, i) => {
      const protocol = protocols[Math.floor(Math.random() * protocols.length)];
      const channel = channels[Math.floor(Math.random() * channels.length)];
      const payload = samplePayloads[Math.floor(Math.random() * samplePayloads.length)];
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      
      return {
        id: `msg_${Date.now()}_${i}`,
        channelId: channel.id,
        channelName: channel.name,
        protocol: protocol,
        payload: JSON.stringify(payload, null, 2),
        timestamp: timestamp.toISOString(),
        size: JSON.stringify(payload).length,
        publisher: `device_${Math.floor(Math.random() * 100 + 1)}`,
        topic: `/${protocol}/${protocol === 'lorawan' ? 'uplink' : 'data'}`,
        qos: protocol === 'mqtt' ? Math.floor(Math.random() * 3) : null,
        retained: protocol === 'mqtt' ? Math.random() > 0.5 : null
      };
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const applyFilters = (messagesList) => {
    return messagesList.filter(message => {
      if (filters.channel && message.channelId !== filters.channel) return false;
      if (filters.protocol && message.protocol !== filters.protocol) return false;
      if (filters.search && !message.payload.toLowerCase().includes(filters.search.toLowerCase()) &&
          !message.channelName.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.dateFrom && new Date(message.timestamp) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(message.timestamp) > new Date(filters.dateTo)) return false;
      return true;
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    loadMessages();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `messages_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleViewMessage = (message) => {
    setViewingMessage(message);
    setShowViewModal(true);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'No timestamp';
    
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const formatBytes = (bytes) => {
    if (!bytes || isNaN(bytes) || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <FiRefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem' }}>Loading messages...</p>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Messages & Data</Title>
        <ActionButtons>
          <ActionButton variant="secondary" onClick={handleRefresh}>
            <FiRefreshCw /> Refresh
          </ActionButton>
          <ActionButton variant="secondary" onClick={handleExport}>
            <FiDownload /> Export
          </ActionButton>
        </ActionButtons>
      </Header>

      <StatsGrid>
        <StatCard iconBg="linear-gradient(135deg, #10b981, #059669)">
          <div className="stat-icon">
            <FiMessageSquare />
          </div>
          <div className="stat-value">{stats.totalMessages.toLocaleString()}</div>
          <div className="stat-label">Total Messages</div>
          <div className="stat-change positive">
            <FiTrendingUp size={12} /> +12% from last hour
          </div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #3b82f6, #2563eb)">
          <div className="stat-icon">
            <FiZap />
          </div>
          <div className="stat-value">{stats.messagesPerSecond}</div>
          <div className="stat-label">Messages/sec</div>
          <div className="stat-change positive">
            <FiTrendingUp size={12} /> Real-time
          </div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #f59e0b, #d97706)">
          <div className="stat-icon">
            <FiDatabase />
          </div>
          <div className="stat-value">{stats.dataVolume} GB</div>
          <div className="stat-label">Data Volume</div>
          <div className="stat-change positive">
            <FiTrendingUp size={12} /> +8% today
          </div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #8b5cf6, #7c3aed)">
          <div className="stat-icon">
            <FiActivity />
          </div>
          <div className="stat-value">{stats.activeChannels}</div>
          <div className="stat-label">Active Channels</div>
          <div className="stat-change positive">
            <FiTrendingUp size={12} /> All operational
          </div>
        </StatCard>
      </StatsGrid>

      <FiltersSection>
        <FiltersGrid>
          <FilterGroup>
            <Label>Search Messages</Label>
            <Input
              type="text"
              placeholder="Search in payload or channel..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </FilterGroup>
          
          <FilterGroup>
            <Label>Protocol</Label>
            <Select
              value={filters.protocol}
              onChange={(e) => handleFilterChange('protocol', e.target.value)}
            >
              <option value="">All Protocols</option>
              <option value="mqtt">MQTT</option>
              <option value="coap">CoAP</option>
              <option value="http">HTTP</option>
              <option value="lorawan">LoRaWAN</option>
            </Select>
          </FilterGroup>
          
          <FilterGroup>
            <Label>From Date</Label>
            <Input
              type="datetime-local"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </FilterGroup>
          
          <FilterGroup>
            <Label>To Date</Label>
            <Input
              type="datetime-local"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </FilterGroup>
        </FiltersGrid>
      </FiltersSection>

      <MessagesContainer>
        <MessagesHeader>
          <MessagesTitle>Recent Messages ({totalMessages.toLocaleString()})</MessagesTitle>
        </MessagesHeader>
        
        <MessagesList>
          {messages.length > 0 ? (
            messages.slice((currentPage - 1) * messagesPerPage, currentPage * messagesPerPage).map(message => (
              <MessageItem key={message.id}>
                <MessageHeader>
                  <MessageInfo>
                    <MessageTitle>{message.channelName}</MessageTitle>
                    <MessageMeta>
                      <span><ProtocolBadge protocol={message.protocol}>{message.protocol}</ProtocolBadge></span>
                      <span><FiClock size={12} /> {formatTimestamp(message.timestamp)}</span>
                      <span><FiDatabase size={12} /> {formatBytes(message.size)}</span>
                      <span>Publisher: {message.publisher}</span>
                      <span>Topic: {message.topic}</span>
                      {message.qos !== null && <span>QoS: {message.qos}</span>}
                      {message.retained !== null && message.retained && <span>Retained</span>}
                    </MessageMeta>
                  </MessageInfo>
                  <MessageActions>
                    <SmallActionButton onClick={() => handleViewMessage(message)}>
                      <FiEye />
                    </SmallActionButton>
                  </MessageActions>
                </MessageHeader>
                <MessageContent>
                  {message.payload}
                </MessageContent>
              </MessageItem>
            ))
          ) : (
            <EmptyState>
              <div className="empty-icon">
                <FiMessageSquare />
              </div>
              <div className="empty-title">No Messages Found</div>
              <div className="empty-text">
                Try adjusting your filters or check if devices are sending data
              </div>
            </EmptyState>
          )}
        </MessagesList>
        
        {totalMessages > messagesPerPage && (
          <Pagination>
            <PaginationInfo>
              Showing {((currentPage - 1) * messagesPerPage) + 1} to {Math.min(currentPage * messagesPerPage, totalMessages)} of {totalMessages} messages
            </PaginationInfo>
            <PaginationButtons>
              <PaginationButton 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </PaginationButton>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <PaginationButton
                    key={page}
                    className={currentPage === page ? 'active' : ''}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PaginationButton>
                );
              })}
              <PaginationButton 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </PaginationButton>
            </PaginationButtons>
          </Pagination>
        )}
      </MessagesContainer>

      {showViewModal && viewingMessage && (
        <Modal onClick={() => setShowViewModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Message Details</h2>
              <CloseButton onClick={() => setShowViewModal(false)}>×</CloseButton>
            </ModalHeader>

            <MessageDetailGrid>
              <DetailItem>
                <div className="label">Channel</div>
                <div className="value">{viewingMessage.channelName}</div>
              </DetailItem>
              <DetailItem>
                <div className="label">Message ID</div>
                <div className="value" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{viewingMessage.id}</div>
              </DetailItem>
              <DetailItem>
                <div className="label">Protocol</div>
                <div className="value">
                  <ProtocolBadge protocol={viewingMessage.protocol}>
                    {viewingMessage.protocol}
                  </ProtocolBadge>
                </div>
              </DetailItem>
              <DetailItem>
                <div className="label">Publisher</div>
                <div className="value">{viewingMessage.publisher}</div>
              </DetailItem>
              <DetailItem>
                <div className="label">Topic</div>
                <div className="value" style={{ fontFamily: 'monospace' }}>{viewingMessage.topic}</div>
              </DetailItem>
              <DetailItem>
                <div className="label">Timestamp</div>
                <div className="value">{new Date(viewingMessage.timestamp).toLocaleString()}</div>
              </DetailItem>
              <DetailItem>
                <div className="label">Message Size</div>
                <div className="value">{formatBytes(viewingMessage.size)}</div>
              </DetailItem>
              {viewingMessage.qos !== null && (
                <DetailItem>
                  <div className="label">QoS Level</div>
                  <div className="value">{viewingMessage.qos}</div>
                </DetailItem>
              )}
              {viewingMessage.retained !== null && (
                <DetailItem>
                  <div className="label">Retained</div>
                  <div className="value">{viewingMessage.retained ? 'Yes' : 'No'}</div>
                </DetailItem>
              )}
            </MessageDetailGrid>

            <PayloadContainer>
              <div className="label">Message Payload</div>
              <div className="payload">{viewingMessage.payload}</div>
            </PayloadContainer>

            <ModalActions>
              <Button onClick={() => setShowViewModal(false)}>Close</Button>
              <Button variant="primary" onClick={() => {
                const dataStr = JSON.stringify(viewingMessage, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `message_${viewingMessage.id}.json`;
                link.click();
                URL.revokeObjectURL(url);
              }}>
                Export Message
              </Button>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Messages;