import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiDatabase, 
  FiHardDrive,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiSettings,
  FiRefreshCw,
  FiTrendingUp,
  FiPieChart,
  FiBarChart,
  FiActivity,
  FiClock,
  FiFolder,
  FiFile,
  FiArchive
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
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const DatasetCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: between;
  align-items: center;
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
`;

const DatasetList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const DatasetItem = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f7fafc;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    background-color: #f7fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const DatasetInfo = styled.div`
  flex: 1;
`;

const DatasetName = styled.div`
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
`;

const DatasetMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #718096;
  flex-wrap: wrap;
`;

const DatasetActions = styled.div`
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

const StorageChart = styled.div`
  height: 200px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #718096;
  font-size: 0.9rem;
  margin: 1rem 1.5rem;
`;

const ProgressBar = styled.div`
  background: #e2e8f0;
  border-radius: 10px;
  height: 8px;
  margin: 0.5rem 0;
  overflow: hidden;
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(135deg, #10b981, #059669);
    border-radius: 10px;
    transition: width 0.3s ease;
    width: ${props => props.percentage}%;
  }
`;

const BackupSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const BackupItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f7fafc;

  &:last-child {
    border-bottom: none;
  }
`;

const BackupInfo = styled.div`
  .backup-name {
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.25rem;
  }
  
  .backup-meta {
    font-size: 0.8rem;
    color: #718096;
  }
`;

