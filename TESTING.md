# Magistrala IoT Dashboard - Testing Guide

## Overview
This guide provides comprehensive testing instructions for the Magistrala API integration in the dashboard.

## Testing Scenarios

### 1. Authentication Testing

#### 1.1 Demo Mode Testing (No Magistrala Instance Required)
```bash
# Test with demo credentials
Email: admin@choovio.com
Password: admin123

Expected Result:
- Instant login
- Access to mock device data
- All features functional with simulated data
```

#### 1.2 Magistrala API Authentication
```bash
# Prerequisites: Running Magistrala instance
# Create a user first via CLI:
magistrala-cli users create testuser test@example.com testpass123

# Test in dashboard:
Email: test@example.com
Password: testpass123

Expected Result:
- JWT token received
- Real user profile loaded
- API endpoints working
```

#### 1.3 Token Refresh Testing
```javascript
// Test automatic token refresh
// 1. Login with real credentials
// 2. Wait for token to near expiry (or manually set short expiry)
// 3. Make API calls - should auto-refresh

// Check browser localStorage:
console.log(localStorage.getItem('magistrala_token'));
console.log(localStorage.getItem('magistrala_refresh_token'));
console.log(localStorage.getItem('magistrala_token_expiry'));
```

### 2. Things (Devices) API Testing

#### 2.1 Get Things
```bash
# Expected API Call
GET /things?offset=0&limit=100
Authorization: Bearer <token>

# Test Steps:
1. Login to dashboard
2. Navigate to Device Management
3. Check console for API calls
4. Verify devices display correctly
```

#### 2.2 Create Thing
```bash
# Expected API Call
POST /things
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Test Sensor",
  "metadata": {
    "type": "sensor",
    "protocol": "mqtt",
    "location": "Building A"
  }
}

# Test Steps:
1. Click "Add Device" button
2. Fill form with test data
3. Submit form
4. Check console for API call
5. Verify device appears in list
```

#### 2.3 Update Thing
```bash
# Expected API Call
PUT /things/{thing_id}
Authorization: Bearer <token>

# Test Steps:
1. Click edit on existing device
2. Modify name or metadata
3. Save changes
4. Verify updates in API response
```

#### 2.4 Delete Thing
```bash
# Expected API Call
DELETE /things/{thing_id}
Authorization: Bearer <token>

# Test Steps:
1. Click delete on device
2. Confirm deletion
3. Verify device removed from list
```

### 3. Channels API Testing

#### 3.1 Get Channels
```bash
# Expected API Call
GET /channels?offset=0&limit=100
Authorization: Bearer <token>

# Test Steps:
1. Navigate to Channels page
2. Check console for API calls
3. Verify channels display with metadata
```

#### 3.2 Create Channel
```bash
# Expected API Call
POST /channels
Authorization: Bearer <token>

{
  "name": "Test Channel",
  "description": "Channel for testing",
  "metadata": {
    "protocol": "mqtt",
    "topic": "/test/data"
  }
}

# Test Steps:
1. Click "Create Channel"
2. Fill form with test data
3. Submit and verify creation
```

### 4. Messaging API Testing

#### 4.1 Send Message
```bash
# Expected API Call
POST /http/channels/{channel_id}/messages
Authorization: Thing <thing_secret>
Content-Type: application/senml+json

[{
  "n": "temperature",
  "v": 22.5,
  "u": "°C",
  "t": 1640995200
}]

# Test Steps:
1. Get thing secret from thing details
2. Use messaging API to send test message
3. Verify message appears in Messages page
```

#### 4.2 Get Messages
```bash
# Expected API Call
GET /readers/channels/{channel_id}/messages?offset=0&limit=100
Authorization: Bearer <token>

# Test Steps:
1. Navigate to Messages page
2. Check console for API calls
3. Verify messages display correctly
```

### 5. Connection Management Testing

#### 5.1 Connect Thing to Channel
```bash
# Expected API Call
POST /connect
Authorization: Bearer <token>

{
  "thing_id": "thing-123",
  "channel_id": "channel-456"
}

# Test Steps:
1. Create thing and channel via API
2. Use connection management in UI
3. Verify connection established
```

## Environment-Specific Testing

### Local Development Setup
```bash
# 1. Start Magistrala with Docker Compose
git clone https://github.com/absmach/magistrala
cd magistrala
docker-compose up -d

# 2. Create test user
magistrala-cli users create testuser test@example.com testpass123

# 3. Configure dashboard environment
cp .env.example .env.local
# Edit .env.local:
REACT_APP_MAGISTRALA_BASE_URL=http://localhost

# 4. Start dashboard
npm start
```

### Remote Magistrala Instance
```bash
# Configure for remote instance
REACT_APP_MAGISTRALA_BASE_URL=https://your-magistrala-instance.com

# Test with existing Magistrala credentials
Email: your-magistrala-user@example.com
Password: your-password
```

### AWS Deployment Testing
```bash
# Configure for AWS deployed Magistrala
REACT_APP_MAGISTRALA_BASE_URL=https://magistrala.your-domain.com

# Test HTTPS endpoints
# Verify CORS configuration
# Check SSL certificate validity
```

