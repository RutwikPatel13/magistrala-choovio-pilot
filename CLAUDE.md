# Magistrala IoT Dashboard - Claude Memory & Documentation

## Project Overview
This is a comprehensive Magistrala IoT platform dashboard built with React. The project implements proper Git version control with branching strategy (main/dev/feature branches) and semantic versioning, along with full integration of Magistrala APIs for authentication, device management, messaging, and advanced IoT features.

## Current Status
- **Version**: v2.1.0 (see VERSION.md and CHANGELOG.md)
- **Branch Strategy**: main (production) → dev (development) → feature branches
- **Authentication**: Enhanced multi-endpoint authentication with demo fallbacks
- **Deployment**: AWS S3 + EC2 ready (credentials need refresh)

## Git Workflow & Version Control
```bash
# Branch strategy
git checkout dev                    # Switch to development branch
git checkout -b feature/new-feature # Create feature branch
git commit -m "feature description" # No co-authored by Claude (user request)
git checkout dev && git merge --no-ff feature/new-feature
git tag v2.2.0                     # Semantic versioning: MAJOR.MINOR.PATCH

# Version bumping rules:
# MAJOR: Breaking changes, major revamps
# MINOR: New features, enhancements
# PATCH: Bug fixes, minor improvements
```

## Magistrala IoT Platform - Complete API Documentation

### Platform Architecture
Magistrala is an open-source Industrial IoT platform built on SuperMQ with:
- Multi-protocol support (HTTP, MQTT, WebSocket, CoAP)
- Microservices architecture with Docker deployment
- SpiceDB-backed authorization (ABAC/RBAC)
- Domain-based multi-tenancy
- Real-time messaging and device management

### Core Services & APIs

#### 1. Users Service - Authentication & User Management
```javascript
// Base endpoint patterns
POST /users                    // Create user
POST /users/tokens/issue       // Login - get JWT tokens
POST /users/tokens/refresh     // Refresh access token
GET  /users/profile           // Get user profile
PUT  /users/<user_id>         // Update user

// Authentication methods supported:
// 1. JWT tokens (access + refresh)
// 2. Federated auth (Google OAuth)
// 3. mTLS with X.509 certificates

// Example login request:
{
  "identity": "user@example.com",
  "secret": "password123"
}

// Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user_id": "user-123"
}
```

#### 2. Things Service - Device/Client Management
```javascript
// Things represent IoT devices or applications
GET    /things                 // List things (with pagination)
POST   /things                 // Create thing
GET    /things/<thing_id>      // Get thing details
PUT    /things/<thing_id>      // Update thing
DELETE /things/<thing_id>      // Delete thing

// Example create thing:
{
  "name": "Temperature Sensor #1",
  "metadata": {
    "type": "sensor",
    "protocol": "mqtt",
    "location": "Building A - Floor 1"
  }
}

// Response includes secret for authentication:
{
  "id": "thing-123",
  "name": "Temperature Sensor #1",
  "secret": "thing-secret-key",
  "metadata": {...}
}
```

#### 3. Channels Service - Communication Channels
```javascript
// Channels are message conduits between things
GET    /channels              // List channels
POST   /channels              // Create channel
GET    /channels/<channel_id> // Get channel details
PUT    /channels/<channel_id> // Update channel
DELETE /channels/<channel_id> // Delete channel

// Connection management:
POST   /connect               // Connect thing to channel
DELETE /channels/<channel_id>/things/<thing_id> // Disconnect

// Example connect request:
{
  "thing_id": "thing-123",
  "channel_id": "channel-456"
}
```

#### 4. Messaging Service - Multi-Protocol Communication
```javascript
// HTTP messaging
POST /http/channels/<channel_id>/messages
Headers: {
  'Authorization': 'Thing <thing_secret>',
  'Content-Type': 'application/senml+json'
}
Body: [
  {
    "bn": "sensor-001",
    "n": "temperature",
    "u": "°C",
    "v": 22.5,
    "t": 1634567890
  }
]

// Reading messages
GET /readers/channels/<channel_id>/messages?offset=0&limit=100
Headers: {
  'Authorization': 'Bearer <user_token>'
}

// MQTT pattern: magistrala/channels/<channel_id>/messages
// WebSocket: ws://localhost/channels/<channel_id>/messages
// CoAP: coap://localhost/channels/<channel_id>/messages
```

