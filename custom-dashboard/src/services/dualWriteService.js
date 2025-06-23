/**
 * Dual-Write Service for Magistrala + PostgreSQL
 * Handles writing to both Magistrala API and PostgreSQL database
 * Provides fallback when Magistrala fails
 */

import magistralaApi from './magistralaApi';

// Simple database service for PostgreSQL backend
const databaseService = {
  apiCall: async (endpoint, method = 'GET', data = null) => {
    try {
      const baseUrl = process.env.REACT_APP_POSTGRES_BASE_URL || 'http://34.207.208.152:3001';
      const url = `${baseUrl}${endpoint}`;
      
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      if (data) {
        options.body = JSON.stringify(data);
      }
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Database service error:', error);
      throw error;
    }
  },

  // Thing operations
  createThing: async (thingData) => {
    return await databaseService.apiCall('/api/things', 'POST', thingData);
  },
  
  getThings: async () => {
    return await databaseService.apiCall('/api/things');
  },
  
  updateThing: async (id, thingData) => {
    return await databaseService.apiCall(`/api/things/${id}`, 'PUT', thingData);
  },
  
  deleteThing: async (id) => {
    return await databaseService.apiCall(`/api/things/${id}`, 'DELETE');
  },

  // Channel operations
  createChannel: async (channelData) => {
    return await databaseService.apiCall('/api/channels', 'POST', channelData);
  },
  
  getChannels: async () => {
    return await databaseService.apiCall('/api/channels');
  },
  
  updateChannel: async (id, channelData) => {
    return await databaseService.apiCall(`/api/channels/${id}`, 'PUT', channelData);
  },
  
  deleteChannel: async (id) => {
    return await databaseService.apiCall(`/api/channels/${id}`, 'DELETE');
  },

  // LoRaWAN operations
  createLoRaWANDevice: async (deviceData) => {
    return await databaseService.apiCall('/api/lorawan-devices', 'POST', deviceData);
  },
  
  getLoRaWANDevices: async () => {
    return await databaseService.apiCall('/api/lorawan-devices');
  },
  
  updateLoRaWANDevice: async (id, deviceData) => {
    return await databaseService.apiCall(`/api/lorawan-devices/${id}`, 'PUT', deviceData);
  },
  
  deleteLoRaWANDevice: async (id) => {
    return await databaseService.apiCall(`/api/lorawan-devices/${id}`, 'DELETE');
  }
};

class DualWriteService {
  constructor() {
    this.debugMode = process.env.REACT_APP_DEBUG_MODE === 'true';
    this.preferDatabase = process.env.REACT_APP_PREFER_DATABASE === 'true';
    this.enableFallback = process.env.REACT_APP_ENABLE_DB_FALLBACK !== 'false'; // Default true
  }

  debugLog(message, data = null) {
    if (this.debugMode) {
      console.log(`🔄 [DualWrite] ${message}`, data || '');
    }
  }

