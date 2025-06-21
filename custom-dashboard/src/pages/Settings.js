import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiSave, 
  FiUpload, 
  FiEdit3, 
  FiShield,
  FiBell,
  FiGlobe,
  FiDatabase,
  FiKey
} from 'react-icons/fi';

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

const ColorPicker = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  .color-option {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    cursor: pointer;
    border: 3px solid transparent;
    transition: border-color 0.3s ease;
    
    &.active {
      border-color: ${props => props.theme.text};
    }
  }
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

const FileUpload = styled.div`
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s ease;
  
  &:hover {
    border-color: ${props => props.theme.primary};
  }
  
  .upload-icon {
    font-size: 2rem;
    color: #666;
    margin-bottom: 1rem;
  }
  
  .upload-text {
    color: #666;
  }
`;

const Settings = () => {
  const [settings, setSettings] = useState({
    company: {
      name: 'Your Company Name',
      logo: null,
      primaryColor: '#667eea',
      secondaryColor: '#764ba2'
    },
    notifications: {
      email: true,
      push: true,
      alerts: true,
      reports: false
    },
    api: {
      endpoint: 'https://api.magistrala.io',
      timeout: 30000,
      retries: 3
    },
    security: {
      twoFactor: false,
      sessionTimeout: 3600,
      apiAccess: true
    }
  });

  const colorOptions = [
    '#667eea', '#764ba2', '#3498db', '#2ecc71', 
    '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c'
  ];

  useEffect(() => {
    // Load saved settings from localStorage
    try {
      const savedSettings = localStorage.getItem('choovio_settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
        
        // Apply saved theme
        if (parsedSettings.company?.primaryColor) {
          document.documentElement.style.setProperty('--primary-color', parsedSettings.company.primaryColor);
        }
        if (parsedSettings.company?.secondaryColor) {
          document.documentElement.style.setProperty('--secondary-color', parsedSettings.company.secondaryColor);
        }
        if (parsedSettings.company?.name) {
          document.title = `${parsedSettings.company.name} IoT Dashboard`;
        }
      }
    } catch (error) {
      console.error('Failed to load saved settings:', error);
    }
  }, []);

  const handleToggle = (section, key) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key]
      }
    }));
  };

  const handleInputChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    try {
      // Save to localStorage for persistence
      localStorage.setItem('choovio_settings', JSON.stringify(settings));
      alert('Settings saved successfully!');
      console.log('Settings saved:', settings);
      
      // Apply theme changes if color was updated
      if (settings.company.primaryColor || settings.company.secondaryColor) {
        document.documentElement.style.setProperty('--primary-color', settings.company.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', settings.company.secondaryColor);
      }
      
      // Apply company name if changed
      if (settings.company.name) {
        document.title = `${settings.company.name} IoT Dashboard`;
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  return (
    <SettingsContainer>
      <PageHeader>
        <h1>Settings</h1>
        <p>Customize your Magistrala IoT platform experience</p>
      </PageHeader>

      <SettingsGrid>
        <SettingsCard>
          <div className="card-header">
            <div className="card-icon" style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)' }}>
              <FiEdit3 />
            </div>
            <div className="card-title">Branding & Appearance</div>
          </div>
          <div className="card-description">
            Customize the look and feel of your IoT dashboard to match your brand identity.
          </div>

          <FormGroup>
            <label>Company Name</label>
            <input
              type="text"
              value={settings.company.name}
              onChange={(e) => handleInputChange('company', 'name', e.target.value)}
              placeholder="Enter your company name"
            />
          </FormGroup>

          <FormGroup>
            <label>Company Logo</label>
            <FileUpload>
              <FiUpload className="upload-icon" />
              <div className="upload-text">
                Click to upload logo or drag and drop
                <br />
                <small>Recommended: PNG, JPG (max 2MB)</small>
              </div>
            </FileUpload>
          </FormGroup>

          <FormRow>
            <FormGroup>
              <label>Primary Color</label>
              <input
                type="text"
                value={settings.company.primaryColor}
                onChange={(e) => handleInputChange('company', 'primaryColor', e.target.value)}
              />
              <ColorPicker>
                {colorOptions.map(color => (
                  <div
                    key={color}
                    className={`color-option ${settings.company.primaryColor === color ? 'active' : ''}`}
                    style={{ background: color }}
                    onClick={() => handleInputChange('company', 'primaryColor', color)}
                  />
                ))}
              </ColorPicker>
            </FormGroup>

            <FormGroup>
              <label>Secondary Color</label>
              <input
                type="text"
                value={settings.company.secondaryColor}
                onChange={(e) => handleInputChange('company', 'secondaryColor', e.target.value)}
              />
            </FormGroup>
          </FormRow>
        </SettingsCard>

        <SettingsCard>
          <div className="card-header">
            <div className="card-icon" style={{ background: 'linear-gradient(45deg, #2ecc71, #27ae60)' }}>
              <FiBell />
            </div>
            <div className="card-title">Notifications</div>
          </div>
          <div className="card-description">
            Configure how and when you receive notifications about your IoT devices and data.
          </div>

          <ToggleSwitch>
            <div className="toggle-info">
              <div className="toggle-title">Email Notifications</div>
              <div className="toggle-description">Receive alerts and updates via email</div>
            </div>
            <div 
              className={`toggle ${settings.notifications.email ? 'active' : ''}`}
              onClick={() => handleToggle('notifications', 'email')}
            >
              <div className={`toggle-slider ${settings.notifications.email ? 'active' : ''}`} />
            </div>
          </ToggleSwitch>

          <ToggleSwitch>
            <div className="toggle-info">
              <div className="toggle-title">Push Notifications</div>
              <div className="toggle-description">Real-time browser notifications</div>
            </div>
            <div 
              className={`toggle ${settings.notifications.push ? 'active' : ''}`}
              onClick={() => handleToggle('notifications', 'push')}
            >
              <div className={`toggle-slider ${settings.notifications.push ? 'active' : ''}`} />
            </div>
          </ToggleSwitch>

          <ToggleSwitch>
            <div className="toggle-info">
              <div className="toggle-title">System Alerts</div>
              <div className="toggle-description">Critical system and device alerts</div>
            </div>
            <div 
              className={`toggle ${settings.notifications.alerts ? 'active' : ''}`}
              onClick={() => handleToggle('notifications', 'alerts')}
            >
              <div className={`toggle-slider ${settings.notifications.alerts ? 'active' : ''}`} />
            </div>
          </ToggleSwitch>

          <ToggleSwitch>
            <div className="toggle-info">
              <div className="toggle-title">Weekly Reports</div>
              <div className="toggle-description">Automated weekly analytics reports</div>
            </div>
            <div 
              className={`toggle ${settings.notifications.reports ? 'active' : ''}`}
              onClick={() => handleToggle('notifications', 'reports')}
            >
              <div className={`toggle-slider ${settings.notifications.reports ? 'active' : ''}`} />
            </div>
          </ToggleSwitch>
        </SettingsCard>

        <SettingsCard>
          <div className="card-header">
            <div className="card-icon" style={{ background: 'linear-gradient(45deg, #3498db, #2980b9)' }}>
              <FiGlobe />
            </div>
            <div className="card-title">API Configuration</div>
          </div>
          <div className="card-description">
            Configure API endpoints and connection settings for your Magistrala platform.
          </div>

          <FormGroup>
            <label>API Endpoint</label>
            <input
              type="url"
              value={settings.api.endpoint}
              onChange={(e) => handleInputChange('api', 'endpoint', e.target.value)}
              placeholder="https://api.magistrala.io"
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <label>Request Timeout (ms)</label>
              <input
                type="number"
                value={settings.api.timeout}
                onChange={(e) => handleInputChange('api', 'timeout', parseInt(e.target.value))}
              />
            </FormGroup>

            <FormGroup>
              <label>Max Retries</label>
              <input
                type="number"
                value={settings.api.retries}
                onChange={(e) => handleInputChange('api', 'retries', parseInt(e.target.value))}
                min="0"
                max="10"
              />
            </FormGroup>
          </FormRow>
        </SettingsCard>

        <SettingsCard>
          <div className="card-header">
            <div className="card-icon" style={{ background: 'linear-gradient(45deg, #e74c3c, #c0392b)' }}>
              <FiShield />
            </div>
            <div className="card-title">Security Settings</div>
          </div>
          <div className="card-description">
            Manage security features and access controls for your IoT platform.
          </div>

          <ToggleSwitch>
            <div className="toggle-info">
              <div className="toggle-title">Two-Factor Authentication</div>
              <div className="toggle-description">Add an extra layer of security to your account</div>
            </div>
            <div 
              className={`toggle ${settings.security.twoFactor ? 'active' : ''}`}
              onClick={() => handleToggle('security', 'twoFactor')}
            >
              <div className={`toggle-slider ${settings.security.twoFactor ? 'active' : ''}`} />
            </div>
          </ToggleSwitch>

          <FormGroup>
            <label>Session Timeout (seconds)</label>
            <input
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
              min="300"
              max="86400"
            />
          </FormGroup>

          <ToggleSwitch>
            <div className="toggle-info">
              <div className="toggle-title">API Access</div>
              <div className="toggle-description">Allow external API access to your data</div>
            </div>
            <div 
              className={`toggle ${settings.security.apiAccess ? 'active' : ''}`}
              onClick={() => handleToggle('security', 'apiAccess')}
            >
              <div className={`toggle-slider ${settings.security.apiAccess ? 'active' : ''}`} />
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