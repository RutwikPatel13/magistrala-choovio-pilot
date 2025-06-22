/**
 * Persistent Data Storage Service
 * Handles local storage for when Magistrala API is unavailable
 * Ensures data persistence across logout/login sessions
 */

class DataStorageService {
  constructor() {
    this.debugMode = process.env.REACT_APP_DEBUG_MODE === 'true';
    
    // Storage keys for different data types
    this.storageKeys = {
      devices: 'magistrala_devices',
      channels: 'magistrala_channels', 
      messages: 'magistrala_messages',
      users: 'magistrala_users',
      connections: 'magistrala_connections',
      analytics: 'magistrala_analytics',
      lorawan: 'magistrala_lorawan_data',
      security: 'magistrala_security_data',
      reports: 'magistrala_reports',
      metadata: 'magistrala_storage_metadata'
    };
    
    this.initializeStorage();
  }

  debugLog(message, data = null) {
    if (this.debugMode) {
      console.log(`💾 [Storage] ${message}`, data || '');
    }
  }

  // Initialize storage structure
  initializeStorage() {
    const metadata = this.getStorageMetadata();
    if (!metadata.initialized) {
      this.debugLog('Initializing persistent storage');
      
      // Set up metadata
      this.setStorageMetadata({
        initialized: true,
        version: '1.0.0',
        created_at: new Date().toISOString(),
        last_sync: null,
        api_status: 'unknown',
        user_id: null
      });
    }
  }

