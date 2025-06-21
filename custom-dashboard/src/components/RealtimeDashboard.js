// Real-time Dashboard Component
// Displays live data from Magistrala channels via WebSocket and MQTT

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FiWifi,
  FiActivity,
  FiRadio,
  FiMessageSquare,
  FiPlay,
  FiPause,
  FiSettings,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiTrash2,
  FiSend,
  FiMonitor
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRealtime, useConnectionStatus } from '../hooks/useRealtime';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
`;

const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StatusCard = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  text-align: center;
  
  .status-icon {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: ${props => {
      switch(props.status) {
        case 'connected': return '#10b981';
        case 'error': return '#ef4444';
        case 'reconnecting': return '#f59e0b';
        default: return '#6b7280';
      }
    }};
  }
  
  .status-label {
    font-size: 0.8rem;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .status-value {
    font-size: 0.9rem;
    font-weight: 600;
    color: #2d3748;
    text-transform: capitalize;
  }
`;

const ControlsSection = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: ${props => props.variant === 'primary' ? '#3182ce' : 'white'};
  color: ${props => props.variant === 'primary' ? 'white' : '#4a5568'};
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.variant === 'primary' ? '#2c5282' : '#f7fafc'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #4a5568;
  font-size: 0.9rem;
`;

const MessagesSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1rem;
  min-height: 400px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartContainer = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  
  .chart-title {
    font-size: 1rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 1rem;
  }
`;

const MessagesContainer = styled.div`
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  
  .messages-header {
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .messages-title {
      font-size: 1rem;
      font-weight: 600;
      color: #2d3748;
    }
    
    .message-count {
      background: #edf2f7;
      color: #4a5568;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }
  }
`;

const MessagesList = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: 300px;
`;

const MessageItem = styled.div`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f7fafc;
  font-size: 0.85rem;
  
  &:last-child {
    border-bottom: none;
  }
  
  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
    
    .message-type {
      background: ${props => props.type === 'mqtt' ? '#3182ce' : '#10b981'};
      color: white;
      padding: 0.125rem 0.25rem;
      border-radius: 3px;
      font-size: 0.7rem;
      text-transform: uppercase;
    }
    
    .message-time {
      color: #6b7280;
      font-size: 0.7rem;
    }
  }
  
  .message-data {
    color: #2d3748;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    background: #f7fafc;
    padding: 0.5rem;
    border-radius: 4px;
    overflow-x: auto;
  }
`;

const SendMessageSection = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-top: 1rem;
  
  .send-title {
    font-size: 1rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.75rem;
  }
  
  .send-form {
    display: flex;
    gap: 0.5rem;
    align-items: end;
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      
      label {
        font-size: 0.8rem;
        color: #4a5568;
        font-weight: 500;
      }
      
      input, select {
        padding: 0.5rem;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        font-size: 0.9rem;
      }
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  
  .empty-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    opacity: 0.5;
  }
`;

