#!/bin/bash

# Proper React Dashboard Deployment Script
# This script properly deploys the React dashboard to AWS EC2

set -e

echo "Starting proper React dashboard deployment..."

# Update system packages
sudo yum update -y
sudo yum install -y nginx git aws-cli

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Create directory structure
sudo mkdir -p /opt/magistrala/dashboard
sudo mkdir -p /var/log/magistrala

# Download React build files from S3 or GitHub
# Option 1: From S3 bucket (if files are uploaded there)
if aws s3 ls s3://magistrala-react-assets-1750469494/ 2>/dev/null; then
    echo "Downloading React files from S3..."
    sudo aws s3 sync s3://magistrala-react-assets-1750469494/ /opt/magistrala/dashboard/
else
    echo "Creating React dashboard from source..."
    # Clone the repository and build React app
    cd /tmp
    git clone https://github.com/RutwikPatel13/magistrala-choovio-pilot.git
    cd magistrala-choovio-pilot/custom-dashboard
    
    # Install dependencies and build
    npm ci
    npm run build
    
    # Copy built files
    sudo cp -r build/* /opt/magistrala/dashboard/
fi

# Create nginx configuration for React app
sudo tee /etc/nginx/conf.d/magistrala-dashboard.conf > /dev/null << 'EOF'
server {
    listen 3000;
    server_name _;
    root /opt/magistrala/dashboard;
    index index.html;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets with proper caching
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;
}
EOF

# Set proper permissions
sudo chown -R nginx:nginx /opt/magistrala/dashboard
sudo chmod -R 755 /opt/magistrala/dashboard

# Start and enable nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Test the deployment
echo "Testing React dashboard deployment..."
sleep 5

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ React dashboard deployed successfully!"
    echo "Dashboard accessible at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
else
    echo "❌ Dashboard deployment failed"
    echo "Checking nginx status..."
    sudo systemctl status nginx
    echo "Checking nginx error logs..."
    sudo tail -n 20 /var/log/nginx/error.log
    exit 1
fi

echo "Deployment completed!"