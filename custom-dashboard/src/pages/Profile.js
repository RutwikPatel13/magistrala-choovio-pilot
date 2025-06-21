import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiUser, 
  FiMail,
  FiLock, 
  FiSave,
  FiEdit,
  FiCamera,
  FiShield,
  FiActivity,
  FiClock,
  FiSettings,
  FiKey,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';

const ProfileContainer = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  background: linear-gradient(135deg, #2C5282, #ED8936);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const ProfileLayout = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  text-align: center;
  height: fit-content;
`;

const AvatarSection = styled.div`
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2C5282, #ED8936);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  font-weight: bold;
  margin: 0 auto;
  box-shadow: 0 8px 24px rgba(44, 82, 130, 0.3);
`;

const AvatarUpload = styled.button`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: #2C5282;
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background: #3182CE;
  }
`;

const UserInfo = styled.div`
  .user-name {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }
  
  .user-email {
    color: #718096;
    margin-bottom: 0.5rem;
  }
  
  .user-role {
    display: inline-block;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: uppercase;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 2rem;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 1rem;
  border-radius: 8px;
  background: #f7fafc;
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #2d3748;
    margin-bottom: 0.25rem;
  }
  
  .stat-label {
    font-size: 0.8rem;
    color: #718096;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const SectionContent = styled.div`
  padding: 1.5rem;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #2d3748;
  font-size: 0.9rem;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #2C5282;
    box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
  }

  &:disabled {
    background: #f7fafc;
    color: #718096;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  color: #718096;
  z-index: 1;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 0.25rem;
  
  &:hover {
    color: #2C5282;
  }
`;

const EditButton = styled.button`
  background: none;
  border: 1px solid #e2e8f0;
  color: #4a5568;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;

  &:hover {
    background: #f7fafc;
    border-color: #cbd5e0;
  }
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #2C5282, #3182CE);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(44, 82, 130, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: #f7fafc;
  
  .activity-icon {
    background: ${props => props.iconBg || '#2C5282'};
    color: white;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .activity-content {
    flex: 1;
    
    .activity-title {
      font-weight: 500;
      color: #2d3748;
      margin-bottom: 0.25rem;
    }
    
    .activity-time {
      font-size: 0.8rem;
      color: #718096;
    }
  }
`;

const SuccessMessage = styled.div`
  background: #c6f6d5;
  color: #22543d;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  border: 1px solid #9ae6b4;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    // Load user data from localStorage or API
    const savedUser = localStorage.getItem('magistrala_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      // Default user data
      const defaultUser = {
        name: 'Admin User',
        email: 'admin@choovio.com',
        role: 'Administrator',
        joinDate: '2025-01-15',
        lastLogin: new Date().toISOString(),
        devicesManaged: 24,
        totalSessions: 156
      };
      setUser(defaultUser);
      setFormData({
        name: defaultUser.name,
        email: defaultUser.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, []);

  const handleEdit = (section) => {
    setEditingSection(section);
    setSaveSuccess('');
  };

  const handleSave = async (section) => {
    try {
      if (section === 'profile') {
        const updatedUser = {
          ...user,
          name: formData.name,
          email: formData.email
        };
        setUser(updatedUser);
        localStorage.setItem('magistrala_user', JSON.stringify(updatedUser));
        setSaveSuccess('Profile updated successfully!');
      } else if (section === 'password') {
        if (formData.newPassword !== formData.confirmPassword) {
          alert('New passwords do not match');
          return;
        }
        // Simulate password update
        setSaveSuccess('Password updated successfully!');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
      
      setEditingSection(null);
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const recentActivity = [
    {
      title: 'Logged in to dashboard',
      time: '2 minutes ago',
      icon: <FiUser size={16} />,
      iconBg: '#10b981'
    },
    {
      title: 'Updated security settings',
      time: '1 hour ago',
      icon: <FiShield size={16} />,
      iconBg: '#3b82f6'
    },
    {
      title: 'Added new LoRaWAN device',
      time: '3 hours ago',
      icon: <FiActivity size={16} />,
      iconBg: '#8b5cf6'
    },
    {
      title: 'Generated API key',
      time: '1 day ago',
      icon: <FiKey size={16} />,
      iconBg: '#f59e0b'
    }
  ];

  if (!user) {
    return (
      <ProfileContainer>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          Loading profile...
        </div>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <Header>
        <Title>My Profile</Title>
      </Header>

      <ProfileLayout>
        <ProfileCard>
          <AvatarSection>
            <Avatar>
              {getInitials(user.name)}
            </Avatar>
            <AvatarUpload>
              <FiCamera size={16} />
            </AvatarUpload>
          </AvatarSection>
          
          <UserInfo>
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
            <div className="user-role">{user.role}</div>
          </UserInfo>
          
          <StatsGrid>
            <StatItem>
              <div className="stat-value">{user.devicesManaged || 24}</div>
              <div className="stat-label">Devices Managed</div>
            </StatItem>
            <StatItem>
              <div className="stat-value">{user.totalSessions || 156}</div>
              <div className="stat-label">Total Sessions</div>
            </StatItem>
            <StatItem>
              <div className="stat-value">
                {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'Jan 2025'}
              </div>
              <div className="stat-label">Member Since</div>
            </StatItem>
            <StatItem>
              <div className="stat-value">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Today'}
              </div>
              <div className="stat-label">Last Login</div>
            </StatItem>
          </StatsGrid>
        </ProfileCard>

        <MainContent>
          {saveSuccess && (
            <SuccessMessage>
              <FiCheckCircle size={16} />
              {saveSuccess}
            </SuccessMessage>
          )}

          <Section>
            <SectionHeader>
              <h3>
                <FiUser size={20} />
                Profile Information
              </h3>
              {editingSection !== 'profile' ? (
                <EditButton onClick={() => handleEdit('profile')}>
                  <FiEdit size={16} />
                  Edit
                </EditButton>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <EditButton onClick={() => setEditingSection(null)}>
                    Cancel
                  </EditButton>
                  <SaveButton onClick={() => handleSave('profile')}>
                    <FiSave size={16} />
                    Save
                  </SaveButton>
                </div>
              )}
            </SectionHeader>
            <SectionContent>
              <Form>
                <FormGroup>
                  <Label>Full Name</Label>
                  <InputWrapper>
                    <InputIcon>
                      <FiUser size={16} />
                    </InputIcon>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={editingSection !== 'profile'}
                    />
                  </InputWrapper>
                </FormGroup>
                
                <FormGroup>
                  <Label>Email Address</Label>
                  <InputWrapper>
                    <InputIcon>
                      <FiMail size={16} />
                    </InputIcon>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={editingSection !== 'profile'}
                    />
                  </InputWrapper>
                </FormGroup>
              </Form>
            </SectionContent>
          </Section>

          <Section>
            <SectionHeader>
              <h3>
                <FiLock size={20} />
                Security & Password
              </h3>
              {editingSection !== 'password' ? (
                <EditButton onClick={() => handleEdit('password')}>
                  <FiEdit size={16} />
                  Change Password
                </EditButton>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <EditButton onClick={() => setEditingSection(null)}>
                    Cancel
                  </EditButton>
                  <SaveButton onClick={() => handleSave('password')}>
                    <FiSave size={16} />
                    Update Password
                  </SaveButton>
                </div>
              )}
            </SectionHeader>
            {editingSection === 'password' && (
              <SectionContent>
                <Form>
                  <FormGroup>
                    <Label>Current Password</Label>
                    <InputWrapper>
                      <InputIcon>
                        <FiLock size={16} />
                      </InputIcon>
                      <Input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        placeholder="Enter current password"
                      />
                      <PasswordToggle
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPasswords.current ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </PasswordToggle>
                    </InputWrapper>
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>New Password</Label>
                    <InputWrapper>
                      <InputIcon>
                        <FiLock size={16} />
                      </InputIcon>
                      <Input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        placeholder="Enter new password"
                      />
                      <PasswordToggle
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPasswords.new ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </PasswordToggle>
                    </InputWrapper>
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Confirm New Password</Label>
                    <InputWrapper>
                      <InputIcon>
                        <FiLock size={16} />
                      </InputIcon>
                      <Input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm new password"
                      />
                      <PasswordToggle
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPasswords.confirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </PasswordToggle>
                    </InputWrapper>
                  </FormGroup>
                </Form>
              </SectionContent>
            )}
          </Section>

          <Section>
            <SectionHeader>
              <h3>
                <FiClock size={20} />
                Recent Activity
              </h3>
            </SectionHeader>
            <SectionContent>
              <ActivityList>
                {recentActivity.map((activity, index) => (
                  <ActivityItem key={index} iconBg={activity.iconBg}>
                    <div className="activity-icon">
                      {activity.icon}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{activity.title}</div>
                      <div className="activity-time">{activity.time}</div>
                    </div>
                  </ActivityItem>
                ))}
              </ActivityList>
            </SectionContent>
          </Section>
        </MainContent>
      </ProfileLayout>
    </ProfileContainer>
  );
};

export default Profile;