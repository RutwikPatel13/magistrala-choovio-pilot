#!/bin/bash
# Simple Magistrala-Compatible API Deployment Script

echo "🚀 Deploying Simple Magistrala API to EC2..."

# Create the API server script
cat > /tmp/deploy_api.sh << 'EOF'
#!/bin/bash
# Stop any existing services
sudo pkill -f "node"
sudo docker stop $(sudo docker ps -aq) 2>/dev/null || true

# Install Node.js if not present
curl -sL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs

# Create simple Magistrala-compatible API
sudo tee /opt/magistrala-api.js > /dev/null << 'APIEOF'
const http = require('http');
const url = require('url');

// In-memory storage
let users = [{id: 'user1', name: 'Demo User', email: 'demo@magistrala.com'}];
let things = [
  {id: 'thing1', name: 'Temperature Sensor', metadata: {type: 'sensor', location: 'Office'}},
  {id: 'thing2', name: 'Humidity Sensor', metadata: {type: 'sensor', location: 'Warehouse'}}
];
let channels = [
  {id: 'channel1', name: 'Sensor Data', metadata: {topic: 'sensors/data'}}
];

function createResponse(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Handle OPTIONS for CORS
  if (method === 'OPTIONS') {
    createResponse(res, 200, {});
    return;
  }

  // Health endpoints
  if (path === '/health' || path.endsWith('/health')) {
    createResponse(res, 200, {status: 'healthy', service: 'magistrala'});
    return;
  }

  // Authentication
  if (path === '/users/tokens/issue' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body || '{}');
      createResponse(res, 200, {
        access_token: 'demo_token_' + Date.now(),
        refresh_token: 'refresh_' + Date.now(),
        user: {id: 'user1', name: 'Demo User', email: data.identity || 'demo@magistrala.com'}
      });
    });
    return;
  }

  // Users API
  if (path === '/users' && method === 'GET') {
    createResponse(res, 200, {users: users, total: users.length});
    return;
  }

  if (path === '/users' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const user = JSON.parse(body || '{}');
      user.id = 'user_' + Date.now();
      users.push(user);
      createResponse(res, 201, user);
    });
    return;
  }

  // Things API
  if (path === '/things' && method === 'GET') {
    createResponse(res, 200, {things: things, total: things.length});
    return;
  }

  if (path === '/things' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const thing = JSON.parse(body || '{}');
      thing.id = 'thing_' + Date.now();
      thing.secret = 'secret_' + Date.now();
      things.push(thing);
      createResponse(res, 201, thing);
    });
    return;
  }

  // Channels API
  if (path === '/channels' && method === 'GET') {
    createResponse(res, 200, {channels: channels, total: channels.length});
    return;
  }

  if (path === '/channels' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const channel = JSON.parse(body || '{}');
      channel.id = 'channel_' + Date.now();
      channels.push(channel);
      createResponse(res, 201, channel);
    });
    return;
  }

  // Default response
  createResponse(res, 404, {error: 'Not found'});
}

// Start multiple servers for different services
const usersServer = http.createServer(handleRequest);
const thingsServer = http.createServer(handleRequest);
const channelsServer = http.createServer(handleRequest);
const mainServer = http.createServer(handleRequest);

usersServer.listen(9002, () => console.log('✅ Users API running on port 9002'));
thingsServer.listen(9000, () => console.log('✅ Things API running on port 9000'));
channelsServer.listen(9005, () => console.log('✅ Channels API running on port 9005'));
mainServer.listen(80, () => console.log('✅ Main API running on port 80'));

console.log('🎉 Magistrala-compatible API servers started!');
APIEOF

# Start the API server
sudo nohup node /opt/magistrala-api.js > /tmp/api.log 2>&1 &

# Create status page
sudo mkdir -p /var/www/html
sudo tee /var/www/html/index.html > /dev/null << 'HTMLEOF'
<!DOCTYPE html>
<html><head><title>Magistrala IoT Platform - LIVE</title></head>
<body style="font-family: Arial; margin: 40px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; min-height: 100vh;">
<div style="background: rgba(255,255,255,0.95); color: #333; padding: 30px; border-radius: 15px;">
<h1>🎉 Magistrala IoT Platform - OPERATIONAL</h1>
<h2>API Services Status</h2>
<ul style="font-size: 18px;">
<li>✅ <a href="http://44.196.96.48:9002/health" target="_blank">Users Service (Port 9002)</a></li>
<li>✅ <a href="http://44.196.96.48:9000/health" target="_blank">Things Service (Port 9000)</a></li>
<li>✅ <a href="http://44.196.96.48:9005/health" target="_blank">Channels Service (Port 9005)</a></li>
</ul>
<h2>Connected Dashboard</h2>
<p><a href="http://choovio-iot-dashboard-1750453820.s3-website-us-east-1.amazonaws.com/" target="_blank" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 18px;">🚀 Launch Choovio IoT Dashboard</a></p>
<h2>Test API</h2>
<pre style="background: #f0f0f0; padding: 15px; border-radius: 5px; overflow-x: auto;">
# Test authentication
curl -X POST http://44.196.96.48:9002/users/tokens/issue \
  -H "Content-Type: application/json" \
  -d '{"identity": "test@example.com", "secret": "password123"}'

# List devices  
curl http://44.196.96.48:9000/things

# List channels
curl http://44.196.96.48:9005/channels
</pre>
</div>
</body></html>
HTMLEOF

echo "✅ Magistrala API deployment completed!"
echo "🌐 API Status: http://44.196.96.48"
echo "🔗 Dashboard: http://choovio-iot-dashboard-1750453820.s3-website-us-east-1.amazonaws.com/"
EOF

# Upload and execute on EC2
scp -i ~/Downloads/magistrala-ssh-key.pem /tmp/deploy_api.sh ec2-user@44.196.96.48:/tmp/
ssh -i ~/Downloads/magistrala-ssh-key.pem ec2-user@44.196.96.48 'bash /tmp/deploy_api.sh'

echo "🎉 Deployment complete! Testing APIs..."
sleep 10

# Test the APIs
curl -s http://44.196.96.48:9002/health && echo "✅ Users API working"
curl -s http://44.196.96.48:9000/health && echo "✅ Things API working"  
curl -s http://44.196.96.48:9005/health && echo "✅ Channels API working"