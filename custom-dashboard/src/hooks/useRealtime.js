// React Hook for Real-time Messaging with Magistrala
// Provides easy integration with WebSocket and MQTT protocols

import { useState, useEffect, useCallback, useRef } from 'react';
import realtimeService from '../services/realtimeService';

export const useRealtime = (channelId, options = {}) => {
  const {
    protocol = 'both',
    token,
    thingSecret,
    autoConnect = true,
    maxMessages = 100
  } = options;

  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState(realtimeService.getConnectionStatus());
  const [isConnected, setIsConnected] = useState(false);
  const unsubscribeRef = useRef(null);

  // Handle incoming messages
  const handleMessage = useCallback((messageData) => {
    setMessages(prev => {
      const newMessages = [messageData, ...prev];
      return newMessages.slice(0, maxMessages);
    });
  }, [maxMessages]);

  // Handle connection status changes
  const handleConnectionStatus = useCallback((status) => {
    setConnectionStatus(status);
    setIsConnected(realtimeService.isConnected());
  }, []);

  // Connect to real-time services
  const connect = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    if (!channelId) {
      console.warn('Cannot connect: channelId is required');
      return;
    }

    try {
      // Subscribe to channel messages and connection status
      const unsubscribeChannel = realtimeService.addListener(`channel_${channelId}`, handleMessage);
      const unsubscribeStatus = realtimeService.addListener('connectionStatus', handleConnectionStatus);

      // Subscribe to the channel
      const unsubscribeProtocol = realtimeService.subscribeToChannel(channelId, {
        protocol,
        token,
        thingSecret,
        onMessage: handleMessage
      });

      // Combine all unsubscribe functions
      unsubscribeRef.current = () => {
        unsubscribeChannel();
        unsubscribeStatus();
        unsubscribeProtocol();
      };

      console.log(`🔌 Connected to real-time services for channel ${channelId}`);
    } catch (error) {
      console.error('Failed to connect to real-time services:', error);
    }
  }, [channelId, protocol, token, thingSecret, handleMessage, handleConnectionStatus]);

  // Disconnect from real-time services
  const disconnect = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    console.log(`🔌 Disconnected from real-time services for channel ${channelId}`);
  }, [channelId]);

  // Send message via real-time protocol
  const sendMessage = useCallback(async (message, sendOptions = {}) => {
    if (!channelId) {
      throw new Error('Cannot send message: channelId is required');
    }

    try {
      await realtimeService.sendMessage(channelId, message, {
        protocol: sendOptions.protocol || 'mqtt',
        subtopic: sendOptions.subtopic || 'data',
        thingSecret: sendOptions.thingSecret || thingSecret
      });
      
      console.log(`📤 Message sent to channel ${channelId}`);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [channelId, thingSecret]);

  // Clear message history
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && channelId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, channelId, connect, disconnect]);

  // Update connection status on mount
  useEffect(() => {
    setConnectionStatus(realtimeService.getConnectionStatus());
    setIsConnected(realtimeService.isConnected());
  }, []);

  return {
    messages,
    connectionStatus,
    isConnected,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
    // Computed properties
    wsConnected: connectionStatus.websocket === 'connected',
    mqttConnected: connectionStatus.mqtt === 'connected',
    hasAnyConnection: isConnected,
    messageCount: messages.length
  };
};

// Hook for connection status only (useful for global status indicators)
export const useConnectionStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState(realtimeService.getConnectionStatus());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleStatusChange = (status) => {
      setConnectionStatus(status);
      setIsConnected(realtimeService.isConnected());
    };

    const unsubscribe = realtimeService.addListener('connectionStatus', handleStatusChange);
    
    // Initial status
    setConnectionStatus(realtimeService.getConnectionStatus());
    setIsConnected(realtimeService.isConnected());

    return unsubscribe;
  }, []);

  return {
    connectionStatus,
    isConnected,
    wsConnected: connectionStatus.websocket === 'connected',
    mqttConnected: connectionStatus.mqtt === 'connected'
  };
};

// Hook for multi-channel monitoring
export const useMultiChannelRealtime = (channelIds = [], options = {}) => {
  const [allMessages, setAllMessages] = useState({});
  const [connectionStatus, setConnectionStatus] = useState(realtimeService.getConnectionStatus());
  const unsubscribersRef = useRef({});

  const { maxMessagesPerChannel = 50, autoConnect = true } = options;

  const handleMessage = useCallback((channelId) => (messageData) => {
    setAllMessages(prev => {
      const channelMessages = prev[channelId] || [];
      const newMessages = [messageData, ...channelMessages];
      return {
        ...prev,
        [channelId]: newMessages.slice(0, maxMessagesPerChannel)
      };
    });
  }, [maxMessagesPerChannel]);

  const connectToChannels = useCallback(() => {
    channelIds.forEach(channelId => {
      if (!unsubscribersRef.current[channelId]) {
        const unsubscribe = realtimeService.subscribeToChannel(channelId, {
          ...options,
          onMessage: handleMessage(channelId)
        });
        unsubscribersRef.current[channelId] = unsubscribe;
      }
    });
  }, [channelIds, options, handleMessage]);

  const disconnectFromChannels = useCallback(() => {
    Object.values(unsubscribersRef.current).forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    unsubscribersRef.current = {};
  }, []);

  useEffect(() => {
    if (autoConnect && channelIds.length > 0) {
      connectToChannels();
    }

    return () => {
      disconnectFromChannels();
    };
  }, [autoConnect, channelIds, connectToChannels, disconnectFromChannels]);

  // Handle connection status
  useEffect(() => {
    const unsubscribe = realtimeService.addListener('connectionStatus', setConnectionStatus);
    return unsubscribe;
  }, []);

  return {
    messages: allMessages,
    connectionStatus,
    connectToChannels,
    disconnectFromChannels,
    clearAllMessages: () => setAllMessages({}),
    totalMessageCount: Object.values(allMessages).reduce((total, msgs) => total + msgs.length, 0)
  };
};

export default useRealtime;