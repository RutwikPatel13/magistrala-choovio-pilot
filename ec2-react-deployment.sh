#\!/bin/bash
# Deploy proper React build to existing EC2 instance

set -e

echo "🚀 Deploying React build to EC2 instance..."

# Backup current files
sudo mkdir -p /opt/magistrala/dashboard-backup-$(date +%s)
sudo cp -r /opt/magistrala/dashboard/* /opt/magistrala/dashboard-backup-$(date +%s)/ 2>/dev/null || true

# Create proper directory structure
sudo mkdir -p /opt/magistrala/dashboard/static/{js,css}

# Download and extract the React build from GitHub
cd /tmp
curl -L -o react-build.zip "https://github.com/RutwikPatel13/magistrala-choovio-pilot/raw/main/custom-dashboard/choovio-dashboard-build.zip"
unzip -o react-build.zip

# Copy files to web directory
sudo cp -r * /opt/magistrala/dashboard/
sudo chown -R nginx:nginx /opt/magistrala/dashboard
sudo chmod -R 755 /opt/magistrala/dashboard

# Update nginx configuration for React SPA
sudo tee /etc/nginx/conf.d/react-spa.conf > /dev/null << 'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    root /opt/magistrala/dashboard;
    index index.html;

    # Handle React Router (SPA) - all routes go to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
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
NGINX

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

echo "✅ React deployment completed\!"
echo "🌐 Dashboard should be available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
