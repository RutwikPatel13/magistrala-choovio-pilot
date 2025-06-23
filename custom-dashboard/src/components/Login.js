import React, { useState } from 'react';
import styled from 'styled-components';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import authService from '../services/authService';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    color: #333;
    font-size: 2rem;
    margin: 0;
    font-weight: 600;
  }
  
  p {
    color: #666;
    margin: 5px 0 0 0;
    font-size: 0.9rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px 50px 15px 45px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  display: flex;
  align-items: center;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  
  &:hover {
    color: #667eea;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 15px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #fcc;
  font-size: 0.9rem;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background: #efe;
  color: #3c3;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #cfc;
  font-size: 0.9rem;
  text-align: center;
`;

const DefaultCredentials = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  
  h4 {
    margin: 0 0 10px 0;
    color: #495057;
    font-size: 0.9rem;
  }
  
  p {
    margin: 5px 0;
    font-size: 0.8rem;
    color: #6c757d;
    font-family: 'Monaco', 'Menlo', monospace;
  }
`;

const Login = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({
    identity: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔐 Attempting login with Magistrala API...');
      
      const result = await authService.authenticate(
        credentials.identity, 
        credentials.password
      );

      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        console.log('✅ Login successful:', result);
        
        // Store tokens in localStorage
        localStorage.setItem('magistrala_token', result.access_token);
        localStorage.setItem('magistrala_user', JSON.stringify(result.user));
        
        if (result.refresh_token) {
          localStorage.setItem('magistrala_refresh_token', result.refresh_token);
        }
        
        // Call the success callback
        setTimeout(() => {
          onLoginSuccess(result);
        }, 1000);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fillDemoCredentials = (type) => {
    if (type === 'admin') {
      setCredentials({
        identity: 'admin@choovio.com',
        password: 'ChoovioAdmin2025!'
      });
    } else {
      setCredentials({
        identity: 'user@choovio.com',
        password: 'ChoovioUser2025!'
      });
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <h1>Choovio Dashboard</h1>
          <p>Magistrala IoT Platform</p>
        </Logo>
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>
              <FiUser size={20} />
            </InputIcon>
            <Input
              type="text"
              name="identity"
              placeholder="Email or Username"
              value={credentials.identity}
              onChange={handleInputChange}
              required
            />
          </InputGroup>
          
          <InputGroup>
            <InputIcon>
              <FiLock size={20} />
            </InputIcon>
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleInputChange}
              required
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </PasswordToggle>
          </InputGroup>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          
          <LoginButton type="submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </LoginButton>
        </Form>
        
        <DefaultCredentials>
          <h4>Demo Credentials:</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6c757d', fontFamily: 'Monaco, Menlo, monospace' }}>
              👤 admin@choovio.com / ChoovioAdmin2025!
            </p>
            <button 
              type="button" 
              onClick={() => fillDemoCredentials('admin')}
              style={{ 
                background: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                padding: '4px 8px', 
                fontSize: '0.7rem', 
                cursor: 'pointer',
                marginLeft: '8px'
              }}
            >
              Use
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6c757d', fontFamily: 'Monaco, Menlo, monospace' }}>
              👤 user@choovio.com / ChoovioUser2025!
            </p>
            <button 
              type="button" 
              onClick={() => fillDemoCredentials('user')}
              style={{ 
                background: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                padding: '4px 8px', 
                fontSize: '0.7rem', 
                cursor: 'pointer',
                marginLeft: '8px'
              }}
            >
              Use
            </button>
          </div>
          <small style={{ color: '#999', fontSize: '0.75rem' }}>
            Click "Use" buttons to auto-fill credentials
          </small>
        </DefaultCredentials>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;