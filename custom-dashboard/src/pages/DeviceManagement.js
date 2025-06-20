import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiPlus, 
  FiSearch, 
  FiFilter,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiWifi,
  FiWifiOff
} from 'react-icons/fi';

const DeviceContainer = styled.div`
  padding: 0;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h1 {
    color: white;
    font-size: 2rem;
  }
  
  .header-actions {
    display: flex;
    gap: 1rem;
  }
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    background: white;
    transform: translateY(-2px);
  }
  
  &.primary {
    background: ${props => props.theme.primary};
    color: white;
    
    &:hover {
      background: ${props => props.theme.secondary};
    }
  }
`;

const FilterSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
  
  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.3s ease;
    
    &:focus {
      border-color: ${props => props.theme.primary};
    }
  }
  
  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  cursor: pointer;
  
  &:focus {
    border-color: ${props => props.theme.primary};
  }
`;

const DeviceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const DeviceCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
  }
  
  .device-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
  
  .device-info {
    flex: 1;
  }
  
  .device-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: ${props => props.theme.text};
    margin-bottom: 0.25rem;
  }
  
  .device-id {
    font-size: 0.8rem;
    color: #666;
    font-family: monospace;
  }
  
  .device-actions {
    position: relative;
  }
  
  .status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 1rem 0;
    
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      
      &.online {
        background: #2ecc71;
      }
      
      &.offline {
        background: #e74c3c;
      }
    }
    
    .status-text {
      font-size: 0.9rem;
      font-weight: 500;
      
      &.online {
        color: #2ecc71;
      }
      
      &.offline {
        color: #e74c3c;
      }
    }
  }
  
  .device-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .stat-item {
    text-align: center;
    
    .stat-value {
      font-size: 1.2rem;
      font-weight: bold;
      color: ${props => props.theme.primary};
    }
    
    .stat-label {
      font-size: 0.8rem;
      color: #666;
      margin-top: 2px;
    }
  }
`;

const ActionMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 0.5rem 0;
  min-width: 150px;
  z-index: 1000;
  
  .menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
    
    &:hover {
      background: #f8f9fa;
    }
    
    &.danger {
      color: #e74c3c;
      
      &:hover {
        background: #fdf2f2;
      }
    }
  }
`;

const DeviceManagement = () => {
  const [devices, setDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    const mockDevices = [
      {
        id: 'dev_001',
        name: 'Temperature Sensor A1',
        type: 'sensor',
        status: 'online',
        lastSeen: '2 minutes ago',
        messagesCount: 1247,
        batteryLevel: 85
      },
      {
        id: 'dev_002', 
        name: 'Smart Thermostat',
        type: 'actuator',
        status: 'online',
        lastSeen: '5 minutes ago',
        messagesCount: 892,
        batteryLevel: 92
      },
      {
        id: 'dev_003',
        name: 'Humidity Monitor B2',
        type: 'sensor',
        status: 'offline',
        lastSeen: '2 hours ago',
        messagesCount: 456,
        batteryLevel: 23
      },
      {
        id: 'dev_004',
        name: 'Light Controller',
        type: 'actuator',
        status: 'online',
        lastSeen: '1 minute ago',
        messagesCount: 2134,
        batteryLevel: 78
      },
      {
        id: 'dev_005',
        name: 'Motion Detector C1',
        type: 'sensor',
        status: 'online',
        lastSeen: '3 minutes ago',
        messagesCount: 634,
        batteryLevel: 91
      },
      {
        id: 'dev_006',
        name: 'Air Quality Monitor',
        type: 'sensor',
        status: 'offline',
        lastSeen: '1 day ago',
        messagesCount: 178,
        batteryLevel: 12
      }
    ];

    setDevices(mockDevices);
  }, []);

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleMenuToggle = (deviceId) => {
    setActiveMenu(activeMenu === deviceId ? null : deviceId);
  };

  return (
    <DeviceContainer>
      <PageHeader>
        <h1>Device Management</h1>
        <div className="header-actions">
          <ActionButton>
            <FiFilter size={16} />
            Advanced Filters
          </ActionButton>
          <ActionButton className="primary">
            <FiPlus size={16} />
            Add Device
          </ActionButton>
        </div>
      </PageHeader>

      <FilterSection>
        <SearchInput>
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search devices by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchInput>
        
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Devices</option>
          <option value="online">Online Only</option>
          <option value="offline">Offline Only</option>
        </FilterSelect>
      </FilterSection>

      <DeviceGrid>
        {filteredDevices.map((device) => (
          <DeviceCard key={device.id}>
            <div className="device-header">
              <div className="device-info">
                <div className="device-name">{device.name}</div>
                <div className="device-id">{device.id}</div>
              </div>
              <div className="device-actions">
                <ActionButton onClick={() => handleMenuToggle(device.id)}>
                  <FiMoreVertical size={16} />
                </ActionButton>
                {activeMenu === device.id && (
                  <ActionMenu>
                    <div className="menu-item">
                      <FiEdit size={14} />
                      Edit Device
                    </div>
                    <div className="menu-item">
                      {device.status === 'online' ? <FiWifiOff size={14} /> : <FiWifi size={14} />}
                      {device.status === 'online' ? 'Disconnect' : 'Connect'}
                    </div>
                    <div className="menu-item danger">
                      <FiTrash2 size={14} />
                      Delete Device
                    </div>
                  </ActionMenu>
                )}
              </div>
            </div>

            <div className="status-indicator">
              <div className={`status-dot ${device.status}`}></div>
              <span className={`status-text ${device.status}`}>
                {device.status === 'online' ? 'Online' : 'Offline'}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#666' }}>
                {device.lastSeen}
              </span>
            </div>

            <div className="device-stats">
              <div className="stat-item">
                <div className="stat-value">{device.messagesCount}</div>
                <div className="stat-label">Messages</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{device.batteryLevel}%</div>
                <div className="stat-label">Battery</div>
              </div>
            </div>
          </DeviceCard>
        ))}
      </DeviceGrid>
    </DeviceContainer>
  );
};

export default DeviceManagement;