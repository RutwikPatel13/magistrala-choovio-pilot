import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import { brandPresets } from './styles/theme';

// Use Choovio theme with fallback to original colors
const theme = {
  ...brandPresets.choovio.colors,
  primary: '#2C5282',
  secondary: '#ED8936',
  background: '#F7FAFC',
  text: '#2D3748',
  white: '#FFFFFF',
  shadow: '0 4px 12px rgba(44, 82, 130, 0.12)'
};

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, ${props => props.theme.primary} 0%, ${props => props.theme.secondary} 100%);
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

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontSize: '1.2rem'
        }}>
          Loading...
        </div>
      </ThemeProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <Login onLoginSuccess={(result) => loginWithTokens(result.access_token, result.user, result.refresh_token)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;