import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiUser, 
  FiUsers,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiMail,
  FiShield,
  FiActivity,
  FiClock,
  FiSettings,
  FiRefreshCw,
  FiEye,
  FiUserCheck,
  FiUserX,
  FiKey,
  FiSearch
} from 'react-icons/fi';
// Removed magistralaApi import - using local state only
import UpcomingFeatureModal from '../components/UpcomingFeatureModal';

const Container = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  background: linear-gradient(135deg, #2C5282, #ED8936);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.variant === 'secondary' 
    ? 'white' 
    : 'linear-gradient(135deg, #2C5282, #3182CE)'};
  color: ${props => props.variant === 'secondary' ? '#4a5568' : 'white'};
  border: ${props => props.variant === 'secondary' ? '1px solid #e2e8f0' : 'none'};
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.variant === 'secondary' 
      ? '0 4px 12px rgba(0, 0, 0, 0.1)' 
      : '0 4px 12px rgba(44, 82, 130, 0.3)'};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  
  .stat-icon {
    background: ${props => props.iconBg || 'linear-gradient(135deg, #2C5282, #3182CE)'};
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: #2d3748;
    margin-bottom: 0.25rem;
  }
  
  .stat-label {
    color: #718096;
    font-size: 0.9rem;
  }
  
  .stat-change {
    font-size: 0.8rem;
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    
    &.positive {
      color: #10b981;
    }
    
    &.negative {
      color: #ef4444;
    }
  }
`;

const FiltersSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  align-items: end;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #2d3748;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #2C5282;
    box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #2C5282;
    box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
  }
`;

const UsersContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const UsersHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UsersTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
`;

const UsersList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
`;

const UserCard = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

const UserHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.25rem 0;
`;

const UserEmail = styled.div`
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const UserMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #718096;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const UserActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SmallActionButton = styled.button`
  background: none;
  border: 1px solid #e2e8f0;
  color: #4a5568;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f7fafc;
    border-color: #cbd5e0;
  }
