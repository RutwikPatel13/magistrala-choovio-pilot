import React from 'react';
import styled from 'styled-components';
import { FiBell, FiUser, FiSearch } from 'react-icons/fi';

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
  
  .action-button {
    background: none;
    border: none;
    padding: 0.5rem;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.3s ease;
    
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

const Header = () => {
  return (
    <HeaderContainer>
      <Logo>
        <div className="logo-icon">C</div>
        <h1>Choovio IoT</h1>
      </Logo>
      
      <SearchBar>
        <FiSearch className="search-icon" />
        <input 
          type="text" 
          placeholder="Search devices, channels, or data..."
        />
      </SearchBar>
      
      <UserActions>
        <button className="action-button notification-badge">
          <FiBell size={20} />
        </button>
        <button className="action-button">
          <FiUser size={20} />
        </button>
      </UserActions>
    </HeaderContainer>
  );
};

export default Header;