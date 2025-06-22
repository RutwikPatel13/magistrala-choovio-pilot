/**
 * Enhanced Authentication Service for SuperMQ/Magistrala
 * Handles multiple authentication methods with proper fallbacks
 */

class AuthService {
  constructor(baseURL = process.env.REACT_APP_MAGISTRALA_BASE_URL) {
    this.baseURL = baseURL;
    this.debugMode = process.env.REACT_APP_DEBUG_MODE === 'true';
    
    // Working endpoints discovered from testing
    this.workingEndpoints = [
      // Primary working endpoints
      { url: `${baseURL}/api/v1/users/tokens`, type: 'api-v1-tokens', method: 'POST', priority: 1 },
      { url: `${baseURL}/tokens/issue`, type: 'proxy-direct', method: 'POST', priority: 2 },
      
      // User creation endpoint
      { url: `${baseURL}/api/v1/users`, type: 'api-v1-users', method: 'POST', priority: 1 }
    ];
    
    // Legacy endpoints for fallback
    this.legacyEndpoints = [
      { url: `${baseURL}/users/tokens/issue`, type: 'proxy-users', method: 'POST' },
      { url: `${baseURL}/auth/tokens/issue`, type: 'proxy-auth', method: 'POST' }
    ];
    
    this.authEndpoints = [...this.workingEndpoints, ...this.legacyEndpoints];
  }

  debugLog(message, data = null) {
    if (this.debugMode) {
      console.log(`🔐 [Auth] ${message}`, data || '');
    }
  }

