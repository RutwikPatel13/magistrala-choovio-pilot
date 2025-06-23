// LoRaWAN Management Service for Choovio
// Comprehensive LoRaWAN device and network management based on Magistrala LoRa adapter

class LoRaWANService {
  constructor(magistralaApi) {
    this.api = magistralaApi;
    this.baseURL = magistralaApi.baseURL;
    
    // LoRaWAN specific configuration
    this.loraAdapterPort = process.env.REACT_APP_LORA_ADAPTER_PORT || '9017';
    this.loraAdapterURL = `${this.baseURL}:${this.loraAdapterPort}`;
    
    // LoRa Server integration
    this.loraServerMQTT = process.env.REACT_APP_LORA_SERVER_MQTT || 'localhost:1883';
    
    // Common LoRaWAN frequencies and configurations
    this.regions = {
      'EU868': { name: 'Europe 868MHz', frequencies: ['868.1', '868.3', '868.5'] },
      'US915': { name: 'US 915MHz', frequencies: ['902.3', '903.9', '905.5'] },
      'AS923': { name: 'Asia 923MHz', frequencies: ['923.2', '923.4', '923.6'] },
      'AU915': { name: 'Australia 915MHz', frequencies: ['915.2', '915.4', '915.6'] },
      'IN865': { name: 'India 865MHz', frequencies: ['865.062', '865.402', '865.985'] }
    };
    
    // LoRaWAN device classes
    this.deviceClasses = {
      'A': { name: 'Class A', description: 'Bi-directional end-devices (battery powered)' },
      'B': { name: 'Class B', description: 'Bi-directional with scheduled receive slots' },
      'C': { name: 'Class C', description: 'Continuously listening (mains powered)' }
    };
    
    console.log('🔧 LoRaWAN Service initialized for Choovio');
  }

  // LoRaWAN Device Management
  async getLoRaWANDevices(offset = 0, limit = 100) {
    try {
      // Get all devices and filter for LoRaWAN
      const allDevices = await this.api.getDevices(offset, limit * 3); // Get more to filter
      
      const loraDevices = allDevices.clients?.filter(device => 
        this.isLoRaWANDevice(device)
      ) || [];
      
      // Enhance with LoRaWAN specific data
      const enhancedDevices = loraDevices.map(device => this.enhanceLoRaWANDevice(device));
      
      console.log(`🔍 Found ${enhancedDevices.length} LoRaWAN devices`);
      return {
        devices: enhancedDevices.slice(0, limit),
        total: enhancedDevices.length,
        offset,
        limit
      };
    } catch (error) {
      console.error('❌ Error fetching LoRaWAN devices:', error);
      throw error;
    }
  }

  async createLoRaWANDevice(deviceData) {
    try {
      console.log('🔧 Creating LoRaWAN device:', deviceData);
      
      // Prepare LoRaWAN specific metadata
      const loraMetadata = {
        type: 'lorawan',
        protocol: 'lorawan',
        region: deviceData.region || 'EU868',
        deviceClass: deviceData.deviceClass || 'A',
        devEUI: deviceData.devEUI,
        appEUI: deviceData.appEUI || deviceData.joinEUI,
        appKey: deviceData.appKey,
        devAddr: deviceData.devAddr,
        nwkSKey: deviceData.nwkSKey,
        appSKey: deviceData.appSKey,
        activationType: deviceData.activationType || 'OTAA', // OTAA or ABP
        dataRate: deviceData.dataRate || 'SF7BW125',
        txPower: deviceData.txPower || 14,
        adrEnabled: deviceData.adrEnabled !== false,
        framePendingEnabled: deviceData.framePendingEnabled || false,
        uplinkInterval: deviceData.uplinkInterval || 600, // seconds
        ...deviceData.metadata
      };

      // Prepare LoRaWAN device data for dual-write service
      const lorawanDeviceData = {
        name: deviceData.name || `LoRaWAN-${deviceData.devEUI}`,
        description: deviceData.description || `LoRaWAN device with DevEUI: ${deviceData.devEUI}`,
        dev_eui: deviceData.devEUI,
        app_eui: deviceData.appEUI || deviceData.joinEUI,
        app_key: deviceData.appKey,
        dev_addr: deviceData.devAddr,
        nwk_s_key: deviceData.nwkSKey,
        app_s_key: deviceData.appSKey,
        frequency_plan: deviceData.region || 'EU868',
        class: deviceData.deviceClass || 'A',
        supports_join: deviceData.activationType !== 'ABP',
        metadata: {
          ...loraMetadata,
          createdVia: 'lorawan-service'
        }
      };

      const createdDevice = await this.dualWriteService.createLoRaWANDevice(lorawanDeviceData);
      
      // If successful, try to setup LoRaWAN routing
      if (createdDevice.id) {
        await this.setupLoRaWANRouting(createdDevice, deviceData);
      }
      
      console.log('✅ LoRaWAN device created successfully via dual-write');
      return this.enhanceLoRaWANDeviceFromDB(createdDevice);
    } catch (error) {
      console.error('❌ Error creating LoRaWAN device:', error);
      throw error;
    }
  }

