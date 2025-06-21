#!/bin/bash

# Setup nginx proxy for Magistrala API access
# This script configures the server to proxy API calls to internal Magistrala services

set -e

echo "🔧 Setting up nginx proxy for Magistrala API access..."

# Check if script is run as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (use sudo)"
    exit 1
fi

# Backup existing nginx configuration
if [ -f /etc/nginx/sites-available/default ]; then
    cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%s)
    echo "✅ Backed up existing nginx configuration"
fi

# Create dashboard directory
mkdir -p /var/www/choovio-dashboard
chown -R www-data:www-data /var/www/choovio-dashboard

# Download latest React build from S3 to server
echo "📥 Downloading latest dashboard from S3..."
aws s3 sync s3://choovio-iot-dashboard-1750453820/ /var/www/choovio-dashboard/ --delete

# Apply new nginx configuration
echo "⚙️ Applying nginx configuration..."
cp /tmp/magistrala-proxy.conf /etc/nginx/sites-available/default

# Test nginx configuration
nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    
    # Reload nginx
    systemctl reload nginx
    echo "🔄 Nginx reloaded successfully"
    
    # Enable nginx service
    systemctl enable nginx
    echo "✅ Nginx service enabled"
    
else
    echo "❌ Nginx configuration test failed"
    exit 1
fi

# Check if Magistrala services are running
echo "🔍 Checking Magistrala services..."
services=("9002" "9000" "9005")
for port in "${services[@]}"; do
    if netstat -tuln | grep ":$port " > /dev/null; then
        echo "✅ Service running on port $port"
    else
        echo "⚠️  No service detected on port $port"
    fi
done

# Test the proxy setup
echo "🧪 Testing proxy setup..."
sleep 2

# Test health endpoint
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Health endpoint working"
else
    echo "⚠️  Health endpoint test failed"
fi

# Test API documentation
if curl -f http://localhost/api > /dev/null 2>&1; then
    echo "✅ API documentation accessible"
else
    echo "⚠️  API documentation test failed"
fi

echo ""
echo "🎉 Nginx proxy setup complete!"
echo ""
echo "📍 Endpoints available:"
echo "   Dashboard: http://44.196.96.48/"
echo "   API Docs:  http://44.196.96.48/api"
echo "   Health:    http://44.196.96.48/health"
echo "   Users API: http://44.196.96.48/api/v1/users/"
echo "   Things API: http://44.196.96.48/api/v1/things/"
echo ""
echo "🔐 Authentication now works through:"
echo "   POST http://44.196.96.48/api/v1/users/tokens/issue"
echo ""
echo "ℹ️  Note: Dashboard will automatically use the new proxy endpoints"