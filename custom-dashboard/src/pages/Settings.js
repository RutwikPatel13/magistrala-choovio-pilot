import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiSave, 
  FiEdit3, 
  FiBell,
  FiDatabase,
  FiSun,
  FiMoon,
  FiClock
} from 'react-icons/fi';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';

const SettingsContainer = styled.div`
  padding: 0;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    color: white;
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const SettingsCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 1.5rem;
    
    .card-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
    }
    
    .card-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: ${props => props.theme.text};
    }
  }
  
  .card-description {
    color: #666;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: ${props => props.theme.text};
  }
  
  input, select, textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.3s ease;
    
    &:focus {
      border-color: ${props => props.theme.primary};
    }
  }
  
  textarea {
    resize: vertical;
    min-height: 100px;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;


const ToggleSwitch = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1rem 0;
  
  .toggle-info {
    flex: 1;
    
    .toggle-title {
      font-weight: 500;
      margin-bottom: 0.25rem;
    }
    
    .toggle-description {
      font-size: 0.8rem;
      color: #666;
    }
  }
  
  .toggle {
    position: relative;
    width: 50px;
    height: 24px;
    background: #ddd;
    border-radius: 12px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    
    &.active {
      background: ${props => props.theme.primary};
    }
    
    .toggle-slider {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: transform 0.3s ease;
      
      &.active {
        transform: translateX(26px);
      }
    }
  }
`;

const SaveButton = styled.button`
  background: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 2rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.theme.secondary};
    transform: translateY(-2px);
  }
`;

const SuccessMessage = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: #48bb78;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
  z-index: 1000;
  animation: slideIn 0.3s ease;
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  display: flex;
  align-items: center;
  gap: 8px;
  
  .success-icon {
    font-size: 1.2rem;
  }
`;

const ThemeToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
  margin: 1rem 0;
  
  .theme-info {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .theme-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${props => props.isDark ? 'linear-gradient(45deg, #4a5568, #2d3748)' : 'linear-gradient(45deg, #f7fafc, #edf2f7)'};
      color: ${props => props.isDark ? '#f7fafc' : '#2d3748'};
      font-size: 1.2rem;
    }
    
    .theme-text {
      .theme-title {
        font-weight: 600;
        color: ${props => props.theme.text};
        margin-bottom: 4px;
      }
      
      .theme-description {
        font-size: 0.8rem;
        color: #666;
      }
    }
  }
  
  .theme-switch {
    position: relative;
    width: 60px;
    height: 32px;
    background: ${props => props.isDark ? '#4299e1' : '#e2e8f0'};
    border-radius: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    
    .theme-slider {
      position: absolute;
      top: 2px;
      left: ${props => props.isDark ? '30px' : '2px'};
      width: 28px;
      height: 28px;
      background: white;
      border-radius: 50%;
      transition: left 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      
      svg {
        font-size: 14px;
        color: ${props => props.isDark ? '#1a202c' : '#f6ad55'};
      }
    }
  }
`;

