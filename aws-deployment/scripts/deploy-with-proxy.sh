#!/bin/bash

# Complete deployment script with nginx proxy setup
# Run this on the target server to deploy the full authentication system

set -e

echo "🚀 Deploying Choovio IoT Dashboard with Magistrala API proxy..."
echo "Server: $(hostname)"
echo "Date: $(date)"
echo ""

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update -y
sudo apt-get install -y nginx curl awscli

# Download nginx configuration
echo "📥 Downloading nginx configuration..."
curl -o /tmp/magistrala-proxy.conf https://raw.githubusercontent.com/RutwikPatel13/magistrala-choovio-pilot/main/aws-deployment/nginx/magistrala-proxy.conf

# Download and run nginx setup script
echo "📥 Downloading setup script..."
curl -o /tmp/setup-nginx-proxy.sh https://raw.githubusercontent.com/RutwikPatel13/magistrala-choovio-pilot/main/aws-deployment/scripts/setup-nginx-proxy.sh
chmod +x /tmp/setup-nginx-proxy.sh

# Run the setup script
echo "⚙️ Running nginx proxy setup..."
sudo /tmp/setup-nginx-proxy.sh

# Verify deployment
echo ""
echo "🧪 Verifying deployment..."

# Test endpoints
endpoints=(
    "http://localhost/"
    "http://localhost/health"
    "http://localhost/api"
)

for endpoint in "${endpoints[@]}"; do
    if curl -f "$endpoint" > /dev/null 2>&1; then
        echo "✅ $endpoint - Working"
    else
        echo "❌ $endpoint - Failed"
    fi
done

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📍 Your dashboard is now available at:"
echo "   http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo '44.196.96.48')/"
echo ""
echo "🔐 Authentication endpoints:"
echo "   POST /api/v1/users/tokens/issue"
echo "   POST /api/v1/users"
echo ""
echo "📚 API documentation:"
echo "   http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo '44.196.96.48')/api"
echo ""
echo "🧪 Test with demo credentials:"
echo "   admin@choovio.com / admin123"