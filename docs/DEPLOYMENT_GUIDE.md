# 🚀 Choovio IoT Dashboard - Complete Deployment Guide

This guide provides complete instructions for deploying the Choovio IoT Dashboard with full Magistrala authentication integration.

## 📋 Current Status

**✅ S3 Dashboard:** http://choovio-iot-dashboard-1750453820.s3-website-us-east-1.amazonaws.com/  
**✅ Server:** http://44.196.96.48/  
**✅ Authentication:** Multi-endpoint with fallbacks  

## 🎯 Deployment Options

### Option 1: Quick S3 Deployment (Current)
The dashboard is already deployed to S3 with authentication working via demo fallback.

### Option 2: Full Server Deployment (Recommended)
Deploy to the main server with nginx proxy for full Magistrala API access.

## 🔧 Server Deployment (Option 2)

### Prerequisites
- Ubuntu/Debian server with sudo access
- Magistrala services running on ports 9002, 9000, 9005
- nginx installed
- AWS CLI configured (for downloading dashboard files)

### Quick Deployment
Run this single command on your server:

```bash
curl -sSL https://raw.githubusercontent.com/RutwikPatel13/magistrala-choovio-pilot/main/aws-deployment/scripts/deploy-with-proxy.sh | bash
```

### Manual Deployment Steps

1. **Download deployment files:**
   ```bash
   # Download nginx configuration
   sudo curl -o /tmp/magistrala-proxy.conf https://raw.githubusercontent.com/RutwikPatel13/magistrala-choovio-pilot/main/aws-deployment/nginx/magistrala-proxy.conf
   
   # Download setup script
   curl -o /tmp/setup-nginx-proxy.sh https://raw.githubusercontent.com/RutwikPatel13/magistrala-choovio-pilot/main/aws-deployment/scripts/setup-nginx-proxy.sh
   chmod +x /tmp/setup-nginx-proxy.sh
   ```

2. **Run the setup:**
   ```bash
   sudo /tmp/setup-nginx-proxy.sh
   ```

3. **Verify deployment:**
   ```bash
   curl http://localhost/health
   curl http://localhost/api
   ```

## 🔐 Authentication Testing

### Test Endpoints

1. **Health Check:**
   ```bash
   curl http://44.196.96.48/health
   ```

2. **API Documentation:**
   ```bash
   curl http://44.196.96.48/api
   ```

3. **User Authentication:**
   ```bash
   curl -X POST http://44.196.96.48/api/v1/users/tokens/issue \
     -H "Content-Type: application/json" \
     -d '{"identity": "user@example.com", "secret": "password"}'
   ```

### Demo Credentials
- **Email:** admin@choovio.com
- **Password:** admin123

## 📁 File Structure

```
aws-deployment/
├── nginx/
│   └── magistrala-proxy.conf      # Nginx proxy configuration
├── scripts/
│   ├── deploy-with-proxy.sh       # Complete deployment script
│   ├── setup-nginx-proxy.sh       # Nginx setup script
│   └── upload-react-to-s3.sh      # S3 deployment script
└── DEPLOYMENT_GUIDE.md            # This guide
```

## 🌐 API Endpoints

After deployment, the following endpoints will be available:

### Dashboard
- **Main:** http://44.196.96.48/
- **S3 Backup:** http://choovio-iot-dashboard-1750453820.s3-website-us-east-1.amazonaws.com/

### API Endpoints
- **Health:** `GET /health`
- **API Docs:** `GET /api`
- **User Auth:** `POST /api/v1/users/tokens/issue`
- **User Creation:** `POST /api/v1/users`
- **Things:** `GET/POST /api/v1/things/`
- **Channels:** `GET/POST /api/v1/channels/`

## 🔧 Configuration Details

### Nginx Proxy Configuration
The deployment sets up nginx to proxy Magistrala API calls:

- `/api/v1/users/` → `localhost:9002/users/`
- `/api/v1/things/` → `localhost:9000/things/`
- `/api/v1/channels/` → `localhost:9005/channels/`

### CORS Headers
All API endpoints include proper CORS headers for browser access:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization`

### Authentication Flow
The dashboard tries authentication in this order:
1. **Proxy endpoints** (http://44.196.96.48/api/v1/users/tokens/issue)
2. **Direct ports** (http://44.196.96.48:9002/users/tokens/issue)
3. **Demo fallback** (admin@choovio.com/admin123)

## 🧪 Testing Checklist

- [ ] Dashboard loads at http://44.196.96.48/
- [ ] Health endpoint returns JSON
- [ ] API documentation displays
- [ ] Demo login works (admin@choovio.com/admin123)
- [ ] Real Magistrala credentials work (if available)
- [ ] Protected routes redirect to login
- [ ] User menu and logout function
- [ ] Profile page accessible

## 🚨 Troubleshooting

### Common Issues

1. **Dashboard not loading**
   ```bash
   # Check nginx status
   sudo systemctl status nginx
   
   # Check nginx error logs
   sudo tail -f /var/log/nginx/error.log
   ```

2. **API calls failing**
   ```bash
   # Check if Magistrala services are running
   sudo netstat -tuln | grep -E ':(9002|9000|9005) '
   
   # Test proxy endpoints
   curl -v http://localhost/api/v1/users/tokens/issue
   ```

3. **Authentication not working**
   - Check browser console for detailed error messages
   - Verify CORS headers in network tab
   - Try demo credentials first

### Log Locations
- **Nginx access:** `/var/log/nginx/access.log`
- **Nginx error:** `/var/log/nginx/error.log`
- **Browser console:** F12 → Console tab

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the browser console for JavaScript errors
3. Check server logs for API call failures
4. Verify Magistrala services are running and accessible

## 🎉 Success Indicators

When deployment is successful, you should see:
- ✅ Dashboard loads with Choovio branding
- ✅ Login page appears for unauthenticated users
- ✅ Demo authentication works
- ✅ User menu appears after login
- ✅ All API endpoints return proper responses
- ✅ No CORS errors in browser console

---

**Dashboard URL:** http://44.196.96.48/  
**API Documentation:** http://44.196.96.48/api  
**Demo Login:** admin@choovio.com / admin123