`;

const StatusBadge = styled.span`
  background: ${props => {
    switch (props.status) {
      case 'active': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'inactive': return 'linear-gradient(135deg, #6b7280, #4b5563)';
      case 'pending': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'suspended': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
  }};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
`;

const RoleBadge = styled.span`
  background: ${props => {
    switch (props.role) {
      case 'admin': return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
      case 'manager': return 'linear-gradient(135deg, #3b82f6, #2563eb)';
      case 'user': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'viewer': return 'linear-gradient(135deg, #6b7280, #4b5563)';
      default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
  }};
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
`;

const UserStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
`;

const UserStat = styled.div`
  text-align: center;
  
  .stat-value {
    font-weight: bold;
    color: #2d3748;
    font-size: 1.1rem;
  }
  
  .stat-label {
    font-size: 0.8rem;
    color: #718096;
    margin-top: 2px;
  }
`;


const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpcomingFeature, setShowUpcomingFeature] = useState(false);
  const [upcomingFeatureName, setUpcomingFeatureName] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    onlineUsers: 0
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setLoading(true);
    
    // Using local mock data only
    const mockUsers = generateMockUsers();
    setUsers(mockUsers);
    
    // Calculate stats from mock data
    setStats({
      totalUsers: mockUsers.length,
      activeUsers: Math.floor(mockUsers.length * 0.8),
      newUsers: Math.floor(mockUsers.length * 0.1),
      onlineUsers: Math.floor(mockUsers.length * 0.3)
    });
    
    setLoading(false);
  };

  const generateMockUsers = () => {
    const roles = ['admin', 'manager', 'user', 'viewer'];
    const statuses = ['active', 'inactive', 'pending'];
    const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eva', 'Frank', 'Grace', 'Henry'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    
    return Array.from({ length: 15 }, (_, i) => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const lastLogin = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      return {
        id: `user_${i + 1}`,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@choovio.com`,
        role,
        status,
        lastLogin: lastLogin.toISOString(),
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        devices: Math.floor(Math.random() * 20),
        sessions: Math.floor(Math.random() * 5),
        dataUsage: (Math.random() * 100).toFixed(1),
        permissions: role === 'admin' ? ['all'] : role === 'manager' ? ['read', 'write'] : ['read']
      };
    });
  };

  const filteredUsers = users.filter(user => {
    if (filters.search && !user.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !user.email.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.role && user.role !== filters.role) return false;
    if (filters.status && user.status !== filters.status) return false;
    return true;
  });

  const handleCreateUser = () => {
    setUpcomingFeatureName('Add User');
    setShowUpcomingFeature(true);
  };

  const handleEditUser = (user) => {
    setUpcomingFeatureName('Edit User');
    setShowUpcomingFeature(true);
  };

  const handleDeleteUser = (userId) => {
    setUpcomingFeatureName('Delete User');
    setShowUpcomingFeature(true);
  };

  const handleToggleStatus = (userId) => {
    setUpcomingFeatureName('Toggle User Status');
    setShowUpcomingFeature(true);
  };

  const formatLastLogin = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <FiRefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem' }}>Loading users...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>User Management</Title>
        <ActionButtons>
          <ActionButton variant="secondary" onClick={() => loadUsers()}>
            <FiRefreshCw /> Refresh
          </ActionButton>
          <ActionButton onClick={handleCreateUser}>
            <FiPlus /> Add User
          </ActionButton>
        </ActionButtons>
      </Header>

      <StatsGrid>
        <StatCard iconBg="linear-gradient(135deg, #10b981, #059669)">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
          <div className="stat-change positive">
            <FiUserCheck size={12} /> +{stats.newUsers} this month
          </div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #3b82f6, #2563eb)">
          <div className="stat-icon">
            <FiUserCheck />
          </div>
          <div className="stat-value">{stats.activeUsers}</div>
          <div className="stat-label">Active Users</div>
          <div className="stat-change positive">
            <FiActivity size={12} /> {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%
          </div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #f59e0b, #d97706)">
          <div className="stat-icon">
            <FiActivity />
          </div>
          <div className="stat-value">{stats.onlineUsers}</div>
          <div className="stat-label">Online Now</div>
          <div className="stat-change positive">
            <FiClock size={12} /> Live status
          </div>
        </StatCard>
        
        <StatCard iconBg="linear-gradient(135deg, #8b5cf6, #7c3aed)">
          <div className="stat-icon">
            <FiShield />
          </div>
          <div className="stat-value">{users.filter(u => u.role === 'admin').length}</div>
          <div className="stat-label">Administrators</div>
          <div className="stat-change positive">
            <FiKey size={12} /> Privileged access
          </div>
        </StatCard>
      </StatsGrid>

      <FiltersSection>
        <FilterGroup>
          <Label>Search Users</Label>
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </FilterGroup>
        
        <FilterGroup>
          <Label>Role</Label>
          <Select
            value={filters.role}
            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
          >
            <option value="">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
            <option value="viewer">Viewer</option>
          </Select>
        </FilterGroup>
        
        <FilterGroup>
          <Label>Status</Label>
          <Select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </Select>
        </FilterGroup>
      </FiltersSection>

      <UsersContainer>
        <UsersHeader>
          <UsersTitle>Users ({filteredUsers.length})</UsersTitle>
        </UsersHeader>
        
        <UsersList>
          {filteredUsers.map(user => (
            <UserCard key={user.id}>
              <UserHeader>
                <UserInfo>
                  <UserName>{user.name}</UserName>
                  <UserEmail><FiMail size={12} /> {user.email}</UserEmail>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <StatusBadge status={user.status}>{user.status}</StatusBadge>
                    <RoleBadge role={user.role}>{user.role}</RoleBadge>
                  </div>
                </UserInfo>
                <UserActions>
                  <SmallActionButton onClick={() => handleEditUser(user)}>
                    <FiEdit />
                  </SmallActionButton>
                  <SmallActionButton onClick={() => handleToggleStatus(user.id)}>
                    {user.status === 'active' ? <FiUserX /> : <FiUserCheck />}
                  </SmallActionButton>
                  <SmallActionButton onClick={() => handleDeleteUser(user.id)}>
                    <FiTrash2 />
                  </SmallActionButton>
                </UserActions>
              </UserHeader>

              <UserMeta>
                <span><FiClock size={12} /> Last login: {formatLastLogin(user.lastLogin)}</span>
                <span><FiUser size={12} /> Created: {new Date(user.createdAt).toLocaleDateString()}</span>
              </UserMeta>

              <UserStats>
                <UserStat>
                  <div className="stat-value">{user.devices}</div>
                  <div className="stat-label">Devices</div>
                </UserStat>
                <UserStat>
                  <div className="stat-value">{user.sessions}</div>
                  <div className="stat-label">Sessions</div>
                </UserStat>
                <UserStat>
                  <div className="stat-value">{user.dataUsage} GB</div>
                  <div className="stat-label">Data Usage</div>
                </UserStat>
              </UserStats>
            </UserCard>
          ))}
        </UsersList>
      </UsersContainer>

      <UpcomingFeatureModal 
        isOpen={showUpcomingFeature}
        onClose={() => setShowUpcomingFeature(false)}
        featureName={upcomingFeatureName}
      />
    </Container>
  );
};

export default UserManagement;