  // Enhanced authentication method with working endpoints
  async authenticate(identity, password, domainId = null) {
    this.debugLog('Starting authentication with working endpoints', { identity, domainId });
    
    // Try working endpoints first
    const sortedEndpoints = this.authEndpoints.sort((a, b) => (a.priority || 99) - (b.priority || 99));
    
    for (const endpoint of sortedEndpoints) {
      // Skip user creation endpoints for authentication
      if (endpoint.url.includes('/users') && !endpoint.url.includes('tokens')) {
        continue;
      }
      
      const requestFormats = this.getRequestFormats(identity, password, domainId, endpoint.type);
      
      for (const requestBody of requestFormats) {
        try {
          this.debugLog(`Trying ${endpoint.type}`, { endpoint: endpoint.url });
          
          const response = await fetch(endpoint.url, {
            method: endpoint.method,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody),
            signal: AbortSignal.timeout(5000)
          });
          
          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const data = await response.json();
              this.debugLog(`✅ Authentication successful via ${endpoint.type}`, data);
              
              // Store the working endpoint for future use
              localStorage.setItem('magistrala_working_auth_endpoint', JSON.stringify(endpoint));
              localStorage.setItem('magistrala_working_auth_format', JSON.stringify(requestBody));
              
              return {
                success: true,
                data: data,
                endpoint: endpoint.type,
                format: requestBody,
                access_token: data.access_token || data.token,
                refresh_token: data.refresh_token,
                user: data.user || { email: identity, name: identity }
              };
            } else {
              // Response is not JSON, likely an error page
              const text = await response.text();
              this.debugLog(`❌ Non-JSON response from ${endpoint.type}: ${text.substring(0, 100)}...`);
              continue;
            }
          } else {
            const errorText = await response.text();
            this.debugLog(`❌ ${endpoint.type} failed: ${response.status} - ${errorText}`);
            
            // If we got a proper response, move to next endpoint
            break;
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            this.debugLog(`⏰ ${endpoint.type} timeout`);
          } else {
            this.debugLog(`🔌 ${endpoint.type} error: ${error.message}`);
          }
          // Try next format
          continue;
        }
      }
    }

    // If all real API attempts fail, try demo mode
    return await this.tryDemoAuthentication(identity, password);
  }

  // Get appropriate request formats based on endpoint type
  getRequestFormats(identity, password, domainId, endpointType) {
    const baseFormats = [
      // Standard Magistrala format
      {
        identity: identity,
        secret: password,
        ...(domainId && { domain_id: domainId })
      },
      // Simple credentials format
      {
        credentials: {
          identity: identity,
          secret: password
        },
        ...(domainId && { domain_id: domainId })
      }
    ];

    // API v1 specific formats
    if (endpointType.includes('api-v1')) {
      return [
        {
          identity: identity,
          secret: password
        },
        ...baseFormats
      ];
    }

    return baseFormats;
  }

  // Demo authentication fallback
  async tryDemoAuthentication(identity, password) {
    this.debugLog('Trying demo authentication', { identity });
    
    if (process.env.REACT_APP_ENABLE_DEMO_MODE !== 'true') {
      throw new Error('All authentication methods failed and demo mode is disabled');
    }

    const demoCredentials = {
      'admin@choovio.com': { password: 'admin123', name: 'Admin User', role: 'admin' },
      'admin': { password: 'admin123', name: 'Admin User', role: 'admin' },
      'user@choovio.com': { password: 'user123', name: 'Demo User', role: 'user' },
      'user': { password: 'user123', name: 'Demo User', role: 'user' },
      'choovio@example.com': { password: 'choovio123', name: 'Choovio Admin', role: 'admin' },
      'demo@magistrala.com': { password: 'demo123', name: 'Demo User', role: 'user' }
    };

    const demoUser = demoCredentials[identity.toLowerCase()];
    if (demoUser && demoUser.password === password) {
      this.debugLog('✅ Demo authentication successful');
      
      const demoToken = `demo_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userData = {
        id: `demo_user_${Date.now()}`,
        name: demoUser.name,
        email: identity.includes('@') ? identity : `${identity}@demo.com`,
        role: demoUser.role,
        created_at: new Date().toISOString(),
        demo: true
      };

      return {
        success: true,
        data: {
          access_token: demoToken,
          refresh_token: null,
          user: userData,
          expires_in: 86400
        },
        endpoint: 'demo',
        access_token: demoToken,
        refresh_token: null,
        user: userData,
        demo: true
      };
    }

    throw new Error('Authentication failed. Please check your credentials.');
  }

  // Quick authentication using stored working endpoint
  async quickAuthenticate(identity, password, domainId = null) {
    const storedEndpoint = localStorage.getItem('magistrala_working_auth_endpoint');
    const storedFormat = localStorage.getItem('magistrala_working_auth_format');
    
    if (storedEndpoint && storedFormat) {
      try {
        const endpoint = JSON.parse(storedEndpoint);
        const formatTemplate = JSON.parse(storedFormat);
        
        // Update the format template with new credentials
        const requestBody = {
          ...formatTemplate,
          identity: identity,
          secret: password,
          username: identity,
          password: password,
          email: identity,
          login: identity,
          ...(domainId && { domain_id: domainId })
        };

        this.debugLog('Quick auth using stored working endpoint', { endpoint: endpoint.url });
        
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(3000)
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            this.debugLog('✅ Quick authentication successful');
            
            return {
              success: true,
              data: data,
              endpoint: endpoint.type,
              access_token: data.access_token || data.token,
              refresh_token: data.refresh_token,
              user: data.user || { email: identity, name: identity }
            };
          } else {
            const text = await response.text();
            this.debugLog(`❌ Quick auth non-JSON response: ${text.substring(0, 100)}...`);
          }
        }
      } catch (error) {
        this.debugLog('Quick auth failed, falling back to full auth', error.message);
      }
    }

    // Fall back to full authentication
    return await this.authenticate(identity, password, domainId);
  }

  // Create user account
  async createUser(userData) {
    this.debugLog('Creating user account', userData);
    
    const userEndpoints = [
      { url: `${this.baseURL}:${this.usersPort}/users`, type: 'users-service' },
      { url: `${this.baseURL}/users`, type: 'proxy-users' },
      { url: `${this.baseURL}/api/v1/users`, type: 'api-v1' }
    ];

    const userFormats = [
      // Format 1: Complete Magistrala format
      {
        first_name: userData.firstName || userData.first_name || 'User',
        last_name: userData.lastName || userData.last_name || 'Demo',
        email: userData.email,
        credentials: {
          username: userData.username || userData.email.split('@')[0],
          secret: userData.password
        }
      },
      
      // Format 2: Simple format
      {
        username: userData.username || userData.email.split('@')[0],
        first_name: userData.firstName || 'User',
        last_name: userData.lastName || 'Demo',
        email: userData.email,
        password: userData.password
      },
      
      // Format 3: Alternative format
      {
        name: `${userData.firstName || 'User'} ${userData.lastName || 'Demo'}`,
        email: userData.email,
        password: userData.password,
        username: userData.username || userData.email.split('@')[0]
      }
    ];

    for (const endpoint of userEndpoints) {
      for (const format of userFormats) {
        try {
          this.debugLog(`Trying user creation via ${endpoint.type}`);
          
          const response = await fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(format),
            signal: AbortSignal.timeout(5000)
          });

          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const data = await response.json();
              this.debugLog('✅ User created successfully');
              return { success: true, data, endpoint: endpoint.type };
            } else {
              const text = await response.text();
              this.debugLog(`❌ User creation non-JSON response: ${text.substring(0, 100)}...`);
              continue;
            }
          } else {
            const errorText = await response.text();
            this.debugLog(`❌ User creation failed: ${response.status} - ${errorText}`);
            
            // If user already exists, that's okay for demo purposes
            if (response.status === 409 || response.status === 422) {
              this.debugLog('User already exists, treating as success');
              return { 
                success: true, 
                data: { message: 'User already exists' },
                endpoint: endpoint.type,
                userExists: true
              };
            }
          }
        } catch (error) {
          this.debugLog(`User creation error: ${error.message}`);
        }
      }
    }

    // Demo mode fallback for user creation
    if (process.env.REACT_APP_ENABLE_DEMO_MODE === 'true') {
      this.debugLog('✅ Demo user creation successful');
      return {
        success: true,
        data: { id: `demo_user_${Date.now()}`, ...userData },
        endpoint: 'demo',
        demo: true
      };
    }

    throw new Error('User creation failed');
  }

  // Test connection to SuperMQ/Magistrala
  async testConnection() {
    this.debugLog('Testing connection to SuperMQ/Magistrala');
    
    const healthEndpoints = [
      `${this.baseURL}:${this.usersPort}/health`,
      `${this.baseURL}:${this.authPort}/health`,
      `${this.baseURL}/health`,
      `${this.baseURL}/users/health`,
      `${this.baseURL}/version`
    ];

    const results = {};
    
    for (const endpoint of healthEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          signal: AbortSignal.timeout(3000)
        });
        
        if (response.ok) {
          const data = await response.text();
          results[endpoint] = { status: 'ok', data };
          this.debugLog(`✅ ${endpoint} is responding`);
        } else {
          results[endpoint] = { status: 'error', code: response.status };
        }
      } catch (error) {
        results[endpoint] = { status: 'failed', error: error.message };
      }
    }

    return results;
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;