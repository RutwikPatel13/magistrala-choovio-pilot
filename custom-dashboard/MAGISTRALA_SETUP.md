# Magistrala IoT Platform Setup Guide

This guide helps you configure the React dashboard to work with a real Magistrala IoT platform instance.

## Prerequisites

1. **Running Magistrala Instance**: You need a running Magistrala platform
2. **Valid Credentials**: User account with appropriate permissions
3. **Network Access**: Dashboard must be able to reach Magistrala endpoints
4. **CORS Configuration**: Magistrala must allow requests from your dashboard domain

## Quick Setup

### 1. Environment Configuration

Copy the appropriate environment file for your setup:

```bash
# For local development
cp .env.development .env.local

# For production deployment
cp .env.production .env.local
```

### 2. Configure Magistrala URL

Edit `.env.local` and update the base URL:

```env
# Local Docker setup
REACT_APP_MAGISTRALA_BASE_URL=http://localhost

# Remote server
REACT_APP_MAGISTRALA_BASE_URL=https://magistrala.yourdomain.com

# Custom port setup
REACT_APP_MAGISTRALA_BASE_URL=http://192.168.1.100
```

### 3. Test Connection

The dashboard includes built-in connection validation. Check the browser console for connection test results when you load the app.

## Deployment Scenarios

### Scenario 1: Local Development with Docker

1. **Start Magistrala services:**
   ```bash
   git clone https://github.com/absmach/magistrala
   cd magistrala
   docker-compose up -d
   ```

2. **Configure environment:**
   ```env
   REACT_APP_MAGISTRALA_BASE_URL=http://localhost
   REACT_APP_DEBUG_MODE=true
   ```

3. **Create initial user:**
   ```bash
   curl -X POST http://localhost:9002/users \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Admin User",
       "credentials": {
         "identity": "admin@example.com", 
         "secret": "password123"
       }
     }'
   ```

### Scenario 2: Remote Magistrala Instance

1. **Configure environment:**
   ```env
   REACT_APP_MAGISTRALA_BASE_URL=https://your-magistrala-server.com
   REACT_APP_DEBUG_MODE=false
   REACT_APP_ENABLE_MTLS=true
   ```

2. **Ensure CORS is configured on the server**
3. **Use valid SSL certificates**

### Scenario 3: AWS/Cloud Deployment

1. **Configure load balancer endpoints:**
   ```env
   REACT_APP_MAGISTRALA_BASE_URL=https://magistrala.yourdomain.com
   ```

2. **Services are typically accessed through the load balancer without port numbers**

### Scenario 4: Kubernetes/Docker Swarm

1. **Use service discovery URLs:**
   ```env
   REACT_APP_MAGISTRALA_BASE_URL=https://magistrala-gateway.cluster.local
   ```

## Service Port Configuration

The dashboard supports flexible port configuration for different deployment scenarios:

### Standard Ports (Default)
```env
REACT_APP_MAGISTRALA_USERS_PORT=9002
REACT_APP_MAGISTRALA_THINGS_PORT=9000
REACT_APP_MAGISTRALA_CHANNELS_PORT=9005
REACT_APP_MAGISTRALA_HTTP_PORT=8008
REACT_APP_MAGISTRALA_READER_PORT=9009
```

### Advanced Services
```env
REACT_APP_MAGISTRALA_BOOTSTRAP_PORT=8202
REACT_APP_MAGISTRALA_PROVISION_PORT=8190
REACT_APP_MAGISTRALA_CONSUMERS_PORT=8180
REACT_APP_MAGISTRALA_RULES_PORT=8185
REACT_APP_MAGISTRALA_REPORTS_PORT=8200
REACT_APP_MAGISTRALA_CERTS_PORT=9019
```

### Protocol Endpoints
```env
REACT_APP_MAGISTRALA_MQTT_PORT=1883
REACT_APP_MAGISTRALA_WS_PORT=8186
REACT_APP_MAGISTRALA_COAP_PORT=5683
```

## Authentication Setup

### 1. Create User Account

```bash
curl -X POST ${MAGISTRALA_URL}/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Name",
    "credentials": {
      "identity": "your.email@domain.com",
      "secret": "your-secure-password"
    }
  }'
```

### 2. Test Authentication

```bash
curl -X POST ${MAGISTRALA_URL}/tokens \
  -H "Content-Type: application/json" \
  -d '{
    "identity": "your.email@domain.com",
    "secret": "your-secure-password"
  }'
```

### 3. Multi-tenant Setup (Optional)

If using domains/tenants:

```env
REACT_APP_DEFAULT_DOMAIN_ID=your-domain-id
```

## CORS Configuration

Ensure your Magistrala instance allows requests from your dashboard:

### nginx proxy example:
```nginx
add_header 'Access-Control-Allow-Origin' 'https://your-dashboard-domain.com';
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type';
```

### Docker Compose environment:
```yaml
environment:
  MG_HTTP_ADAPTER_CLIENT_TLS: "false"
  MG_HTTP_ADAPTER_SERVER_CERT: ""
  MG_HTTP_ADAPTER_SERVER_KEY: ""
```

## Security Configuration

### Production Security Checklist

- [ ] Use HTTPS for all communications
- [ ] Configure proper CORS policies  
- [ ] Enable mTLS if required
- [ ] Set up proper authentication domains
- [ ] Use environment variables for sensitive config
- [ ] Enable security headers
- [ ] Regular security updates

### mTLS Setup (Advanced)

If your Magistrala instance requires mTLS:

```env
REACT_APP_ENABLE_MTLS=true
```

Note: Browser-based mTLS has limitations. Consider using a proxy for client certificates.

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if Magistrala services are running
   - Verify the base URL and ports
   - Test network connectivity

2. **CORS Errors**
   - Configure CORS headers on Magistrala server
   - Check browser developer tools for specific CORS errors
   - Ensure the dashboard domain is whitelisted

3. **Authentication Failures**
   - Verify user credentials are correct
   - Check if the user account exists
   - Ensure the authentication endpoint is accessible

4. **API Endpoint Errors**
   - Test individual service endpoints manually
   - Check service logs on the Magistrala side
   - Verify API versions are compatible

### Debug Mode

Enable debug mode for detailed logging:

```env
REACT_APP_DEBUG_MODE=true
```

This will show detailed API call information in the browser console.

### Health Check

The dashboard includes a built-in connection validator. Check the browser console when loading the app to see connection test results.

### Manual API Testing

Test individual endpoints manually:

```bash
# Test users service
curl -X GET http://localhost:9002/health

# Test things service  
curl -X GET http://localhost:9000/health

# Test with authentication
curl -X GET http://localhost:9000/things \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Performance Optimization

### Timeout Configuration

Adjust API timeouts based on your network:

```env
# 3 seconds for local development
REACT_APP_API_TIMEOUT=3000

# 10 seconds for slow networks
REACT_APP_API_TIMEOUT=10000
```

### Endpoint Optimization

The dashboard automatically detects working endpoints and prioritizes them for future requests. This improves performance by avoiding failed endpoints.

## Support

For additional help:

1. Check Magistrala documentation: https://docs.magistrala.abstractmachines.fr/
2. Review browser console for detailed error messages
3. Test API endpoints manually using curl or Postman
4. Check Magistrala service logs for server-side issues