const RealtimeDashboard = ({ channelId, thingSecret, token }) => {
  const [selectedProtocol, setSelectedProtocol] = useState('both');
  const [isManuallyConnected, setIsManuallyConnected] = useState(false);
  const [messageForm, setMessageForm] = useState({
    subtopic: 'temperature',
    value: '25.5',
    unit: '°C'
  });

  const {
    messages,
    connectionStatus,
    isConnected,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
    wsConnected,
    mqttConnected,
    messageCount
  } = useRealtime(channelId, {
    protocol: selectedProtocol,
    token,
    thingSecret,
    autoConnect: false,
    maxMessages: 50
  });

  const globalStatus = useConnectionStatus();

  // Chart data preparation
  const chartData = messages
    .filter(msg => msg.data && Array.isArray(msg.data))
    .flatMap(msg => 
      msg.data.filter(record => record.v !== undefined).map(record => ({
        time: new Date(msg.timestamp).toLocaleTimeString(),
        value: parseFloat(record.v) || 0,
        name: record.n || 'value',
        unit: record.u || ''
      }))
    )
    .slice(-20)
    .reverse();

  const handleConnect = () => {
    if (isConnected) {
      disconnect();
      setIsManuallyConnected(false);
    } else {
      connect();
      setIsManuallyConnected(true);
    }
  };

  const handleSendMessage = async () => {
    if (!thingSecret || !channelId) {
      alert('Thing secret and channel ID are required to send messages');
      return;
    }

    try {
      const senMLMessage = [{
        bn: `device-${channelId}`,
        n: messageForm.subtopic,
        v: parseFloat(messageForm.value) || 0,
        u: messageForm.unit,
        t: Math.floor(Date.now() / 1000)
      }];

      await sendMessage(senMLMessage, {
        subtopic: messageForm.subtopic,
        protocol: 'mqtt'
      });

      // Reset form
      setMessageForm({
        subtopic: 'temperature',
        value: (Math.random() * 30 + 10).toFixed(1),
        unit: '°C'
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message: ' + error.message);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'connected': return <FiCheckCircle />;
      case 'error': return <FiXCircle />;
      case 'reconnecting': return <FiRefreshCw style={{ animation: 'spin 1s linear infinite' }} />;
      default: return <FiAlertCircle />;
    }
  };

  if (!channelId) {
    return (
      <Container>
        <EmptyState>
          <div className="empty-icon">
            <FiMonitor />
          </div>
          <p>Select a channel to monitor real-time data</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FiActivity />
          Real-time Monitor - Channel {channelId}
        </Title>
        <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
          {messageCount} messages received
        </div>
      </Header>

      <StatusGrid>
        <StatusCard status={connectionStatus.websocket}>
          <div className="status-icon">{getStatusIcon(connectionStatus.websocket)}</div>
          <div className="status-label">WebSocket</div>
          <div className="status-value">{connectionStatus.websocket}</div>
        </StatusCard>
        
        <StatusCard status={connectionStatus.mqtt}>
          <div className="status-icon">{getStatusIcon(connectionStatus.mqtt)}</div>
          <div className="status-label">MQTT</div>
          <div className="status-value">{connectionStatus.mqtt}</div>
        </StatusCard>
        
        <StatusCard status={isConnected ? 'connected' : 'disconnected'}>
          <div className="status-icon">{isConnected ? <FiCheckCircle /> : <FiXCircle />}</div>
          <div className="status-label">Overall</div>
          <div className="status-value">{isConnected ? 'connected' : 'disconnected'}</div>
        </StatusCard>
      </StatusGrid>

      <ControlsSection>
        <Select
          value={selectedProtocol}
          onChange={(e) => setSelectedProtocol(e.target.value)}
          disabled={isConnected}
        >
          <option value="both">Both Protocols</option>
          <option value="websocket">WebSocket Only</option>
          <option value="mqtt">MQTT Only</option>
        </Select>

        <ControlButton
          variant="primary"
          onClick={handleConnect}
          disabled={!channelId}
        >
          {isConnected ? <FiPause /> : <FiPlay />}
          {isConnected ? 'Disconnect' : 'Connect'}
        </ControlButton>

        <ControlButton onClick={clearMessages} disabled={messageCount === 0}>
          <FiTrash2 />
          Clear ({messageCount})
        </ControlButton>
      </ControlsSection>

      <MessagesSection>
        <ChartContainer>
          <div className="chart-title">Live Data Visualization</div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} ${props.payload.unit}`,
                    props.payload.name
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3182ce" 
                  strokeWidth={2}
                  dot={{ fill: '#3182ce', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState>
              <div className="empty-icon">
                <FiActivity />
              </div>
              <p>No data available for visualization</p>
            </EmptyState>
          )}
        </ChartContainer>

        <MessagesContainer>
          <div className="messages-header">
            <div className="messages-title">Recent Messages</div>
            <div className="message-count">{messageCount}</div>
          </div>
          <MessagesList>
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <MessageItem key={index} type={message.type}>
                  <div className="message-header">
                    <span className="message-type">{message.type}</span>
                    <span className="message-time">{formatTimestamp(message.timestamp)}</span>
                  </div>
                  <div className="message-data">
                    {JSON.stringify(message.data, null, 2)}
                  </div>
                </MessageItem>
              ))
            ) : (
              <EmptyState>
                <div className="empty-icon">
                  <FiMessageSquare />
                </div>
                <p>No messages received</p>
              </EmptyState>
            )}
          </MessagesList>
        </MessagesContainer>
      </MessagesSection>

      {thingSecret && (
        <SendMessageSection>
          <div className="send-title">Send Test Message</div>
          <div className="send-form">
            <div className="form-group">
              <label>Subtopic</label>
              <input
                type="text"
                value={messageForm.subtopic}
                onChange={(e) => setMessageForm({ ...messageForm, subtopic: e.target.value })}
                placeholder="temperature"
              />
            </div>
            <div className="form-group">
              <label>Value</label>
              <input
                type="number"
                step="0.1"
                value={messageForm.value}
                onChange={(e) => setMessageForm({ ...messageForm, value: e.target.value })}
                placeholder="25.5"
              />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <input
                type="text"
                value={messageForm.unit}
                onChange={(e) => setMessageForm({ ...messageForm, unit: e.target.value })}
                placeholder="°C"
              />
            </div>
            <ControlButton variant="primary" onClick={handleSendMessage}>
              <FiSend />
              Send
            </ControlButton>
          </div>
        </SendMessageSection>
      )}
    </Container>
  );
};

export default RealtimeDashboard;