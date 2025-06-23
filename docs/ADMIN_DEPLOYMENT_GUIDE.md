# 🔐 Administrator Deployment Guide

## Current Status
The AWS user `magistrala-deploy-user` lacks required permissions:
- ❌ `s3:CreateBucket` 
- ❌ `cloudformation:CreateStack`
- ❌ `cloudfront:CreateDistribution`

## Option 3: Administrator Access Required

### **Step 1: Switch to Admin AWS Credentials**

Replace current credentials with administrator access:

```bash
# Option A: Update AWS credentials file
aws configure
# Enter admin Access Key ID
# Enter admin Secret Access Key  
# Region: us-east-1
# Format: json

# Option B: Use environment variables
export AWS_ACCESS_KEY_ID="ADMIN_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="ADMIN_SECRET_KEY"
export AWS_DEFAULT_REGION="us-east-1"

# Option C: Use AWS profiles
aws configure --profile admin
aws configure set default.profile admin
```

### **Step 2: Verify Admin Access**
```bash
aws sts get-caller-identity
# Should show admin user/role, not magistrala-deploy-user
```

### **Step 3: Deploy with Full CloudFormation**
```bash
./deploy-with-cloudformation.sh
```

### **Step 4: Alternative - Simple S3 Deployment**
```bash
./simple-s3-deploy.sh
```

---

## Alternative: Grant Permissions to Current User

If you prefer to keep current credentials, attach this policy to `magistrala-deploy-user`:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "*",
            "Resource": "*"
        }
    ]
}
```

---

## Quick Deployment Commands (Once Admin Access is Set)

### **Full AWS Infrastructure**
```bash
# Complete S3 + CloudFront deployment
./deploy-with-cloudformation.sh
```

### **Simple S3 Website**  
```bash
# Basic S3 static website
./simple-s3-deploy.sh
```

Both scripts are ready and will deploy the Choovio IoT Dashboard immediately once administrator permissions are available.

---

## Expected Result

**CloudFront URL**: `https://RANDOM-ID.cloudfront.net`  
**S3 Website**: `http://BUCKET-NAME.s3-website-us-east-1.amazonaws.com`

The dashboard will show:
- ✅ Choovio branding and colors
- ✅ Professional IoT metrics interface  
- ✅ Responsive mobile design
- ✅ Real-time device monitoring
- ✅ Fast CDN-cached loading