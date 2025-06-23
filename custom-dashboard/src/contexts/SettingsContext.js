import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

const defaultSettings = {
  companyName: 'Choovio IoT',
  adminEmail: 'admin@choovio.com',
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  theme: {
    isDarkMode: false
  },
  notifications: {
    systemAlerts: true,
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true
  },
  dataRetention: {
    autoBackup: true,
    backupFrequency: 'daily', // daily, weekly, monthly
    retentionPeriod: 90, // days
    compressionEnabled: true,
    encryptBackups: true
  }
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('choovio_settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({
          ...prev,
          ...parsedSettings
        }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save settings to localStorage whenever settings change
  const saveSettings = (newSettings) => {
    try {
      const settingsToSave = {
        ...settings,
        ...newSettings
      };
      setSettings(settingsToSave);
      localStorage.setItem('choovio_settings', JSON.stringify(settingsToSave));
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  };

  // Update specific setting
  const updateSetting = (key, value) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    return saveSettings(newSettings);
  };

  // Update nested setting
  const updateNestedSetting = (category, key, value) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    };
    return saveSettings(newSettings);
  };

  // Reset settings to default
  const resetSettings = () => {
    try {
      setSettings(defaultSettings);
      localStorage.setItem('choovio_settings', JSON.stringify(defaultSettings));
      return true;
    } catch (error) {
      console.error('Failed to reset settings:', error);
      return false;
    }
  };

  // Get formatted timestamp based on user's timezone
  const formatTimestamp = (timestamp, format = 'full') => {
    try {
      const date = new Date(timestamp);
      const options = {
        timeZone: settings.timeZone,
        ...(format === 'full' ? {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        } : format === 'date' ? {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        } : {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      return new Intl.DateTimeFormat('en-US', options).format(date);
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return new Date(timestamp).toLocaleString();
    }
  };

  // Export settings as JSON
  const exportSettings = () => {
    try {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `choovio-settings-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      return true;
    } catch (error) {
      console.error('Failed to export settings:', error);
      return false;
    }
  };

  // Import settings from JSON
  const importSettings = (jsonData) => {
    try {
      const importedSettings = JSON.parse(jsonData);
      // Validate imported settings structure
      const validatedSettings = {
        ...defaultSettings,
        ...importedSettings
      };
      return saveSettings(validatedSettings);
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  };

  const value = {
    settings,
    isLoading,
    updateSetting,
    updateNestedSetting,
    saveSettings,
    resetSettings,
    formatTimestamp,
    exportSettings,
    importSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export default SettingsContext;