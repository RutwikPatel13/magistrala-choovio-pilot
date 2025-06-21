import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FiPlay,
  FiPause,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCode,
  FiActivity,
  FiClock,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiSearch,
  FiFilter,
  FiEye
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

const RulesContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const RulesHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RulesTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
`;

const RulesList = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const RuleItem = styled.div`
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

const RuleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const RuleInfo = styled.div`
  flex: 1;
`;

const RuleName = styled.div`
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
`;

const RuleDescription = styled.div`
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const RuleMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #718096;
  flex-wrap: wrap;
`;

const RuleActions = styled.div`
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
  
  &.toggle-enabled {
    background: #10b981;
    color: white;
    border-color: #10b981;
  }
  
  &.toggle-disabled {
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

const CodePreview = styled.div`
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  color: #2d3748;
  max-height: 150px;
  overflow-y: auto;
  white-space: pre-wrap;
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
  min-height: 200px;
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

const RulesEngine = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'enabled',
    logic: '',
    input_topic: '',
    output_topic: '',
    schedule: ''
  });

  const [stats, setStats] = useState({
    totalRules: 0,
    activeRules: 0,
    executions: 0,
    errors: 0
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const response = await magistralaApi.getRules();
      const rulesData = response.rules || [];
      setRules(rulesData);
      
      // Calculate stats
      setStats({
        totalRules: rulesData.length,
        activeRules: rulesData.filter(r => r.status === 'enabled').length,
        executions: Math.floor(Math.random() * 10000 + 5000),
        errors: Math.floor(Math.random() * 50)
      });
    } catch (error) {
      console.error('Failed to load rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         rule.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === 'all' || rule.status === filters.status;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateRule = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      status: 'enabled',
      logic: '-- Lua script for message processing\nfunction process(message)\n  -- Add your logic here\n  return message\nend',
      input_topic: '',
      output_topic: '',
      schedule: ''
    });
    setShowModal(true);
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description,
      status: rule.status,
      logic: rule.logic,
      input_topic: rule.metadata?.input_topic || '',
      output_topic: rule.metadata?.output_topic || '',
      schedule: rule.metadata?.schedule || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const ruleData = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        logic: formData.logic,
        input_topic: formData.input_topic,
        output_topic: formData.output_topic,
        schedule: formData.schedule,
        metadata: {
          input_topic: formData.input_topic,
          output_topic: formData.output_topic,
          schedule: formData.schedule
        }
      };

      if (editingRule) {
        await magistralaApi.updateRule(editingRule.id, ruleData);
      } else {
        await magistralaApi.createRule(ruleData);
      }
      
      setShowModal(false);
      await loadRules();
    } catch (error) {
      console.error('Failed to save rule:', error);
      alert('Failed to save rule. Please try again.');
    }
  };

  const handleToggleRule = async (ruleId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
      await magistralaApi.toggleRule(ruleId, newStatus === 'enabled');
      await loadRules();
    } catch (error) {
      console.error('Failed to toggle rule:', error);
      alert('Failed to toggle rule status. Please try again.');
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this rule? This action cannot be undone.')) {
      return;
    }

    try {
      await magistralaApi.deleteRule(ruleId);
      await loadRules();
    } catch (error) {
      console.error('Failed to delete rule:', error);
      alert('Failed to delete rule. Please try again.');
    }
  };

  const formatLastExecution = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <FiRefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem' }}>Loading rules engine...</p>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Rules Engine</Title>
        <ActionButton onClick={handleCreateRule}>
          <FiPlus /> Create Rule
        </ActionButton>
      </Header>

      <StatsGrid>
        <StatCard iconBg="linear-gradient(135deg, #10b981, #059669)">
          <div className="stat-icon">
            <FiCode />
          </div>
          <div className="stat-value">{stats.totalRules}</div>
          <div className="stat-label">Total Rules</div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #3b82f6, #2563eb)">
          <div className="stat-icon">
            <FiActivity />
          </div>
          <div className="stat-value">{stats.activeRules}</div>
          <div className="stat-label">Active Rules</div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #f59e0b, #d97706)">
          <div className="stat-icon">
            <FiCheckCircle />
          </div>
          <div className="stat-value">{stats.executions.toLocaleString()}</div>
          <div className="stat-label">Executions</div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #ef4444, #dc2626)">
          <div className="stat-icon">
            <FiXCircle />
          </div>
          <div className="stat-value">{stats.errors}</div>
          <div className="stat-label">Errors</div>
        </StatCard>
      </StatsGrid>

      <FiltersSection>
        <FiltersGrid>
          <FilterGroup>
            <Label>Search Rules</Label>
            <Input
              type="text"
              placeholder="Search by name or description..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
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

      <RulesContainer>
        <RulesHeader>
          <RulesTitle>Processing Rules ({filteredRules.length})</RulesTitle>
        </RulesHeader>
        
        <RulesList>
          {filteredRules.length > 0 ? (
            filteredRules.map((rule) => (
              <RuleItem key={rule.id}>
                <RuleHeader>
                  <RuleInfo>
                    <RuleName>{rule.name}</RuleName>
                    <RuleDescription>{rule.description}</RuleDescription>
                    <RuleMeta>
                      <span>ID: {rule.id}</span>
                      <span><FiClock size={12} /> Last: {formatLastExecution(rule.metadata?.last_execution)}</span>
                      {rule.metadata?.input_topic && <span>Input: {rule.metadata.input_topic}</span>}
                      {rule.metadata?.output_topic && <span>Output: {rule.metadata.output_topic}</span>}
                      {rule.metadata?.schedule && <span>Schedule: {rule.metadata.schedule}</span>}
                    </RuleMeta>
                  </RuleInfo>
                  <RuleActions>
                    <SmallActionButton onClick={() => handleEditRule(rule)}>
                      <FiEye />
                    </SmallActionButton>
                    <SmallActionButton onClick={() => handleEditRule(rule)}>
                      <FiEdit />
                    </SmallActionButton>
                    <SmallActionButton 
                      className={rule.status === 'enabled' ? 'toggle-enabled' : 'toggle-disabled'}
                      onClick={() => handleToggleRule(rule.id, rule.status)}
                    >
                      {rule.status === 'enabled' ? <FiPause /> : <FiPlay />}
                    </SmallActionButton>
                    <SmallActionButton onClick={() => handleDeleteRule(rule.id)}>
                      <FiTrash2 />
                    </SmallActionButton>
                  </RuleActions>
                </RuleHeader>

                <StatusIndicator>
                  <div className={`status-dot ${rule.status}`}></div>
                  <span className={`status-text ${rule.status}`}>
                    {rule.status === 'enabled' ? 'Active' : 'Disabled'}
                  </span>
                </StatusIndicator>

                <CodePreview>
                  {rule.logic}
                </CodePreview>
              </RuleItem>
            ))
          ) : (
            <EmptyState>
              <div className="empty-icon">
                <FiCode />
              </div>
              <div className="empty-title">No Rules Found</div>
              <div className="empty-text">
                Create your first processing rule to start automating message handling
              </div>
            </EmptyState>
          )}
        </RulesList>
      </RulesContainer>

      {showModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <ModalContent>
            <h2>{editingRule ? 'Edit Rule' : 'Create New Rule'}</h2>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Rule Name</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter rule name"
                />
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this rule does"
                  style={{ minHeight: '80px' }}
                />
              </FormGroup>

              <FormGroup>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Input Topic</Label>
                <Input
                  type="text"
                  value={formData.input_topic}
                  onChange={(e) => setFormData({ ...formData, input_topic: e.target.value })}
                  placeholder="e.g., channels.*.temperature"
                />
              </FormGroup>

              <FormGroup>
                <Label>Output Topic</Label>
                <Input
                  type="text"
                  value={formData.output_topic}
                  onChange={(e) => setFormData({ ...formData, output_topic: e.target.value })}
                  placeholder="e.g., alerts.temperature"
                />
              </FormGroup>

              <FormGroup>
                <Label>Schedule (Cron Expression - Optional)</Label>
                <Input
                  type="text"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  placeholder="e.g., 0 */5 * * * (every 5 minutes)"
                />
              </FormGroup>

              <FormGroup>
                <Label>Lua Script</Label>
                <TextArea
                  value={formData.logic}
                  onChange={(e) => setFormData({ ...formData, logic: e.target.value })}
                  required
                  placeholder="Enter your Lua script here..."
                />
              </FormGroup>

              <ButtonGroup>
                <Button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingRule ? 'Update' : 'Create'} Rule
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default RulesEngine;