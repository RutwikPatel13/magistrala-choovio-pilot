import React, { createContext, useContext, useState, useEffect } from 'react';
import { brandPresets } from '../styles/theme';

const ThemeContext = createContext();

// Light and dark theme definitions
const lightTheme = {
  ...brandPresets.choovio.colors,
  primary: '#2C5282',
  secondary: '#ED8936',
  background: '#F7FAFC',
  surface: '#FFFFFF',
  text: '#2D3748',
  textSecondary: '#718096',
  border: '#E2E8F0',
  shadow: '0 4px 12px rgba(44, 82, 130, 0.12)',
  mode: 'light'
};

const darkTheme = {
  ...brandPresets.choovio.colors,
  primary: '#3182CE',
  secondary: '#F6AD55',
  background: '#1A202C',
  surface: '#2D3748',
  text: '#F7FAFC',
  textSecondary: '#A0AEC0',
  border: '#4A5568',
  shadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  mode: 'dark'
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [companyName, setCompanyName] = useState('Choovio IoT');
  const [adminEmail, setAdminEmail] = useState('admin@choovio.com');
  const [timeZone, setTimeZone] = useState('UTC');

  // Load settings from localStorage on init
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('choovio_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.theme?.isDarkMode !== undefined) {
          setIsDarkMode(settings.theme.isDarkMode);
        }
        if (settings.companyName) {
          setCompanyName(settings.companyName);
        }
        if (settings.adminEmail) {
          setAdminEmail(settings.adminEmail);
        }
        if (settings.timeZone) {
          setTimeZone(settings.timeZone);
        }
      }
    } catch (error) {
      console.error('Failed to load theme settings:', error);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      // Save to localStorage
      try {
        const savedSettings = localStorage.getItem('choovio_settings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {};
        settings.theme = { ...settings.theme, isDarkMode: newMode };
        localStorage.setItem('choovio_settings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save theme setting:', error);
      }
      return newMode;
    });
  };

  const updateCompanyName = (name) => {
    setCompanyName(name);
    // Update document title
    document.title = `${name} Dashboard`;
    
    // Also save to localStorage to keep in sync with SettingsContext
    try {
      const savedSettings = localStorage.getItem('choovio_settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      settings.companyName = name;
      localStorage.setItem('choovio_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save company name to settings:', error);
    }
  };

  const updateAdminEmail = (email) => {
    setAdminEmail(email);
    
    // Also save to localStorage to keep in sync with SettingsContext
    try {
      const savedSettings = localStorage.getItem('choovio_settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      settings.adminEmail = email;
      localStorage.setItem('choovio_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save admin email to settings:', error);
    }
  };

  const updateTimeZone = (tz) => {
    setTimeZone(tz);
    
    // Also save to localStorage to keep in sync with SettingsContext
    try {
      const savedSettings = localStorage.getItem('choovio_settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      settings.timeZone = tz;
      localStorage.setItem('choovio_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save timezone to settings:', error);
    }
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  const value = {
    theme: currentTheme,
    isDarkMode,
    toggleTheme,
    companyName,
    updateCompanyName,
    adminEmail,
    updateAdminEmail,
    timeZone,
    updateTimeZone
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;