import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiUser, FiSearch, FiSettings, FiLogOut, FiMail } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const HeaderContainer = styled.header`
  background: ${props => props.theme.white};
  padding: 1rem 2rem;
  box-shadow: ${props => props.theme.shadow};
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  h1 {
    color: ${props => props.theme.primary};
    font-size: 1.5rem;
    font-weight: bold;
  }
  
  .logo-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(45deg, ${props => props.theme.primary}, ${props => props.theme.secondary});
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
  }
`;

const SearchBar = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
  margin: 0 2rem;
  
  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 25px;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.3s ease;
    
    &:focus {
      border-color: ${props => props.theme.primary};
    }
  }
  
  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
  }
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  
  .action-button {
    background: none;
    border: none;
    padding: 0.5rem;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.3s ease;
    position: relative;
    
    &:hover {
      background-color: #f5f5f5;
    }
  }
  
  .notification-badge {
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 8px;
      height: 8px;
      background: #ff4757;
      border-radius: 50%;
    }
  }
`;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-top: 4px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  .search-item {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #f7fafc;
    }
    
    &:last-child {
      border-bottom: none;
    }
    
    .item-title {
      font-weight: 500;
      color: #2d3748;
    }
    
    .item-subtitle {
      font-size: 0.8rem;
      color: #718096;
      margin-top: 2px;
    }
  }
  
  .no-results {
    padding: 2rem;
    text-align: center;
    color: #718096;
  }
`;

const NotificationDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 60px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  .notification-header {
    padding: 1rem;
    border-bottom: 1px solid #f0f0f0;
    font-weight: 600;
    color: #2d3748;
  }
  
  .notification-item {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #f7fafc;
    }
    
    &:last-child {
      border-bottom: none;
    }
    
    .notification-title {
      font-weight: 500;
      color: #2d3748;
      margin-bottom: 4px;
    }
    
    .notification-text {
      font-size: 0.8rem;
      color: #718096;
      margin-bottom: 4px;
    }
    
    .notification-time {
      font-size: 0.7rem;
      color: #a0aec0;
    }
    
    &.unread {
      background-color: #ebf8ff;
      
      .notification-title {
        color: #2b6cb0;
      }
    }
  }
`;

const UserDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  width: 200px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  .user-info {
    padding: 1rem;
    border-bottom: 1px solid #f0f0f0;
    
    .user-name {
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 4px;
    }
    
    .user-email {
      font-size: 0.8rem;
      color: #718096;
    }
  }
  
  .user-menu-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
    font-size: 0.9rem;
    color: #4a5568;
    
    &:hover {
      background-color: #f7fafc;
    }
    
    &.logout {
      color: #e53e3e;
      border-top: 1px solid #f0f0f0;
    }
  }
`;

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const searchData = [
    { type: 'device', title: 'Temperature Sensor #1', subtitle: 'Building A - Floor 1' },
    { type: 'device', title: 'LoRaWAN Gateway #1', subtitle: 'Building B - Roof' },
    { type: 'channel', title: 'Temperature Data Channel', subtitle: 'MQTT Channel' },
    { type: 'channel', title: 'LoRaWAN Uplink Channel', subtitle: 'LoRaWAN Protocol' },
    { type: 'data', title: 'Sensor Readings Database', subtitle: 'PostgreSQL' },
    { type: 'user', title: 'John Doe', subtitle: 'Administrator' },
  ];

  const notifications = [
    {
      id: 1,
      title: 'Device Offline',
      text: 'Temperature Sensor #3 has gone offline',
      time: '2 minutes ago',
      unread: true
    },
    {
      id: 2,
      title: 'New Device Connected',
      text: 'LoRaWAN Device #247 successfully registered',
      time: '15 minutes ago',
      unread: true
    },
    {
      id: 3,
      title: 'Data Export Complete',
      text: 'Monthly sensor data export finished',
      time: '1 hour ago',
      unread: false
    },
    {
      id: 4,
      title: 'System Update',
      text: 'Platform updated to version 2.1.0',
      time: '3 hours ago',
      unread: false
    }
  ];

  const filteredResults = searchData.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSearchResults(value.length > 0);
  };

  const handleSearchItemClick = (item) => {
    setSearchTerm('');
    setShowSearchResults(false);
    // Navigate based on item type
    const routes = {
      device: '/devices',
      channel: '/channels',
      data: '/messages',
      user: '/users'
    };
    navigate(routes[item.type] || '/');
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
  };

  const handleUserClick = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
  };

  const handleUserMenuAction = (action) => {
    setShowUserMenu(false);
    switch (action) {
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'logout':
        if (window.confirm('Are you sure you want to logout?')) {
          logout();
          navigate('/login');
        }
        break;
      default:
        break;
    }
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowSearchResults(false);
      setShowNotifications(false);
      setShowUserMenu(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <HeaderContainer>
      <Logo>
        <div className="logo-icon">C</div>
        <h1>Choovio IoT</h1>
      </Logo>
      
      <SearchBar onClick={(e) => e.stopPropagation()}>
        <FiSearch className="search-icon" />
        <input 
          type="text" 
          placeholder="Search devices, channels, or data..."
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => searchTerm && setShowSearchResults(true)}
        />
        {showSearchResults && (
          <SearchResults>
            {filteredResults.length > 0 ? (
              filteredResults.map((item, index) => (
                <div 
                  key={index} 
                  className="search-item"
                  onClick={() => handleSearchItemClick(item)}
                >
                  <div className="item-title">{item.title}</div>
                  <div className="item-subtitle">{item.subtitle}</div>
                </div>
              ))
            ) : (
              <div className="no-results">
                No results found for "{searchTerm}"
              </div>
            )}
          </SearchResults>
        )}
      </SearchBar>
      
      <UserActions onClick={(e) => e.stopPropagation()}>
        <button 
          className="action-button notification-badge"
          onClick={handleNotificationClick}
        >
          <FiBell size={20} />
        </button>
        
        {showNotifications && (
          <NotificationDropdown>
            <div className="notification-header">
              Notifications ({notifications.filter(n => n.unread).length} new)
            </div>
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${notification.unread ? 'unread' : ''}`}
              >
                <div className="notification-title">{notification.title}</div>
                <div className="notification-text">{notification.text}</div>
                <div className="notification-time">{notification.time}</div>
              </div>
            ))}
          </NotificationDropdown>
        )}
        
        <button 
          className="action-button"
          onClick={handleUserClick}
        >
          <FiUser size={20} />
        </button>
        
        {showUserMenu && (
          <UserDropdown>
            <div className="user-info">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-email">{user?.email || 'user@choovio.com'}</div>
            </div>
            <div 
              className="user-menu-item"
              onClick={() => handleUserMenuAction('profile')}
            >
              <FiUser size={16} />
              My Profile
            </div>
            <div 
              className="user-menu-item"
              onClick={() => handleUserMenuAction('settings')}
            >
              <FiSettings size={16} />
              Settings
            </div>
            <div 
              className="user-menu-item logout"
              onClick={() => handleUserMenuAction('logout')}
            >
              <FiLogOut size={16} />
              Logout
            </div>
          </UserDropdown>
        )}
      </UserActions>
    </HeaderContainer>
  );
};

export default Header;