  async updateLoRaWANDevice(deviceId, updates) {
    try {
      console.log('🔄 Updating LoRaWAN device via dual-write service:', deviceId, updates);
      
      // Prepare LoRaWAN device updates for dual-write service
      const lorawanUpdates = {
        name: updates.name,
        description: updates.description,
        dev_eui: updates.devEUI,
        app_eui: updates.appEUI || updates.joinEUI,
        app_key: updates.appKey,
        dev_addr: updates.devAddr,
        nwk_s_key: updates.nwkSKey,
        app_s_key: updates.appSKey,
        frequency_plan: updates.region,
        class: updates.deviceClass,
        supports_join: updates.activationType !== 'ABP',
        metadata: {
          ...updates.metadata,
          type: 'lorawan',
          protocol: 'lorawan',
          lastUpdated: new Date().toISOString(),
          updatedVia: 'lorawan-service'
        }
      };

      const updatedDevice = await this.dualWriteService.updateLoRaWANDevice(deviceId, lorawanUpdates);
      console.log('✅ LoRaWAN device updated via dual-write:', updatedDevice);
      return this.enhanceLoRaWANDeviceFromDB(updatedDevice);
    } catch (error) {
      console.error('❌ Error updating LoRaWAN device via dual-write:', error);
      throw error;
    }
  }

  // LoRaWAN Gateway Management
  async getLoRaWANGateways() {
    try {
      console.log('🔄 Getting LoRaWAN gateways via dual-write service...');
      
      // Get devices that are configured as gateways using dual-write service
      const allThings = await this.dualWriteService.getThings({ limit: 1000 });
      
      const gateways = allThings.filter(device => 
        device.metadata?.type === 'gateway' && 
        device.metadata?.protocol === 'lorawan'
      ) || [];
      
      console.log(`✅ Found ${gateways.length} LoRaWAN gateways via dual-write`);
      return gateways.map(gateway => this.enhanceLoRaWANGateway(gateway));
    } catch (error) {
      console.error('❌ Error fetching LoRaWAN gateways:', error);
      throw error;
    }
  }

  async createLoRaWANGateway(gatewayData) {
    try {
      const gateway = {
        name: gatewayData.name,
        metadata: {
          type: 'gateway',
          protocol: 'lorawan',
          gatewayEUI: gatewayData.gatewayEUI,
          region: gatewayData.region || 'EU868',
          location: {
            latitude: gatewayData.latitude,
            longitude: gatewayData.longitude,
            altitude: gatewayData.altitude || 0
          },
          networkSettings: {
            ip: gatewayData.ip,
            port: gatewayData.port || 1700,
            keepAliveInterval: gatewayData.keepAliveInterval || 10
          },
          antennaGain: gatewayData.antennaGain || 2.15,
          ...gatewayData.metadata
        }
      };

      const createdGateway = await this.api.createDevice(gateway);
      console.log('✅ LoRaWAN gateway created successfully');
      return this.enhanceLoRaWANGateway(createdGateway);
    } catch (error) {
      console.error('❌ Error creating LoRaWAN gateway:', error);
      throw error;
    }
  }

