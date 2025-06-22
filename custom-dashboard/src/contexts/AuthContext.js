import React, { createContext, useContext, useState, useEffect } from 'react';
import magistralaApi from '../services/magistralaApi';
import dataStorage from '../services/dataStorage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check for existing authentication on app startup
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const token = localStorage.getItem('magistrala_token');
      const refreshToken = localStorage.getItem('magistrala_refresh_token');
      const tokenExpiry = localStorage.getItem('magistrala_token_expiry');
      const savedUser = localStorage.getItem('magistrala_user');
      
      if (token && savedUser) {
        const userData = JSON.parse(savedUser);
        
        // Check if token is expired
        if (tokenExpiry) {
          const expiryTime = new Date(tokenExpiry).getTime();
          const now = Date.now();
          
          if (now >= expiryTime && refreshToken) {
            // Token expired, try to refresh
            console.log('🔄 Token expired, attempting refresh...');
            try {
              await magistralaApi.refreshAccessToken();
              // If refresh successful, magistralaApi will update the tokens
              const newToken = localStorage.getItem('magistrala_token');
              if (newToken) {
                setUser(userData);
                setIsAuthenticated(true);
                console.log('✅ Token refreshed successfully');
              } else {
                throw new Error('Token refresh failed');
              }
            } catch (refreshError) {
              console.log('❌ Token refresh failed, requiring re-login');
              await logout();
            }
          } else {
            // Token still valid
            setUser(userData);
            setIsAuthenticated(true);
          }
        } else {
          // No expiry info, assume valid (for demo tokens)
          setUser(userData);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Error checking existing auth:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, domainId = null) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      console.log('🔐 Attempting login via AuthContext...');
      const result = await magistralaApi.login(email, password, domainId);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        
        console.log(`✅ Login successful via ${result.endpoint}`);
        return {
          success: true,
          user: result.user,
          endpoint: result.endpoint
        };
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error.message);
      return {
        success: false,
        error: error.message
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Legacy login method for backward compatibility
  const loginWithTokens = (token, userData, refreshToken = null) => {
    if (refreshToken) {
      localStorage.setItem('magistrala_refresh_token', refreshToken);
    }
    localStorage.setItem('magistrala_token', token);
    localStorage.setItem('magistrala_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async (clearUserData = false) => {
    try {
      const userId = magistralaApi.getUserId();
      
      // Use the API logout method to properly clear all tokens
      magistralaApi.logout();
      
      // Optionally clear user's persistent data (devices, channels, etc.)
      if (clearUserData && userId && userId !== 'anonymous') {
        dataStorage.clearUserData(userId);
        console.log('🗑️ User data cleared from storage');
      } else {
        console.log('💾 User data preserved in storage for next login');
      }
      
      // Clear local state
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
      
      console.log('📤 User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear everything anyway
      localStorage.removeItem('magistrala_token');
      localStorage.removeItem('magistrala_refresh_token');
      localStorage.removeItem('magistrala_token_expiry');
      localStorage.removeItem('magistrala_user');
      localStorage.removeItem('magistrala_working_endpoints');
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
    }
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    localStorage.setItem('magistrala_user', JSON.stringify(newUserData));
    setUser(newUserData);
  };

  // Check if user session is still valid
  const checkAuthStatus = async () => {
    try {
      const userData = await magistralaApi.getUserInfo();
      if (userData && userData.id !== 'user-default') {
        setUser(userData);
        return true;
      } else {
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      await logout();
      return false;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    authError,
    login,
    loginWithTokens, // For backward compatibility
    logout,
    updateUser,
    checkAuthStatus,
    // Additional utility methods
    isDemo: user?.email === 'admin@choovio.com' || localStorage.getItem('magistrala_token')?.startsWith('demo_token_'),
    hasValidToken: () => {
      const token = localStorage.getItem('magistrala_token');
      const expiry = localStorage.getItem('magistrala_token_expiry');
      if (!token) return false;
      if (!expiry) return true; // Demo tokens don't expire
      return new Date(expiry).getTime() > Date.now();
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};