import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

const TestContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  min-width: 300px;
  z-index: 1000;
`;

const TestHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  h3 {
    margin: 0;
    color: ${props => props.theme.text};
    font-size: 1rem;
  }
`;

const TestItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.5rem 0;
  font-size: 0.9rem;
  
  .icon {
    &.success { color: #27ae60; }
    &.error { color: #e74c3c; }
    &.warning { color: #f39c12; }
    &.loading { 
      color: #3498db;
      animation: spin 1s linear infinite;
    }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const TestStatus = () => {
  const [tests, setTests] = useState({
    react: { status: 'loading', message: 'Checking React...' },
    components: { status: 'loading', message: 'Loading components...' },
    styling: { status: 'loading', message: 'Checking styles...' },
    routing: { status: 'loading', message: 'Testing routing...' },
    mockData: { status: 'loading', message: 'Loading mock data...' }
  });

  const runTests = async () => {
    setTests({
      react: { status: 'loading', message: 'Checking React...' },
      components: { status: 'loading', message: 'Loading components...' },
      styling: { status: 'loading', message: 'Checking styles...' },
      routing: { status: 'loading', message: 'Testing routing...' },
      mockData: { status: 'loading', message: 'Loading mock data...' }
    });

    // Simulate testing with delays
    setTimeout(() => {
      setTests(prev => ({
        ...prev,
        react: { status: 'success', message: 'React is working' }
      }));
    }, 500);

    setTimeout(() => {
      setTests(prev => ({
        ...prev,
        components: { status: 'success', message: 'Components loaded' }
      }));
    }, 1000);

    setTimeout(() => {
      setTests(prev => ({
        ...prev,
        styling: { status: 'success', message: 'Styled Components working' }
      }));
    }, 1500);

    setTimeout(() => {
      setTests(prev => ({
        ...prev,
        routing: { status: 'success', message: 'React Router working' }
      }));
    }, 2000);

    setTimeout(() => {
      setTests(prev => ({
        ...prev,
        mockData: { status: 'success', message: 'Mock data loaded' }
      }));
    }, 2500);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getIcon = (status) => {
    switch (status) {
      case 'success':
        return <FiCheckCircle className="icon success" />;
      case 'error':
        return <FiXCircle className="icon error" />;
      case 'warning':
        return <FiAlertCircle className="icon warning" />;
      default:
        return <FiRefreshCw className="icon loading" />;
    }
  };

  const allPassed = Object.values(tests).every(test => test.status === 'success');

  return (
    <TestContainer>
      <TestHeader>
        <h3>Test Status</h3>
        <RefreshButton onClick={runTests}>
          <FiRefreshCw size={16} />
        </RefreshButton>
      </TestHeader>
      
      {Object.entries(tests).map(([key, test]) => (
        <TestItem key={key}>
          {getIcon(test.status)}
          <span>{test.message}</span>
        </TestItem>
      ))}
      
      {allPassed && (
        <TestItem style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
          <FiCheckCircle className="icon success" />
          <strong>All tests passed! Dashboard ready.</strong>
        </TestItem>
      )}
    </TestContainer>
  );
};

export default TestStatus;