  // LoRaWAN Network Analytics
  async getLoRaWANNetworkStats() {
    try {
      const [devices, gateways, messages] = await Promise.all([
        this.getLoRaWANDevices(0, 1000),
        this.getLoRaWANGateways(),
        this.getRecentLoRaWANMessages()
      ]);

      // Calculate network statistics
      const activeDevices = devices.devices.filter(d => d.status === 'online').length;
      const activeGateways = gateways.filter(g => g.status === 'online').length;
      
      // Device distribution by region
      const regionStats = devices.devices.reduce((acc, device) => {
        const region = device.metadata?.region || 'Unknown';
        acc[region] = (acc[region] || 0) + 1;
        return acc;
      }, {});

      // Device class distribution
      const classStats = devices.devices.reduce((acc, device) => {
        const deviceClass = device.metadata?.deviceClass || 'A';
        acc[`Class ${deviceClass}`] = (acc[`Class ${deviceClass}`] || 0) + 1;
        return acc;
      }, {});

      return {
        totalDevices: devices.total,
        activeDevices,
        totalGateways: gateways.length,
        activeGateways,
        totalMessages: messages.total || 0,
        regionDistribution: regionStats,
        classDistribution: classStats,
        networkCoverage: this.calculateNetworkCoverage(gateways),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error getting LoRaWAN network stats:', error);
      return this.getDefaultNetworkStats();
    }
  }

  // LoRaWAN Message Management
  async getRecentLoRaWANMessages(limit = 50) {
    try {
      // Get messages from LoRaWAN channels
      const channels = await this.api.getChannels(0, 100);
      const loraChannels = channels.channels?.filter(ch => 
        ch.metadata?.protocol === 'lorawan' || ch.metadata?.type === 'lorawan'
      ) || [];

      let allMessages = [];
      
      for (const channel of loraChannels) {
        try {
          const messages = await this.api.getMessages(channel.id, 0, 20);
          const enhancedMessages = messages.messages?.map(msg => 
            this.enhanceLoRaWANMessage(msg, channel)
          ) || [];
          allMessages = [...allMessages, ...enhancedMessages];
        } catch (error) {
          console.log(`⚠️ Could not fetch messages for channel ${channel.id}`);
        }
      }

      // Sort by timestamp and limit
      allMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return {
        messages: allMessages.slice(0, limit),
        total: allMessages.length
      };
    } catch (error) {
      console.error('❌ Error fetching LoRaWAN messages:', error);
      return { messages: [], total: 0 };
    }
  }

  // LoRaWAN Configuration Management
  async getLoRaWANConfiguration() {
    try {
      return {
        adapterStatus: await this.checkLoRaAdapterStatus(),
        supportedRegions: this.regions,
        deviceClasses: this.deviceClasses,
        networkServer: {
          mqttBroker: this.loraServerMQTT,
          adapterURL: this.loraAdapterURL
        },
        defaultSettings: {
          region: 'EU868',
          deviceClass: 'A',
          dataRate: 'SF7BW125',
          txPower: 14,
          adrEnabled: true
        }
      };
    } catch (error) {
      console.error('❌ Error getting LoRaWAN configuration:', error);
      return this.getDefaultConfiguration();
    }
  }

  // Helper Methods
  isLoRaWANDevice(device) {
    return device.metadata?.protocol === 'lorawan' || 
           device.metadata?.type === 'lorawan' ||
           device.metadata?.devEUI ||
           device.name?.toLowerCase().includes('lora');
  }

  enhanceLoRaWANDevice(device) {
    const metadata = device.metadata || {};
    
    return {
      ...device,
      deviceType: 'LoRaWAN',
      region: metadata.region || 'EU868',
      deviceClass: metadata.deviceClass || 'A',
      activationType: metadata.activationType || 'OTAA',
      dataRate: metadata.dataRate || 'SF7BW125',
      txPower: metadata.txPower || 14,
      devEUI: metadata.devEUI,
      appEUI: metadata.appEUI || metadata.joinEUI,
      status: this.inferDeviceStatus(device),
      lastSeen: metadata.lastSeen || device.created_at,
      batteryLevel: metadata.batteryLevel,
      signalStrength: metadata.rssi || metadata.snr,
      frameCounter: metadata.frameCounter || 0
    };
  }

  enhanceLoRaWANDeviceFromDB(dbDevice) {
    // Handle database records with potentially different field naming conventions
    const metadata = typeof dbDevice.metadata === 'string' 
      ? JSON.parse(dbDevice.metadata) 
      : (dbDevice.metadata || {});
    
    return {
      id: dbDevice.id || dbDevice.device_id,
      name: dbDevice.name || dbDevice.device_name,
      description: dbDevice.description,
      created_at: dbDevice.created_at,
      updated_at: dbDevice.updated_at,
      metadata: metadata,
      deviceType: 'LoRaWAN',
      region: dbDevice.frequency_plan || metadata.region || 'EU868',
      deviceClass: dbDevice.class || metadata.deviceClass || 'A',
      activationType: dbDevice.supports_join ? 'OTAA' : 'ABP',
      dataRate: metadata.dataRate || 'SF7BW125',
      txPower: metadata.txPower || 14,
      devEUI: dbDevice.dev_eui || metadata.devEUI,
      appEUI: dbDevice.app_eui || metadata.appEUI || metadata.joinEUI,
      appKey: dbDevice.app_key || metadata.appKey,
      devAddr: dbDevice.dev_addr || metadata.devAddr,
      nwkSKey: dbDevice.nwk_s_key || metadata.nwkSKey,
      appSKey: dbDevice.app_s_key || metadata.appSKey,
      status: this.inferDeviceStatusFromDB(dbDevice),
      lastSeen: dbDevice.last_seen || metadata.lastSeen || dbDevice.created_at,
      batteryLevel: metadata.batteryLevel,
      signalStrength: metadata.rssi || metadata.snr,
      frameCounter: metadata.frameCounter || 0,
      // Additional database-specific fields
      lorawan_device_id: dbDevice.lorawan_device_id,
      magistrala_thing_id: dbDevice.magistrala_thing_id,
      supports_join: dbDevice.supports_join,
      // Preserve original database fields for reference
      _dbRecord: {
        ...dbDevice
      }
    };
  }

  enhanceLoRaWANGateway(gateway) {
    const metadata = gateway.metadata || {};
    
    return {
      ...gateway,
      gatewayType: 'LoRaWAN Gateway',
      gatewayEUI: metadata.gatewayEUI,
      region: metadata.region || 'EU868',
      location: metadata.location,
      networkSettings: metadata.networkSettings,
      status: this.inferDeviceStatus(gateway),
      connectedDevices: metadata.connectedDevices || 0,
      throughput: metadata.throughput || '0 msg/h'
    };
  }

  enhanceLoRaWANMessage(message, channel) {
    return {
      ...message,
      channelName: channel.name,
      protocol: 'LoRaWAN',
      region: channel.metadata?.region,
      dataRate: message.metadata?.dataRate,
      frequency: message.metadata?.frequency,
      rssi: message.metadata?.rssi,
      snr: message.metadata?.snr,
      gatewayId: message.metadata?.gatewayId
    };
  }

  inferDeviceStatus(device) {
    const lastSeen = device.metadata?.lastSeen || device.created_at;
    if (!lastSeen) return 'unknown';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const minutesSinceLastSeen = (now - lastSeenDate) / (1000 * 60);
    
    if (minutesSinceLastSeen < 15) return 'online';
    if (minutesSinceLastSeen < 60) return 'idle';
    return 'offline';
  }

  inferDeviceStatusFromDB(dbDevice) {
    // Check for explicit status field first
    if (dbDevice.status) {
      return dbDevice.status;
    }
    
    // Use last_seen field if available
    const lastSeen = dbDevice.last_seen || dbDevice.updated_at || dbDevice.created_at;
    if (!lastSeen) return 'unknown';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const minutesSinceLastSeen = (now - lastSeenDate) / (1000 * 60);
    
    if (minutesSinceLastSeen < 15) return 'online';
    if (minutesSinceLastSeen < 60) return 'idle';
    return 'offline';
  }

  async checkLoRaAdapterStatus() {
    try {
      const response = await fetch(`${this.loraAdapterURL}/health`, {
        timeout: 3000
      });
      return response.ok ? 'running' : 'error';
    } catch (error) {
      return 'unavailable';
    }
  }

  async setupLoRaWANRouting(device, deviceData) {
    // Implementation for setting up LoRaWAN routing in Redis
    // This would interact with the LoRa adapter's routing configuration
    console.log('🔄 Setting up LoRaWAN routing for device:', device.id);
  }

  calculateNetworkCoverage(gateways) {
    // Simple coverage calculation based on gateway locations
    // In real implementation, this would use proper RF propagation models
    if (!gateways.length) return 0;
    
    const activeGateways = gateways.filter(g => g.status === 'online').length;
    return Math.min(100, (activeGateways / gateways.length) * 100);
  }

  getDefaultNetworkStats() {
    return {
      totalDevices: 0,
      activeDevices: 0,
      totalGateways: 0,
      activeGateways: 0,
      totalMessages: 0,
      regionDistribution: {},
      classDistribution: {},
      networkCoverage: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  getDefaultConfiguration() {
    return {
      adapterStatus: 'unavailable',
      supportedRegions: this.regions,
      deviceClasses: this.deviceClasses,
      networkServer: {
        mqttBroker: 'localhost:1883',
        adapterURL: 'http://localhost:9017'
      },
      defaultSettings: {
        region: 'EU868',
        deviceClass: 'A',
        dataRate: 'SF7BW125',
        txPower: 14,
        adrEnabled: true
      }
    };
  }
}

export default LoRaWANService;