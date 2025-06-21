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
  FiWifiOff,
  FiBattery,
  FiActivity,
  FiMapPin,
  FiSettings,
  FiRadio
} from 'react-icons/fi';
import magistralaApi from '../services/magistralaApi';

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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeMenu, setActiveMenu] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'sensor',
    protocol: 'mqtt',
    location: '',
    devEUI: '',
    appEUI: '',
    appKey: ''
  });

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const response = await magistralaApi.getDevices();
      setDevices(response.clients || []);
    } catch (error) {
      console.error('Failed to load devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    const matchesType = typeFilter === 'all' || device.metadata?.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAddDevice = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a device name');
      return;
    }

    try {
      setAddLoading(true);
      console.log('Adding device:', formData);
      
      if (formData.type === 'lorawan') {
        const result = await magistralaApi.createLoRaWANDevice({
          name: formData.name,
          devEUI: formData.devEUI,
          appEUI: formData.appEUI,
          appKey: formData.appKey,
          location: formData.location
        });
        console.log('LoRaWAN device created:', result);
      } else {
        const result = await magistralaApi.createDevice({
          name: formData.name,
          type: formData.type,
          protocol: formData.protocol,
          location: formData.location
        });
        console.log('Device created:', result);
      }
      
      setShowAddModal(false);
      setFormData({
        name: '',
        type: 'sensor',
        protocol: 'mqtt',
        location: '',
        devEUI: '',
        appEUI: '',
        appKey: ''
      });
      await loadDevices();
      console.log('Device added successfully');
    } catch (error) {
      console.error('Failed to add device:', error);
      alert('Failed to add device. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditDevice = (device) => {
    setEditingDevice(device);
    setFormData({
      name: device.name,
      type: device.metadata?.type || 'sensor',
      protocol: device.metadata?.protocol || 'mqtt',
      location: device.metadata?.location || '',
      devEUI: device.metadata?.devEUI || '',
      appEUI: device.metadata?.appEUI || '',
      appKey: device.metadata?.appKey || ''
    });
    setShowEditModal(true);
    setActiveMenu(null);
  };

  const handleUpdateDevice = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a device name');
      return;
    }

    try {
      setAddLoading(true);
      console.log('Updating device:', editingDevice.id, formData);
      
      const result = await magistralaApi.updateDevice(editingDevice.id, {
        name: formData.name,
        metadata: {
          type: formData.type,
          protocol: formData.protocol,
          location: formData.location,
          devEUI: formData.devEUI,
          appEUI: formData.appEUI,
          appKey: formData.appKey,
          ...editingDevice.metadata
        }
      });
      console.log('Device updated:', result);
      
      setShowEditModal(false);
      setEditingDevice(null);
      setFormData({
        name: '',
        type: 'sensor',
        protocol: 'mqtt',
        location: '',
        devEUI: '',
        appEUI: '',
        appKey: ''
      });
      await loadDevices();
      console.log('Device updated successfully');
    } catch (error) {
      console.error('Failed to update device:', error);
      alert('Failed to update device. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleToggleDevice = async (device) => {
    try {
      console.log('Toggling device status:', device.id, device.status);
      const newStatus = device.status === 'online' ? 'offline' : 'online';
      
      await magistralaApi.updateDevice(device.id, {
        status: newStatus,
        metadata: {
          ...device.metadata,
          lastStatusChange: new Date().toISOString()
        }
      });
      
      console.log(`Device ${device.id} status changed to ${newStatus}`);
      await loadDevices();
      setActiveMenu(null);
    } catch (error) {
      console.error('Failed to toggle device status:', error);
      alert('Failed to change device status. Please try again.');
    }
  };

  const handleDeleteDevice = async (device) => {
    if (!window.confirm(`Are you sure you want to delete "${device.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log('Deleting device:', device.id);
      await magistralaApi.deleteDevice(device.id);
      console.log('Device deleted successfully');
      await loadDevices();
      setActiveMenu(null);
    } catch (error) {
      console.error('Failed to delete device:', error);
      alert('Failed to delete device. Please try again.');
    }
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

  const getDeviceTypeIcon = (type) => {
    switch (type) {
      case 'lorawan': return <FiRadio />;
      case 'sensor': return <FiSettings />;
      case 'actuator': return <FiWifi />;
      default: return <FiSettings />;
    }
  };

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
          <ActionButton className="primary" onClick={() => setShowAddModal(true)}>
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
          <option value="all">All Status</option>
          <option value="online">Online Only</option>
          <option value="offline">Offline Only</option>
        </FilterSelect>
        
        <FilterSelect
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="sensor">Sensors</option>
          <option value="actuator">Actuators</option>
          <option value="lorawan">LoRaWAN</option>
          <option value="gateway">Gateways</option>
        </FilterSelect>
      </FilterSection>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'white' }}>
          Loading devices...
        </div>
      ) : (
        <DeviceGrid>
          {filteredDevices.map((device) => (
            <DeviceCard key={device.id}>
              <div className="device-header">
                <div className="device-info">
                  <div className="device-name">
                    {getDeviceTypeIcon(device.metadata?.type)} {device.name}
                  </div>
                  <div className="device-id">{device.id}</div>
                  {device.metadata?.type && (
                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                      {device.metadata.type.toUpperCase()} • {device.metadata?.protocol || 'MQTT'}
                    </div>
                  )}
                </div>
                <div className="device-actions">
                  <ActionButton onClick={() => handleMenuToggle(device.id)}>
                    <FiMoreVertical size={16} />
                  </ActionButton>
                  {activeMenu === device.id && (
                    <ActionMenu>
                      <div className="menu-item" onClick={() => handleEditDevice(device)}>
                        <FiEdit size={14} />
                        Edit Device
                      </div>
                      <div className="menu-item" onClick={() => handleToggleDevice(device)}>
                        {device.status === 'online' ? <FiWifiOff size={14} /> : <FiWifi size={14} />}
                        {device.status === 'online' ? 'Disconnect' : 'Connect'}
                      </div>
                      <div className="menu-item danger" onClick={() => handleDeleteDevice(device)}>
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
                  {formatLastSeen(device.metadata?.lastSeen)}
                </span>
              </div>

              {device.metadata?.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
                  <FiMapPin size={14} />
                  {device.metadata.location}
                </div>
              )}

              <div className="device-stats">
                <div className="stat-item">
                  <div className="stat-value">{Math.floor(Math.random() * 1000 + 100)}</div>
                  <div className="stat-label">Messages</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {device.metadata?.batteryLevel || Math.floor(Math.random() * 100)}%
                  </div>
                  <div className="stat-label">Battery</div>
                </div>
                {device.metadata?.signalStrength && (
                  <div className="stat-item">
                    <div className="stat-value">{device.metadata.signalStrength}</div>
                    <div className="stat-label">Signal (dBm)</div>
                  </div>
                )}
                {device.metadata?.devEUI && (
                  <div className="stat-item">
                    <div className="stat-value" style={{ fontSize: '0.8rem' }}>
                      {device.metadata.devEUI.slice(-4)}
                    </div>
                    <div className="stat-label">DevEUI</div>
                  </div>
                )}
              </div>
            </DeviceCard>
          ))}
        </DeviceGrid>
      )}

      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Add New Device</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Device Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
                placeholder="Enter device name"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Device Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                <option value="sensor">Sensor</option>
                <option value="actuator">Actuator</option>
                <option value="lorawan">LoRaWAN Device</option>
                <option value="gateway">Gateway</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Protocol</label>
              <select
                value={formData.protocol}
                onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                <option value="mqtt">MQTT</option>
                <option value="coap">CoAP</option>
                <option value="http">HTTP</option>
                <option value="lorawan">LoRaWAN</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
                placeholder="e.g., Building A - Floor 1"
              />
            </div>

            {formData.type === 'lorawan' && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Device EUI</label>
                  <input
                    type="text"
                    value={formData.devEUI}
                    onChange={(e) => setFormData({ ...formData, devEUI: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                    placeholder="0011223344556677"
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Application EUI</label>
                  <input
                    type="text"
                    value={formData.appEUI}
                    onChange={(e) => setFormData({ ...formData, appEUI: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                    placeholder="7066554433221100"
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Application Key</label>
                  <input
                    type="text"
                    value={formData.appKey}
                    onChange={(e) => setFormData({ ...formData, appKey: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                    placeholder="00112233445566778899AABBCCDDEEFF"
                  />
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #e2e8f0',
                  background: '#f7fafc',
                  color: '#4a5568',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddDevice}
                disabled={addLoading}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  background: addLoading ? '#ccc' : 'linear-gradient(135deg, #2C5282, #3182CE)',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: addLoading ? 'not-allowed' : 'pointer',
                  opacity: addLoading ? 0.7 : 1
                }}
              >
                {addLoading ? 'Adding...' : 'Add Device'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Edit Device</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Device Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
                placeholder="Enter device name"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Device Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                <option value="sensor">Sensor</option>
                <option value="actuator">Actuator</option>
                <option value="lorawan">LoRaWAN Device</option>
                <option value="gateway">Gateway</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Protocol</label>
              <select
                value={formData.protocol}
                onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                <option value="mqtt">MQTT</option>
                <option value="coap">CoAP</option>
                <option value="http">HTTP</option>
                <option value="lorawan">LoRaWAN</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
                placeholder="e.g., Building A - Floor 1"
              />
            </div>

            {formData.type === 'lorawan' && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Device EUI</label>
                  <input
                    type="text"
                    value={formData.devEUI}
                    onChange={(e) => setFormData({ ...formData, devEUI: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                    placeholder="0011223344556677"
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Application EUI</label>
                  <input
                    type="text"
                    value={formData.appEUI}
                    onChange={(e) => setFormData({ ...formData, appEUI: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                    placeholder="7066554433221100"
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Application Key</label>
                  <input
                    type="text"
                    value={formData.appKey}
                    onChange={(e) => setFormData({ ...formData, appKey: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '1rem'
                    }}
                    placeholder="00112233445566778899AABBCCDDEEFF"
                  />
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingDevice(null);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #e2e8f0',
                  background: '#f7fafc',
                  color: '#4a5568',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDevice}
                disabled={addLoading}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  background: addLoading ? '#ccc' : 'linear-gradient(135deg, #2C5282, #3182CE)',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: addLoading ? 'not-allowed' : 'pointer',
                  opacity: addLoading ? 0.7 : 1
                }}
              >
                {addLoading ? 'Updating...' : 'Update Device'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DeviceContainer>
  );
};

export default DeviceManagement;