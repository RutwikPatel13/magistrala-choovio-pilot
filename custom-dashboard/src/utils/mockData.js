// Mock data for testing dashboard functionality

export const mockDevices = [
  {
    id: 'dev_001',
    name: 'Temperature Sensor A1',
    type: 'sensor',
    status: 'online',
    lastSeen: '2 minutes ago',
    messagesCount: 1247,
    batteryLevel: 85,
    location: 'Building A - Floor 1',
    firmware: 'v2.1.3'
  },
  {
    id: 'dev_002', 
    name: 'Smart Thermostat',
    type: 'actuator',
    status: 'online',
    lastSeen: '5 minutes ago',
    messagesCount: 892,
    batteryLevel: 92,
    location: 'Building A - Floor 2',
    firmware: 'v1.8.1'
  },
  {
    id: 'dev_003',
    name: 'Humidity Monitor B2',
    type: 'sensor',
    status: 'offline',
    lastSeen: '2 hours ago',
    messagesCount: 456,
    batteryLevel: 23,
    location: 'Building B - Floor 2',
    firmware: 'v2.0.1'
  },
  {
    id: 'dev_004',
    name: 'Light Controller',
    type: 'actuator',
    status: 'online',
    lastSeen: '1 minute ago',
    messagesCount: 2134,
    batteryLevel: 78,
    location: 'Building A - Floor 3',
    firmware: 'v1.9.2'
  },
  {
    id: 'dev_005',
    name: 'Motion Detector C1',
    type: 'sensor',
    status: 'online',
    lastSeen: '3 minutes ago',
    messagesCount: 634,
    batteryLevel: 91,
    location: 'Building C - Floor 1',
    firmware: 'v2.2.0'
  },
  {
    id: 'dev_006',
    name: 'Air Quality Monitor',
    type: 'sensor',
    status: 'offline',
    lastSeen: '1 day ago',
    messagesCount: 178,
    batteryLevel: 12,
    location: 'Building B - Floor 1',
    firmware: 'v1.7.5'
  },
  {
    id: 'dev_007',
    name: 'Smart Door Lock',
    type: 'actuator',
    status: 'online',
    lastSeen: '30 seconds ago',
    messagesCount: 423,
    batteryLevel: 67,
    location: 'Building A - Entrance',
    firmware: 'v3.1.0'
  },
  {
    id: 'dev_008',
    name: 'Pressure Sensor D1',
    type: 'sensor',
    status: 'online',
    lastSeen: '1 minute ago',
    messagesCount: 789,
    batteryLevel: 94,
    location: 'Building D - Floor 1',
    firmware: 'v2.3.1'
  }
];

export const mockChannels = [
  {
    id: 'ch_001',
    name: 'sensor-data',
    description: 'Primary sensor data channel',
    protocol: 'MQTT',
    devicesConnected: 12,
    messagesPerHour: 1500,
    status: 'active'
  },
  {
    id: 'ch_002',
    name: 'actuator-commands',
    description: 'Command channel for actuators',
    protocol: 'HTTP',
    devicesConnected: 8,
    messagesPerHour: 450,
    status: 'active'
  },
  {
    id: 'ch_003',
    name: 'alerts-notifications',
    description: 'System alerts and notifications',
    protocol: 'WebSocket',
    devicesConnected: 20,
    messagesPerHour: 200,
    status: 'active'
  }
];

export const mockAnalyticsData = {
  timeSeriesData: Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    messages: Math.floor(Math.random() * 2000) + 1000,
    errors: Math.floor(Math.random() * 50) + 10,
    responseTime: Math.floor(Math.random() * 100) + 100,
    devices: Math.floor(Math.random() * 50) + 200,
    throughput: Math.floor(Math.random() * 100) + 50
  })),
  
  deviceTypeData: [
    { name: 'Sensors', value: 45, color: '#3498db' },
    { name: 'Actuators', value: 25, color: '#2ecc71' },
    { name: 'Gateways', value: 20, color: '#e74c3c' },
    { name: 'Controllers', value: 10, color: '#f39c12' }
  ],
  
  protocolData: [
    { name: 'MQTT', messages: 45000, color: '#667eea' },
    { name: 'HTTP', messages: 32000, color: '#764ba2' },
    { name: 'CoAP', messages: 18000, color: '#f093fb' },
    { name: 'WebSocket', messages: 12000, color: '#4facfe' }
  ],
  
  metrics: {
    totalMessages: 125847,
    messageChange: 12.5,
    avgThroughput: 87.3,
    throughputChange: -2.1,
    errorRate: 0.8,
    errorChange: -15.3,
    responseTime: 145,
    responseChange: 8.7
  }
};

export const mockDashboardStats = {
  activeDevices: 1247,
  totalChannels: 89,
  messagesProcessed: 45623,
  dataVolume: 2.4,
  systemUptime: '99.9%',
  connectedUsers: 34
};

export const mockRecentActivity = [
  {
    id: 1,
    title: 'New device connected',
    description: 'Temperature Sensor A1 came online',
    time: '2 minutes ago',
    type: 'device',
    severity: 'info'
  },
  {
    id: 2,
    title: 'Channel threshold exceeded',
    description: 'sensor-data channel reached 95% capacity',
    time: '15 minutes ago',
    type: 'alert',
    severity: 'warning'
  },
  {
    id: 3,
    title: 'Data export completed',
    description: 'Monthly analytics report generated',
    time: '1 hour ago',
    type: 'data',
    severity: 'success'
  },
  {
    id: 4,
    title: 'Device disconnected',
    description: 'Humidity Monitor B2 went offline',
    time: '2 hours ago',
    type: 'device',
    severity: 'error'
  },
  {
    id: 5,
    title: 'System backup finished',
    description: 'Automated backup completed successfully',
    time: '3 hours ago',
    type: 'system',
    severity: 'success'
  }
];

// Mock API responses
export const mockApiResponses = {
  '/health': { status: 'healthy', timestamp: new Date().toISOString() },
  '/clients': { clients: mockDevices, total: mockDevices.length },
  '/channels': { channels: mockChannels, total: mockChannels.length },
  '/analytics': mockAnalyticsData,
  '/dashboard/stats': mockDashboardStats,
  '/activity': mockRecentActivity
};

// Generate real-time mock data
export const generateRealtimeData = () => ({
  timestamp: new Date().toISOString(),
  metrics: {
    messagesPerSecond: Math.floor(Math.random() * 100) + 50,
    activeConnections: Math.floor(Math.random() * 50) + 200,
    cpuUsage: Math.floor(Math.random() * 30) + 20,
    memoryUsage: Math.floor(Math.random() * 40) + 30,
    networkThroughput: Math.floor(Math.random() * 1000) + 500
  },
  alerts: Math.random() > 0.8 ? [{
    id: Date.now(),
    message: 'High CPU usage detected',
    severity: 'warning',
    timestamp: new Date().toISOString()
  }] : []
});

export default {
  mockDevices,
  mockChannels,
  mockAnalyticsData,
  mockDashboardStats,
  mockRecentActivity,
  mockApiResponses,
  generateRealtimeData
};