#### 5. Bootstrap Service - Device Provisioning
```javascript
// Gateway configuration and device provisioning
GET  /things/bootstrap/<external_id>     // Get bootstrap config
POST /things/bootstrap                   // Create bootstrap config
PUT  /things/bootstrap/<thing_id>        // Update bootstrap config

// Used for automated device onboarding
```

#### 6. Provision Service - Bulk Operations
```javascript
// Automated creation of things, channels, connections
POST /mapping                           // Provision from config file

// Example provision payload:
{
  "things": [...],
  "channels": [...],
  "connections": [...]
}
```

#### 7. Certificates Service - mTLS Support
```javascript
// X.509 certificate management for mTLS authentication
GET  /certs                            // List certificates
POST /certs                            // Generate certificate
GET  /certs/<cert_id>                  // Get certificate details
```

### Current Implementation Status

#### Implemented Features ✅
- **Complete Magistrala API Integration**: Replaced all mock implementations with real API calls
- **Enhanced JWT Authentication**: Proper token management with automatic refresh
- **Things (Devices) Management**: Full CRUD operations with proper Magistrala Things API
- **Channels Management**: Complete channel operations with real API integration
- **Messaging System**: SenML format support with proper message handling
- **Connection Management**: Connect/disconnect things to channels functionality
- **Multi-endpoint Support**: Proxy and direct endpoint fallbacks for reliability
- **Token Management**: Secure storage with expiration handling and refresh logic
- **Environment Configuration**: Flexible setup for different deployment scenarios
- **LoRaWAN Support**: Enhanced LoRaWAN device integration with proper metadata
- **Error Handling**: Graceful fallbacks and comprehensive error management
- **Demo Mode**: Backward compatibility with demo credentials for testing

#### Files Structure
```
/custom-dashboard/
├── src/
│   ├── services/
│   │   └── magistralaApi.js        # ✅ Complete Magistrala API integration
│   ├── pages/
│   │   ├── DeviceManagement.js     # ✅ Real Things API integration
│   │   ├── Channels.js             # ✅ Real Channels API integration  
│   │   ├── Messages.js             # ✅ Real Messaging API integration
│   │   ├── Login.js                # ✅ Enhanced authentication
│   │   └── ...
│   └── contexts/
│       └── AuthContext.js          # ✅ JWT token management
├── aws-deployment/                 # AWS deployment scripts
├── .env.example                    # ✅ Environment configuration template
├── TESTING.md                      # ✅ Comprehensive testing guide
├── VERSION.md                      # Version tracking
├── CHANGELOG.md                    # Version history
└── CLAUDE.md                       # This file (updated)
```

### Integration Roadmap

#### Phase 1: Core API Integration ✅ COMPLETED
1. **Authentication System** ✅
   - ✅ JWT token management with automatic refresh
   - ✅ Multi-endpoint authentication (proxy/direct)
   - ✅ Secure token storage with expiration handling
   - ✅ Enhanced error handling and fallbacks

2. **Things API Integration** ✅
   - ✅ Complete CRUD operations with real Magistrala Things API
   - ✅ Thing secrets management for messaging
   - ✅ Status inference and metadata handling
   - ✅ LoRaWAN device support with specialized fields

3. **Channels API Integration** ✅
   - ✅ Real Channels API with full CRUD operations
   - ✅ Protocol and topic inference from metadata
   - ✅ Connection management (connect/disconnect things)
   - ✅ Channel statistics and activity tracking

4. **Messaging API Integration** ✅
   - ✅ SenML format support for message sending
   - ✅ Real message data from Magistrala readers API
   - ✅ Message transformation and formatting
   - ✅ Protocol-specific message handling

#### Phase 2: Advanced Features 🚧 IN PROGRESS
1. **Multi-Protocol Support** 🔄
   - 🔄 MQTT.js integration for real-time MQTT messaging
   - 🔄 WebSocket support for live data updates
   - 🔄 CoAP client implementation
   - ✅ HTTP messaging with SenML format

2. **Security Enhancements** 🔄
   - 🔄 mTLS certificate support via Certs service
   - ✅ Thing secrets management for secure messaging
   - ✅ Secure JWT token storage and refresh
   - ✅ Multi-endpoint failover for reliability