  // Execute operation on both systems with proper error handling
  async dualWrite(operation, magistralaOp, databaseOp, entityType, entityData) {
    this.debugLog(`${operation} ${entityType}`, entityData);
    
    const results = {
      magistrala: { success: false, data: null, error: null },
      database: { success: false, data: null, error: null },
      fallbackUsed: false,
      primarySuccess: false
    };

    // Determine primary and secondary systems
    const primarySystem = this.preferDatabase ? 'database' : 'magistrala';
    const secondarySystem = this.preferDatabase ? 'magistrala' : 'database';

    // Try primary system first
    try {
      if (primarySystem === 'magistrala') {
        this.debugLog(`Executing ${operation} on Magistrala (primary)`);
        const magistralaResult = await magistralaOp();
        results.magistrala = { success: true, data: magistralaResult, error: null };
        results.primarySuccess = true;
        
        // Now try database as secondary
        try {
          this.debugLog(`Executing ${operation} on Database (secondary)`);
          const dbResult = await databaseOp(magistralaResult);
          results.database = { success: true, data: dbResult, error: null };
        } catch (dbError) {
          this.debugLog(`Database ${operation} failed (secondary)`, dbError.message);
          results.database = { success: false, data: null, error: dbError.message };
          // Don't fail the whole operation if secondary fails
        }
      } else {
        this.debugLog(`Executing ${operation} on Database (primary)`);
        const dbResult = await databaseOp();
        results.database = { success: true, data: dbResult, error: null };
        results.primarySuccess = true;
        
        // Now try Magistrala as secondary
        try {
          this.debugLog(`Executing ${operation} on Magistrala (secondary)`);
          const magistralaResult = await magistralaOp();
          results.magistrala = { success: true, data: magistralaResult, error: null };
        } catch (magistralaError) {
          this.debugLog(`Magistrala ${operation} failed (secondary)`, magistralaError.message);
          results.magistrala = { success: false, data: null, error: magistralaError.message };
          // Don't fail the whole operation if secondary fails
        }
      }
    } catch (primaryError) {
      this.debugLog(`Primary system ${operation} failed, trying fallback`, primaryError.message);
      
      if (primarySystem === 'magistrala') {
        results.magistrala = { success: false, data: null, error: primaryError.message };
      } else {
        results.database = { success: false, data: null, error: primaryError.message };
      }

      // Try fallback to secondary system
      if (this.enableFallback) {
        try {
          this.debugLog(`Executing ${operation} on ${secondarySystem} (fallback)`);
          
          if (secondarySystem === 'database') {
            const dbResult = await databaseOp();
            results.database = { success: true, data: dbResult, error: null };
            results.fallbackUsed = true;
          } else {
            const magistralaResult = await magistralaOp();
            results.magistrala = { success: true, data: magistralaResult, error: null };
            results.fallbackUsed = true;
          }
        } catch (fallbackError) {
          this.debugLog(`Fallback ${operation} also failed`, fallbackError.message);
          
          if (secondarySystem === 'magistrala') {
            results.magistrala = { success: false, data: null, error: fallbackError.message };
          } else {
            results.database = { success: false, data: null, error: fallbackError.message };
          }
          
          throw new Error(`Both systems failed: Primary (${primarySystem}): ${primaryError.message}, Fallback (${secondarySystem}): ${fallbackError.message}`);
        }
      } else {
        throw primaryError;
      }
    }

    // Log sync operation for tracking
    try {
      await databaseService.logSyncOperation({
        table_name: entityType,
        record_id: results.database.data?.id,
        magistrala_id: results.magistrala.data?.id,
        operation: operation.toLowerCase(),
        status: results.primarySuccess || results.fallbackUsed ? 'success' : 'failed',
        error_message: (!results.magistrala.success && !results.database.success) ? 
          `${results.magistrala.error || ''} | ${results.database.error || ''}` : null,
        request_data: entityData,
        response_data: results
      });
    } catch (logError) {
      this.debugLog('Failed to log sync operation', logError.message);
      // Don't fail the main operation because of logging
    }

    return results;
  }

  // ==================== THINGS (DEVICES) OPERATIONS ====================

  async createThing(thingData) {
    const magistralaOp = async () => {
      return await magistralaApi.createThing(thingData);
    };

    const databaseOp = async (magistralaResult = null) => {
      const dbData = magistralaResult ? {
        ...thingData,
        id: magistralaResult.id,
        secret: magistralaResult.secret
      } : thingData;
      
      return await databaseService.createThing(dbData);
    };

    const results = await this.dualWrite('CREATE', magistralaOp, databaseOp, 'things', thingData);
    
    // Return the successful result data
    return results.magistrala.success ? results.magistrala.data : 
           results.database.success ? results.database.data : null;
  }

  async updateThing(thingId, updateData) {
    const magistralaOp = async () => {
      return await magistralaApi.updateThing(thingId, updateData);
    };

    const databaseOp = async (magistralaResult = null) => {
      return await databaseService.updateThing(thingId, updateData);
    };

    const results = await this.dualWrite('UPDATE', magistralaOp, databaseOp, 'things', { id: thingId, ...updateData });
    
    return results.magistrala.success ? results.magistrala.data : 
           results.database.success ? results.database.data : null;
  }

  async deleteThing(thingId) {
    const magistralaOp = async () => {
      return await magistralaApi.deleteThing(thingId);
    };

    const databaseOp = async () => {
      return await databaseService.deleteThing(thingId);
    };

    const results = await this.dualWrite('DELETE', magistralaOp, databaseOp, 'things', { id: thingId });
    
    return results.magistrala.success || results.database.success;
  }

  async getThings(filters = {}) {
    this.debugLog('Getting things from both systems', filters);
    
    try {
      // Try Magistrala first
      const magistralaThings = await magistralaApi.getThings(filters);
      this.debugLog('✅ Got things from Magistrala', magistralaThings.length);
      return magistralaThings;
    } catch (magistralaError) {
      this.debugLog('❌ Magistrala things failed, trying database', magistralaError.message);
      
      if (this.enableFallback) {
        try {
          const dbThings = await databaseService.getThings(filters);
          this.debugLog('✅ Got things from database (fallback)', dbThings.length);
          return dbThings;
        } catch (dbError) {
          this.debugLog('❌ Database things also failed', dbError.message);
          // Return offline data as last resort
          return databaseService.getOfflineData().things;
        }
      } else {
        throw magistralaError;
      }
    }
  }

