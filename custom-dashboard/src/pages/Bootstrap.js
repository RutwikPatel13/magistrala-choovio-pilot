import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiWifi,
  FiShield,
  FiCpu,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiSettings,
  FiEye,
  FiCopy,
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiFilter,
  FiServer
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

const ConfigsContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const ConfigsHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ConfigsTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
`;

const ConfigsList = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const ConfigItem = styled.div`
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

const ConfigHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ConfigInfo = styled.div`
  flex: 1;
`;

const ConfigName = styled.div`
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
`;

const ConfigDescription = styled.div`
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const ConfigMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #718096;
  flex-wrap: wrap;
`;

const ConfigActions = styled.div`
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
  
  &.state-active {
    background: #10b981;
    color: white;
    border-color: #10b981;
  }
  
  &.state-inactive {
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
    
    &.active {
      background: #10b981;
    }
    
    &.inactive {
      background: #ef4444;
    }
  }
  
  .status-text {
    font-size: 0.9rem;
    font-weight: 500;
    
    &.active {
      color: #10b981;
    }
    
    &.inactive {
      color: #ef4444;
    }
  }
`;

const ConfigDetails = styled.div`
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

const Bootstrap = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    state: 'all'
  });
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    external_id: '',
    external_key: '',
    thing_id: '',
    channels: [],
    name: '',
    client_cert: '',
    client_key: '',
    ca_cert: '',
    content: ''
  });

  const [stats, setStats] = useState({
    totalConfigs: 0,
    activeConfigs: 0,
    provisioned: 0,
    pending: 0
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await magistralaApi.getBootstrapConfigs();
      const configsData = response.configs || [];
      setConfigs(configsData);
      
      // Calculate stats
      setStats({
        totalConfigs: configsData.length,
        activeConfigs: configsData.filter(c => c.state === 1).length,
        provisioned: configsData.filter(c => c.state === 1).length,
        pending: configsData.filter(c => c.state === 0).length
      });
    } catch (error) {
      console.error('Failed to load bootstrap configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConfigs = configs.filter(config => {
    const matchesSearch = (config.name && config.name.toLowerCase().includes(filters.search.toLowerCase())) ||
                         (config.external_id && config.external_id.toLowerCase().includes(filters.search.toLowerCase()));
    const matchesState = filters.state === 'all' || 
                        (filters.state === 'active' && config.state === 1) ||
                        (filters.state === 'inactive' && config.state === 0);
    
    return matchesSearch && matchesState;
  });

  const handleCreateConfig = () => {
    setEditingConfig(null);
    setFormData({
      external_id: '',
      external_key: '',
      thing_id: '',
      channels: [],
      name: '',
      client_cert: '',
      client_key: '',
      ca_cert: '',
      content: ''
    });
    setShowModal(true);
  };

  const handleEditConfig = (config) => {
    setEditingConfig(config);
    setFormData({
      external_id: config.external_id || '',
      external_key: config.external_key || '',
      thing_id: config.thing_id || '',
      channels: config.channels || [],
      name: config.name || '',
      client_cert: config.client_cert || '',
      client_key: config.client_key || '',
      ca_cert: config.ca_cert || '',
      content: config.content || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const configData = {
        ...formData,
        channels: Array.isArray(formData.channels) ? formData.channels : 
                 formData.channels.split(',').map(ch => ch.trim()).filter(ch => ch)
      };

      if (editingConfig) {
        await magistralaApi.updateBootstrapConfig(editingConfig.thing_id, configData);
      } else {
        await magistralaApi.createBootstrapConfig(configData);
      }
      
      setShowModal(false);
      await loadConfigs();
    } catch (error) {
      console.error('Failed to save bootstrap config:', error);
      alert('Failed to save bootstrap configuration. Please try again.');
    }
  };

  const handleToggleConfig = async (configId, currentState) => {
    try {
      const newState = currentState === 1 ? 0 : 1;
      await magistralaApi.updateBootstrapConfig(configId, { state: newState });
      await loadConfigs();
    } catch (error) {
      console.error('Failed to toggle config state:', error);
      alert('Failed to toggle configuration state. Please try again.');
    }
  };

  const handleDeleteConfig = async (configId) => {
    if (!window.confirm('Are you sure you want to delete this bootstrap configuration? This action cannot be undone.')) {
      return;
    }

    try {
      await magistralaApi.deleteBootstrapConfig(configId);
      await loadConfigs();
    } catch (error) {
      console.error('Failed to delete config:', error);
      alert('Failed to delete bootstrap configuration. Please try again.');
    }
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
          <p style={{ marginTop: '1rem' }}>Loading bootstrap configurations...</p>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Bootstrap Service</Title>
        <ActionButton onClick={handleCreateConfig}>
          <FiPlus /> Create Configuration
        </ActionButton>
      </Header>

      <StatsGrid>
        <StatCard iconBg="linear-gradient(135deg, #10b981, #059669)">
          <div className="stat-icon">
            <FiServer />
          </div>
          <div className="stat-value">{stats.totalConfigs}</div>
          <div className="stat-label">Total Configs</div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #3b82f6, #2563eb)">
          <div className="stat-icon">
            <FiCheckCircle />
          </div>
          <div className="stat-value">{stats.activeConfigs}</div>
          <div className="stat-label">Active Configs</div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #f59e0b, #d97706)">
          <div className="stat-icon">
            <FiCpu />
          </div>
          <div className="stat-value">{stats.provisioned}</div>
          <div className="stat-label">Provisioned</div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #ef4444, #dc2626)">
          <div className="stat-icon">
            <FiWifi />
          </div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </StatCard>
      </StatsGrid>

      <FiltersSection>
        <FiltersGrid>
          <FilterGroup>
            <Label>Search Configurations</Label>
            <Input
              type="text"
              placeholder="Search by name or external ID..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </FilterGroup>
          
          <FilterGroup>
            <Label>State</Label>
            <Select
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            >
              <option value="all">All States</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </Select>
          </FilterGroup>
        </FiltersGrid>
      </FiltersSection>

      <ConfigsContainer>
        <ConfigsHeader>
          <ConfigsTitle>Device Configurations ({filteredConfigs.length})</ConfigsTitle>
        </ConfigsHeader>
        
        <ConfigsList>
          {filteredConfigs.length > 0 ? (
            filteredConfigs.map((config) => (
              <ConfigItem key={config.thing_id || config.external_id}>
                <ConfigHeader>
                  <ConfigInfo>
                    <ConfigName>{config.name || config.external_id}</ConfigName>
                    <ConfigDescription>
                      Zero-touch provisioning configuration for device {config.external_id}
                    </ConfigDescription>
                    <ConfigMeta>
                      <span>ID: {config.thing_id || 'N/A'}</span>
                      <span>External: {config.external_id}</span>
                      <span>Channels: {Array.isArray(config.channels) ? config.channels.length : 0}</span>
                      <span>Created: {formatTimestamp(config.created_at)}</span>
                    </ConfigMeta>
                  </ConfigInfo>
                  <ConfigActions>
                    <SmallActionButton onClick={() => handleEditConfig(config)}>
                      <FiEye />
                    </SmallActionButton>
                    <SmallActionButton onClick={() => handleEditConfig(config)}>
                      <FiEdit />
                    </SmallActionButton>
                    <SmallActionButton 
                      className={config.state === 1 ? 'state-active' : 'state-inactive'}
                      onClick={() => handleToggleConfig(config.thing_id, config.state)}
                    >
                      {config.state === 1 ? <FiCheckCircle /> : <FiXCircle />}
                    </SmallActionButton>
                    <SmallActionButton onClick={() => handleDeleteConfig(config.thing_id)}>
                      <FiTrash2 />
                    </SmallActionButton>
                  </ConfigActions>
                </ConfigHeader>

                <StatusIndicator>
                  <div className={`status-dot ${config.state === 1 ? 'active' : 'inactive'}`}></div>
                  <span className={`status-text ${config.state === 1 ? 'active' : 'inactive'}`}>
                    {config.state === 1 ? 'Active' : 'Inactive'}
                  </span>
                </StatusIndicator>

                <ConfigDetails>
                  <div className="detail-item">
                    <div className="detail-label">Thing ID</div>
                    <div className="detail-value">{config.thing_id || 'Not assigned'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">External Key</div>
                    <div className="detail-value">{config.external_key ? '••••••••' : 'Not set'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Client Certificate</div>
                    <div className="detail-value">{config.client_cert ? 'Configured' : 'Not configured'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Last Updated</div>
                    <div className="detail-value">{formatTimestamp(config.updated_at)}</div>
                  </div>
                </ConfigDetails>
              </ConfigItem>
            ))
          ) : (
            <EmptyState>
              <div className="empty-icon">
                <FiServer />
              </div>
              <div className="empty-title">No Bootstrap Configurations</div>
              <div className="empty-text">
                Create your first bootstrap configuration for zero-touch device provisioning
              </div>
            </EmptyState>
          )}
        </ConfigsList>
      </ConfigsContainer>

      {showModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <ModalContent>
            <h2>{editingConfig ? 'Edit Configuration' : 'Create Bootstrap Configuration'}</h2>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Configuration Name</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter configuration name"
                />
              </FormGroup>

              <FormGroup>
                <Label>External ID *</Label>
                <Input
                  type="text"
                  value={formData.external_id}
                  onChange={(e) => setFormData({ ...formData, external_id: e.target.value })}
                  required
                  placeholder="Device external identifier"
                />
              </FormGroup>

              <FormGroup>
                <Label>External Key *</Label>
                <Input
                  type="password"
                  value={formData.external_key}
                  onChange={(e) => setFormData({ ...formData, external_key: e.target.value })}
                  required
                  placeholder="Device authentication key"
                />
              </FormGroup>

              <FormGroup>
                <Label>Thing ID</Label>
                <Input
                  type="text"
                  value={formData.thing_id}
                  onChange={(e) => setFormData({ ...formData, thing_id: e.target.value })}
                  placeholder="Magistrala Thing ID (auto-assigned if empty)"
                />
              </FormGroup>

              <FormGroup>
                <Label>Channels</Label>
                <Input
                  type="text"
                  value={Array.isArray(formData.channels) ? formData.channels.join(', ') : formData.channels}
                  onChange={(e) => setFormData({ ...formData, channels: e.target.value })}
                  placeholder="Channel IDs (comma-separated)"
                />
              </FormGroup>

              <FormGroup>
                <Label>Client Certificate</Label>
                <TextArea
                  value={formData.client_cert}
                  onChange={(e) => setFormData({ ...formData, client_cert: e.target.value })}
                  placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                />
              </FormGroup>

              <FormGroup>
                <Label>Client Private Key</Label>
                <TextArea
                  value={formData.client_key}
                  onChange={(e) => setFormData({ ...formData, client_key: e.target.value })}
                  placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                />
              </FormGroup>

              <FormGroup>
                <Label>CA Certificate</Label>
                <TextArea
                  value={formData.ca_cert}
                  onChange={(e) => setFormData({ ...formData, ca_cert: e.target.value })}
                  placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                />
              </FormGroup>

              <FormGroup>
                <Label>Additional Content (JSON)</Label>
                <TextArea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder='{"custom_field": "value"}'
                />
              </FormGroup>

              <ButtonGroup>
                <Button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingConfig ? 'Update' : 'Create'} Configuration
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Bootstrap;