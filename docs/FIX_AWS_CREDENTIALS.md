# 🔐 AWS Credentials Fix Required

## Current Issue
AWS credentials are invalid: `InvalidClientTokenId`

## Solution: Update AWS Credentials

### **Step 1: Get New Admin Credentials**
From AWS Console:
1. Go to **IAM** → **Users** → **magistrala-deploy-user**
2. **Security credentials** tab
3. **Create access key** (if needed)
4. Copy the **Access Key ID** and **Secret Access Key**

### **Step 2: Update Local AWS Configuration**
```bash
aws configure
```
Enter when prompted:
- **AWS Access Key ID**: [NEW_ACCESS_KEY]
- **AWS Secret Access Key**: [NEW_SECRET_KEY]  
- **Default region**: us-east-1
- **Default output format**: json

### **Step 3: Verify Admin Access**
```bash
./test-admin-permissions.sh
```

Should show:
```
✅ S3 ListBuckets: OK
✅ CloudFormation ListStacks: OK  
✅ IAM GetUser: OK
✅ READY FOR DEPLOYMENT
```

### **Step 4: Deploy Dashboard**
```bash
./deploy-with-cloudformation.sh
```

---

## Alternative: Use Environment Variables

If you have admin credentials available:

```bash
export AWS_ACCESS_KEY_ID="YOUR_ADMIN_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="YOUR_ADMIN_SECRET_KEY"  
export AWS_DEFAULT_REGION="us-east-1"

# Test
./test-admin-permissions.sh

# Deploy
./deploy-with-cloudformation.sh
```

---

## Expected Result After Fix

Once credentials are updated:
- ✅ Permissions test passes
- ✅ CloudFormation deployment succeeds  
- ✅ S3 + CloudFront infrastructure created
- ✅ React dashboard deployed
- ✅ Live URL provided

The deployment will take ~5 minutes once valid admin credentials are configured.