## API Endpoint Testing

### Health Check
```bash
curl -X GET http://localhost:8080/health
# Expected: 200 OK with health status
```

### Authentication
```bash
# Test login endpoint
curl -X POST http://localhost/users/tokens/issue \
  -H "Content-Type: application/json" \
  -d '{
    "identity": "test@example.com",
    "secret": "testpass123"
  }'

# Expected response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600
}
```

### Things API
```bash
# Get things
curl -X GET "http://localhost/things?limit=10" \
  -H "Authorization: Bearer <token>"

# Create thing
curl -X POST http://localhost/things \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Device",
    "metadata": {"type": "sensor"}
  }'
```

### Channels API
```bash
# Get channels
curl -X GET "http://localhost/channels?limit=10" \
  -H "Authorization: Bearer <token>"

# Create channel
curl -X POST http://localhost/channels \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Channel",
    "metadata": {"protocol": "mqtt"}
  }'
```

## Error Handling Testing

### Network Issues
```bash
# Test with invalid base URL
REACT_APP_MAGISTRALA_BASE_URL=http://invalid-url.com

# Expected: Graceful fallback to demo mode
# Console should show endpoint errors
```

### Authentication Failures
```bash
# Test with invalid credentials
Email: invalid@example.com
Password: wrongpassword

# Expected: Clear error message
# No token stored
```

### Token Expiration
```bash
# Test with expired token
# 1. Login successfully
# 2. Manually edit token expiry in localStorage to past date
# 3. Make API calls
# Expected: Automatic token refresh or re-login prompt
```

## Performance Testing

### Load Testing
```javascript
// Test multiple concurrent API calls
const promises = [];
for (let i = 0; i < 10; i++) {
  promises.push(magistralaApi.getDevices());
}
Promise.all(promises).then(results => {
  console.log('All requests completed:', results.length);
});
```

### Timeout Testing
```bash
# Test with slow network
# Configure API timeout in .env.local:
REACT_APP_API_TIMEOUT=1000

# Expected: Requests timeout appropriately
# Fallback to demo data when timeouts occur
```

## Browser Testing

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Local Storage Testing
```javascript
// Check token storage
console.log('Auth tokens:', {
  token: localStorage.getItem('magistrala_token'),
  refresh: localStorage.getItem('magistrala_refresh_token'),
  expiry: localStorage.getItem('magistrala_token_expiry'),
  user: localStorage.getItem('magistrala_user')
});

// Clear all auth data
Object.keys(localStorage)
  .filter(key => key.startsWith('magistrala_'))
  .forEach(key => localStorage.removeItem(key));
```

## Common Issues and Solutions

### Issue: CORS Errors
```bash
# Solution: Configure Magistrala CORS headers
# In Magistrala docker-compose.yml:
environment:
  MG_HTTP_ADAPTER_CORS_ALLOWED_ORIGINS: "*"
  MG_HTTP_ADAPTER_CORS_ALLOWED_METHODS: "GET,POST,PUT,DELETE,OPTIONS"
  MG_HTTP_ADAPTER_CORS_ALLOWED_HEADERS: "*"
```

### Issue: Connection Refused
```bash
# Check Magistrala services are running
docker ps | grep magistrala

# Check port availability
netstat -tulpn | grep :9000
```

### Issue: Invalid Token Format
```bash
# Verify token format in localStorage
# JWT tokens should start with "eyJ"
# Demo tokens start with "demo_token_"
```

## Debugging Tips

### Enable Debug Mode
```bash
# Add to .env.local
REACT_APP_DEBUG_MODE=true

# This enables detailed console logging
```

### Network Tab Monitoring
1. Open browser DevTools
2. Go to Network tab
3. Filter by XHR/Fetch
4. Monitor API calls and responses

### Console Logging
- All API calls are logged with emojis for easy identification
- Success: ✅
- Errors: ❌  
- Timeouts: ⏰
- Demo mode: 🎭

## Test Data Sets

### Sample Users
```json
[
  {"email": "admin@choovio.com", "password": "admin123", "role": "admin"},
  {"email": "user@choovio.com", "password": "user123", "role": "user"},
  {"email": "test@example.com", "password": "testpass123", "role": "user"}
]
```

### Sample Devices
```json
[
  {
    "name": "Temperature Sensor #1",
    "type": "sensor",
    "protocol": "mqtt",
    "location": "Building A - Floor 1"
  },
  {
    "name": "LoRaWAN Gateway",
    "type": "lorawan",
    "protocol": "lorawan",
    "location": "Building B - Roof",
    "devEUI": "0011223344556677"
  }
]
```

### Sample Channels
```json
[
  {
    "name": "Temperature Data",
    "protocol": "mqtt",
    "topic": "/sensors/temperature",
    "description": "Channel for temperature sensor data"
  },
  {
    "name": "LoRaWAN Uplink",
    "protocol": "lorawan", 
    "topic": "/lorawan/uplink",
    "description": "LoRaWAN device uplink messages"
  }
]
```

This testing guide ensures comprehensive validation of all Magistrala API integrations and helps identify any issues during development or deployment.