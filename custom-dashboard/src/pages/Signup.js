import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FiUser, 
  FiMail,
  FiLock, 
  FiEye, 
  FiEyeOff,
  FiUserPlus,
  FiCheckCircle,
  FiWifi,
  FiShield
} from 'react-icons/fi';
import magistralaApi from '../services/magistralaApi';

const SignupContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const SignupCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 450px;
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

  &.valid {
    border-color: #48bb78;
  }

  &.invalid {
    border-color: #f56565;
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

const ValidationIcon = styled.div`
  position: absolute;
  right: ${props => props.hasToggle ? '3rem' : '1rem'};
  color: ${props => props.valid ? '#48bb78' : '#f56565'};
`;

const SignupButton = styled.button`
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
  text-align: left;
`;

const SuccessMessage = styled.div`
  background: #c6f6d5;
  color: #22543d;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  border: 1px solid #9ae6b4;
`;

const PasswordRequirements = styled.div`
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 0.5rem;
  text-align: left;
  
  .requirements-title {
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
  }
  
  .requirement {
    font-size: 0.8rem;
    margin: 0.25rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    &.met {
      color: #22543d;
    }
    
    &.unmet {
      color: #718096;
    }
  }
`;

const RoleSelection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1rem 0;
`;

const RoleCard = styled.div`
  border: 2px solid ${props => props.selected ? '#2C5282' : '#e2e8f0'};
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  
  &:hover {
    border-color: #2C5282;
  }
  
  .role-icon {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: ${props => props.selected ? '#2C5282' : '#718096'};
  }
  
  .role-name {
    font-weight: 600;
    color: ${props => props.selected ? '#2C5282' : '#2d3748'};
    margin-bottom: 0.25rem;
  }
  
  .role-description {
    font-size: 0.8rem;
    color: #718096;
  }
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

const LoginLink = styled.div`
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

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    return requirements;
  };

  const passwordRequirements = validatePassword(formData.password);
  const isPasswordValid = Object.values(passwordRequirements).every(req => req);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!isPasswordValid) {
      setError('Please ensure your password meets all requirements.');
      setLoading(false);
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await magistralaApi.createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      if (response.success || response.id) {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        throw new Error('Failed to create account');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Failed to create account. Email may already be in use.');
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

  const handleRoleSelect = (role) => {
    setFormData(prev => ({
      ...prev,
      role
    }));
  };

  return (
    <SignupContainer>
      <SignupCard>
        <Logo>
          <div className="logo-icon">C</div>
          <div className="logo-text">Choovio</div>
        </Logo>
        
        <Title>Create Account</Title>
        <Subtitle>Join the IoT revolution today</Subtitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Full Name</Label>
            <InputWrapper>
              <InputIcon>
                <FiUser size={18} />
              </InputIcon>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label>Email Address</Label>
            <InputWrapper>
              <InputIcon>
                <FiMail size={18} />
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
                placeholder="Create a strong password"
                className={formData.password ? (isPasswordValid ? 'valid' : 'invalid') : ''}
                required
              />
              {formData.password && (
                <ValidationIcon valid={isPasswordValid} hasToggle={true}>
                  <FiCheckCircle size={16} />
                </ValidationIcon>
              )}
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </PasswordToggle>
            </InputWrapper>
            
            {formData.password && (
              <PasswordRequirements>
                <div className="requirements-title">Password Requirements:</div>
                <div className={`requirement ${passwordRequirements.length ? 'met' : 'unmet'}`}>
                  <FiCheckCircle size={12} />
                  At least 8 characters
                </div>
                <div className={`requirement ${passwordRequirements.uppercase ? 'met' : 'unmet'}`}>
                  <FiCheckCircle size={12} />
                  One uppercase letter
                </div>
                <div className={`requirement ${passwordRequirements.lowercase ? 'met' : 'unmet'}`}>
                  <FiCheckCircle size={12} />
                  One lowercase letter
                </div>
                <div className={`requirement ${passwordRequirements.number ? 'met' : 'unmet'}`}>
                  <FiCheckCircle size={12} />
                  One number
                </div>
                <div className={`requirement ${passwordRequirements.special ? 'met' : 'unmet'}`}>
                  <FiCheckCircle size={12} />
                  One special character
                </div>
              </PasswordRequirements>
            )}
          </InputGroup>

          <InputGroup>
            <Label>Confirm Password</Label>
            <InputWrapper>
              <InputIcon>
                <FiLock size={18} />
              </InputIcon>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className={formData.confirmPassword ? (passwordsMatch ? 'valid' : 'invalid') : ''}
                required
              />
              {formData.confirmPassword && (
                <ValidationIcon valid={passwordsMatch} hasToggle={true}>
                  <FiCheckCircle size={16} />
                </ValidationIcon>
              )}
              <PasswordToggle
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </PasswordToggle>
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label>Account Type</Label>
            <RoleSelection>
              <RoleCard 
                selected={formData.role === 'user'}
                onClick={() => handleRoleSelect('user')}
              >
                <div className="role-icon">👤</div>
                <div className="role-name">User</div>
                <div className="role-description">Standard access</div>
              </RoleCard>
              <RoleCard 
                selected={formData.role === 'admin'}
                onClick={() => handleRoleSelect('admin')}
              >
                <div className="role-icon">🛡️</div>
                <div className="role-name">Admin</div>
                <div className="role-description">Full access</div>
              </RoleCard>
            </RoleSelection>
          </InputGroup>

          <SignupButton type="submit" disabled={loading || !isPasswordValid || !passwordsMatch}>
            {loading ? (
              <>
                <FiWifi className="loading-icon" style={{ animation: 'spin 1s linear infinite' }} />
                Creating Account...
              </>
            ) : (
              <>
                <FiUserPlus size={18} />
                Create Account
              </>
            )}
          </SignupButton>
        </Form>

        <Divider>
          <span>or</span>
        </Divider>

        <LoginLink>
          Already have an account? <Link to="/login">Sign in here</Link>
        </LoginLink>
      </SignupCard>
    </SignupContainer>
  );
};

export default Signup;