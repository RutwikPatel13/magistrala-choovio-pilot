# 🚀 Deploy New EC2 with SSH Access & Full Magistrala

## ✅ **Ready to Deploy!**

I've prepared everything for deploying a new EC2 instance with:
- ✅ **SSH access configured**
- ✅ **Full Magistrala IoT platform**
- ✅ **All service ports open**
- ✅ **Complete dashboard integration**

## 🔑 **Step 1: Create SSH Key Pair**

Choose one method:

### Method A: AWS Console (Recommended)
1. Go to [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
2. Click **"Key Pairs"** in left sidebar  
3. Click **"Create key pair"**
4. **Name**: `magistrala-ssh-key`
5. **Type**: RSA, **.pem format**
6. Click **"Create"** and **download the .pem file**
7. **IMPORTANT**: Save the file securely!

### Method B: AWS CLI
```bash
aws ec2 create-key-pair --key-name magistrala-ssh-key --query 'KeyMaterial' --output text > magistrala-ssh-key.pem
chmod 400 magistrala-ssh-key.pem
```

## 🚀 **Step 2: Deploy with Terraform**

```bash
cd /Users/rutwik/choovio/magistrala/aws-deployment/terraform

# Initialize Terraform (if not already done)
terraform init

# Plan the deployment
terraform plan

# Deploy the infrastructure
terraform apply
```

**Type `yes` when prompted**

## 🎯 **What Gets Deployed**

### Infrastructure:
- **New EC2 instance** with SSH access
- **RDS PostgreSQL database** (existing one will be reused)
- **Security groups** with all Magistrala ports
- **Elastic IP** for consistent access

### Full Magistrala Platform:
- **Users Service** (port 9002) - Authentication
- **Things Service** (port 9000) - Device management
- **Channels Service** (port 9005) - Communication channels
- **HTTP Adapter** (port 8008) - REST API
- **MQTT Adapter** (port 1883) - MQTT messaging
- **Reader Service** (port 9009) - Message reading
- **WebSocket** (port 8080) - Real-time communication

## 🔌 **Step 3: Get Connection Details**

After deployment completes, get the SSH command:

```bash
terraform output ssh_command
```

This will show: `ssh -i magistrala-ssh-key.pem ec2-user@NEW_IP_ADDRESS`

## 🔍 **Step 4: Verify Deployment**

### Check Services:
```bash
# SSH into the new instance
ssh -i magistrala-ssh-key.pem ec2-user@NEW_IP_ADDRESS

# Check running containers
sudo docker ps

# Check service logs
sudo docker-compose -f /opt/magistrala/magistrala/docker-compose-prod.yml logs
```

### Test API Endpoints:
```bash
# Get the new IP from terraform output
NEW_IP=$(terraform output -raw public_ip)

# Test all services
curl http://$NEW_IP/health
curl http://$NEW_IP:9002/health  # Users
curl http://$NEW_IP:9000/health  # Things  
curl http://$NEW_IP:9005/health  # Channels
curl http://$NEW_IP:8008/health  # HTTP Adapter
```

## 🎨 **Step 5: Update Dashboard**

Once the new Magistrala instance is running, I'll:

1. **Update dashboard configuration** to point to new IP
2. **Rebuild and redeploy** the dashboard
3. **Test complete integration**
4. **Create test user account**

## 💰 **Cost Impact**

**New costs:**
- **Additional EC2 instance**: ~$4-6/month (free tier eligible)
- **Additional Elastic IP**: $3.60/month
- **Total additional cost**: ~$7-10/month

**You can terminate the old instance** after testing to save costs.

## 🔧 **Troubleshooting**

If deployment fails:

### Common Issues:
1. **Key pair not found**: Make sure key pair name matches exactly
2. **Region mismatch**: Ensure key pair is in correct region
3. **Quota limits**: Check EC2 instance limits

### Debug Steps:
```bash
# Check Terraform state
terraform state list

# View detailed logs
terraform apply -auto-approve -no-color | tee deploy.log

# Check AWS resources
aws ec2 describe-instances --filters "Name=tag:Name,Values=magistrala-iot-minimal-app"
```

## ⚡ **Ready to Start?**

1. **Create the SSH key pair** (Step 1)
2. **Run terraform apply** (Step 2)  
3. **Let me know the new IP** and I'll update the dashboard immediately!

---

**Next**: After you create the SSH key and run terraform apply, I'll configure the dashboard to connect to your new full Magistrala instance!