import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled, { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import Login from './components/Login';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TestStatus from './components/TestStatus';
import Dashboard from './pages/Dashboard';
import DeviceManagement from './pages/DeviceManagement';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import LoRaWANManagement from './pages/LoRaWANManagement';
import LoRaWANDashboard from './pages/LoRaWANDashboard';
import Channels from './pages/Channels';
import Messages from './pages/Messages';
import DataStorage from './pages/DataStorage';
import UserManagement from './pages/UserManagement';
import Security from './pages/Security';
import Profile from './pages/Profile';

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)' 
    : 'linear-gradient(135deg, #2C5282 0%, #ED8936 100%)'};
  transition: background 0.3s ease;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ContentArea = styled.main`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

// Main app content component
const AppContent = () => {
  const { isAuthenticated, loading, loginWithTokens } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <StyledThemeProvider theme={theme}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: theme.mode === 'dark' 
            ? 'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)' 
            : 'linear-gradient(135deg, #2C5282 0%, #ED8936 100%)',
          color: theme.text,
          fontSize: '1.2rem'
        }}>
          Loading...
        </div>
      </StyledThemeProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <StyledThemeProvider theme={theme}>
        <Login onLoginSuccess={(result) => loginWithTokens(result.access_token, result.user, result.refresh_token)} />
      </StyledThemeProvider>
    );
  }

  return (
    <StyledThemeProvider theme={theme}>
      <Router>
        <AppContainer>
          <Sidebar />
          <MainContent>
            <Header />
            <ContentArea>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/devices" element={<DeviceManagement />} />
                <Route path="/lorawan" element={<LoRaWANDashboard />} />
                <Route path="/lorawan-management" element={<LoRaWANManagement />} />
                <Route path="/channels" element={<Channels />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/data" element={<DataStorage />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/security" element={<Security />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </ContentArea>
          </MainContent>
          {process.env.NODE_ENV === 'development' && <TestStatus />}
        </AppContainer>
      </Router>
    </StyledThemeProvider>
  );
};

function App() {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}

export default App;