  // Get/Set storage metadata
  getStorageMetadata() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKeys.metadata)) || {};
    } catch (error) {
      this.debugLog('Error reading metadata, resetting:', error.message);
      return {};
    }
  }

  setStorageMetadata(metadata) {
    const current = this.getStorageMetadata();
    const updated = {
      ...current,
      ...metadata,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(this.storageKeys.metadata, JSON.stringify(updated));
  }

  // Generic storage methods with user scoping
  saveData(key, data, userId = null) {
    try {
      const scopedKey = userId ? `${key}_${userId}` : key;
      const storageData = {
        data: data,
        timestamp: new Date().toISOString(),
        userId: userId,
        source: 'local_storage'
      };
      
      localStorage.setItem(scopedKey, JSON.stringify(storageData));
      this.debugLog(`Data saved: ${scopedKey}`, { count: Array.isArray(data) ? data.length : 1 });
      
      // Update metadata
      this.setStorageMetadata({
        last_sync: new Date().toISOString(),
        [`${key}_count`]: Array.isArray(data) ? data.length : 1
      });
      
      return true;
    } catch (error) {
      this.debugLog(`Error saving ${key}:`, error.message);
      return false;
    }
  }

  getData(key, userId = null) {
    try {
      const scopedKey = userId ? `${key}_${userId}` : key;
      const stored = localStorage.getItem(scopedKey);
      
      if (!stored) {
        this.debugLog(`No data found for: ${scopedKey}`);
        return null;
      }
      
      const parsed = JSON.parse(stored);
      this.debugLog(`Data loaded: ${scopedKey}`, { 
        timestamp: parsed.timestamp,
        count: Array.isArray(parsed.data) ? parsed.data.length : 1
      });
      
      return parsed.data;
    } catch (error) {
      this.debugLog(`Error loading ${key}:`, error.message);
      return null;
    }
  }

  // Device management
  saveDevices(devices, userId = null) {
    return this.saveData(this.storageKeys.devices, devices, userId);
  }

  getDevices(userId = null) {
    return this.getData(this.storageKeys.devices, userId) || [];
  }

  addDevice(device, userId = null) {
    const devices = this.getDevices(userId);
    const existingIndex = devices.findIndex(d => d.id === device.id);
    
    if (existingIndex >= 0) {
      devices[existingIndex] = { ...devices[existingIndex], ...device };
      this.debugLog('Device updated:', device.id);
    } else {
      devices.push({
        ...device,
        created_at: device.created_at || new Date().toISOString(),
        source: 'local_storage'
      });
      this.debugLog('Device added:', device.id);
    }
    
    return this.saveDevices(devices, userId);
  }

  deleteDevice(deviceId, userId = null) {
    const devices = this.getDevices(userId);
    const filtered = devices.filter(d => d.id !== deviceId);
    this.debugLog('Device deleted:', deviceId);
    return this.saveDevices(filtered, userId);
  }

  // Channel management
  saveChannels(channels, userId = null) {
    return this.saveData(this.storageKeys.channels, channels, userId);
  }

  getChannels(userId = null) {
    return this.getData(this.storageKeys.channels, userId) || [];
  }

  addChannel(channel, userId = null) {
    const channels = this.getChannels(userId);
    const existingIndex = channels.findIndex(c => c.id === channel.id);
    
    if (existingIndex >= 0) {
      channels[existingIndex] = { ...channels[existingIndex], ...channel };
      this.debugLog('Channel updated:', channel.id);
    } else {
      channels.push({
        ...channel,
        created_at: channel.created_at || new Date().toISOString(),
        source: 'local_storage'
      });
      this.debugLog('Channel added:', channel.id);
    }
    
    return this.saveChannels(channels, userId);
  }

  deleteChannel(channelId, userId = null) {
    const channels = this.getChannels(userId);
    const filtered = channels.filter(c => c.id !== channelId);
    this.debugLog('Channel deleted:', channelId);
    return this.saveChannels(filtered, userId);
  }

  // Message management
  saveMessages(messages, channelId = null, userId = null) {
    const key = channelId ? `${this.storageKeys.messages}_${channelId}` : this.storageKeys.messages;
    return this.saveData(key, messages, userId);
  }

  getMessages(channelId = null, userId = null) {
    const key = channelId ? `${this.storageKeys.messages}_${channelId}` : this.storageKeys.messages;
    return this.getData(key, userId) || [];
  }

  addMessage(message, channelId = null, userId = null) {
    const messages = this.getMessages(channelId, userId);
    messages.unshift({
      ...message,
      timestamp: message.timestamp || new Date().toISOString(),
      source: 'local_storage'
    });
    
    // Keep only last 1000 messages to prevent storage bloat
    if (messages.length > 1000) {
      messages.splice(1000);
    }
    
    this.debugLog('Message added:', { channelId, messageId: message.id });
    return this.saveMessages(messages, channelId, userId);
  }

  // Connection management
  saveConnections(connections, userId = null) {
    return this.saveData(this.storageKeys.connections, connections, userId);
  }

  getConnections(userId = null) {
    return this.getData(this.storageKeys.connections, userId) || [];
  }

  addConnection(thingId, channelId, userId = null) {
    const connections = this.getConnections(userId);
    const connection = {
      thing_id: thingId,
      channel_id: channelId,
      created_at: new Date().toISOString(),
      source: 'local_storage'
    };
    
    // Check if connection already exists
    const exists = connections.some(c => c.thing_id === thingId && c.channel_id === channelId);
    if (!exists) {
      connections.push(connection);
      this.debugLog('Connection added:', { thingId, channelId });
      return this.saveConnections(connections, userId);
    }
    
    return true;
  }

  removeConnection(thingId, channelId, userId = null) {
    const connections = this.getConnections(userId);
    const filtered = connections.filter(c => !(c.thing_id === thingId && c.channel_id === channelId));
    this.debugLog('Connection removed:', { thingId, channelId });
    return this.saveConnections(filtered, userId);
  }

  // Analytics data
  saveAnalytics(analytics, userId = null) {
    return this.saveData(this.storageKeys.analytics, analytics, userId);
  }

  getAnalytics(userId = null) {
    return this.getData(this.storageKeys.analytics, userId) || {
      device_count: 0,
      channel_count: 0,
      message_count: 0,
      active_connections: 0,
      last_activity: null
    };
  }

  updateAnalytics(userId = null) {
    const devices = this.getDevices(userId);
    const channels = this.getChannels(userId);
    const connections = this.getConnections(userId);
    
    // Calculate total messages across all channels
    let totalMessages = 0;
    channels.forEach(channel => {
      const channelMessages = this.getMessages(channel.id, userId);
      totalMessages += channelMessages.length;
    });
    
    const analytics = {
      device_count: devices.length,
      channel_count: channels.length,
      message_count: totalMessages,
      active_connections: connections.length,
      last_activity: new Date().toISOString(),
      devices_by_status: {
        online: devices.filter(d => d.status === 'online').length,
        offline: devices.filter(d => d.status === 'offline').length,
        error: devices.filter(d => d.status === 'error').length
      }
    };
    
    this.saveAnalytics(analytics, userId);
    return analytics;
  }

  // LoRaWAN specific data
  saveLoRaWANData(data, userId = null) {
    return this.saveData(this.storageKeys.lorawan, data, userId);
  }

  getLoRaWANData(userId = null) {
    return this.getData(this.storageKeys.lorawan, userId) || {
      gateways: [],
      end_devices: [],
      network_settings: {}
    };
  }

  // Security data
  saveSecurityData(data, userId = null) {
    return this.saveData(this.storageKeys.security, data, userId);
  }

  getSecurityData(userId = null) {
    return this.getData(this.storageKeys.security, userId) || {
      certificates: [],
      access_logs: [],
      security_policies: []
    };
  }

  // User management
  saveUsers(users, userId = null) {
    return this.saveData(this.storageKeys.users, users, userId);
  }

  getUsers(userId = null) {
    return this.getData(this.storageKeys.users, userId) || [];
  }

  // Data export/import
  exportAllData(userId = null) {
    try {
      const exportData = {
        metadata: {
          exported_at: new Date().toISOString(),
          version: '1.0.0',
          user_id: userId
        },
        devices: this.getDevices(userId),
        channels: this.getChannels(userId),
        connections: this.getConnections(userId),
        analytics: this.getAnalytics(userId),
        lorawan: this.getLoRaWANData(userId),
        security: this.getSecurityData(userId),
        users: this.getUsers(userId)
      };
      
      // Add messages for each channel
      exportData.messages = {};
      exportData.channels.forEach(channel => {
        exportData.messages[channel.id] = this.getMessages(channel.id, userId);
      });
      
      this.debugLog('Data exported successfully');
      return exportData;
    } catch (error) {
      this.debugLog('Export failed:', error.message);
      return null;
    }
  }

  importData(importData, userId = null) {
    try {
      if (importData.devices) this.saveDevices(importData.devices, userId);
      if (importData.channels) this.saveChannels(importData.channels, userId);
      if (importData.connections) this.saveConnections(importData.connections, userId);
      if (importData.analytics) this.saveAnalytics(importData.analytics, userId);
      if (importData.lorawan) this.saveLoRaWANData(importData.lorawan, userId);
      if (importData.security) this.saveSecurityData(importData.security, userId);
      if (importData.users) this.saveUsers(importData.users, userId);
      
      // Import messages for each channel
      if (importData.messages) {
        Object.entries(importData.messages).forEach(([channelId, messages]) => {
          this.saveMessages(messages, channelId, userId);
        });
      }
      
      this.setStorageMetadata({
        imported_at: new Date().toISOString(),
        import_source: importData.metadata?.version || 'unknown'
      });
      
      this.debugLog('Data imported successfully');
      return true;
    } catch (error) {
      this.debugLog('Import failed:', error.message);
      return false;
    }
  }

  // Clear user data (for logout)
  clearUserData(userId) {
    if (!userId) return;
    
    Object.values(this.storageKeys).forEach(key => {
      const scopedKey = `${key}_${userId}`;
      localStorage.removeItem(scopedKey);
      
      // Also remove channel-specific message data
      if (key === this.storageKeys.messages) {
        const channels = this.getChannels(userId) || [];
        channels.forEach(channel => {
          localStorage.removeItem(`${scopedKey}_${channel.id}`);
        });
      }
    });
    
    this.debugLog('User data cleared:', userId);
  }

  // Get storage usage stats
  getStorageStats() {
    let totalSize = 0;
    const stats = {};
    
    Object.entries(this.storageKeys).forEach(([name, key]) => {
      const data = localStorage.getItem(key);
      const size = data ? new Blob([data]).size : 0;
      stats[name] = {
        size: size,
        entries: data ? (JSON.parse(data).data?.length || 1) : 0
      };
      totalSize += size;
    });
    
    return {
      total_size: totalSize,
      total_size_mb: (totalSize / 1024 / 1024).toFixed(2),
      breakdown: stats,
      available_space: 5 * 1024 * 1024 - totalSize // Assume 5MB limit
    };
  }

  // Clean up old data
  cleanup(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    let cleaned = 0;
    
    // Clean old messages
    Object.values(this.storageKeys).forEach(key => {
      if (key.includes('messages')) {
        const data = this.getData(key);
        if (data && Array.isArray(data)) {
          const filtered = data.filter(item => {
            const itemDate = new Date(item.timestamp || item.created_at);
            return itemDate > cutoffDate;
          });
          
          if (filtered.length < data.length) {
            this.saveData(key, filtered);
            cleaned += data.length - filtered.length;
          }
        }
      }
    });
    
    this.debugLog(`Cleanup completed: ${cleaned} items removed`);
    return cleaned;
  }
}

// Export singleton instance
export default new DataStorageService();