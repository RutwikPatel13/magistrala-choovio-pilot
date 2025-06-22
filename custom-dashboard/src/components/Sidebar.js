import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FiHome, 
  FiLayers, 
  FiBarChart, 
  FiSettings,
  FiWifi,
  FiDatabase,
  FiRadio,
  FiMessageSquare,
  FiUsers,
  FiShield
} from 'react-icons/fi';

const SidebarContainer = styled.nav`
  width: 250px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: ${props => props.theme.shadow};
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem 2rem;
  color: ${props => props.theme.text};
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: ${props => props.theme.primary};
  }
  
  &.active {
    background: rgba(102, 126, 234, 0.15);
    color: ${props => props.theme.primary};
    font-weight: 600;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: ${props => props.theme.primary};
    }
  }
  
  .nav-icon {
    font-size: 1.2rem;
  }
  
  .nav-text {
    font-size: 0.95rem;
  }
`;

const SidebarSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  padding: 0 2rem;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
`;

const Sidebar = () => {
  return (
    <SidebarContainer>
      <SidebarSection>
        <SectionTitle>Main</SectionTitle>
        <NavItem to="/" end>
          <FiHome className="nav-icon" />
          <span className="nav-text">Dashboard</span>
        </NavItem>
        <NavItem to="/devices">
          <FiLayers className="nav-icon" />
          <span className="nav-text">Device Management</span>
        </NavItem>
        <NavItem to="/lorawan">
          <FiRadio className="nav-icon" />
          <span className="nav-text">LoRaWAN Network</span>
        </NavItem>
        <NavItem to="/analytics">
          <FiBarChart className="nav-icon" />
          <span className="nav-text">Analytics</span>
        </NavItem>
      </SidebarSection>
      
      <SidebarSection>
        <SectionTitle>IoT Platform</SectionTitle>
        <NavItem to="/channels">
          <FiWifi className="nav-icon" />
          <span className="nav-text">Channels</span>
        </NavItem>
        <NavItem to="/messages">
          <FiMessageSquare className="nav-icon" />
          <span className="nav-text">Messages</span>
        </NavItem>
        <NavItem to="/data">
          <FiDatabase className="nav-icon" />
          <span className="nav-text">Data Storage</span>
        </NavItem>
      </SidebarSection>
      
      <SidebarSection>
        <SectionTitle>Management</SectionTitle>
        <NavItem to="/users">
          <FiUsers className="nav-icon" />
          <span className="nav-text">User Management</span>
        </NavItem>
        <NavItem to="/security">
          <FiShield className="nav-icon" />
          <span className="nav-text">Security</span>
        </NavItem>
      </SidebarSection>
      
      <SidebarSection>
        <SectionTitle>System</SectionTitle>
        <NavItem to="/settings">
          <FiSettings className="nav-icon" />
          <span className="nav-text">Settings</span>
        </NavItem>
      </SidebarSection>
    </SidebarContainer>
  );
};

export default Sidebar;