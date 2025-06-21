import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiBell,
  FiMail,
  FiSmartphone,
  FiRefreshCw,
  FiPlay,
  FiPause,
  FiSettings,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiSearch,
  FiFilter,
  FiMessageSquare,
  FiSlack,
  FiSend
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

const ConsumersContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const ConsumersHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ConsumersTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
`;

const ConsumersList = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const ConsumerItem = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #f7fafc;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f7fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ConsumerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ConsumerInfo = styled.div`
  flex: 1;
`;

const ConsumerName = styled.div`
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ConsumerType = styled.span`
  background: ${props => {
    switch(props.type) {
      case 'smtp': return '#3b82f6';
      case 'http': return '#10b981';
      case 'slack': return '#f59e0b';
      case 'webhook': return '#8b5cf6';
      default: return '#6b7280';
    }
  }};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const ConsumerDescription = styled.div`
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const ConsumerMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #718096;
  flex-wrap: wrap;
`;

const ConsumerActions = styled.div`
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
  
  &.enabled {
    background: #10b981;
    color: white;
    border-color: #10b981;
  }
  
  &.disabled {
    background: #ef4444;
    color: white;
    border-color: #ef4444;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 1rem 0;
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    
    &.enabled {
      background: #10b981;
    }
    
    &.disabled {
      background: #ef4444;
    }
  }
  
  .status-text {
    font-size: 0.9rem;
    font-weight: 500;
    
    &.enabled {
      color: #10b981;
    }
    
    &.disabled {
      color: #ef4444;
    }
  }
`;

const ConsumerDetails = styled.div`
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  font-size: 0.85rem;
  
  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    
    .detail-label {
      font-weight: 600;
      color: #4a5568;
    }
    
    .detail-value {
      color: #2d3748;
      word-break: break-all;
    }
  }
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

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;

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

const getConsumerIcon = (type) => {
  switch(type?.toLowerCase()) {
    case 'smtp': return <FiMail />;
    case 'http': return <FiSend />;
    case 'slack': return <FiSlack />;
    case 'webhook': return <FiMessageSquare />;
    default: return <FiBell />;
  }
};