const Settings = () => {
  const { settings, updateNestedSetting, formatTimestamp } = useSettings();
  const { isDarkMode, toggleTheme, companyName, updateCompanyName, adminEmail, updateAdminEmail, timeZone, updateTimeZone } = useTheme();
  const [showSuccess, setShowSuccess] = useState(false);
  const [localSettings, setLocalSettings] = useState({});

  // Initialize local settings from contexts
  useEffect(() => {
    setLocalSettings({
      companyName: companyName,
      adminEmail: adminEmail,
      timeZone: timeZone,
      isDarkMode: isDarkMode,
      notifications: settings.notifications || {},
      dataRetention: settings.dataRetention || {}
    });
  }, [companyName, adminEmail, timeZone, isDarkMode, settings]);

  const handleInputChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNestedInputChange = (section, key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    try {
      // Update context states
      if (localSettings.companyName !== companyName) {
        updateCompanyName(localSettings.companyName);
      }
      if (localSettings.adminEmail !== adminEmail) {
        updateAdminEmail(localSettings.adminEmail);
      }
      if (localSettings.timeZone !== timeZone) {
        updateTimeZone(localSettings.timeZone);
      }
      
      // Update settings context
      updateNestedSetting('notifications', 'systemAlerts', localSettings.notifications.systemAlerts);
      updateNestedSetting('notifications', 'emailNotifications', localSettings.notifications.emailNotifications);
      updateNestedSetting('notifications', 'pushNotifications', localSettings.notifications.pushNotifications);
      updateNestedSetting('notifications', 'weeklyReports', localSettings.notifications.weeklyReports);
      
      updateNestedSetting('dataRetention', 'autoBackup', localSettings.dataRetention.autoBackup);
      updateNestedSetting('dataRetention', 'backupFrequency', localSettings.dataRetention.backupFrequency);
      updateNestedSetting('dataRetention', 'retentionPeriod', localSettings.dataRetention.retentionPeriod);
      updateNestedSetting('dataRetention', 'compressionEnabled', localSettings.dataRetention.compressionEnabled);
      updateNestedSetting('dataRetention', 'encryptBackups', localSettings.dataRetention.encryptBackups);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  // Get list of common timezones
  const commonTimezones = [
    'UTC',
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  return (
    <SettingsContainer>
      {showSuccess && (
        <SuccessMessage>
          <FiSave className="success-icon" />
          Settings saved successfully!
        </SuccessMessage>
      )}
      
      <PageHeader>
        <h1>Settings</h1>
        <p>Configure your IoT platform preferences and behavior</p>
      </PageHeader>

      <SettingsGrid>
        {/* Company Branding */}
        <SettingsCard>
          <div className="card-header">
            <div className="card-icon" style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)' }}>
              <FiEdit3 />
            </div>
            <div className="card-title">Company Information</div>
          </div>
          <div className="card-description">
            Update your company details that appear throughout the dashboard.
          </div>

          <FormGroup>
            <label>Company Name</label>
            <input
              type="text"
              value={localSettings.companyName || ''}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder="Enter your company name"
            />
            <small style={{ color: '#666', fontSize: '0.8rem' }}>
              This name will appear in the navbar and page titles
            </small>
          </FormGroup>

          <FormGroup>
            <label>Admin Email</label>
            <input
              type="email"
              value={localSettings.adminEmail || ''}
              onChange={(e) => handleInputChange('adminEmail', e.target.value)}
              placeholder="admin@company.com"
            />
            <small style={{ color: '#666', fontSize: '0.8rem' }}>
              Primary contact email for administrative notifications
            </small>
          </FormGroup>
        </SettingsCard>

        {/* Theme Settings */}
        <SettingsCard>
          <div className="card-header">
            <div className="card-icon" style={{ background: 'linear-gradient(45deg, #4299e1, #63b3ed)' }}>
              {isDarkMode ? <FiMoon /> : <FiSun />}
            </div>
            <div className="card-title">Appearance</div>
          </div>
          <div className="card-description">
            Choose between light and dark themes for your dashboard interface.
          </div>

          <ThemeToggle isDark={isDarkMode}>
            <div className="theme-info">
              <div className="theme-icon">
                {isDarkMode ? <FiMoon /> : <FiSun />}
              </div>
              <div className="theme-text">
                <div className="theme-title">
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </div>
                <div className="theme-description">
                  {isDarkMode ? 'Dark theme for low-light environments' : 'Light theme for bright environments'}
                </div>
              </div>
            </div>
            <div className="theme-switch" onClick={toggleTheme}>
              <div className="theme-slider">
                {isDarkMode ? <FiMoon /> : <FiSun />}
              </div>
            </div>
          </ThemeToggle>
        </SettingsCard>

        {/* Time Zone Settings */}
        <SettingsCard>
          <div className="card-header">
            <div className="card-icon" style={{ background: 'linear-gradient(45deg, #38b2ac, #4fd1c7)' }}>
              <FiClock />
            </div>
            <div className="card-title">Time Zone</div>
          </div>
          <div className="card-description">
            Set your preferred time zone for displaying timestamps throughout the platform.
          </div>

          <FormGroup>
            <label>Time Zone</label>
            <select
              value={localSettings.timeZone || 'UTC'}
              onChange={(e) => handleInputChange('timeZone', e.target.value)}
            >
              {commonTimezones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
            <small style={{ color: '#666', fontSize: '0.8rem' }}>
              Current time: {formatTimestamp(new Date(), 'full')}
            </small>
          </FormGroup>
        </SettingsCard>

        {/* Notifications */}
        <SettingsCard>
          <div className="card-header">
            <div className="card-icon" style={{ background: 'linear-gradient(45deg, #48bb78, #68d391)' }}>
              <FiBell />
            </div>
            <div className="card-title">Notifications</div>
          </div>
          <div className="card-description">
            Control how and when you receive notifications about system events.
          </div>

          <ToggleSwitch>
            <div className="toggle-info">
              <div className="toggle-title">System Alerts</div>
              <div className="toggle-description">Critical system and device alerts</div>
            </div>
            <div 
              className={`toggle ${localSettings.notifications?.systemAlerts ? 'active' : ''}`}
              onClick={() => handleNestedInputChange('notifications', 'systemAlerts', !localSettings.notifications?.systemAlerts)}
            >
              <div className={`toggle-slider ${localSettings.notifications?.systemAlerts ? 'active' : ''}`} />
            </div>
          </ToggleSwitch>

          <ToggleSwitch>
            <div className="toggle-info">
              <div className="toggle-title">Email Notifications</div>
              <div className="toggle-description">Receive alerts and updates via email</div>
            </div>
            <div 
              className={`toggle ${localSettings.notifications?.emailNotifications ? 'active' : ''}`}
              onClick={() => handleNestedInputChange('notifications', 'emailNotifications', !localSettings.notifications?.emailNotifications)}
            >
              <div className={`toggle-slider ${localSettings.notifications?.emailNotifications ? 'active' : ''}`} />
            </div>
          </ToggleSwitch>

          <ToggleSwitch>
            <div className="toggle-info">
              <div className="toggle-title">Push Notifications</div>
              <div className="toggle-description">Browser push notifications for real-time alerts</div>
            </div>
            <div 
              className={`toggle ${localSettings.notifications?.pushNotifications ? 'active' : ''}`}
              onClick={() => handleNestedInputChange('notifications', 'pushNotifications', !localSettings.notifications?.pushNotifications)}
            >
              <div className={`toggle-slider ${localSettings.notifications?.pushNotifications ? 'active' : ''}`} />
            </div>
          </ToggleSwitch>

          <ToggleSwitch>
            <div className="toggle-info">
              <div className="toggle-title">Weekly Reports</div>
              <div className="toggle-description">Automated weekly analytics reports</div>
            </div>
            <div 
              className={`toggle ${localSettings.notifications?.weeklyReports ? 'active' : ''}`}
              onClick={() => handleNestedInputChange('notifications', 'weeklyReports', !localSettings.notifications?.weeklyReports)}
            >
              <div className={`toggle-slider ${localSettings.notifications?.weeklyReports ? 'active' : ''}`} />
            </div>
          </ToggleSwitch>
        </SettingsCard>

        {/* Data Retention */}
        <SettingsCard>
          <div className="card-header">
            <div className="card-icon" style={{ background: 'linear-gradient(45deg, #ed8936, #f6ad55)' }}>
              <FiDatabase />
            </div>
            <div className="card-title">Data Retention & Backup</div>
          </div>
          <div className="card-description">
            Configure data backup and retention policies for your IoT data.
          </div>

          <ToggleSwitch>
            <div className="toggle-info">
              <div className="toggle-title">Automatic Backup</div>
              <div className="toggle-description">Enable automated data backups</div>
            </div>
            <div 
              className={`toggle ${localSettings.dataRetention?.autoBackup ? 'active' : ''}`}
              onClick={() => handleNestedInputChange('dataRetention', 'autoBackup', !localSettings.dataRetention?.autoBackup)}
            >
              <div className={`toggle-slider ${localSettings.dataRetention?.autoBackup ? 'active' : ''}`} />
            </div>
          </ToggleSwitch>

          {localSettings.dataRetention?.autoBackup && (
            <FormRow>
              <FormGroup>
                <label>Backup Frequency</label>
                <select
                  value={localSettings.dataRetention?.backupFrequency || 'daily'}
                  onChange={(e) => handleNestedInputChange('dataRetention', 'backupFrequency', e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </FormGroup>

              <FormGroup>
                <label>Retention Period (days)</label>
                <input
                  type="number"
                  value={localSettings.dataRetention?.retentionPeriod || 90}
                  onChange={(e) => handleNestedInputChange('dataRetention', 'retentionPeriod', parseInt(e.target.value))}
                  min="7"
                  max="365"
                />
              </FormGroup>
            </FormRow>
          )}

          <ToggleSwitch>
            <div className="toggle-info">
              <div className="toggle-title">Compress Backups</div>
              <div className="toggle-description">Enable compression to save storage space</div>
            </div>
            <div 
              className={`toggle ${localSettings.dataRetention?.compressionEnabled ? 'active' : ''}`}
              onClick={() => handleNestedInputChange('dataRetention', 'compressionEnabled', !localSettings.dataRetention?.compressionEnabled)}
            >
              <div className={`toggle-slider ${localSettings.dataRetention?.compressionEnabled ? 'active' : ''}`} />
            </div>
          </ToggleSwitch>

          <ToggleSwitch>
            <div className="toggle-info">
              <div className="toggle-title">Encrypt Backups</div>
              <div className="toggle-description">Encrypt backup files for enhanced security</div>
            </div>
            <div 
              className={`toggle ${localSettings.dataRetention?.encryptBackups ? 'active' : ''}`}
              onClick={() => handleNestedInputChange('dataRetention', 'encryptBackups', !localSettings.dataRetention?.encryptBackups)}
            >
              <div className={`toggle-slider ${localSettings.dataRetention?.encryptBackups ? 'active' : ''}`} />
            </div>
          </ToggleSwitch>
        </SettingsCard>
      </SettingsGrid>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <SaveButton onClick={handleSave}>
          <FiSave size={16} />
          Save All Settings
        </SaveButton>
      </div>
    </SettingsContainer>
  );
};

export default Settings;