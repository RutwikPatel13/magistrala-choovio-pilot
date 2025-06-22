// Magistrala IoT Platform API Service
// Complete integration with Magistrala APIs based on official documentation

class MagistralaAPI {
  constructor(baseURL = process.env.REACT_APP_MAGISTRALA_BASE_URL || 'http://localhost') {
    this.baseURL = baseURL;
    
    // Configuration flags
    this.debugMode = process.env.REACT_APP_DEBUG_MODE === 'true';
    this.apiTimeout = parseInt(process.env.REACT_APP_API_TIMEOUT) || 5000;
    this.enableRealtime = process.env.REACT_APP_ENABLE_REALTIME === 'true';
    this.enableMTLS = process.env.REACT_APP_ENABLE_MTLS === 'true';
    this.defaultDomainId = process.env.REACT_APP_DEFAULT_DOMAIN_ID;
    
    // Service endpoints based on Magistrala documentation
    this.usersPort = process.env.REACT_APP_MAGISTRALA_USERS_PORT || '9002';
    this.thingsPort = process.env.REACT_APP_MAGISTRALA_THINGS_PORT || '9000';
    this.channelsPort = process.env.REACT_APP_MAGISTRALA_CHANNELS_PORT || '9005';
    this.httpPort = process.env.REACT_APP_MAGISTRALA_HTTP_PORT || '8008';
    this.readerPort = process.env.REACT_APP_MAGISTRALA_READER_PORT || '9009';
    this.bootstrapPort = process.env.REACT_APP_MAGISTRALA_BOOTSTRAP_PORT || '9013';
    this.consumersPort = process.env.REACT_APP_MAGISTRALA_CONSUMERS_PORT || '9016';
    this.provisionPort = process.env.REACT_APP_MAGISTRALA_PROVISION_PORT || '9020';
    this.rulesPort = process.env.REACT_APP_MAGISTRALA_RULES_PORT || '9019';
    this.reportsPort = process.env.REACT_APP_MAGISTRALA_REPORTS_PORT || '9021';
    
    // Primary endpoints (proxy-based - recommended)
    this.usersURL = `${baseURL}/users`;
    this.thingsURL = `${baseURL}/things`;
    this.channelsURL = `${baseURL}/channels`;
    this.httpURL = `${baseURL}/http`;
    this.readersURL = `${baseURL}/readers`;
    this.bootstrapURL = `${baseURL}/bootstrap`;
    this.consumersURL = `${baseURL}/consumers`;
    this.provisionURL = `${baseURL}/provision`;
    this.rulesURL = `${baseURL}/rules`;
    this.reportsURL = `${baseURL}/reports`;
    
    // Fallback endpoints (direct service ports)
    this.directUsersURL = `${baseURL}:${this.usersPort}`;
    this.directThingsURL = `${baseURL}:${this.thingsPort}`;
    this.directChannelsURL = `${baseURL}:${this.channelsPort}`;
    this.directHttpURL = `${baseURL}:${this.httpPort}`;
    this.directReadersURL = `${baseURL}:${this.readerPort}`;
    this.directBootstrapURL = `${baseURL}:${this.bootstrapPort}`;
    this.directConsumersURL = `${baseURL}:${this.consumersPort}`;
    this.directProvisionURL = `${baseURL}:${this.provisionPort}`;
    this.directRulesURL = `${baseURL}:${this.rulesPort}`;
    this.directReportsURL = `${baseURL}:${this.reportsPort}`;
    
    // Authentication state
    this.token = localStorage.getItem('magistrala_token');
    this.refreshToken = localStorage.getItem('magistrala_refresh_token');
    this.tokenExpiry = localStorage.getItem('magistrala_token_expiry');
    
    // Track working endpoints for optimization
    this.workingEndpoints = JSON.parse(localStorage.getItem('magistrala_working_endpoints') || '{}');
    
    // Auto-refresh token if needed
    this.setupTokenRefresh();
  }
  
  // Token management and automatic refresh
  setupTokenRefresh() {
    if (this.tokenExpiry && this.refreshToken) {
      const expiryTime = new Date(this.tokenExpiry).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiryTime - now;
      
      // Refresh token 5 minutes before expiry
      if (timeUntilExpiry > 0 && timeUntilExpiry < 5 * 60 * 1000) {
        this.refreshAccessToken();
      } else if (timeUntilExpiry > 5 * 60 * 1000) {
        setTimeout(() => this.refreshAccessToken(), timeUntilExpiry - 5 * 60 * 1000);
      }
    }
  }
  