const Notifications = () => {
  const [consumers, setConsumers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all'
  });
  const [showModal, setShowModal] = useState(false);
  const [editingConsumer, setEditingConsumer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'smtp',
    config: '',
    subtopic: '',
    channel: '',
    enabled: true
  });

  const [stats, setStats] = useState({
    totalConsumers: 0,
    activeConsumers: 0,
    emailConsumers: 0,
    webhookConsumers: 0
  });

  useEffect(() => {
    loadConsumers();
  }, []);

  const loadConsumers = async () => {
    try {
      setLoading(true);
      const response = await magistralaApi.getConsumers();
      const consumersData = response.consumers || [];
      setConsumers(consumersData);
      
      // Calculate stats
      setStats({
        totalConsumers: consumersData.length,
        activeConsumers: consumersData.filter(c => c.enabled).length,
        emailConsumers: consumersData.filter(c => c.type === 'smtp').length,
        webhookConsumers: consumersData.filter(c => c.type === 'http' || c.type === 'webhook').length
      });
    } catch (error) {
      console.error('Failed to load consumers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConsumers = consumers.filter(consumer => {
    const matchesSearch = (consumer.name && consumer.name.toLowerCase().includes(filters.search.toLowerCase())) ||
                         (consumer.subtopic && consumer.subtopic.toLowerCase().includes(filters.search.toLowerCase()));
    const matchesType = filters.type === 'all' || consumer.type === filters.type;
    const matchesStatus = filters.status === 'all' || 
                         (filters.status === 'enabled' && consumer.enabled) ||
                         (filters.status === 'disabled' && !consumer.enabled);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateConsumer = () => {
    setEditingConsumer(null);
    setFormData({
      name: '',
      type: 'smtp',
      config: JSON.stringify({
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_username: 'your-email@gmail.com',
        smtp_password: 'your-password',
        from_addr: 'noreply@choovio.com',
        to_addrs: ['admin@choovio.com']
      }, null, 2),
      subtopic: '',
      channel: '',
      enabled: true
    });
    setShowModal(true);
  };

  const handleEditConsumer = (consumer) => {
    setEditingConsumer(consumer);
    setFormData({
      name: consumer.name || '',
      type: consumer.type || 'smtp',
      config: typeof consumer.config === 'object' ? JSON.stringify(consumer.config, null, 2) : consumer.config || '',
      subtopic: consumer.subtopic || '',
      channel: consumer.channel || '',
      enabled: consumer.enabled !== false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let config;
      try {
        config = JSON.parse(formData.config);
      } catch (e) {
        alert('Invalid JSON configuration. Please check your configuration format.');
        return;
      }

      const consumerData = {
        name: formData.name,
        type: formData.type,
        config: config,
        subtopic: formData.subtopic,
        channel: formData.channel,
        enabled: formData.enabled
      };

      if (editingConsumer) {
        await magistralaApi.updateConsumer(editingConsumer.id, consumerData);
      } else {
        await magistralaApi.createConsumer(consumerData);
      }
      
      setShowModal(false);
      await loadConsumers();
    } catch (error) {
      console.error('Failed to save consumer:', error);
      alert('Failed to save notification consumer. Please try again.');
    }
  };

  const handleToggleConsumer = async (consumerId, currentStatus) => {
    try {
      await magistralaApi.updateConsumer(consumerId, { enabled: !currentStatus });
      await loadConsumers();
    } catch (error) {
      console.error('Failed to toggle consumer:', error);
      alert('Failed to toggle consumer status. Please try again.');
    }
  };

  const handleDeleteConsumer = async (consumerId) => {
    if (!window.confirm('Are you sure you want to delete this notification consumer? This action cannot be undone.')) {
      return;
    }

    try {
      await magistralaApi.deleteConsumer(consumerId);
      await loadConsumers();
    } catch (error) {
      console.error('Failed to delete consumer:', error);
      alert('Failed to delete notification consumer. Please try again.');
    }
  };

  const handleTypeChange = (type) => {
    let defaultConfig = {};
    switch(type) {
      case 'smtp':
        defaultConfig = {
          smtp_host: 'smtp.gmail.com',
          smtp_port: 587,
          smtp_username: 'your-email@gmail.com',
          smtp_password: 'your-password',
          from_addr: 'noreply@choovio.com',
          to_addrs: ['admin@choovio.com']
        };
        break;
      case 'http':
      case 'webhook':
        defaultConfig = {
          url: 'https://your-webhook-url.com/notify',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer your-token'
          }
        };
        break;
      case 'slack':
        defaultConfig = {
          webhook_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
          channel: '#alerts',
          username: 'Magistrala Bot'
        };
        break;
      default:
        defaultConfig = {};
    }
    
    setFormData({
      ...formData,
      type: type,
      config: JSON.stringify(defaultConfig, null, 2)
    });
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <FiRefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem' }}>Loading notification consumers...</p>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Notifications</Title>
        <ActionButton onClick={handleCreateConsumer}>
          <FiPlus /> Create Consumer
        </ActionButton>
      </Header>

      <StatsGrid>
        <StatCard iconBg="linear-gradient(135deg, #10b981, #059669)">
          <div className="stat-icon">
            <FiBell />
          </div>
          <div className="stat-value">{stats.totalConsumers}</div>
          <div className="stat-label">Total Consumers</div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #3b82f6, #2563eb)">
          <div className="stat-icon">
            <FiCheckCircle />
          </div>
          <div className="stat-value">{stats.activeConsumers}</div>
          <div className="stat-label">Active Consumers</div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #f59e0b, #d97706)">
          <div className="stat-icon">
            <FiMail />
          </div>
          <div className="stat-value">{stats.emailConsumers}</div>
          <div className="stat-label">Email Consumers</div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #8b5cf6, #7c3aed)">
          <div className="stat-icon">
            <FiMessageSquare />
          </div>
          <div className="stat-value">{stats.webhookConsumers}</div>
          <div className="stat-label">Webhook Consumers</div>
        </StatCard>
      </StatsGrid>

      <FiltersSection>
        <FiltersGrid>
          <FilterGroup>
            <Label>Search Consumers</Label>
            <Input
              type="text"
              placeholder="Search by name or subtopic..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </FilterGroup>
          
          <FilterGroup>
            <Label>Type</Label>
            <Select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="all">All Types</option>
              <option value="smtp">Email (SMTP)</option>
              <option value="http">HTTP Webhook</option>
              <option value="slack">Slack</option>
              <option value="webhook">Generic Webhook</option>
            </Select>
          </FilterGroup>
          
          <FilterGroup>
            <Label>Status</Label>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Status</option>
              <option value="enabled">Enabled Only</option>
              <option value="disabled">Disabled Only</option>
            </Select>
          </FilterGroup>
        </FiltersGrid>
      </FiltersSection>

      <ConsumersContainer>
        <ConsumersHeader>
          <ConsumersTitle>Notification Consumers ({filteredConsumers.length})</ConsumersTitle>
        </ConsumersHeader>
        
        <ConsumersList>
          {filteredConsumers.length > 0 ? (
            filteredConsumers.map((consumer) => (
              <ConsumerItem key={consumer.id}>
                <ConsumerHeader>
                  <ConsumerInfo>
                    <ConsumerName>
                      {getConsumerIcon(consumer.type)}
                      {consumer.name || 'Unnamed Consumer'}
                      <ConsumerType type={consumer.type}>{consumer.type?.toUpperCase()}</ConsumerType>
                    </ConsumerName>
                    <ConsumerDescription>
                      {consumer.subtopic ? `Listening to: ${consumer.subtopic}` : 'Listening to all messages'}
                    </ConsumerDescription>
                    <ConsumerMeta>
                      <span>ID: {consumer.id}</span>
                      <span>Channel: {consumer.channel || 'All'}</span>
                      <span>Created: {formatTimestamp(consumer.created_at)}</span>
                    </ConsumerMeta>
                  </ConsumerInfo>
                  <ConsumerActions>
                    <SmallActionButton onClick={() => handleEditConsumer(consumer)}>
                      <FiEye />
                    </SmallActionButton>
                    <SmallActionButton onClick={() => handleEditConsumer(consumer)}>
                      <FiEdit />
                    </SmallActionButton>
                    <SmallActionButton 
                      className={consumer.enabled ? 'enabled' : 'disabled'}
                      onClick={() => handleToggleConsumer(consumer.id, consumer.enabled)}
                    >
                      {consumer.enabled ? <FiPause /> : <FiPlay />}
                    </SmallActionButton>
                    <SmallActionButton onClick={() => handleDeleteConsumer(consumer.id)}>
                      <FiTrash2 />
                    </SmallActionButton>
                  </ConsumerActions>
                </ConsumerHeader>

                <StatusIndicator>
                  <div className={`status-dot ${consumer.enabled ? 'enabled' : 'disabled'}`}></div>
                  <span className={`status-text ${consumer.enabled ? 'enabled' : 'disabled'}`}>
                    {consumer.enabled ? 'Active' : 'Disabled'}
                  </span>
                </StatusIndicator>

                <ConsumerDetails>
                  <div className="detail-item">
                    <div className="detail-label">Type</div>
                    <div className="detail-value">{consumer.type}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Subtopic Filter</div>
                    <div className="detail-value">{consumer.subtopic || 'None (all messages)'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Target Channel</div>
                    <div className="detail-value">{consumer.channel || 'All channels'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Last Updated</div>
                    <div className="detail-value">{formatTimestamp(consumer.updated_at)}</div>
                  </div>
                </ConsumerDetails>
              </ConsumerItem>
            ))
          ) : (
            <EmptyState>
              <div className="empty-icon">
                <FiBell />
              </div>
              <div className="empty-title">No Notification Consumers</div>
              <div className="empty-text">
                Create your first notification consumer to receive alerts via email, webhooks, or Slack
              </div>
            </EmptyState>
          )}
        </ConsumersList>
      </ConsumersContainer>

      {showModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <ModalContent>
            <h2>{editingConsumer ? 'Edit Consumer' : 'Create Notification Consumer'}</h2>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Consumer Name</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter consumer name"
                />
              </FormGroup>

              <FormGroup>
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                >
                  <option value="smtp">Email (SMTP)</option>
                  <option value="http">HTTP Webhook</option>
                  <option value="slack">Slack</option>
                  <option value="webhook">Generic Webhook</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Subtopic Filter</Label>
                <Input
                  type="text"
                  value={formData.subtopic}
                  onChange={(e) => setFormData({ ...formData, subtopic: e.target.value })}
                  placeholder="e.g., temperature.high (leave empty for all messages)"
                />
              </FormGroup>

              <FormGroup>
                <Label>Channel ID</Label>
                <Input
                  type="text"
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  placeholder="Specific channel ID (leave empty for all channels)"
                />
              </FormGroup>

              <FormGroup>
                <Label>Enabled</Label>
                <Select
                  value={formData.enabled.toString()}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.value === 'true' })}
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Configuration (JSON)</Label>
                <TextArea
                  value={formData.config}
                  onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                  required
                  style={{ minHeight: '200px' }}
                  placeholder="Enter JSON configuration..."
                />
              </FormGroup>

              <ButtonGroup>
                <Button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingConsumer ? 'Update' : 'Create'} Consumer
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Notifications;