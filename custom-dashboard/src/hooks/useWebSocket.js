import { useState, useEffect, useRef } from 'react';

const useWebSocket = (url, options = {}) => {
  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [readyState, setReadyState] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('Connecting');
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  
  const {
    onOpen,
    onClose,
    onMessage,
    onError,
    shouldReconnect = true,
    reconnectAttempts: maxReconnectAttempts = 5,
    reconnectInterval = 3000,
  } = options;

  const connect = () => {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      
      ws.onopen = (event) => {
        setReadyState(ws.readyState);
        setConnectionStatus('Connected');
        reconnectAttempts.current = 0;
        if (onOpen) onOpen(event);
      };
      
      ws.onclose = (event) => {
        setReadyState(ws.readyState);
        setConnectionStatus('Disconnected');
        if (onClose) onClose(event);
        
        if (shouldReconnect && reconnectAttempts.current < maxReconnectAttempts) {
          setConnectionStatus('Reconnecting...');
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, reconnectInterval);
        }
      };
      
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setLastMessage(message);
        if (onMessage) onMessage(message);
      };
      
      ws.onerror = (event) => {
        setConnectionStatus('Error');
        if (onError) onError(event);
      };
      
      setSocket(ws);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setConnectionStatus('Error');
    }
  };

  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [url]);

  return {
    socket,
    lastMessage,
    readyState,
    connectionStatus,
    sendMessage,
    disconnect,
  };
};

export default useWebSocket;