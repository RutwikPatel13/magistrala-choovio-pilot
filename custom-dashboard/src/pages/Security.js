import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiShield, 
  FiKey,
  FiLock,
  FiEye,
  FiEyeOff,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiSettings,
  FiActivity,
  FiClock,
  FiUser,
  FiGlobe,
  FiServer,
  FiDatabase,
  FiWifi
} from 'react-icons/fi';

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
    display: flex;
    align-items: center;
    gap: 0.25rem;
    
    &.positive {
      color: #10b981;
    }
    
    &.negative {
      color: #ef4444;
    }
    
    &.warning {
      color: #f59e0b;
    }
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
`;

const SectionContent = styled.div`
  padding: 1.5rem;
`;

const SecurityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f7fafc;

  &:last-child {
    border-bottom: none;
  }
`;

const SecurityItemInfo = styled.div`
  flex: 1;
  
  .item-title {
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.25rem;
  }
  
  .item-description {
    font-size: 0.8rem;
    color: #718096;
  }
`;

const SecurityItemStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusIndicator = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  font-weight: 500;
  
  &.secure {
    color: #10b981;
  }
  
  &.warning {
    color: #f59e0b;
  }
  
  &.danger {
    color: #ef4444;
  }
`;

const Toggle = styled.button`
  background: ${props => props.enabled ? '#10b981' : '#cbd5e0'};
  border: none;
  border-radius: 12px;
  width: 40px;
  height: 20px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.enabled ? '22px' : '2px'};
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    transition: left 0.2s;
  }
`;

const LogsList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const LogItem = styled.div`
  padding: 0.75rem 0;
  border-bottom: 1px solid #f7fafc;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  &:last-child {
    border-bottom: none;
  }
`;

const LogInfo = styled.div`
  flex: 1;
  
  .log-action {
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.25rem;
  }
  
  .log-details {
    font-size: 0.8rem;
    color: #718096;
  }
`;

const LogMeta = styled.div`
  font-size: 0.8rem;
  color: #718096;
  text-align: right;
`;

const Alert = styled.div`
  background: ${props => {
    switch (props.type) {
      case 'success': return 'linear-gradient(135deg, #d1fae5, #a7f3d0)';
      case 'warning': return 'linear-gradient(135deg, #fef3c7, #fde68a)';
      case 'error': return 'linear-gradient(135deg, #fee2e2, #fecaca)';
      default: return 'linear-gradient(135deg, #dbeafe, #bfdbfe)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.type) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#3b82f6';
    }
  }};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const APIKeyCard = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const APIKeyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const APIKeyName = styled.div`
  font-weight: 600;
  color: #2d3748;
`;

const APIKeyValue = styled.div`
  font-family: monospace;
  background: #f7fafc;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #4a5568;
  margin-bottom: 0.5rem;
  word-break: break-all;
`;

const APIKeyMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #718096;
`;

const Security = () => {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    ipWhitelisting: false,
    sessionTimeout: true,
    auditLogging: true,
    encryptionAtRest: true,
    apiRateLimit: true
  });

  const [apiKeys, setApiKeys] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState({});

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock data
      setApiKeys(generateMockApiKeys());
      setSecurityLogs(generateMockSecurityLogs());
      
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockApiKeys = () => {
    return [
      {
        id: 'key_1',
        name: 'Production API Key',
        key: 'mg_api_prod_abcd1234567890efghijklmnopqrstuvwxyz',
        permissions: ['read', 'write'],
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'key_2',
        name: 'Development API Key',
        key: 'mg_api_dev_xyz9876543210fedcba0987654321abcdef',
        permissions: ['read'],
        lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'key_3',
        name: 'Mobile App Key',
        key: 'mg_api_mobile_123abc456def789ghi012jkl345mno678',
        permissions: ['read', 'write', 'devices'],
        lastUsed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  };

  const generateMockSecurityLogs = () => {
    const actions = [
      'User login successful',
      'Failed login attempt',
      'API key created',
      'Password changed',
      'Two-factor authentication enabled',
      'Device connected',
      'Unauthorized access attempt',
      'Session expired',
      'API rate limit exceeded',
      'Security settings updated'
    ];
    
    return Array.from({ length: 20 }, (_, i) => {
      const action = actions[Math.floor(Math.random() * actions.length)];
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const ipAddress = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';
      
      return {
        id: `log_${i + 1}`,
        action,
        timestamp: timestamp.toISOString(),
        ipAddress,
        userAgent,
        userId: `user_${Math.floor(Math.random() * 10 + 1)}`,
        severity: action.includes('Failed') || action.includes('Unauthorized') ? 'high' : 
                 action.includes('rate limit') ? 'medium' : 'low'
      };
    });
  };

  const handleToggleSetting = (setting) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleToggleApiKeyVisibility = (keyId) => {
    setShowApiKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const handleRevokeApiKey = (keyId) => {
    if (window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
    }
  };

  const handleGenerateApiKey = () => {
    const newKey = {
      id: `key_${Date.now()}`,
      name: 'New API Key',
      key: `mg_api_new_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      permissions: ['read'],
      lastUsed: null,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    setApiKeys(prev => [...prev, newKey]);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const maskApiKey = (key) => {
    if (key.length <= 8) return key;
    return key.substring(0, 8) + '*'.repeat(key.length - 16) + key.substring(key.length - 8);
  };

  const secureCount = Object.values(securitySettings).filter(Boolean).length;
  const totalSettings = Object.keys(securitySettings).length;
  const securityScore = Math.round((secureCount / totalSettings) * 100);

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <FiRefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem' }}>Loading security data...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Security & Access Control</Title>
        <ActionButtons>
          <ActionButton variant="secondary" onClick={() => loadSecurityData()}>
            <FiRefreshCw /> Refresh
          </ActionButton>
          <ActionButton variant="secondary" onClick={handleGenerateApiKey}>
            <FiKey /> Generate API Key
          </ActionButton>
          <ActionButton>
            <FiSettings /> Security Settings
          </ActionButton>
        </ActionButtons>
      </Header>

      <StatsGrid>
        <StatCard iconBg="linear-gradient(135deg, #10b981, #059669)">
          <div className="stat-icon">
            <FiShield />
          </div>
          <div className="stat-value">{securityScore}%</div>
          <div className="stat-label">Security Score</div>
          <div className={`stat-change ${securityScore >= 80 ? 'positive' : 'warning'}`}>
            {securityScore >= 80 ? <FiCheckCircle size={12} /> : <FiAlertTriangle size={12} />}
            {securityScore >= 80 ? 'Strong security' : 'Needs attention'}
          </div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #3b82f6, #2563eb)">
          <div className="stat-icon">
            <FiKey />
          </div>
          <div className="stat-value">{apiKeys.length}</div>
          <div className="stat-label">Active API Keys</div>
          <div className="stat-change positive">
            <FiActivity size={12} /> All monitored
          </div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #f59e0b, #d97706)">
          <div className="stat-icon">
            <FiAlertTriangle />
          </div>
          <div className="stat-value">{securityLogs.filter(log => log.severity === 'high').length}</div>
          <div className="stat-label">Security Alerts</div>
          <div className="stat-change warning">
            <FiClock size={12} /> Last 7 days
          </div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #8b5cf6, #7c3aed)">
          <div className="stat-icon">
            <FiDatabase />
          </div>
          <div className="stat-value">{securityLogs.length}</div>
          <div className="stat-label">Audit Logs</div>
          <div className="stat-change positive">
            <FiActivity size={12} /> Real-time monitoring
          </div>
        </StatCard>
      </StatsGrid>

      {securityScore < 80 && (
        <Alert type="warning">
          <FiAlertTriangle />
          Your security score is below recommended levels. Consider enabling additional security features.
        </Alert>
      )}

      <ContentGrid>
        <Section>
          <SectionHeader>
            <SectionTitle>Security Settings</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <SecurityItem>
              <SecurityItemInfo>
                <div className="item-title">Two-Factor Authentication</div>
                <div className="item-description">Add an extra layer of security to user accounts</div>
              </SecurityItemInfo>
              <SecurityItemStatus>
                <StatusIndicator className={securitySettings.twoFactorAuth ? 'secure' : 'warning'}>
                  {securitySettings.twoFactorAuth ? <FiCheckCircle size={16} /> : <FiXCircle size={16} />}
                  {securitySettings.twoFactorAuth ? 'Enabled' : 'Disabled'}
                </StatusIndicator>
                <Toggle 
                  enabled={securitySettings.twoFactorAuth}
                  onClick={() => handleToggleSetting('twoFactorAuth')}
                />
              </SecurityItemStatus>
            </SecurityItem>

            <SecurityItem>
              <SecurityItemInfo>
                <div className="item-title">IP Whitelisting</div>
                <div className="item-description">Restrict access to specific IP addresses</div>
              </SecurityItemInfo>
              <SecurityItemStatus>
                <StatusIndicator className={securitySettings.ipWhitelisting ? 'secure' : 'warning'}>
                  {securitySettings.ipWhitelisting ? <FiCheckCircle size={16} /> : <FiXCircle size={16} />}
                  {securitySettings.ipWhitelisting ? 'Enabled' : 'Disabled'}
                </StatusIndicator>
                <Toggle 
                  enabled={securitySettings.ipWhitelisting}
                  onClick={() => handleToggleSetting('ipWhitelisting')}
                />
              </SecurityItemStatus>
            </SecurityItem>

            <SecurityItem>
              <SecurityItemInfo>
                <div className="item-title">Session Timeout</div>
                <div className="item-description">Automatically logout inactive users</div>
              </SecurityItemInfo>
              <SecurityItemStatus>
                <StatusIndicator className={securitySettings.sessionTimeout ? 'secure' : 'warning'}>
                  {securitySettings.sessionTimeout ? <FiCheckCircle size={16} /> : <FiXCircle size={16} />}
                  {securitySettings.sessionTimeout ? 'Enabled' : 'Disabled'}
                </StatusIndicator>
                <Toggle 
                  enabled={securitySettings.sessionTimeout}
                  onClick={() => handleToggleSetting('sessionTimeout')}
                />
              </SecurityItemStatus>
            </SecurityItem>

            <SecurityItem>
              <SecurityItemInfo>
                <div className="item-title">Audit Logging</div>
                <div className="item-description">Log all security-related events</div>
              </SecurityItemInfo>
              <SecurityItemStatus>
                <StatusIndicator className={securitySettings.auditLogging ? 'secure' : 'danger'}>
                  {securitySettings.auditLogging ? <FiCheckCircle size={16} /> : <FiXCircle size={16} />}
                  {securitySettings.auditLogging ? 'Enabled' : 'Disabled'}
                </StatusIndicator>
                <Toggle 
                  enabled={securitySettings.auditLogging}
                  onClick={() => handleToggleSetting('auditLogging')}
                />
              </SecurityItemStatus>
            </SecurityItem>

            <SecurityItem>
              <SecurityItemInfo>
                <div className="item-title">Encryption at Rest</div>
                <div className="item-description">Encrypt data stored in databases</div>
              </SecurityItemInfo>
              <SecurityItemStatus>
                <StatusIndicator className={securitySettings.encryptionAtRest ? 'secure' : 'danger'}>
                  {securitySettings.encryptionAtRest ? <FiCheckCircle size={16} /> : <FiXCircle size={16} />}
                  {securitySettings.encryptionAtRest ? 'Enabled' : 'Disabled'}
                </StatusIndicator>
                <Toggle 
                  enabled={securitySettings.encryptionAtRest}
                  onClick={() => handleToggleSetting('encryptionAtRest')}
                />
              </SecurityItemStatus>
            </SecurityItem>

            <SecurityItem>
              <SecurityItemInfo>
                <div className="item-title">API Rate Limiting</div>
                <div className="item-description">Prevent API abuse with rate limiting</div>
              </SecurityItemInfo>
              <SecurityItemStatus>
                <StatusIndicator className={securitySettings.apiRateLimit ? 'secure' : 'warning'}>
                  {securitySettings.apiRateLimit ? <FiCheckCircle size={16} /> : <FiXCircle size={16} />}
                  {securitySettings.apiRateLimit ? 'Enabled' : 'Disabled'}
                </StatusIndicator>
                <Toggle 
                  enabled={securitySettings.apiRateLimit}
                  onClick={() => handleToggleSetting('apiRateLimit')}
                />
              </SecurityItemStatus>
            </SecurityItem>
          </SectionContent>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>API Key Management</SectionTitle>
          </SectionHeader>
          <SectionContent>
            {apiKeys.map(apiKey => (
              <APIKeyCard key={apiKey.id}>
                <APIKeyHeader>
                  <APIKeyName>{apiKey.name}</APIKeyName>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <ActionButton 
                      variant="secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      onClick={() => handleToggleApiKeyVisibility(apiKey.id)}
                    >
                      {showApiKey[apiKey.id] ? <FiEyeOff size={12} /> : <FiEye size={12} />}
                    </ActionButton>
                    <ActionButton 
                      variant="secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: '#ef4444' }}
                      onClick={() => handleRevokeApiKey(apiKey.id)}
                    >
                      Revoke
                    </ActionButton>
                  </div>
                </APIKeyHeader>
                <APIKeyValue>
                  {showApiKey[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                </APIKeyValue>
                <APIKeyMeta>
                  <span>Permissions: {apiKey.permissions.join(', ')}</span>
                  <span>Last used: {apiKey.lastUsed ? formatTimestamp(apiKey.lastUsed) : 'Never'}</span>
                </APIKeyMeta>
                <APIKeyMeta>
                  <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                  <span>Expires: {new Date(apiKey.expiresAt).toLocaleDateString()}</span>
                </APIKeyMeta>
              </APIKeyCard>
            ))}
          </SectionContent>
        </Section>
      </ContentGrid>

      <Section>
        <SectionHeader>
          <SectionTitle>Security Audit Log</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <LogsList>
            {securityLogs.slice(0, 10).map(log => (
              <LogItem key={log.id}>
                <LogInfo>
                  <div className="log-action">
                    {log.severity === 'high' && <FiAlertTriangle style={{ color: '#ef4444', marginRight: '0.5rem' }} />}
                    {log.action}
                  </div>
                  <div className="log-details">
                    <FiUser size={12} /> User: {log.userId} • 
                    <FiGlobe size={12} /> IP: {log.ipAddress}
                  </div>
                </LogInfo>
                <LogMeta>
                  <div>{formatTimestamp(log.timestamp)}</div>
                  <div style={{ color: log.severity === 'high' ? '#ef4444' : log.severity === 'medium' ? '#f59e0b' : '#10b981' }}>
                    {log.severity.toUpperCase()}
                  </div>
                </LogMeta>
              </LogItem>
            ))}
          </LogsList>
        </SectionContent>
      </Section>
    </Container>
  );
};

export default Security;