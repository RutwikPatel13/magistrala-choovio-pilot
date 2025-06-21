import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FiUser, 
  FiLock, 
  FiEye, 
  FiEyeOff,
  FiLogIn,
  FiShield,
  FiWifi
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import magistralaApi from '../services/magistralaApi';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 2rem;
  
  .logo-icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #2C5282, #ED8936);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 1.5rem;
  }
  
  .logo-text {
    font-size: 1.8rem;
    font-weight: bold;
    background: linear-gradient(135deg, #2C5282, #ED8936);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #718096;
  margin-bottom: 2rem;
  font-size: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
  text-align: left;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #2C5282;
    box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  color: #718096;
  z-index: 1;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 0.25rem;
  
  &:hover {
    color: #2C5282;
  }
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #2C5282, #3182CE);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(44, 82, 130, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: #fed7d7;
  color: #c53030;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  border: 1px solid #feb2b2;
`;

const SuccessMessage = styled.div`
  background: #c6f6d5;
  color: #22543d;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  border: 1px solid #9ae6b4;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e2e8f0;
  }
  
  span {
    padding: 0 1rem;
    color: #718096;
    font-size: 0.9rem;
  }
`;

const SignupLink = styled.div`
  margin-top: 1.5rem;
  color: #718096;
  font-size: 0.9rem;
  
  a {
    color: #2C5282;
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const DemoCredentials = styled.div`
  background: #ebf8ff;
  border: 1px solid #bee3f8;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: left;
  
  .demo-title {
    font-weight: 600;
    color: #2b6cb0;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .demo-item {
    font-size: 0.85rem;
    color: #2c5282;
    margin: 0.25rem 0;
  }

  .api-info {
    background: #f0f9ff;
    border: 1px solid #7dd3fc;
    border-radius: 6px;
    padding: 0.75rem;
    margin-top: 0.75rem;
    font-size: 0.8rem;
    color: #0c4a6e;
    
    .api-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
  }
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await magistralaApi.login(formData.email, formData.password);
      
      if (response.token && response.user) {
        // Use AuthContext login method
        login(response.token, response.user);
        setSuccess('Login successful! Redirecting...');
        
        // Redirect to the original destination or dashboard
        const from = location.state?.from?.pathname || '/';
        setTimeout(() => navigate(from), 1500);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fillDemoCredentials = (type) => {
    if (type === 'admin') {
      setFormData({
        email: 'admin@choovio.com',
        password: 'admin123'
      });
    } else {
      setFormData({
        email: 'user@choovio.com',
        password: 'user123'
      });
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <div className="logo-icon">C</div>
          <div className="logo-text">Choovio</div>
        </Logo>
        
        <Title>Welcome Back</Title>
        <Subtitle>Sign in to your IoT Dashboard</Subtitle>

        <DemoCredentials>
          <div className="demo-title">
            <FiShield size={16} />
            Magistrala Authentication
          </div>
          <div className="demo-item">
            Use your Magistrala user credentials created via the platform
          </div>
          <div className="demo-item">
            <strong>Demo fallback:</strong> admin@choovio.com / admin123
            <button 
              type="button" 
              onClick={() => fillDemoCredentials('admin')}
              style={{ 
                marginLeft: '8px', 
                background: 'none', 
                border: 'none', 
                color: '#2C5282', 
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.8rem'
              }}
            >
              (Use)
            </button>
          </div>
          <div className="api-info">
            <div className="api-title">API Integration</div>
            This dashboard integrates with Magistrala's authentication API (/users/tokens/issue) for secure user login and token management.
          </div>
        </DemoCredentials>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Email Address</Label>
            <InputWrapper>
              <InputIcon>
                <FiUser size={18} />
              </InputIcon>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label>Password</Label>
            <InputWrapper>
              <InputIcon>
                <FiLock size={18} />
              </InputIcon>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </PasswordToggle>
            </InputWrapper>
          </InputGroup>

          <LoginButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <FiWifi className="loading-icon" style={{ animation: 'spin 1s linear infinite' }} />
                Signing In...
              </>
            ) : (
              <>
                <FiLogIn size={18} />
                Sign In
              </>
            )}
          </LoginButton>
        </Form>

        <Divider>
          <span>or</span>
        </Divider>

        <SignupLink>
          Don't have an account? <Link to="/signup">Create one here</Link>
        </SignupLink>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;