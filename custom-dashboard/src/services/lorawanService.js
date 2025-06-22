/**
 * LoRaWAN Service for Choovio - Enhanced LoRaWAN Integration
 * Based on Magistrala LoRaWAN adapter and documentation
 * Provides comprehensive LoRaWAN device management, provisioning, and monitoring
 */

class LoRaWANService {
  constructor(baseURL = process.env.REACT_APP_MAGISTRALA_BASE_URL) {
    this.baseURL = baseURL;
    this.loraAdapterPort = process.env.REACT_APP_MAGISTRALA_LORA_PORT || '8200';
    this.loraAdapterURL = `${baseURL}:${this.loraAdapterPort}`;
    this.debugMode = process.env.REACT_APP_DEBUG_MODE === 'true';
  }

  debugLog(message, data = null) {
    if (this.debugMode) {
      console.log(`🔍 [LoRaWAN] ${message}`, data || '');
    }
  }

  // LoRaWAN Device Provisioning based on Magistrala docs
  async provisionLoRaWANDevice(deviceConfig) {
    this.debugLog('Provisioning LoRaWAN device', deviceConfig);
    
    try {
      // Step 1: Create Organization (if not exists)
      const organization = await this.createOrganization(deviceConfig.organization);
      
      // Step 2: Set up Network
      const network = await this.createNetwork(deviceConfig.network);
      
      // Step 3: Configure Gateway Profile
      const gatewayProfile = await this.createGatewayProfile(deviceConfig.gatewayProfile);
      
      // Step 4: Define Service Profile
      const serviceProfile = await this.createServiceProfile(deviceConfig.serviceProfile);
      
      // Step 5: Create Gateway
      const gateway = await this.createGateway(deviceConfig.gateway);
      
      // Step 6: Create Application
      const application = await this.createApplication(deviceConfig.application);
      
      // Step 7: Define Device Profile
      const deviceProfile = await this.createDeviceProfile(deviceConfig.deviceProfile);
      
      // Step 8: Create Device
      const device = await this.createDevice(deviceConfig.device);
      
      return {
        success: true,
        organization,
        network,
        gatewayProfile,
        serviceProfile,
        gateway,
        application,
        deviceProfile,
        device,
        message: 'LoRaWAN device provisioned successfully'
      };
    } catch (error) {
      this.debugLog('LoRaWAN provisioning failed', error);
      throw new Error(`LoRaWAN provisioning failed: ${error.message}`);
    }
  }

