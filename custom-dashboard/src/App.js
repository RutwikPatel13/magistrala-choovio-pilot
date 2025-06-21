import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TestStatus from './components/TestStatus';
import Dashboard from './pages/Dashboard';
import DeviceManagement from './pages/DeviceManagement';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import LoRaWANManagement from './pages/LoRaWANManagement';
import Channels from './pages/Channels';
import Messages from './pages/Messages';
import DataStorage from './pages/DataStorage';
import UserManagement from './pages/UserManagement';
import Security from './pages/Security';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import RulesEngine from './pages/RulesEngine';
import Bootstrap from './pages/Bootstrap';
import Notifications from './pages/Notifications';
import Certificates from './pages/Certificates';
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route path="/*" element={
              <ProtectedRoute>
                <AppContainer>
                  <Sidebar />
                  <MainContent>
                    <Header />
                    <ContentArea>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/devices" element={<DeviceManagement />} />
                        <Route path="/lorawan" element={<LoRaWANManagement />} />
                        <Route path="/channels" element={<Channels />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/data" element={<DataStorage />} />
                        <Route path="/users" element={<UserManagement />} />
                        <Route path="/security" element={<Security />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/rules" element={<RulesEngine />} />
                        <Route path="/bootstrap" element={<Bootstrap />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/certificates" element={<Certificates />} />
                      </Routes>
                    </ContentArea>
                  </MainContent>
                  {process.env.NODE_ENV === 'development' && <TestStatus />}
                </AppContainer>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;