3. **Device Provisioning** 🔄
   - 🔄 Bootstrap service integration for gateway config
   - 🔄 Bulk provisioning via Provision service
   - ✅ Individual device/channel creation and management
   - ✅ Connection management between things and channels

### Environment Configuration
```javascript
// Required environment variables
REACT_APP_MAGISTRALA_BASE_URL=http://localhost  // Or your Magistrala instance
REACT_APP_MAGISTRALA_USERS_PORT=9002
REACT_APP_MAGISTRALA_THINGS_PORT=9000
REACT_APP_MAGISTRALA_CHANNELS_PORT=9005
REACT_APP_MAGISTRALA_HTTP_PORT=8008
REACT_APP_MAGISTRALA_WS_PORT=8186

// Optional for advanced features
REACT_APP_MAGISTRALA_MQTT_PORT=1883
REACT_APP_MAGISTRALA_COAP_PORT=5683
REACT_APP_MAGISTRALA_BOOTSTRAP_PORT=8202
REACT_APP_MAGISTRALA_PROVISION_PORT=8190
```

### Testing Strategy
1. **API Testing**: Direct API calls to Magistrala instance
2. **Integration Testing**: End-to-end workflows
3. **Protocol Testing**: Multi-protocol message exchange
4. **Security Testing**: Authentication and authorization flows

### Deployment Information
- **AWS Setup**: S3 + EC2 deployment ready
- **Build Command**: `npm run build`
- **Deploy Script**: `/aws-deployment/scripts/upload-react-to-s3.sh`
- **Status**: Build successful, deployment pending credential refresh

### User Preferences & Requirements
- ❌ No "Co-Authored-By: Claude" in Git commits (user explicitly requested)
- ✅ Professional Git workflow with semantic versioning
- ✅ Comprehensive documentation and memory storage
- ✅ Multi-terminal session continuity
- ✅ AWS deployment capability

### Deployment Configuration

#### AWS S3 + EC2 Setup
- **Frontend**: Deployed to S3 bucket `choovio-dashboard.s3-website-us-east-1.amazonaws.com`
- **Backend**: Magistrala running on EC2 instance `100.27.187.76`
- **Status**: ✅ Build successful, deployed with CORS auto-detection

#### CORS Configuration for Production
- **Issue**: CORS blocking S3 frontend → EC2 backend requests
- **Solution**: nginx CORS configuration on EC2 instance
- **Script**: `configure-nginx-cors.sh` - automated nginx setup for EC2

```bash
# To apply CORS fix on EC2 instance (100.27.187.76):
scp configure-nginx-cors.sh ubuntu@100.27.187.76:~/
ssh ubuntu@100.27.187.76
chmod +x configure-nginx-cors.sh
sudo ./configure-nginx-cors.sh
```

#### Environment Configuration
```env
# Production (.env.production)
REACT_APP_MAGISTRALA_BASE_URL=http://100.27.187.76
REACT_APP_MAGISTRALA_USERS_PORT=9002
REACT_APP_MAGISTRALA_THINGS_PORT=9006
REACT_APP_MAGISTRALA_CHANNELS_PORT=9005
REACT_APP_MAGISTRALA_HTTP_PORT=8008
```

### Next Steps
1. ✅ Complete Magistrala API integration (ALL MOCK DATA REPLACED)
2. ✅ Implement proper authentication with JWT tokens  
3. ✅ Deploy to AWS S3 with CORS auto-detection fallback
4. 🔄 Apply nginx CORS configuration on EC2 instance - READY TO EXECUTE
5. 🔄 Add real-time protocol support (MQTT, WebSocket)
6. 🔄 Add advanced features (Bootstrap, Provision, Certificates)
7. 🔄 Comprehensive testing with real Magistrala instance
8. 🔄 Performance optimization and caching strategies

---
**Last Updated**: 2025-06-23  
**Current Task**: 🔄 nginx CORS configuration ready for EC2 deployment
**Next Priority**: Execute nginx CORS script on EC2 to fix production CORS issues
**Active Branch**: `main` (production ready with S3 deployment complete)

**Major Achievement**: 🎉 Full S3 deployment with intelligent CORS fallback and automated nginx configuration script ready for EC2.