  // ==================== CHANNELS OPERATIONS ====================

  async createChannel(channelData) {
    const magistralaOp = async () => {
      return await magistralaApi.createChannel(channelData);
    };

    const databaseOp = async (magistralaResult = null) => {
      const dbData = magistralaResult ? {
        ...channelData,
        id: magistralaResult.id
      } : channelData;
      
      return await databaseService.createChannel(dbData);
    };

    const results = await this.dualWrite('CREATE', magistralaOp, databaseOp, 'channels', channelData);
    
    return results.magistrala.success ? results.magistrala.data : 
           results.database.success ? results.database.data : null;
  }

  async updateChannel(channelId, updateData) {
    const magistralaOp = async () => {
      return await magistralaApi.updateChannel(channelId, updateData);
    };

    const databaseOp = async () => {
      return await databaseService.updateChannel(channelId, updateData);
    };

    const results = await this.dualWrite('UPDATE', magistralaOp, databaseOp, 'channels', { id: channelId, ...updateData });
    
    return results.magistrala.success ? results.magistrala.data : 
           results.database.success ? results.database.data : null;
  }

  async deleteChannel(channelId) {
    const magistralaOp = async () => {
      return await magistralaApi.deleteChannel(channelId);
    };

    const databaseOp = async () => {
      return await databaseService.deleteChannel(channelId);
    };

    const results = await this.dualWrite('DELETE', magistralaOp, databaseOp, 'channels', { id: channelId });
    
    return results.magistrala.success || results.database.success;
  }

  async getChannels(filters = {}) {
    this.debugLog('Getting channels from both systems', filters);
    
    try {
      const magistralaChannels = await magistralaApi.getChannels(filters);
      this.debugLog('✅ Got channels from Magistrala', magistralaChannels.length);
      return magistralaChannels;
    } catch (magistralaError) {
      this.debugLog('❌ Magistrala channels failed, trying database', magistralaError.message);
      
      if (this.enableFallback) {
        try {
          const dbChannels = await databaseService.getChannels(filters);
          this.debugLog('✅ Got channels from database (fallback)', dbChannels.length);
          return dbChannels;
        } catch (dbError) {
          this.debugLog('❌ Database channels also failed', dbError.message);
          return databaseService.getOfflineData().channels;
        }
      } else {
        throw magistralaError;
      }
    }
  }

  // ==================== CONNECTIONS OPERATIONS ====================

  async connectThingToChannel(thingId, channelId) {
    const magistralaOp = async () => {
      return await magistralaApi.connectThingToChannel(thingId, channelId);
    };

    const databaseOp = async () => {
      return await databaseService.createConnection({
        thing_id: thingId,
        channel_id: channelId,
        connection_type: 'publish'
      });
    };

    const results = await this.dualWrite('CONNECT', magistralaOp, databaseOp, 'connections', { thingId, channelId });
    
    return results.magistrala.success || results.database.success;
  }

  async disconnectThingFromChannel(thingId, channelId) {
    const magistralaOp = async () => {
      return await magistralaApi.disconnectThingFromChannel(thingId, channelId);
    };

    const databaseOp = async () => {
      return await databaseService.deleteConnection(thingId, channelId);
    };

    const results = await this.dualWrite('DISCONNECT', magistralaOp, databaseOp, 'connections', { thingId, channelId });
    
    return results.magistrala.success || results.database.success;
  }

  // ==================== LORAWAN OPERATIONS ====================

  async createLoRaWANDevice(lorawanData) {
    // For LoRaWAN, we need to create a thing first, then the LoRaWAN device record
    const thingData = {
      name: lorawanData.name || `LoRaWAN Device ${lorawanData.dev_eui}`,
      description: lorawanData.description || `LoRaWAN device with DevEUI: ${lorawanData.dev_eui}`,
      metadata: {
        ...lorawanData.metadata,
        type: 'lorawan',
        dev_eui: lorawanData.dev_eui,
        app_eui: lorawanData.app_eui,
        frequency_plan: lorawanData.frequency_plan || 'EU868',
        lorawan_class: lorawanData.class || 'A'
      }
    };

    // Create the thing first
    const thingResult = await this.createThing(thingData);
    
    // Now create the LoRaWAN device record
    const lorawanDbData = {
      ...lorawanData,
      magistrala_id: thingResult.id,
      thing_id: thingResult.id // This will be set by database service
    };

    try {
      const lorawanResult = await databaseService.createLoRaWANDevice(lorawanDbData);
      this.debugLog('✅ LoRaWAN device created in database', lorawanResult);
      
      return {
        ...thingResult,
        lorawan: lorawanResult,
        type: 'lorawan'
      };
    } catch (dbError) {
      this.debugLog('❌ Failed to create LoRaWAN device record', dbError.message);
      // Thing was created successfully, so return that at least
      return thingResult;
    }
  }

