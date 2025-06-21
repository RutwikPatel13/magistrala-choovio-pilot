// Real-time Messaging Service for Magistrala
// Supports WebSocket and MQTT protocols for live data streaming

import mqtt from 'mqtt';

class RealtimeService {
  constructor() {
    this.wsConnections = new Map();
    this.mqttClients = new Map();
    this.listeners = new Map();
    this.connectionStatus = {
      websocket: 'disconnected',
      mqtt: 'disconnected'
    };
    
    // Configuration from environment
    this.config = {
      websocket: {
        baseURL: process.env.REACT_APP_MAGISTRALA_WS_URL || 'ws://localhost:8186',
        reconnectInterval: 5000,
        maxReconnectAttempts: 10
      },
      mqtt: {
        brokerURL: process.env.REACT_APP_MAGISTRALA_MQTT_URL || 'ws://localhost:9001',
        options: {
          clientId: `magistrala_dashboard_${Math.random().toString(16).substr(2, 8)}`,
          clean: true,
          connectTimeout: 4000,
          reconnectPeriod: 1000,
          protocol: 'ws'
        }
      }
    };

    this.reconnectAttempts = {
      websocket: 0,
      mqtt: 0
    };
  }

  // WebSocket Management
  async connectWebSocket(channelId, token) {
    const connectionKey = `ws_${channelId}`;
    
    if (this.wsConnections.has(connectionKey)) {
      console.log(`WebSocket already connected for channel ${channelId}`);
      return this.wsConnections.get(connectionKey);
    }

    try {
      const wsURL = `${this.config.websocket.baseURL}/channels/${channelId}/messages`;
      const ws = new WebSocket(wsURL, ['protocol', token]);
      
      ws.onopen = () => {
        console.log(`✅ WebSocket connected for channel ${channelId}`);
        this.connectionStatus.websocket = 'connected';
        this.reconnectAttempts.websocket = 0;
        this.notifyListeners('connectionStatus', this.connectionStatus);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.notifyListeners(`channel_${channelId}`, {
            type: 'websocket',
            channelId,
            data: message,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log(`🔌 WebSocket disconnected for channel ${channelId}:`, event.reason);
        this.connectionStatus.websocket = 'disconnected';
        this.wsConnections.delete(connectionKey);
        this.notifyListeners('connectionStatus', this.connectionStatus);
        
        // Attempt reconnection
        if (this.reconnectAttempts.websocket < this.config.websocket.maxReconnectAttempts) {
          this.reconnectAttempts.websocket++;
          setTimeout(() => {
            console.log(`🔄 Attempting WebSocket reconnection ${this.reconnectAttempts.websocket}/${this.config.websocket.maxReconnectAttempts}`);
            this.connectWebSocket(channelId, token);
          }, this.config.websocket.reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error(`❌ WebSocket error for channel ${channelId}:`, error);
        this.connectionStatus.websocket = 'error';
        this.notifyListeners('connectionStatus', this.connectionStatus);
      };

      this.wsConnections.set(connectionKey, ws);
      return ws;
    } catch (error) {
      console.error(`Failed to connect WebSocket for channel ${channelId}:`, error);
      throw error;
    }
  }

  disconnectWebSocket(channelId) {
    const connectionKey = `ws_${channelId}`;
    const ws = this.wsConnections.get(connectionKey);
    
    if (ws) {
      ws.close();
      this.wsConnections.delete(connectionKey);
      console.log(`🔌 WebSocket disconnected for channel ${channelId}`);
    }
  }

  // MQTT Management
  async connectMQTT(channelId, thingSecret) {
    const connectionKey = `mqtt_${channelId}`;
    
    if (this.mqttClients.has(connectionKey)) {
      console.log(`MQTT already connected for channel ${channelId}`);
      return this.mqttClients.get(connectionKey);
    }

    try {
      const client = mqtt.connect(this.config.mqtt.brokerURL, {
        ...this.config.mqtt.options,
        username: channelId,
        password: thingSecret
      });

      client.on('connect', () => {
        console.log(`✅ MQTT connected for channel ${channelId}`);
        this.connectionStatus.mqtt = 'connected';
        this.reconnectAttempts.mqtt = 0;
        this.notifyListeners('connectionStatus', this.connectionStatus);
        
        // Subscribe to channel messages
        const topic = `channels/${channelId}/messages/+`;
        client.subscribe(topic, (err) => {
          if (err) {
            console.error(`Failed to subscribe to MQTT topic ${topic}:`, err);
          } else {
            console.log(`📡 Subscribed to MQTT topic: ${topic}`);
          }
        });
      });

      client.on('message', (topic, message) => {
        try {
          const data = JSON.parse(message.toString());
          const subtopic = topic.split('/').pop();
          
          this.notifyListeners(`channel_${channelId}`, {
            type: 'mqtt',
            channelId,
            subtopic,
            data,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Failed to parse MQTT message:', error);
        }
      });

      client.on('close', () => {
        console.log(`🔌 MQTT disconnected for channel ${channelId}`);
        this.connectionStatus.mqtt = 'disconnected';
        this.mqttClients.delete(connectionKey);
        this.notifyListeners('connectionStatus', this.connectionStatus);
      });

      client.on('error', (error) => {
        console.error(`❌ MQTT error for channel ${channelId}:`, error);
        this.connectionStatus.mqtt = 'error';
        this.notifyListeners('connectionStatus', this.connectionStatus);
      });

      client.on('reconnect', () => {
        console.log(`🔄 MQTT reconnecting for channel ${channelId}...`);
        this.connectionStatus.mqtt = 'reconnecting';
        this.notifyListeners('connectionStatus', this.connectionStatus);
      });

      this.mqttClients.set(connectionKey, client);
      return client;
    } catch (error) {
      console.error(`Failed to connect MQTT for channel ${channelId}:`, error);
      throw error;
    }
  }

  disconnectMQTT(channelId) {
    const connectionKey = `mqtt_${channelId}`;
    const client = this.mqttClients.get(connectionKey);
    
    if (client) {
      client.end();
      this.mqttClients.delete(connectionKey);
      console.log(`🔌 MQTT disconnected for channel ${channelId}`);
    }
  }

  // Message Publishing via MQTT
  async publishMessage(channelId, subtopic, message, thingSecret) {
    const connectionKey = `mqtt_${channelId}`;
    let client = this.mqttClients.get(connectionKey);
    
    if (!client) {
      client = await this.connectMQTT(channelId, thingSecret);
    }
    
    return new Promise((resolve, reject) => {
      const topic = `channels/${channelId}/messages/${subtopic}`;
      const payload = JSON.stringify(message);
      
      client.publish(topic, payload, { qos: 1 }, (error) => {
        if (error) {
          console.error(`Failed to publish MQTT message to ${topic}:`, error);
          reject(error);
        } else {
          console.log(`📤 MQTT message published to ${topic}`);
          resolve();
        }
      });
    });
  }

  // Listener Management
  addListener(eventKey, callback) {
    if (!this.listeners.has(eventKey)) {
      this.listeners.set(eventKey, new Set());
    }
    this.listeners.get(eventKey).add(callback);
    
    console.log(`👂 Listener added for ${eventKey}`);
    return () => this.removeListener(eventKey, callback);
  }

  removeListener(eventKey, callback) {
    const listeners = this.listeners.get(eventKey);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.listeners.delete(eventKey);
      }
    }
  }

  notifyListeners(eventKey, data) {
    const listeners = this.listeners.get(eventKey);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener callback for ${eventKey}:`, error);
        }
      });
    }
  }

  // Connection Management
  getConnectionStatus() {
    return this.connectionStatus;
  }

  isConnected(protocol = null) {
    if (protocol) {
      return this.connectionStatus[protocol] === 'connected';
    }
    return Object.values(this.connectionStatus).some(status => status === 'connected');
  }

  // Cleanup
  disconnectAll() {
    console.log('🧹 Cleaning up all real-time connections...');
    
    // Disconnect all WebSockets
    this.wsConnections.forEach((ws, key) => {
      ws.close();
    });
    this.wsConnections.clear();
    
    // Disconnect all MQTT clients
    this.mqttClients.forEach((client, key) => {
      client.end();
    });
    this.mqttClients.clear();
    
    // Clear all listeners
    this.listeners.clear();
    
    // Reset connection status
    this.connectionStatus = {
      websocket: 'disconnected',
      mqtt: 'disconnected'
    };
    
    console.log('✅ All real-time connections cleaned up');
  }

  // Protocol-specific helpers
  subscribeToChannel(channelId, options = {}) {
    const { protocol = 'both', token, thingSecret, onMessage } = options;
    
    const unsubscribers = [];
    
    if (onMessage) {
      const unsubscribe = this.addListener(`channel_${channelId}`, onMessage);
      unsubscribers.push(unsubscribe);
    }
    
    if (protocol === 'websocket' || protocol === 'both') {
      if (token) {
        this.connectWebSocket(channelId, token).catch(console.error);
      }
    }
    
    if (protocol === 'mqtt' || protocol === 'both') {
      if (thingSecret) {
        this.connectMQTT(channelId, thingSecret).catch(console.error);
      }
    }
    
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
      this.disconnectWebSocket(channelId);
      this.disconnectMQTT(channelId);
    };
  }

  // Multi-protocol message sending
  async sendMessage(channelId, message, options = {}) {
    const { protocol = 'mqtt', subtopic = 'data', thingSecret } = options;
    
    if (protocol === 'mqtt' && thingSecret) {
      return this.publishMessage(channelId, subtopic, message, thingSecret);
    } else {
      throw new Error(`Unsupported protocol or missing credentials: ${protocol}`);
    }
  }
}

// Singleton instance
const realtimeService = new RealtimeService();

export default realtimeService;