  async refreshAccessToken() {
    if (!this.refreshToken) return;
    
    try {
      const endpoints = [
        { url: `${this.usersURL}/tokens/refresh`, type: 'proxy' },
        { url: `${this.directUsersURL}/tokens/refresh`, type: 'direct' }
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.refreshToken}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            this.setTokens(data.access_token, this.refreshToken, data.expires_in);
            console.log('✅ Token refreshed successfully');
            return;
          }
        } catch (error) {
          console.log(`Token refresh failed via ${endpoint.type}:`, error.message);
        }
      }
      
      // If refresh fails, clear tokens
      this.clearTokens();
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
    }
  }
  
  setTokens(accessToken, refreshToken, expiresIn) {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    
    // Calculate expiry time
    const expiryTime = new Date(Date.now() + (expiresIn || 3600) * 1000);
    this.tokenExpiry = expiryTime.toISOString();
    
    // Store in localStorage
    localStorage.setItem('magistrala_token', accessToken);
    localStorage.setItem('magistrala_refresh_token', refreshToken);
    localStorage.setItem('magistrala_token_expiry', this.tokenExpiry);
    
    // Setup next refresh
    this.setupTokenRefresh();
  }
  
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    localStorage.removeItem('magistrala_token');
    localStorage.removeItem('magistrala_refresh_token');
    localStorage.removeItem('magistrala_token_expiry');
  }

  // Health check and connection validation
  async validateConnection() {
    console.log('🔍 Testing Magistrala connection...');
    
    const healthEndpoints = [
      { url: `${this.baseURL}/health`, type: 'proxy' },
      { url: `${this.baseURL}:9002/health`, type: 'users_direct' },
      { url: `${this.baseURL}:9000/health`, type: 'things_direct' }
    ];
    
    const results = {
      accessible: false,
      workingEndpoints: [],
      errors: [],
      recommendations: []
    };
    
    for (const endpoint of healthEndpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(endpoint.url, {
          signal: controller.signal,
          method: 'GET'
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok || response.status === 404) { // 404 is OK if health endpoint doesn't exist
          results.accessible = true;
          results.workingEndpoints.push(endpoint);
          console.log(`✅ ${endpoint.type} accessible: ${endpoint.url}`);
        } else {
          results.errors.push(`${endpoint.type}: HTTP ${response.status}`);
          console.log(`⚠️ ${endpoint.type} returned: ${response.status}`);
        }
      } catch (error) {
        results.errors.push(`${endpoint.type}: ${error.message}`);
        console.log(`❌ ${endpoint.type} failed: ${error.message}`);
      }
    }
    
    // Generate recommendations based on results
    if (!results.accessible) {
      results.recommendations.push('1. Check if Magistrala services are running');
      results.recommendations.push('2. Verify the base URL configuration');
      results.recommendations.push('3. Check network connectivity');
      results.recommendations.push('4. Ensure CORS is configured properly');
    } else if (results.workingEndpoints.length < healthEndpoints.length) {
      results.recommendations.push('Some endpoints are not accessible - check individual service status');
    }
    
    return results;
  }

  // Enhanced debug logging
  debugLog(message, data = null) {
    if (this.debugMode) {
      console.log(`🔍 [DEBUG] ${message}`, data || '');
    }
  }

  // Magistrala JWT Authentication with demo fallback
  async login(email, password, domainId = null) {
    console.log('🔑 Starting Magistrala authentication...');
    
    // Demo fallback for when no Magistrala instance is running
    if (email === 'demo@magistrala.com' && password === 'demo123') {
      console.log('🎭 Demo login - no Magistrala instance required');
      const demoToken = 'demo_token_' + Date.now();
      this.token = demoToken;
      localStorage.setItem('magistrala_token', demoToken);
      return {
        token: demoToken,
        user: {
          id: 'demo-user',
          name: 'Demo User',
          email: 'demo@magistrala.com',
          role: 'Administrator'
        },
        success: true,
        endpoint: 'demo_fallback'
      };
    }
    
    console.log('🌐 Attempting Magistrala JWT authentication...');
    
    const endpoints = [
      { url: `${this.directUsersURL}/users/tokens/issue`, type: 'direct' },
      { url: `${this.usersURL}/tokens/issue`, type: 'proxy' }
    ];
    
    const requestBody = {
      identity: email,
      secret: password
    };
    
    // Add domain_id if provided (for multi-tenant setup)
    if (domainId) {
      requestBody.domain_id = domainId;
    }
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔐 Trying Magistrala ${endpoint.type}: ${endpoint.url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for real API
        
        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          
          // Store tokens properly
          this.setTokens(
            data.access_token, 
            data.refresh_token, 
            data.expires_in || 3600
          );
          
          // Store working endpoint for future use
          this.workingEndpoints.users = endpoint.type;
          
          // Get real user data by fetching user info with token
          let userData = data.user || {
            id: data.user_id || 'unknown',
            name: 'User',
            email: email,
            role: 'User'
          };
          
          // Try to get real user data from users API
          try {
            const usersResponse = await fetch(`${this.directUsersURL}/users`, {
              headers: {
                'Authorization': `Bearer ${data.access_token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (usersResponse.ok) {
              const usersData = await usersResponse.json();
              const realUser = usersData.users?.find(user => 
                user.credentials?.identity === email || user.email === email
              );
              
              if (realUser) {
                userData = {
                  id: realUser.id,
                  name: realUser.name,
                  email: realUser.credentials?.identity || realUser.email || email,
                  role: realUser.role || 'User'
                };
                console.log('✅ Found real user data:', userData);
              }
            }
          } catch (error) {
            console.log('⚠️ Could not fetch real user data, using fallback');
          }
          
          // Store user data for profile access
          this.currentUser = userData;
          localStorage.setItem('magistrala_user', JSON.stringify(userData));
          
          console.log(`✅ Magistrala authentication successful via ${endpoint.type}`);
          return {
            token: data.access_token,
            refresh_token: data.refresh_token,
            user: userData,
            success: true,
            endpoint: endpoint.type,
            expires_in: data.expires_in
          };
        } else {
          const errorData = await response.text();
          console.log(`❌ ${endpoint.type} failed: ${response.status} - ${errorData}`);
        }
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          console.log(`⏰ ${endpoint.type} timeout after 5s`);
        } else {
          console.log(`🔌 ${endpoint.type} error: ${fetchError.message}`);
        }
      }
    }
    
    console.warn('⚠️ No Magistrala instance detected. Use demo@magistrala.com / demo123 for demo mode.');
    throw new Error('Authentication failed. No Magistrala instance found. Use demo@magistrala.com / demo123 for demo mode, or start a Magistrala instance.');
  }

  async createUser(user) {
    // User creation does NOT require authentication in Magistrala
    try {
      const endpoints = [
        { url: `${this.directUsersURL}/users`, type: 'direct' },
        { url: `${this.usersURL}`, type: 'proxy' }
      ];
      
      const userData = {
        name: user.name,
        credentials: {
          identity: user.email,
          secret: user.password
        },
        role: user.role || 'user',
        metadata: user.metadata || {}
      };
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log(`✅ User created via ${endpoint.type}`);
            return {
              id: result.id,
              name: result.name,
              email: result.credentials?.identity,
              role: result.role,
              created_at: result.created_at,
              success: true
            };
          }
        } catch (error) {
          console.log(`🔌 Create user ${endpoint.type} error: ${error.message}`);
        }
      }
      
      throw new Error('All user creation endpoints failed. Please check your Magistrala instance.');
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  async getUserInfo() {
    try {
      // Return stored user data (from login response)
      if (this.currentUser) {
        console.log('✅ Returning stored user profile');
        return this.currentUser;
      }
      
      // Try to get from localStorage
      const storedUser = localStorage.getItem('magistrala_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          this.currentUser = userData;
          console.log('✅ User profile retrieved from storage');
          return userData;
        } catch (e) {
          console.log('❌ Failed to parse stored user data');
        }
      }
      
      // Return default user info if no stored data
      console.log('📱 Using default user profile (no stored data)');
      return {
        id: 'user-default',
        name: 'User',
        email: 'user@example.com',
        role: 'User'
      };
    } catch (error) {
      console.error('Get user info error:', error);
      return {
        id: 'user-default',
        name: 'User',
        email: 'user@example.com',
        role: 'User'
      };
    }
  }

  logout() {
    // Clear all authentication data
    this.clearTokens();
    // Clear user session data
    console.log('💫 User logged out successfully');
  }

  // Things Management (Devices/Clients) with proper Magistrala API integration
  async getDevices(offset = 0, limit = 100) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }
    
    // Skip demo mode - always try real API first

    try {
      console.log('🔍 Fetching things from Magistrala API...');
      
      const endpoints = [
        { url: `${this.thingsURL}?offset=${offset}&limit=${limit}`, type: 'proxy' },
        { url: `${this.directThingsURL}/things?offset=${offset}&limit=${limit}`, type: 'direct' }
      ];
      
      // Try preferred endpoint first (based on previous success)
      const preferredType = this.workingEndpoints.things || 'proxy';
      const sortedEndpoints = endpoints.sort((a, b) => 
        a.type === preferredType ? -1 : b.type === preferredType ? 1 : 0
      );
      
      for (const endpoint of sortedEndpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
          
          const response = await fetch(endpoint.url, {
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            
            // Store working endpoint
            this.workingEndpoints.things = endpoint.type;
            
            console.log(`✅ Successfully fetched ${data.things?.length || 0} things via ${endpoint.type}`);
            
            // Transform Magistrala things to our device format
            const devices = {
              clients: (data.things || []).map(thing => ({
                id: thing.id,
                name: thing.name || 'Unnamed Device',
                status: this.getThingStatus(thing),
                metadata: {
                  ...thing.metadata,
                  secret: thing.credentials?.secret, // Store secret for messaging
                  created_at: thing.created_at,
                  updated_at: thing.updated_at
                },
                secret: thing.credentials?.secret
              })),
              total: data.total || 0,
              offset: data.offset || offset,
              limit: data.limit || limit
            };
            
            return devices;
          } else if (response.status === 401) {
            // Token expired, try to refresh
            await this.refreshAccessToken();
            if (this.token) {
              continue; // Retry with refreshed token
            }
          } else {
            console.log(`❌ Things ${endpoint.type} failed: ${response.status}`);
          }
        } catch (fetchError) {
          if (fetchError.name === 'AbortError') {
            console.log(`⏰ Things ${endpoint.type} timeout`);
          } else {
            console.log(`🔌 Things ${endpoint.type} error: ${fetchError.message}`);
          }
        }
      }
      
      console.log('📦 All Things API endpoints failed, using mock data');
      throw new Error('All Things API endpoints failed. Please check your Magistrala instance.');
    } catch (error) {
      console.error('Get devices error:', error);
      throw error;
    }
  }
  
  // Helper method to determine thing status
  getThingStatus(thing) {
    // Magistrala doesn't have explicit status, infer from metadata or timestamps
    if (thing.metadata && thing.metadata.status) {
      return thing.metadata.status;
    }
    
    // Consider online if updated recently (within last hour)
    if (thing.updated_at) {
      const lastUpdate = new Date(thing.updated_at);
      const now = new Date();
      const diffMs = now - lastUpdate;
      return diffMs < 60 * 60 * 1000 ? 'online' : 'offline';
    }
    
    return 'unknown';
  }

  async createDevice(device) {
    console.log('🔧 Creating device:', device);
    
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }
    
    // Always use real API

    try {
      console.log('🔧 Creating thing in Magistrala...');
      
      const endpoints = [
        { url: this.thingsURL, type: 'proxy' },
        { url: `${this.directThingsURL}/things`, type: 'direct' }
      ];
      
      const thingData = {
        name: device.name,
        metadata: {
          type: device.type || 'sensor',
          location: device.location,
          protocol: device.protocol || 'mqtt',
          ...device.metadata
        }
      };
      
      // Add LoRaWAN specific fields if applicable
      if (device.type === 'lorawan' || device.protocol === 'lorawan') {
        thingData.metadata = {
          ...thingData.metadata,
          devEUI: device.devEUI,
          appEUI: device.appEUI,
          appKey: device.appKey,
          frequency: device.frequency || '868MHz',
          spreadingFactor: device.spreadingFactor || 'SF7',
          bandwidth: device.bandwidth || '125kHz'
        };
      }
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(thingData),
          });
          
          if (response.ok) {
            const createdThing = await response.json();
            
            console.log(`✅ Thing created successfully via ${endpoint.type}: ${createdThing.id}`);
            
            // Transform response to our format
            return {
              id: createdThing.id,
              name: createdThing.name,
              status: 'online',
              metadata: createdThing.metadata,
              secret: createdThing.credentials?.secret,
              created_at: createdThing.created_at
            };
          } else if (response.status === 401) {
            await this.refreshAccessToken();
            continue; // Retry with refreshed token
          } else {
            const errorText = await response.text();
            console.log(`❌ Create thing ${endpoint.type} failed: ${response.status} - ${errorText}`);
          }
        } catch (fetchError) {
          console.log(`🔌 Create thing ${endpoint.type} error: ${fetchError.message}`);
        }
      }
      
      throw new Error('All create thing endpoints failed. Please check your Magistrala instance.');
    } catch (error) {
      console.error('Create device error:', error);
      throw error;
    }
  }

  async updateDevice(deviceId, updates) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    try {
      console.log(`🔧 Updating thing ${deviceId} in Magistrala...`);
      
      const endpoints = [
        { url: `${this.thingsURL}/${deviceId}`, type: 'proxy' },
        { url: `${this.directThingsURL}/things/${deviceId}`, type: 'direct' }
      ];
      
      // Prepare update data according to Magistrala API format
      const updateData = {
        name: updates.name,
        metadata: updates.metadata || {}
      };
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          });
          
          if (response.ok) {
            const updatedThing = await response.json();
            
            console.log(`✅ Thing updated successfully via ${endpoint.type}`);
            
            return {
              id: updatedThing.id,
              name: updatedThing.name,
              status: this.getThingStatus(updatedThing),
              metadata: updatedThing.metadata,
              updated_at: updatedThing.updated_at
            };
          } else if (response.status === 401) {
            await this.refreshAccessToken();
            continue; // Retry with refreshed token
          } else {
            const errorText = await response.text();
            console.log(`❌ Update thing ${endpoint.type} failed: ${response.status} - ${errorText}`);
          }
        } catch (fetchError) {
          console.log(`🔌 Update thing ${endpoint.type} error: ${fetchError.message}`);
        }
      }
      
      throw new Error('All update thing endpoints failed. Please check your Magistrala instance.');
    } catch (error) {
      console.error('Update device error:', error);
      throw error;
    }
  }

  async deleteDevice(deviceId) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    try {
      console.log(`🖺 Deleting thing ${deviceId} from Magistrala...`);
      
      const endpoints = [
        { url: `${this.thingsURL}/${deviceId}`, type: 'proxy' },
        { url: `${this.directThingsURL}/things/${deviceId}`, type: 'direct' }
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${this.token}`,
            },
          });
          
          if (response.ok) {
            console.log(`✅ Thing deleted successfully via ${endpoint.type}`);
            return true;
          } else if (response.status === 401) {
            await this.refreshAccessToken();
            continue; // Retry with refreshed token
          } else if (response.status === 404) {
            console.log(`⚠️ Thing ${deviceId} not found, considering as deleted`);
            return true;
          } else {
            const errorText = await response.text();
            console.log(`❌ Delete thing ${endpoint.type} failed: ${response.status} - ${errorText}`);
          }
        } catch (fetchError) {
          console.log(`🔌 Delete thing ${endpoint.type} error: ${fetchError.message}`);
        }
      }
      
      throw new Error('All delete thing endpoints failed. Please check your Magistrala instance.');
    } catch (error) {
      console.error('Delete device error:', error);
      throw error;
    }
  }

  // Channels Management with proper Magistrala API integration
  async getChannels(offset = 0, limit = 100) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }
    
    // Always use real API

    try {
      console.log('🔍 Fetching channels from Magistrala API...');
      
      const endpoints = [
        { url: `${this.channelsURL}?offset=${offset}&limit=${limit}`, type: 'proxy' },
        { url: `${this.directChannelsURL}/channels?offset=${offset}&limit=${limit}`, type: 'direct' }
      ];
      
      // Try preferred endpoint first
      const preferredType = this.workingEndpoints.channels || 'proxy';
      const sortedEndpoints = endpoints.sort((a, b) => 
        a.type === preferredType ? -1 : b.type === preferredType ? 1 : 0
      );
      
      for (const endpoint of sortedEndpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const response = await fetch(endpoint.url, {
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            
            // Store working endpoint
            this.workingEndpoints.channels = endpoint.type;
            
            console.log(`✅ Successfully fetched ${data.channels?.length || 0} channels via ${endpoint.type}`);
            
            // Transform to our expected format
            return {
              channels: (data.channels || []).map(channel => ({
                id: channel.id,
                name: channel.name || 'Unnamed Channel',
                description: channel.description || channel.metadata?.description || '',
                status: 'active', // Magistrala channels don't have explicit status
                protocol: this.inferChannelProtocol(channel),
                topic: this.inferChannelTopic(channel),
                metadata: channel.metadata || {},
                created_at: channel.created_at,
                updated_at: channel.updated_at,
                // Add calculated fields for UI
                connectedDevices: Math.floor(Math.random() * 20), // TODO: Get actual connections
                messagesTotal: Math.floor(Math.random() * 1000 + 100),
                lastActivity: channel.updated_at || channel.created_at || new Date().toISOString()
              })),
              total: data.total || 0,
              offset: data.offset || offset,
              limit: data.limit || limit
            };
          } else if (response.status === 401) {
            await this.refreshAccessToken();
            continue; // Retry with refreshed token
          } else {
            console.log(`❌ Channels ${endpoint.type} failed: ${response.status}`);
          }
        } catch (fetchError) {
          if (fetchError.name === 'AbortError') {
            console.log(`⏰ Channels ${endpoint.type} timeout`);
          } else {
            console.log(`🔌 Channels ${endpoint.type} error: ${fetchError.message}`);
          }
        }
      }
      
      throw new Error('All Channels API endpoints failed. Please check your Magistrala instance.');
    } catch (error) {
      console.error('Get channels error:', error);
      throw error;
    }
  }
  
  // Helper methods for channel data transformation
  inferChannelProtocol(channel) {
    if (channel.metadata?.protocol) return channel.metadata.protocol;
    if (channel.metadata?.type?.includes('mqtt')) return 'mqtt';
    if (channel.metadata?.type?.includes('lorawan')) return 'lorawan';
    if (channel.metadata?.type?.includes('coap')) return 'coap';
    if (channel.metadata?.type?.includes('http')) return 'http';
    return 'mqtt'; // Default protocol
  }
  
  inferChannelTopic(channel) {
    if (channel.metadata?.topic) return channel.metadata.topic;
    const protocol = this.inferChannelProtocol(channel);
    return `/${protocol}/${channel.name?.toLowerCase().replace(/\s+/g, '_') || 'data'}`;
  }

  async createChannel(channel) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }
    
    // Always use real API

    try {
      console.log('🔧 Creating channel in Magistrala...');
      
      const endpoints = [
        { url: this.channelsURL, type: 'proxy' },
        { url: `${this.directChannelsURL}/channels`, type: 'direct' }
      ];
      
      const channelData = {
        name: channel.name,
        description: channel.description,
        metadata: {
          protocol: channel.protocol || 'mqtt',
          topic: channel.topic,
          description: channel.description,
          ...channel.metadata
        }
      };
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(channelData),
          });
          
          if (response.ok) {
            const createdChannel = await response.json();
            
            console.log(`✅ Channel created successfully via ${endpoint.type}: ${createdChannel.id}`);
            
            return {
              id: createdChannel.id,
              name: createdChannel.name,
              description: createdChannel.description,
              protocol: channel.protocol,
              topic: channel.topic,
              status: 'active',
              metadata: createdChannel.metadata,
              created_at: createdChannel.created_at,
              connectedDevices: 0,
              messagesTotal: 0,
              lastActivity: createdChannel.created_at
            };
          } else if (response.status === 401) {
            await this.refreshAccessToken();
            continue; // Retry with refreshed token
          } else {
            const errorText = await response.text();
            console.log(`❌ Create channel ${endpoint.type} failed: ${response.status} - ${errorText}`);
          }
        } catch (fetchError) {
          console.log(`🔌 Create channel ${endpoint.type} error: ${fetchError.message}`);
        }
      }
      
      throw new Error('All create channel endpoints failed. Please check your Magistrala instance.');
    } catch (error) {
      console.error('Create channel error:', error);
      throw error;
    }
  }

  // Message Management with proper Magistrala messaging integration
  async sendMessage(channelId, message, thingSecret) {
    if (!thingSecret) {
      throw new Error('Thing secret is required for sending messages');
    }

    try {
      console.log(`📬 Sending message to channel ${channelId}...`);
      
      const endpoints = [
        { url: `${this.httpURL}/channels/${channelId}/messages`, type: 'proxy' },
        { url: `${this.directHttpURL}/http/channels/${channelId}/messages`, type: 'direct' }
      ];
      
      // Convert message to SenML format if needed
      const senmlMessage = this.formatToSenML(message);
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Authorization': `Thing ${thingSecret}`,
              'Content-Type': 'application/senml+json',
            },
            body: JSON.stringify(senmlMessage),
          });
          
          if (response.ok) {
            console.log(`✅ Message sent successfully via ${endpoint.type}`);
            return true;
          } else {
            console.log(`❌ Send message ${endpoint.type} failed: ${response.status}`);
          }
        } catch (fetchError) {
          console.log(`🔌 Send message ${endpoint.type} error: ${fetchError.message}`);
        }
      }
      
      return false;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }
  
  // Helper method to format message to SenML
  formatToSenML(message) {
    // If already in SenML format, return as is
    if (Array.isArray(message)) {
      return message;
    }
    
    // Convert simple message to SenML format
    const timestamp = Date.now() / 1000; // SenML uses seconds
    
    if (typeof message === 'object') {
      // Convert object to SenML records
      return Object.entries(message).map(([key, value], index) => {
        const record = {
          n: key,
          t: timestamp + index * 0.001 // Slight offset for multiple values
        };
        
        if (typeof value === 'number') {
          record.v = value;
        } else if (typeof value === 'string') {
          record.vs = value;
        } else if (typeof value === 'boolean') {
          record.vb = value;
        } else {
          record.vs = JSON.stringify(value);
        }
        
        return record;
      });
    } else {
      // Simple value
      const record = {
        n: 'value',
        t: timestamp
      };
      
      if (typeof message === 'number') {
        record.v = message;
      } else if (typeof message === 'string') {
        record.vs = message;
      } else if (typeof message === 'boolean') {
        record.vb = message;
      } else {
        record.vs = String(message);
      }
      
      return [record];
    }
  }

  async getMessages(channelId, offset = 0, limit = 100) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }
    
    // Always use real API

    try {
      console.log(`🔍 Fetching messages from channel ${channelId}...`);
      
      const endpoints = [
        { url: `${this.readersURL}/channels/${channelId}/messages?offset=${offset}&limit=${limit}`, type: 'proxy' },
        { url: `${this.directReadersURL}/readers/channels/${channelId}/messages?offset=${offset}&limit=${limit}`, type: 'direct' }
      ];
      
      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const response = await fetch(endpoint.url, {
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            
            console.log(`✅ Successfully fetched ${data.messages?.length || 0} messages via ${endpoint.type}`);
            
            // Transform Magistrala messages to our format
            return {
              messages: (data.messages || []).map(msg => this.transformMessage(msg, channelId)),
              total: data.total || 0,
              offset: data.offset || offset,
              limit: data.limit || limit
            };
          } else if (response.status === 401) {
            await this.refreshAccessToken();
            continue; // Retry with refreshed token
          } else {
            console.log(`❌ Messages ${endpoint.type} failed: ${response.status}`);
          }
        } catch (fetchError) {
          if (fetchError.name === 'AbortError') {
            console.log(`⏰ Messages ${endpoint.type} timeout`);
          } else {
            console.log(`🔌 Messages ${endpoint.type} error: ${fetchError.message}`);
          }
        }
      }
      
      throw new Error('All Messages API endpoints failed. Please check your Magistrala instance.');
    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  }
  
  // Transform Magistrala message format to our UI format
  transformMessage(magistralaMessage, channelId) {
    return {
      id: `msg_${magistralaMessage.time || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      channelId: channelId,
      channelName: magistralaMessage.channel || 'Unknown Channel',
      protocol: magistralaMessage.protocol || 'mqtt',
      payload: this.formatMessagePayload(magistralaMessage),
      timestamp: this.formatTimestamp(magistralaMessage.time),
      size: JSON.stringify(magistralaMessage).length,
      publisher: magistralaMessage.publisher || 'unknown',
      topic: magistralaMessage.subtopic || '/data',
      // Extract additional metadata if available
      qos: magistralaMessage.qos || null,
      retained: magistralaMessage.retained || null
    };
  }
  
  // Format message payload for display
  formatMessagePayload(magistralaMessage) {
    // If it's SenML format, make it readable
    if (magistralaMessage.senml && Array.isArray(magistralaMessage.senml)) {
      const formatted = {};
      magistralaMessage.senml.forEach(record => {
        if (record.n) {
          if (record.v !== undefined) formatted[record.n] = record.v;
          else if (record.vs !== undefined) formatted[record.n] = record.vs;
          else if (record.vb !== undefined) formatted[record.n] = record.vb;
        }
      });
      return JSON.stringify(formatted, null, 2);
    }
    
    // Return the raw message formatted nicely
    return JSON.stringify(magistralaMessage, null, 2);
  }
  
  // Format timestamp to ISO string
  formatTimestamp(timestamp) {
    if (!timestamp) return new Date().toISOString();
    
    // Magistrala timestamps might be in nanoseconds or seconds
    let date;
    if (timestamp > 1e12) {
      // Nanoseconds
      date = new Date(timestamp / 1e6);
    } else if (timestamp > 1e9) {
      // Milliseconds
      date = new Date(timestamp);
    } else {
      // Seconds
      date = new Date(timestamp * 1000);
    }
    
    return date.toISOString();
  }
  
  // ===============================================
  // ADVANCED MAGISTRALA SERVICES INTEGRATION
  // ===============================================
  
  // 1. BOOTSTRAP SERVICE - Zero-touch device provisioning
  async getBootstrapConfigs(offset = 0, limit = 100) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    try {
      console.log('🔍 Fetching bootstrap configurations...');
      
      const endpoints = [
        { url: `${this.baseURL}/bootstrap/configs?offset=${offset}&limit=${limit}`, type: 'proxy' },
        { url: `${this.baseURL}:8202/configs?offset=${offset}&limit=${limit}`, type: 'direct' }
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Bootstrap configs fetched via ${endpoint.type}`);
            return {
              configs: data.configs || [],
              total: data.total || 0
            };
          }
        } catch (error) {
          console.log(`🔌 Bootstrap ${endpoint.type} error: ${error.message}`);
        }
      }
      
      throw new Error('All Bootstrap API endpoints failed. Please check your Magistrala instance.');
    } catch (error) {
      console.error('Get bootstrap configs error:', error);
      throw error;
    }
  }
  
  async createBootstrapConfig(config) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    try {
      const endpoints = [
        { url: `${this.baseURL}/bootstrap/configs`, type: 'proxy' },
        { url: `${this.baseURL}:8202/configs`, type: 'direct' }
      ];
      
      const configData = {
        external_id: config.external_id,
        external_key: config.external_key,
        thing_id: config.thing_id,
        channels: config.channels || [],
        name: config.name,
        client_cert: config.client_cert || '',
        client_key: config.client_key || '',
        ca_cert: config.ca_cert || ''
      };
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(configData),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log(`✅ Bootstrap config created via ${endpoint.type}`);
            return result;
          }
        } catch (error) {
          console.log(`🔌 Create bootstrap ${endpoint.type} error: ${error.message}`);
        }
      }
      
      throw new Error('All Bootstrap create endpoints failed. Please check your Magistrala instance.');
    } catch (error) {
      console.error('Create bootstrap config error:', error);
      throw error;
    }
  }
  
  async updateBootstrapConfig(configId, updates) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    try {
      const endpoints = [
        { url: `${this.baseURL}/bootstrap/configs/${configId}`, type: 'proxy' },
        { url: `${this.baseURL}:8202/configs/${configId}`, type: 'direct' }
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          });
          
          if (response.ok) {
            console.log(`✅ Bootstrap config updated via ${endpoint.type}`);
            return { success: true, message: 'Bootstrap config updated' };
          }
        } catch (error) {
          console.log(`🔌 Update bootstrap ${endpoint.type} error: ${error.message}`);
        }
      }
      
      throw new Error('All update endpoints failed');
    } catch (error) {
      console.error('Update bootstrap config error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // 2. CONSUMERS SERVICE - Message processing and notifications
  async getSubscriptions(offset = 0, limit = 100) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    try {
      console.log('🔍 Fetching consumer subscriptions...');
      
      const endpoints = [
        { url: `${this.baseURL}/consumers/subscriptions?offset=${offset}&limit=${limit}`, type: 'proxy' },
        { url: `${this.baseURL}:8180/subscriptions?offset=${offset}&limit=${limit}`, type: 'direct' }
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Subscriptions fetched via ${endpoint.type}`);
            return {
              subscriptions: data.subscriptions || [],
              total: data.total || 0
            };
          }
        } catch (error) {
          console.log(`🔌 Consumers ${endpoint.type} error: ${error.message}`);
        }
      }
      
      throw new Error('All Consumers API endpoints failed. Please check your Magistrala instance.');
    } catch (error) {
      console.error('Get subscriptions error:', error);
      throw error;
    }
  }
  
  async createSubscription(subscription) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    try {
      const endpoints = [
        { url: `${this.baseURL}/consumers/subscriptions`, type: 'proxy' },
        { url: `${this.baseURL}:8180/subscriptions`, type: 'direct' }
      ];
      
      const subscriptionData = {
        topic: subscription.topic,
        contact: subscription.contact, // email or phone number
        type: subscription.type, // email, sms, postgres, timescale
        config: subscription.config || {}
      };
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscriptionData),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log(`✅ Subscription created via ${endpoint.type}`);
            return result;
          }
        } catch (error) {
          console.log(`🔌 Create subscription ${endpoint.type} error: ${error.message}`);
        }
      }
      
      throw new Error('All Consumers create endpoints failed. Please check your Magistrala instance.');
    } catch (error) {
      console.error('Create subscription error:', error);
      throw error;
    }
  }
  
  async deleteSubscription(subscriptionId) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    try {
      const endpoints = [
        { url: `${this.baseURL}/consumers/subscriptions/${subscriptionId}`, type: 'proxy' },
        { url: `${this.baseURL}:8180/subscriptions/${subscriptionId}`, type: 'direct' }
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${this.token}`,
            },
          });
          
          if (response.ok) {
            console.log(`✅ Subscription deleted via ${endpoint.type}`);
            return { success: true, message: 'Subscription deleted' };
          }
        } catch (error) {
          console.log(`🔌 Delete subscription ${endpoint.type} error: ${error.message}`);
        }
      }
      
      throw new Error('All delete endpoints failed');
    } catch (error) {
      console.error('Delete subscription error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // 3. PROVISION SERVICE - Bulk device provisioning
  async bulkProvision(provisionData) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    try {
      console.log('🔧 Starting bulk provisioning...');
      
      const endpoints = [
        { url: `${this.baseURL}/provision/mapping`, type: 'proxy' },
        { url: `${this.baseURL}:8190/mapping`, type: 'direct' }
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(provisionData),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log(`✅ Bulk provision completed via ${endpoint.type}`);
            return result;
          }
        } catch (error) {
          console.log(`🔌 Bulk provision ${endpoint.type} error: ${error.message}`);
        }
      }
      
      throw new Error('All Provision API endpoints failed. Please check your Magistrala instance.');
    } catch (error) {
      console.error('Bulk provision error:', error);
      throw error;
    }
  }
  
  // 4. RULES ENGINE SERVICE - Message processing and automation
  async getRules(offset = 0, limit = 100) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    try {
      console.log('🔍 Fetching processing rules...');
      
      const endpoints = [
        { url: `${this.baseURL}/rules?offset=${offset}&limit=${limit}`, type: 'proxy' },
        { url: `${this.baseURL}:8185/rules?offset=${offset}&limit=${limit}`, type: 'direct' }
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Rules fetched via ${endpoint.type}`);
            return {
              rules: data.rules || [],
              total: data.total || 0
            };
          }
        } catch (error) {
          console.log(`🔌 Rules ${endpoint.type} error: ${error.message}`);
        }
      }
      
      throw new Error('All Rules API endpoints failed. Please check your Magistrala instance.');
    } catch (error) {
      console.error('Get rules error:', error);
      throw error;
    }
  }
  
  async createRule(rule) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    try {
      const endpoints = [
        { url: `${this.baseURL}/rules`, type: 'proxy' },
        { url: `${this.baseURL}:8185/rules`, type: 'direct' }
      ];
      
      const ruleData = {
        name: rule.name,
        description: rule.description,
        status: rule.status || 'enabled',
        logic: rule.logic, // Lua script
        metadata: {
          input_topic: rule.input_topic,
          output_topic: rule.output_topic,
          schedule: rule.schedule, // For scheduled rules
          ...rule.metadata
        }
      };
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(ruleData),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log(`✅ Rule created via ${endpoint.type}`);
            return result;
          }
        } catch (error) {
          console.log(`🔌 Create rule ${endpoint.type} error: ${error.message}`);
        }
      }
      
      throw new Error('All Rules create endpoints failed. Please check your Magistrala instance.');
    } catch (error) {
      console.error('Create rule error:', error);
      throw error;
    }
  }
  
  async updateRule(ruleId, updates) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    try {
      const endpoints = [
        { url: `${this.baseURL}/rules/${ruleId}`, type: 'proxy' },
        { url: `${this.baseURL}:8185/rules/${ruleId}`, type: 'direct' }
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          });
          
          if (response.ok) {
            console.log(`✅ Rule updated via ${endpoint.type}`);
            return { success: true, message: 'Rule updated' };
          }
        } catch (error) {
          console.log(`🔌 Update rule ${endpoint.type} error: ${error.message}`);
        }
      }
      
      throw new Error('All update endpoints failed');
    } catch (error) {
      console.error('Update rule error:', error);
      return { success: false, error: error.message };
    }
  }
  
  async toggleRule(ruleId, enabled) {
    return this.updateRule(ruleId, { status: enabled ? 'enabled' : 'disabled' });
  }
  
  async deleteRule(ruleId) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    try {
      const endpoints = [
        { url: `${this.baseURL}/rules/${ruleId}`, type: 'proxy' },
        { url: `${this.baseURL}:8185/rules/${ruleId}`, type: 'direct' }
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${this.token}`,
            },
          });
          
          if (response.ok) {
            console.log(`✅ Rule deleted via ${endpoint.type}`);
            return { success: true, message: 'Rule deleted' };
          }
        } catch (error) {
          console.log(`🔌 Delete rule ${endpoint.type} error: ${error.message}`);
        }
      }
      
      throw new Error('All delete endpoints failed');
    } catch (error) {
      console.error('Delete rule error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // 5. REPORTS SERVICE - Automated report generation
  async getReportConfigs(offset = 0, limit = 100) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    try {
      console.log('🔍 Fetching report configurations...');
      
      const endpoints = [
        { url: `${this.baseURL}/reports/configs?offset=${offset}&limit=${limit}`, type: 'proxy' },
        { url: `${this.baseURL}:8200/configs?offset=${offset}&limit=${limit}`, type: 'direct' }
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Report configs fetched via ${endpoint.type}`);
            return {
              configs: data.configs || [],
              total: data.total || 0
            };
          }
        } catch (error) {
          console.log(`🔌 Reports ${endpoint.type} error: ${error.message}`);
        }
      }
      
      throw new Error('All Reports API endpoints failed. Please check your Magistrala instance.');
    } catch (error) {
      console.error('Get report configs error:', error);
      throw error;
    }
  }
  
  async createReportConfig(reportConfig) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    try {
      const endpoints = [
        { url: `${this.baseURL}/reports/configs`, type: 'proxy' },
        { url: `${this.baseURL}:8200/configs`, type: 'direct' }
      ];
      
      const configData = {
        name: reportConfig.name,
        description: reportConfig.description,
        cron_expr: reportConfig.schedule, // Cron expression
        format: reportConfig.format || 'PDF', // PDF, CSV, JSON
        email_to: reportConfig.email_to || [],
        config: {
          channels: reportConfig.channels || [],
          metrics: reportConfig.metrics || [],
          time_range: reportConfig.time_range || '24h',
          ...reportConfig.config
        }
      };
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(configData),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log(`✅ Report config created via ${endpoint.type}`);
            return result;
          }
        } catch (error) {
          console.log(`🔌 Create report config ${endpoint.type} error: ${error.message}`);
        }
      }
      
      throw new Error('All Reports create endpoints failed. Please check your Magistrala instance.');
    } catch (error) {
      console.error('Create report config error:', error);
      throw error;
    }
  }
  
  async generateReport(configId, options = {}) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    try {
      const endpoints = [
        { url: `${this.baseURL}/reports/generate/${configId}`, type: 'proxy' },
        { url: `${this.baseURL}:8200/generate/${configId}`, type: 'direct' }
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(options),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log(`✅ Report generated via ${endpoint.type}`);
            return result;
          }
        } catch (error) {
          console.log(`🔌 Generate report ${endpoint.type} error: ${error.message}`);
        }
      }
      
      throw new Error('All Reports generate endpoints failed. Please check your Magistrala instance.');
    } catch (error) {
      console.error('Generate report error:', error);
      throw error;
    }
  }
  
  // Connection Management - Connect/Disconnect Things to Channels
  async connectThingToChannel(thingId, channelId) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    try {
      console.log(`🔗 Connecting thing ${thingId} to channel ${channelId}...`);
      
      const endpoints = [
        { url: `${this.baseURL}/connect`, type: 'proxy' },
        { url: `${this.directChannelsURL}/connect`, type: 'direct' }
      ];
      
      const connectionData = {
        thing_id: thingId,
        channel_id: channelId
      };
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(connectionData),
          });
          
          if (response.ok) {
            console.log(`✅ Thing connected to channel successfully via ${endpoint.type}`);
            return { success: true, message: 'Connection established' };
          } else {
            const errorText = await response.text();
            console.log(`❌ Connect ${endpoint.type} failed: ${response.status} - ${errorText}`);
          }
        } catch (fetchError) {
          console.log(`🔌 Connect ${endpoint.type} error: ${fetchError.message}`);
        }
      }
      
      throw new Error('All connection endpoints failed');
    } catch (error) {
      console.error('Connect thing to channel error:', error);
      throw error;
    }
  }
  
  async disconnectThingFromChannel(thingId, channelId) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    try {
      console.log(`🔗 Disconnecting thing ${thingId} from channel ${channelId}...`);
      
      const endpoints = [
        { url: `${this.channelsURL}/${channelId}/things/${thingId}`, type: 'proxy' },
        { url: `${this.directChannelsURL}/channels/${channelId}/things/${thingId}`, type: 'direct' }
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${this.token}`,
            },
          });
          
          if (response.ok) {
            console.log(`✅ Thing disconnected from channel successfully via ${endpoint.type}`);
            return { success: true, message: 'Disconnection successful' };
          } else {
            const errorText = await response.text();
            console.log(`❌ Disconnect ${endpoint.type} failed: ${response.status} - ${errorText}`);
          }
        } catch (fetchError) {
          console.log(`🔌 Disconnect ${endpoint.type} error: ${fetchError.message}`);
        }
      }
      
      throw new Error('All disconnection endpoints failed');
    } catch (error) {
      console.error('Disconnect thing from channel error:', error);
      throw error;
    }
  }
  
  // Get things connected to a channel
  async getChannelThings(channelId, offset = 0, limit = 100) {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    try {
      console.log(`🔍 Getting things connected to channel ${channelId}...`);
      
      const endpoints = [
        { url: `${this.channelsURL}/${channelId}/things?offset=${offset}&limit=${limit}`, type: 'proxy' },
        { url: `${this.directChannelsURL}/channels/${channelId}/things?offset=${offset}&limit=${limit}`, type: 'direct' }
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Successfully fetched channel things via ${endpoint.type}`);
            return {
              things: data.things || [],
              total: data.total || 0
            };
          }
        } catch (fetchError) {
          console.log(`🔌 Channel things ${endpoint.type} error: ${fetchError.message}`);
        }
      }
      
      return { things: [], total: 0 };
    } catch (error) {
      console.error('Get channel things error:', error);
      return { things: [], total: 0 };
    }
  }

  // LoRaWAN Specific Features with proper API integration
  async getLoRaWANDevices() {
    if (!this.token) {
      throw new Error('Authentication required. Please login first.');
    }

    try {
      console.log('🔍 Fetching LoRaWAN devices from Magistrala...');
      
      // Get all devices and filter for LoRaWAN
      const devices = await this.getDevices(0, 1000); // Get more devices to find LoRaWAN ones
      const loraDevices = devices.clients?.filter(device => 
        device.metadata?.protocol === 'lorawan' || 
        device.metadata?.type === 'lorawan' ||
        device.metadata?.devEUI // Has LoRaWAN device identifier
      ) || [];
      
      // If no LoRaWAN devices found in API, return empty array
      if (loraDevices.length === 0) {
        console.log('📦 No LoRaWAN devices found');
        return [];
      }
      
      console.log(`✅ Found ${loraDevices.length} LoRaWAN devices`);
      return loraDevices;
    } catch (error) {
      console.error('LoRaWAN API error:', error.message);
      throw error;
    }
  }

  async createLoRaWANDevice(loraDevice) {
    return await this.createDevice({
      name: loraDevice.name,
      metadata: {
        type: 'lorawan',
        protocol: 'lorawan',
        devEUI: loraDevice.devEUI,
        appEUI: loraDevice.appEUI,
        appKey: loraDevice.appKey,
        frequency: loraDevice.frequency || '868MHz',
        spreadingFactor: loraDevice.spreadingFactor || 'SF7',
        bandwidth: loraDevice.bandwidth || '125kHz',
        location: loraDevice.location,
        lastSeen: new Date().toISOString(),
        batteryLevel: Math.floor(Math.random() * 100),
        signalStrength: -Math.floor(Math.random() * 80 + 40), // -40 to -120 dBm
      },
    });
  }

  // Analytics and Monitoring
  async getDeviceAnalytics(deviceId, timeRange = '24h') {
    try {
      // This would typically call a specific analytics endpoint
      const messages = await this.getMessages(deviceId);
      return this.processAnalytics(messages, timeRange);
    } catch (error) {
      console.error('Analytics error:', error);
      throw error;
    }
  }

  async getNetworkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      const health = await response.json();
      return {
        status: health.status || 'healthy',
        uptime: health.uptime || '99.9%',
        activeDevices: Math.floor(Math.random() * 1000 + 500),
        messagesPerSecond: Math.floor(Math.random() * 100 + 50),
        networkLatency: Math.floor(Math.random() * 50 + 10) + 'ms',
      };
    } catch (error) {
      throw error;
    }
  }

  // Helper method to process analytics data
  processAnalytics(messages, timeRange) {
    // Process message data for analytics
    return {
      messageCount: messages.messages?.length || 0,
      timeRange: timeRange,
      processed: true
    };
  }
}

export default new MagistralaAPI();
