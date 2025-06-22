# EC2 Magistrala Instance Troubleshooting

## 🔍 Current Situation Analysis

**EC2 Instance**: `44.196.96.48`

### What's Working ✅
- ✅ Basic connectivity to EC2 instance
- ✅ Dashboard is deployed and accessible on port 80
- ✅ HTML content loads showing "Choovio IoT Dashboard"

### What's Not Working ❌
- ❌ Magistrala Users service (port 9002) - Connection timeout
- ❌ Magistrala Things service (port 9000) - Connection timeout  
- ❌ Magistrala Channels service (port 9005) - Connection timeout
- ❌ Alternative ports (8080, etc.) - Not accessible

## 🚨 Root Cause
The dashboard is deployed but **Magistrala backend services are not running or accessible** on your EC2 instance.

## 🔧 Solutions

### Option 1: Check and Start Magistrala Services on EC2

You need to SSH into your EC2 instance and check if Magistrala is running:

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@44.196.96.48

# Check if Docker containers are running
docker ps

# Check if Magistrala services are running
sudo netstat -tlnp | grep -E '(9002|9000|9005|8008)'

# If not running, start Magistrala
cd /path/to/magistrala
docker-compose up -d

# Or if using Docker Swarm
docker stack deploy -c docker-compose.yml magistrala
```

### Option 2: Fix EC2 Security Group

The Magistrala ports might be blocked by AWS Security Group:

1. **Go to AWS Console → EC2 → Security Groups**
2. **Find your instance's security group**
3. **Add inbound rules for Magistrala ports**:
   - Port 9002 (Users service)
   - Port 9000 (Things service) 
   - Port 9005 (Channels service)
   - Port 8008 (HTTP adapter)
   - Port 9009 (Reader service)

### Option 3: Use Different Port Configuration

Maybe Magistrala is running on different ports. Try these alternatives:

```bash
# Test common alternative ports
curl http://44.196.96.48:3000/health    # Alternative Users port
curl http://44.196.96.48:8000/health    # Alternative Things port
curl http://44.196.96.48:8080/health    # Alternative HTTP port
```

### Option 4: Proxy Configuration

If Magistrala is behind a reverse proxy, it might be accessible via the main domain:

```bash
# Test proxy endpoints
curl http://44.196.96.48/users/health
curl http://44.196.96.48/things/health
curl http://44.196.96.48/channels/health
curl http://44.196.96.48/api/v1/users/health
```

## 🎯 Immediate Next Steps

1. **SSH into EC2 and check Magistrala status**
2. **Verify Docker containers are running**
3. **Check AWS Security Group settings**
4. **Start Magistrala services if needed**

## 🔄 Dashboard Configuration Update

Once Magistrala is running, we'll update the dashboard configuration and redeploy.

---

**Status**: Diagnosis complete - Need to fix Magistrala backend services on EC2
**Next Action**: Check EC2 instance for running Magistrala services