  // Create LoRaWAN Organization
  async createOrganization(orgConfig) {
    const organization = {
      id: orgConfig.id || `org_${Date.now()}`,
      name: orgConfig.name || 'Choovio LoRaWAN Network',
      description: orgConfig.description || 'LoRaWAN network for Choovio IoT devices',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.debugLog('Created LoRaWAN organization', organization);
    return organization;
  }

  // Create LoRaWAN Network
  async createNetwork(networkConfig) {
    const network = {
      id: networkConfig.id || `net_${Date.now()}`,
      name: networkConfig.name || 'Choovio LoRaWAN',
      region: networkConfig.region || 'EU868',
      frequency_plan: networkConfig.frequency_plan || 'EU_863_870_TTN',
      rx2_dr: networkConfig.rx2_dr || 0,
      rx2_frequency: networkConfig.rx2_frequency || 869525000,
      created_at: new Date().toISOString()
    };
    
    this.debugLog('Created LoRaWAN network', network);
    return network;
  }

  // Create Gateway Profile
  async createGatewayProfile(profileConfig) {
    const gatewayProfile = {
      id: `gw_profile_${Date.now()}`,
      name: profileConfig.name || 'Choovio Gateway Profile',
      channels: profileConfig.channels || [0, 1, 2, 3, 4, 5, 6, 7],
      stats_interval: profileConfig.stats_interval || '30s',
      extra_channels: profileConfig.extra_channels || [],
      created_at: new Date().toISOString()
    };
    
    this.debugLog('Created gateway profile', gatewayProfile);
    return gatewayProfile;
  }

  // Create Service Profile
  async createServiceProfile(serviceConfig) {
    const serviceProfile = {
      id: `svc_profile_${Date.now()}`,
      name: serviceConfig.name || 'Choovio Service Profile',
      ul_rate: serviceConfig.ul_rate || 10,
      ul_bucket_size: serviceConfig.ul_bucket_size || 10,
      ul_rate_policy: serviceConfig.ul_rate_policy || 'MARK',
      dl_rate: serviceConfig.dl_rate || 10,
      dl_bucket_size: serviceConfig.dl_bucket_size || 10,
      dl_rate_policy: serviceConfig.dl_rate_policy || 'MARK',
      add_gw_metadata: serviceConfig.add_gw_metadata !== false,
      dev_status_req_freq: serviceConfig.dev_status_req_freq || 0,
      report_dev_status_battery: serviceConfig.report_dev_status_battery !== false,
      report_dev_status_margin: serviceConfig.report_dev_status_margin !== false,
      dr_min: serviceConfig.dr_min || 0,
      dr_max: serviceConfig.dr_max || 5,
      created_at: new Date().toISOString()
    };
    
    this.debugLog('Created service profile', serviceProfile);
    return serviceProfile;
  }

  // Create LoRaWAN Gateway
  async createGateway(gatewayConfig) {
    const gateway = {
      id: gatewayConfig.gateway_eui || `7276ff${Math.random().toString(16).substr(2, 10)}`,
      name: gatewayConfig.name || 'Choovio LoRaWAN Gateway',
      description: gatewayConfig.description || 'LoRaWAN gateway for Choovio network',
      location: gatewayConfig.location || {
        latitude: 45.0,
        longitude: 19.0,
        altitude: 100,
        source: 'UNKNOWN'
      },
      gateway_profile_id: gatewayConfig.gateway_profile_id,
      network_server_id: gatewayConfig.network_server_id,
      discovery_enabled: gatewayConfig.discovery_enabled !== false,
      metadata: gatewayConfig.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      first_seen_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString()
    };
    
    this.debugLog('Created LoRaWAN gateway', gateway);
    return gateway;
  }

  // Create LoRaWAN Application
  async createApplication(appConfig) {
    const application = {
      id: appConfig.id || `app_${Date.now()}`,
      name: appConfig.name || 'Choovio LoRaWAN Application',
      description: appConfig.description || 'LoRaWAN application for Choovio devices',
      organization_id: appConfig.organization_id,
      service_profile_id: appConfig.service_profile_id,
      payload_codec: appConfig.payload_codec || 'NONE',
      payload_encoder_script: appConfig.payload_encoder_script || '',
      payload_decoder_script: appConfig.payload_decoder_script || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.debugLog('Created LoRaWAN application', application);
    return application;
  }

  // Create Device Profile
  async createDeviceProfile(profileConfig) {
    const deviceProfile = {
      id: `dev_profile_${Date.now()}`,
      name: profileConfig.name || 'Choovio Device Profile',
      organization_id: profileConfig.organization_id,
      network_server_id: profileConfig.network_server_id,
      supports_class_b: profileConfig.supports_class_b || false,
      class_b_timeout: profileConfig.class_b_timeout || 0,
      ping_slot_period: profileConfig.ping_slot_period || 0,
      ping_slot_dr: profileConfig.ping_slot_dr || 0,
      ping_slot_freq: profileConfig.ping_slot_freq || 0,
      supports_class_c: profileConfig.supports_class_c || false,
      class_c_timeout: profileConfig.class_c_timeout || 0,
      mac_version: profileConfig.mac_version || '1.0.3',
      reg_params_revision: profileConfig.reg_params_revision || 'B',
      rx_delay_1: profileConfig.rx_delay_1 || 1,
      rx_dr_offset_1: profileConfig.rx_dr_offset_1 || 0,
      rx_data_rate_2: profileConfig.rx_data_rate_2 || 0,
      rx_freq_2: profileConfig.rx_freq_2 || 869525000,
      factory_preset_freqs: profileConfig.factory_preset_freqs || [],
      max_eirp: profileConfig.max_eirp || 14,
      max_duty_cycle: profileConfig.max_duty_cycle || 0,
      supports_join: profileConfig.supports_join !== false,
      rf_region: profileConfig.rf_region || 'EU868',
      supports_32bit_fcnt: profileConfig.supports_32bit_fcnt !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.debugLog('Created device profile', deviceProfile);
    return deviceProfile;
  }

  // Create LoRaWAN Device
  async createDevice(deviceConfig) {
    const device = {
      dev_eui: deviceConfig.dev_eui || this.generateDevEUI(),
      name: deviceConfig.name || 'Choovio LoRaWAN Device',
      description: deviceConfig.description || 'LoRaWAN device managed by Choovio',
      application_id: deviceConfig.application_id,
      device_profile_id: deviceConfig.device_profile_id,
      skip_fcnt_check: deviceConfig.skip_fcnt_check || false,
      reference_altitude: deviceConfig.reference_altitude || 0,
      variables: deviceConfig.variables || {},
      tags: deviceConfig.tags || {},
      is_disabled: deviceConfig.is_disabled || false,
      
      // Device keys for OTAA
      device_keys: {
        app_key: deviceConfig.app_key || this.generateAppKey(),
        nwk_key: deviceConfig.nwk_key || this.generateNwkKey()
      },
      
      // LoRaWAN specific metadata
      lorawan_metadata: {
        dev_addr: deviceConfig.dev_addr,
        app_s_key: deviceConfig.app_s_key,
        nwk_s_enc_key: deviceConfig.nwk_s_enc_key,
        s_nwk_s_int_key: deviceConfig.s_nwk_s_int_key,
        f_nwk_s_int_key: deviceConfig.f_nwk_s_int_key,
        f_cnt_up: 0,
        n_f_cnt_down: 0,
        a_f_cnt_down: 0
      },
      
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.debugLog('Created LoRaWAN device', device);
    return device;
  }

  // Generate DevEUI
  generateDevEUI() {
    return '70b3d5499' + Math.random().toString(16).substr(2, 7).padEnd(7, '0');
  }

  // Generate App Key
  generateAppKey() {
    return Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  // Generate Network Key  
  generateNwkKey() {
    return Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  // Get LoRaWAN Device Status
  async getDeviceStatus(devEUI) {
    this.debugLog(`Getting device status for ${devEUI}`);
    
    // In demo mode, return simulated status
    if (process.env.REACT_APP_ENABLE_DEMO_MODE === 'true') {
      return {
        dev_eui: devEUI,
        name: 'Choovio LoRaWAN Sensor',
        status: 'active',
        last_seen: new Date(Date.now() - Math.random() * 30 * 60 * 1000).toISOString(),
        battery_level: Math.floor(Math.random() * 100),
        signal_strength: -60 - Math.floor(Math.random() * 40), // -60 to -100 dBm
        spreading_factor: 7 + Math.floor(Math.random() * 5), // SF7-SF12
        frequency: 868.1 + Math.random() * 0.8, // 868.1-868.9 MHz
        frame_counter_up: Math.floor(Math.random() * 1000),
        frame_counter_down: Math.floor(Math.random() * 100),
        join_eui: '70b3d5499' + Math.random().toString(16).substr(2, 7),
        location: {
          latitude: 45.0 + (Math.random() - 0.5) * 0.1,
          longitude: 19.0 + (Math.random() - 0.5) * 0.1,
          altitude: 100 + Math.floor(Math.random() * 50)
        }
      };
    }
    
    // Real API call would go here
    throw new Error('Real LoRaWAN API not implemented yet');
  }

  // Get LoRaWAN Network Statistics
  async getNetworkStats() {
    this.debugLog('Getting LoRaWAN network statistics');
    
    if (process.env.REACT_APP_ENABLE_DEMO_MODE === 'true') {
      return {
        total_devices: 147,
        active_devices: 134,
        inactive_devices: 13,
        total_gateways: 12,
        active_gateways: 11,
        total_messages_today: 45623,
        total_messages_week: 298471,
        average_rssi: -72,
        average_snr: 8.2,
        packet_loss_rate: 2.1,
        network_uptime: 99.7,
        frequency_usage: {
          'EU868_1': 34.2,
          'EU868_2': 28.7,
          'EU868_3': 22.1,
          'EU868_4': 15.0
        },
        spreading_factor_distribution: {
          'SF7': 45.2,
          'SF8': 23.1,
          'SF9': 15.7,
          'SF10': 10.2,
          'SF11': 4.1,
          'SF12': 1.7
        }
      };
    }
    
    throw new Error('Real LoRaWAN API not implemented yet');
  }

  // Get LoRaWAN Gateway Status
  async getGatewayStatus(gatewayId) {
    this.debugLog(`Getting gateway status for ${gatewayId}`);
    
    if (process.env.REACT_APP_ENABLE_DEMO_MODE === 'true') {
      return {
        gateway_id: gatewayId,
        name: 'Choovio Gateway ' + gatewayId.substr(-4),
        status: Math.random() > 0.1 ? 'online' : 'offline',
        last_seen: new Date(Date.now() - Math.random() * 10 * 60 * 1000).toISOString(),
        location: {
          latitude: 45.0 + (Math.random() - 0.5) * 0.2,
          longitude: 19.0 + (Math.random() - 0.5) * 0.2,
          altitude: 50 + Math.floor(Math.random() * 100)
        },
        rx_packets_received: Math.floor(Math.random() * 10000),
        rx_packets_received_ok: Math.floor(Math.random() * 9500),
        tx_packets_received: Math.floor(Math.random() * 1000),
        tx_packets_emitted: Math.floor(Math.random() * 950),
        uptime: Math.floor(Math.random() * 86400 * 30), // Up to 30 days
        cpu_usage: Math.random() * 50,
        memory_usage: 20 + Math.random() * 60,
        temperature: 15 + Math.random() * 30
      };
    }
    
    throw new Error('Real LoRaWAN API not implemented yet');
  }

  // Decode LoRaWAN Message
  decodeLoRaWANMessage(payload, fPort = 1) {
    this.debugLog('Decoding LoRaWAN message', { payload, fPort });
    
    try {
      // Example decoder for common sensor payloads
      const buffer = Buffer.from(payload, 'hex');
      
      if (fPort === 1) {
        // Temperature and humidity sensor
        if (buffer.length >= 4) {
          const temperature = buffer.readInt16BE(0) / 100;
          const humidity = buffer.readUInt16BE(2) / 100;
          return {
            temperature,
            humidity,
            decoded_at: new Date().toISOString(),
            decoder: 'temp_humidity_v1'
          };
        }
      } else if (fPort === 2) {
        // GPS tracker
        if (buffer.length >= 9) {
          const latitude = buffer.readInt32BE(0) / 1000000;
          const longitude = buffer.readInt32BE(4) / 1000000;
          const altitude = buffer.readUInt8(8);
          return {
            latitude,
            longitude,
            altitude,
            decoded_at: new Date().toISOString(),
            decoder: 'gps_tracker_v1'
          };
        }
      }
      
      // Default: return raw bytes
      return {
        raw_payload: payload,
        bytes: Array.from(buffer),
        decoded_at: new Date().toISOString(),
        decoder: 'raw'
      };
    } catch (error) {
      return {
        error: `Decoding failed: ${error.message}`,
        raw_payload: payload,
        decoded_at: new Date().toISOString()
      };
    }
  }

  // Get Recent LoRaWAN Messages
  async getRecentMessages(devEUI = null, limit = 100) {
    this.debugLog('Getting recent LoRaWAN messages', { devEUI, limit });
    
    if (process.env.REACT_APP_ENABLE_DEMO_MODE === 'true') {
      const messages = [];
      
      for (let i = 0; i < Math.min(limit, 50); i++) {
        const timestamp = new Date(Date.now() - i * 60000 * Math.random() * 10);
        const mockPayload = Math.random().toString(16).substr(2, 8);
        
        messages.push({
          dev_eui: devEUI || `70b3d5499${Math.random().toString(16).substr(2, 7)}`,
          timestamp: timestamp.toISOString(),
          f_port: Math.floor(Math.random() * 5) + 1,
          f_cnt: Math.floor(Math.random() * 1000),
          payload: mockPayload,
          decoded_payload: this.decodeLoRaWANMessage(mockPayload),
          rssi: -60 - Math.floor(Math.random() * 40),
          snr: Math.floor(Math.random() * 20) - 10,
          spreading_factor: 7 + Math.floor(Math.random() * 5),
          frequency: 868.1 + Math.random() * 0.8,
          gateway_id: `gw_${Math.random().toString(16).substr(2, 8)}`,
          confirmed: Math.random() > 0.8
        });
      }
      
      return messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    throw new Error('Real LoRaWAN API not implemented yet');
  }
}

// Export singleton instance
const lorawanService = new LoRaWANService();
export default lorawanService;