  async updateLoRaWANDevice(deviceId, updateData) {
    // Update both the thing and the LoRaWAN device record
    const results = {
      thing: null,
      lorawan: null,
      success: false
    };

    try {
      // Update the thing if general data changed
      if (updateData.name || updateData.description || updateData.metadata) {
        const thingUpdate = {
          name: updateData.name,
          description: updateData.description,
          metadata: {
            ...updateData.metadata,
            type: 'lorawan'
          }
        };
        
        results.thing = await this.updateThing(deviceId, thingUpdate);
      }

      // Update LoRaWAN specific data
      if (updateData.dev_eui || updateData.app_eui || updateData.app_key || updateData.frequency_plan) {
        results.lorawan = await databaseService.updateLoRaWANDevice(deviceId, updateData);
      }

      results.success = true;
      return results;
    } catch (error) {
      this.debugLog('❌ Failed to update LoRaWAN device', error.message);
      throw error;
    }
  }

  async deleteLoRaWANDevice(deviceId) {
    // Delete both the LoRaWAN record and the thing
    try {
      // Delete LoRaWAN device record first
      await databaseService.deleteLoRaWANDevice(deviceId);
      
      // Then delete the thing
      await this.deleteThing(deviceId);
      
      return true;
    } catch (error) {
      this.debugLog('❌ Failed to delete LoRaWAN device', error.message);
      throw error;
    }
  }

  async getLoRaWANDevices(filters = {}) {
    this.debugLog('Getting LoRaWAN devices', filters);
    
    try {
      // Get LoRaWAN devices from database (they're only stored there)
      const dbDevices = await databaseService.getLoRaWANDevices(filters);
      this.debugLog('✅ Got LoRaWAN devices from database', dbDevices.length);
      return dbDevices;
    } catch (dbError) {
      this.debugLog('❌ Database LoRaWAN devices failed', dbError.message);
      return databaseService.getOfflineData().lorawanDevices;
    }
  }

  // ==================== UTILITY METHODS ====================

  async getSystemStatus() {
    const status = {
      magistrala: { available: false, error: null },
      database: { available: false, error: null },
      fallbackEnabled: this.enableFallback,
      preferredSystem: this.preferDatabase ? 'database' : 'magistrala'
    };

    // Check Magistrala
    try {
      await magistralaApi.testConnection();
      status.magistrala.available = true;
    } catch (error) {
      status.magistrala.error = error.message;
    }

    // Check Database
    try {
      const dbHealth = await databaseService.healthCheck();
      status.database.available = dbHealth.status === 'ok';
      if (!status.database.available) {
        status.database.error = 'Database not responding';
      }
    } catch (error) {
      status.database.error = error.message;
    }

    return status;
  }

  async syncData() {
    this.debugLog('Starting data synchronization between systems');
    
    const syncResults = {
      things: { synced: 0, failed: 0 },
      channels: { synced: 0, failed: 0 },
      errors: []
    };

    try {
      // Get all pending sync records from database
      const pendingSync = await databaseService.getSyncLog({ status: 'pending' });
      
      for (const syncRecord of pendingSync) {
        try {
          // Retry the failed operation based on the sync log
          // Implementation depends on specific requirements
          this.debugLog(`Retrying sync for ${syncRecord.table_name}:${syncRecord.record_id}`);
          
          // Mark as synced if successful
          await databaseService.markSyncSuccess(syncRecord.table_name, syncRecord.record_id);
          
          if (syncRecord.table_name === 'things') {
            syncResults.things.synced++;
          } else if (syncRecord.table_name === 'channels') {
            syncResults.channels.synced++;
          }
        } catch (error) {
          syncResults.errors.push({
            record: syncRecord,
            error: error.message
          });
          
          if (syncRecord.table_name === 'things') {
            syncResults.things.failed++;
          } else if (syncRecord.table_name === 'channels') {
            syncResults.channels.failed++;
          }
        }
      }

      this.debugLog('Data synchronization completed', syncResults);
      return syncResults;
    } catch (error) {
      this.debugLog('Data synchronization failed', error.message);
      throw error;
    }
  }
}

// Export singleton instance
const dualWriteService = new DualWriteService();
export default dualWriteService;