const StatusBadge = styled.span`
  background: ${props => {
    switch (props.status) {
      case 'active': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'pending': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'failed': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      case 'archived': return 'linear-gradient(135deg, #6b7280, #4b5563)';
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

const DataStorage = () => {
  const [storageStats, setStorageStats] = useState({
    totalStorage: 0,
    usedStorage: 0,
    availableStorage: 0,
    totalDatasets: 0
  });

  const [datasets, setDatasets] = useState([]);
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock storage data
      const mockStorageStats = {
        totalStorage: 1024, // GB
        usedStorage: 387.5, // GB
        availableStorage: 636.5, // GB
        totalDatasets: 156
      };
      
      const mockDatasets = generateMockDatasets();
      const mockBackups = generateMockBackups();
      
      setStorageStats(mockStorageStats);
      setDatasets(mockDatasets);
      setBackups(mockBackups);
      
    } catch (error) {
      console.error('Failed to load storage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockDatasets = () => {
    const datasetTypes = ['sensor_data', 'device_logs', 'analytics', 'user_data', 'system_logs'];
    const statuses = ['active', 'archived', 'pending'];
    
    return Array.from({ length: 12 }, (_, i) => {
      const type = datasetTypes[Math.floor(Math.random() * datasetTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const size = Math.floor(Math.random() * 50 + 1); // GB
      const records = Math.floor(Math.random() * 1000000 + 10000);
      const lastUpdated = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      return {
        id: `dataset_${i + 1}`,
        name: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Dataset ${i + 1}`,
        type,
        status,
        size,
        records,
        lastUpdated: lastUpdated.toISOString(),
        tables: Math.floor(Math.random() * 10 + 1),
        retention: Math.floor(Math.random() * 365 + 30) // days
      };
    });
  };

  const generateMockBackups = () => {
    const backupTypes = ['full', 'incremental', 'differential'];
    const statuses = ['completed', 'running', 'failed', 'scheduled'];
    
    return Array.from({ length: 8 }, (_, i) => {
      const type = backupTypes[Math.floor(Math.random() * backupTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const size = Math.floor(Math.random() * 20 + 1); // GB
      const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      
      return {
        id: `backup_${i + 1}`,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Backup ${createdAt.toLocaleDateString()}`,
        type,
        status,
        size,
        createdAt: createdAt.toISOString(),
        duration: Math.floor(Math.random() * 120 + 5) // minutes
      };
    });
  };

  const formatBytes = (gb) => {
    if (gb >= 1024) {
      return `${(gb / 1024).toFixed(1)} TB`;
    }
    return `${gb.toFixed(1)} GB`;
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleDownloadDataset = (dataset) => {
    alert(`Downloading dataset: ${dataset.name}\nSize: ${formatBytes(dataset.size)}\nThis would start a dataset export process.`);
  };

  const handleDeleteDataset = (datasetId) => {
    if (window.confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) {
      setDatasets(prev => prev.filter(d => d.id !== datasetId));
    }
  };

  const handleCreateBackup = () => {
    alert('Creating new backup...\nThis would start a full system backup process.');
  };

  const handleRestoreBackup = (backup) => {
    if (window.confirm(`Restore from backup: ${backup.name}?\nThis will restore the system to the state from ${formatDate(backup.createdAt)}.`)) {
      alert('Backup restoration started. This process may take several minutes.');
    }
  };

  const storagePercentage = (storageStats.usedStorage / storageStats.totalStorage) * 100;

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <FiRefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem' }}>Loading storage data...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Data Storage & Management</Title>
        <ActionButtons>
          <ActionButton variant="secondary" onClick={() => loadStorageData()}>
            <FiRefreshCw /> Refresh
          </ActionButton>
          <ActionButton variant="secondary" onClick={handleCreateBackup}>
            <FiUpload /> Create Backup
          </ActionButton>
          <ActionButton>
            <FiSettings /> Storage Settings
          </ActionButton>
        </ActionButtons>
      </Header>

      <StatsGrid>
        <StatCard iconBg="linear-gradient(135deg, #10b981, #059669)">
          <div className="stat-icon">
            <FiHardDrive />
          </div>
          <div className="stat-value">{formatBytes(storageStats.totalStorage)}</div>
          <div className="stat-label">Total Storage</div>
          <div className="stat-change positive">
            <FiTrendingUp size={12} /> 20% increase this month
          </div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #3b82f6, #2563eb)">
          <div className="stat-icon">
            <FiDatabase />
          </div>
          <div className="stat-value">{formatBytes(storageStats.usedStorage)}</div>
          <div className="stat-label">Used Storage</div>
          <ProgressBar percentage={storagePercentage}>
            <div className="progress-fill"></div>
          </ProgressBar>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #f59e0b, #d97706)">
          <div className="stat-icon">
            <FiFolder />
          </div>
          <div className="stat-value">{storageStats.totalDatasets}</div>
          <div className="stat-label">Total Datasets</div>
          <div className="stat-change positive">
            <FiTrendingUp size={12} /> +12 this week
          </div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #8b5cf6, #7c3aed)">
          <div className="stat-icon">
            <FiArchive />
          </div>
          <div className="stat-value">{formatBytes(storageStats.availableStorage)}</div>
          <div className="stat-label">Available Storage</div>
          <div className="stat-change positive">
            <FiActivity size={12} /> {(100 - storagePercentage).toFixed(1)}% free
          </div>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <DatasetCard>
          <CardHeader>
            <CardTitle>Active Datasets</CardTitle>
          </CardHeader>
          <DatasetList>
            {datasets.map(dataset => (
              <DatasetItem key={dataset.id}>
                <DatasetInfo>
                  <DatasetName>{dataset.name}</DatasetName>
                  <DatasetMeta>
                    <span><StatusBadge status={dataset.status}>{dataset.status}</StatusBadge></span>
                    <span><FiDatabase size={12} /> {formatBytes(dataset.size)}</span>
                    <span><FiBarChart size={12} /> {formatNumber(dataset.records)} records</span>
                    <span><FiClock size={12} /> Updated {formatDate(dataset.lastUpdated)}</span>
                    <span>{dataset.tables} tables</span>
                    <span>Retention: {dataset.retention} days</span>
                  </DatasetMeta>
                </DatasetInfo>
                <DatasetActions>
                  <SmallActionButton onClick={() => handleDownloadDataset(dataset)}>
                    <FiDownload />
                  </SmallActionButton>
                  <SmallActionButton onClick={() => handleDeleteDataset(dataset.id)}>
                    <FiTrash2 />
                  </SmallActionButton>
                </DatasetActions>
              </DatasetItem>
            ))}
          </DatasetList>
        </DatasetCard>

        <div>
          <BackupSection>
            <CardHeader style={{ padding: '0 0 1rem 0', border: 'none' }}>
              <CardTitle>Storage Usage</CardTitle>
            </CardHeader>
            <StorageChart>
              <FiPieChart size={48} />
              <div style={{ marginLeft: '1rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2d3748' }}>
                  {storagePercentage.toFixed(1)}%
                </div>
                <div>Storage Used</div>
              </div>
            </StorageChart>
          </BackupSection>

          <BackupSection style={{ marginTop: '2rem' }}>
            <CardHeader style={{ padding: '0 0 1rem 0', border: 'none' }}>
              <CardTitle>Recent Backups</CardTitle>
            </CardHeader>
            {backups.slice(0, 5).map(backup => (
              <BackupItem key={backup.id}>
                <BackupInfo>
                  <div className="backup-name">{backup.name}</div>
                  <div className="backup-meta">
                    <StatusBadge status={backup.status}>{backup.status}</StatusBadge>
                    {' • '}
                    {formatBytes(backup.size)}
                    {' • '}
                    {formatDate(backup.createdAt)}
                    {' • '}
                    {backup.duration}min
                  </div>
                </BackupInfo>
                <DatasetActions>
                  <SmallActionButton onClick={() => handleRestoreBackup(backup)}>
                    <FiUpload />
                  </SmallActionButton>
                  <SmallActionButton onClick={() => handleDownloadDataset(backup)}>
                    <FiDownload />
                  </SmallActionButton>
                </DatasetActions>
              </BackupItem>
            ))}
          </BackupSection>
        </div>
      </ContentGrid>
    </Container>
  );
};

export default DataStorage;